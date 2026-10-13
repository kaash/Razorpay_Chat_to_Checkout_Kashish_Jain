"use strict";
// Calls the Claude Messages API and asks for exactly one structured tool call (record_draft).
// The API key is read from the server environment only. It never reaches the browser.
const { SYSTEM, TOOL, userText } = require("./prompt");

const API_URL = "https://api.anthropic.com/v1/messages";

async function extract({ text, image, channel, buyer }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw Object.assign(new Error("AI is not configured"), { status: 503 });
  const model = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
  const content = [];
  if (image) {
    const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/.exec(image);
    if (!m) throw Object.assign(new Error("Unsupported image"), { status: 400 });
    content.push({ type: "image", source: { type: "base64", media_type: m[1], data: m[2] } });
  }
  content.push({ type: "text", text: userText({ text, channel, buyer }) });
  // Current Claude models reject a forced tool_choice and custom temperature (400), so the tool is
  // offered with "auto" and the prompt asks for exactly one record_draft call. Thinking is always on;
  // low effort keeps a short extraction fast. If the model answers without the tool, ask once more.
  const body = { model, max_tokens: 8000, system: SYSTEM, tools: [TOOL], tool_choice: { type: "auto", disable_parallel_tool_use: true }, output_config: { effort: process.env.CLAUDE_EFFORT || "low" }, messages: [{ role: "user", content }] };
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), +(process.env.AI_TIMEOUT_MS || 50000));
  const t0 = Date.now();
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await fetch(API_URL, { method: "POST", signal: ctrl.signal, headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error((j.error && j.error.message) || `AI request failed (${r.status})`), { status: 502 });
      if (j.stop_reason === "refusal") throw Object.assign(new Error("AI declined to read this chat"), { status: 502 });
      const use = (j.content || []).find(c => c.type === "tool_use" && c.name === TOOL.name);
      if (use) return { raw: use.input, model: j.model || model, ms: Date.now() - t0, usage: j.usage || null };
    }
  } finally { clearTimeout(timer); }
  throw Object.assign(new Error("AI did not return the draft"), { status: 502 });
}

module.exports = { extract };
