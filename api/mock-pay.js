"use strict";
// Local-testing checkout for MOCK_PAY=1. Returns 404 in any real deployment.
const mem = global.__c2cMockLinks || (global.__c2cMockLinks = new Map());

module.exports = async (req, res) => {
  if (process.env.MOCK_PAY !== "1") { res.statusCode = 404; return res.end("Not found"); }
  const url = new URL(req.url, "http://x"); const id = url.searchParams.get("id"); const l = mem.get(id);
  if (!l) { res.statusCode = 404; return res.end("Unknown link"); }
  if (req.method === "POST") { if (l.status === "unpaid") l.status = "paid"; }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mock checkout</title>
<body style="font-family:system-ui;max-width:420px;margin:40px auto;padding:0 16px">
<h2>Mock checkout (local testing)</h2><p>${l.item.replace(/[<>&]/g, "")}</p><p style="font-size:28px;font-weight:800">₹${(l.amount / 100).toLocaleString("en-IN")}</p>
<p>Status: <b id="st">${l.status}</b></p>
<form method="post"><button id="pay" style="font-size:18px;padding:12px 20px" ${l.status !== "unpaid" ? "disabled" : ""}>Pay (mock)</button></form></body>`);
};
