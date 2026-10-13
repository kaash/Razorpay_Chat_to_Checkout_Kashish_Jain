"use strict";
// POST /api/draft  { text?: string, image?: "data:image/png;base64,...", channel: "instagram"|"whatsapp", buyer?: string }
// → the draft card, in the same shape the page's rules parser produces, after code checks (lib/guard.js).
const { send, readJson, clientIp, cors } = require("../lib/http");
const { limit } = require("../lib/rate");
const { extract } = require("../lib/anthropic");
const { guard } = require("../lib/guard");
const { rawFromRules } = require("../lib/mock");

const MAX_TEXT = 6000, MAX_BODY = 4_400_000; // Vercel's request limit is about 4.5 MB

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== "POST") return send(res, 405, { error: "Use POST" });
  try {
    const rl = limit("draft:" + clientIp(req), +(process.env.RATE_PER_MIN || 8), +(process.env.RATE_PER_DAY || 120));
    if (!rl.ok) return send(res, 429, { error: rl.why });
    const b = await readJson(req, MAX_BODY);
    const channel = b.channel === "whatsapp" ? "whatsapp" : "instagram";
    const text = typeof b.text === "string" ? b.text.replace(/\r/g, "").slice(0, MAX_TEXT).trim() : "";
    const image = typeof b.image === "string" ? b.image : null;
    const buyer = typeof b.buyer === "string" ? b.buyer.slice(0, 40) : null;
    if (!text && !image) return send(res, 400, { error: "Send chat text or a screenshot" });
    const t0 = Date.now();
    let out;
    if (process.env.MOCK_AI === "1") out = { raw: rawFromRules({ text, channel, buyer }), model: "mock (rules)", ms: 0, usage: null };
    else out = await extract({ text: text || null, image: text ? null : image, channel, buyer });
    // For a screenshot we keep the AI's transcript; for pasted text we check against the exact pasted lines.
    const draft = guard(out.raw, { text: text || null, channel, buyer });
    send(res, 200, { draft, meta: { model: out.model, ai_ms: out.ms, guard_ms: draft.guard_ms, total_ms: Date.now() - t0, source_check: draft.checks, usage: out.usage } });
  } catch (e) {
    send(res, e.status || 500, { error: e.status ? e.message : "Something went wrong reading this chat" });
  }
};
