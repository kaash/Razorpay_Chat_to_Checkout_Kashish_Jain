"use strict";
// Small helpers so the handlers run the same on Vercel and on the local dev server.

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readJson(req, maxBytes) {
  if (req.body && typeof req.body === "object") return req.body; // Vercel already parsed it
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > maxBytes) throw Object.assign(new Error("Request too large"), { status: 413 }); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function clientIp(req) {
  const xf = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || req.headers["x-real-ip"] || (req.socket && req.socket.remoteAddress) || "unknown";
}

// Same-origin by default. Set ALLOWED_ORIGINS="https://a.com,https://b.com" to allow others.
function cors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return true; }
  return false;
}

module.exports = { send, readJson, clientIp, cors };
