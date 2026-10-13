#!/usr/bin/env node
"use strict";
// Local server that behaves like Vercel: static files from public/, functions from api/.
//   npm run dev        → uses .env (real keys if you set them)
//   npm run dev:mock   → MOCK_AI=1 MOCK_PAY=1, no keys needed
const http = require("http"), fs = require("fs"), path = require("path");
const root = __dirname;
try { fs.readFileSync(path.join(root, ".env"), "utf8").split("\n").forEach(l => { const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(l); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }); } catch (e) { /* no .env */ }
const PORT = +(process.env.PORT || 3000);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".md": "text/markdown; charset=utf-8" };
http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost");
  const m = /^\/api\/([a-z-]+)$/.exec(u.pathname);
  if (m) {
    const f = path.join(root, "api", m[1] + ".js");
    if (!fs.existsSync(f)) { res.statusCode = 404; return res.end("Not found"); }
    try { await require(f)(req, res); } catch (e) { console.error(e); res.statusCode = 500; res.end("Server error"); }
    return;
  }
  let p = path.normalize(decodeURIComponent(u.pathname)).replace(/^(\.\.[/\\])+/, "");
  if (p === "/" || p === "\\") p = "/index.html";
  const file = path.join(root, "public", p);
  if (!file.startsWith(path.join(root, "public")) || !fs.existsSync(file)) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Chat to Checkout on http://localhost:${PORT}  (AI: ${process.env.MOCK_AI === "1" ? "mock" : process.env.ANTHROPIC_API_KEY ? "Claude" : "off"}, payments: ${process.env.MOCK_PAY === "1" ? "mock" : process.env.RAZORPAY_KEY_ID ? "Razorpay test" : "simulated"})`));
