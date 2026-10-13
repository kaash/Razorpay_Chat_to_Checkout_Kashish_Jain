"use strict";
// POST /api/links            { order, buyer, channel, expiry_hrs }  → creates a Razorpay Payment Link (test mode)
// GET  /api/links?id=plink_… → current status: unpaid | paid | expired | cancelled
// POST /api/links?id=…&action=cancel → cancels an unpaid link
const { send, readJson, clientIp, cors } = require("../lib/http");
const { limit } = require("../lib/rate");
const { priceOrder } = require("../lib/order");
const rzp = require("../lib/razorpay");

// MOCK_PAY=1 keeps links in memory and serves a fake checkout at /api/mock-pay (local testing only).
const mem = global.__c2cMockLinks || (global.__c2cMockLinks = new Map());

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  const url = new URL(req.url, "http://x");
  const id = url.searchParams.get("id");
  const mock = process.env.MOCK_PAY === "1";
  try {
    if (req.method === "GET") {
      if (!id) return send(res, 400, { error: "Missing id" });
      if (mock) { const l = mem.get(id); return l ? send(res, 200, { id, status: l.status }) : send(res, 404, { error: "Unknown link" }); }
      return send(res, 200, await rzp.getLink(id));
    }
    if (req.method !== "POST") return send(res, 405, { error: "Use GET or POST" });
    if (id && url.searchParams.get("action") === "cancel") {
      if (mock) { const l = mem.get(id); if (!l) return send(res, 404, { error: "Unknown link" }); if (l.status === "unpaid") l.status = "cancelled"; return send(res, 200, { id, status: l.status }); }
      const cur = await rzp.getLink(id);
      if (cur.status !== "unpaid") return send(res, 409, { error: `Link is ${cur.status}; nothing to cancel`, status: cur.status });
      return send(res, 200, await rzp.cancelLink(id));
    }
    const rl = limit("links:" + clientIp(req), +(process.env.LINKS_PER_MIN || 6), +(process.env.LINKS_PER_DAY || 60));
    if (!rl.ok) return send(res, 429, { error: rl.why });
    const b = await readJson(req, 20000);
    const priced = priceOrder(b.order);
    const referenceId = "CT-" + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).slice(2, 4).toUpperCase();
    if (mock) {
      const mid = "plink_mock_" + Math.random().toString(36).slice(2, 10);
      const origin = (req.headers["x-forwarded-proto"] || "http") + "://" + req.headers.host;
      mem.set(mid, { status: "unpaid", amount: priced.total, item: priced.item });
      return send(res, 200, { id: mid, short_url: `${origin}/api/mock-pay?id=${mid}`, reference_id: referenceId, amount: priced.total, status: "unpaid", priced, mode: "mock" });
    }
    const link = await rzp.createLink({ priced, buyer: b.buyer, channel: b.channel, referenceId, expiryHrs: b.expiry_hrs });
    send(res, 200, Object.assign(link, { priced, mode: "test" }));
  } catch (e) {
    send(res, e.status || 500, { error: e.status ? e.message : "Something went wrong with the payment link" });
  }
};
