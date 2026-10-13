#!/usr/bin/env node
"use strict";
// Runs the F1 cases in extraction-test/ through the real server path (Claude → guard → pricing)
// and counts: correct & accepted, flagged for the seller, and SILENT ERRORS (wrong but accepted).
//   npm run eval                                (real model, key from .env; costs a few cents)
//   node scripts/eval-extraction.js --mock      (rules stand-in, no key)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
try { fs.readFileSync(path.join(root, ".env"), "utf8").split("\n").forEach(l => { const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(l); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); }); } catch (e) { /* no .env */ }
const { compute } = require("../lib/core");
const { guard } = require("../lib/guard");
const { extract } = require("../lib/anthropic");
const { rawFromRules } = require("../lib/mock");
const MOCK = process.argv.includes("--mock");

const cases = JSON.parse(fs.readFileSync(path.join(root, "extraction-test", "cases.json"), "utf8")).cases;
const expected = JSON.parse(fs.readFileSync(path.join(root, "extraction-test", "expected.json"), "utf8"));
const F1 = cases.filter(c => expected[c.id] && ["agreed", "question", "unclear"].includes(expected[c.id].intent) && !c.context_paid_order);

const toText = c => c.messages.map(m => {
  const img = /^\[shared image:.*?'(.+?)'\]$/.exec(m.text); if (img) return `[reel: ${img[1]}]`;
  return (/\(seller\)/i.test(m.from) ? "Me" : m.from.split(" ")[0]) + ": " + m.text;
}).join("\n");

(async () => {
  const tally = { correct: 0, flagged: 0, silent: 0 }; const rows = [];
  for (const c of F1) {
    const e = expected[c.id], text = toText(c);
    let raw, ms = 0;
    try { if (MOCK) raw = rawFromRules({ text, channel: c.channel }); else { const out = await extract({ text, channel: c.channel }); raw = out.raw; ms = out.ms; } }
    catch (err) { rows.push([c.id, "ERROR " + err.message]); continue; }
    const d = guard(raw, { text, channel: c.channel }); const it = d.items[0]; const cc = compute(d, {}); const ag = d.agreement || { state: "unclear" };
    const notes = [];
    const field = (name, accepted, right) => { if (!accepted) { tally.flagged++; notes.push(name + ": flagged"); } else if (right) { tally.correct++; notes.push(name + ": ok"); } else { tally.silent++; notes.push(name + ": SILENT ERROR"); } };
    if (e.special !== "multiple_customers") field("intent", e.intent !== "agreed" || ag.state === "agreed", ag.state === e.intent || (e.intent === "unclear" && ag.state !== "agreed"));
    if (e.special === "multiple_customers") field("customers", d.multiple_customers, d.multiple_customers);
    else if (e.items && e.items[0]) {
      const [eid, esz, eq] = e.items[0];
      if (eid === "AMBIG") field("item", it && it.state === "supported", false);
      else if (eid === "NOT_FOUND") field("item", true, !!(it && it.notInList));
      else {
        field("item", it && it.state === "supported", it && it.product_id === eid);
        if (esz) field("size", it && it.size && it.size.state === "supported", it && it.size && it.size.value === esz);
        else notes.push("size: " + (it && it.size ? it.size.state : "none") + " (expected missing)");
        field("qty", it && it.qty && it.qty.state === "supported", it && it.qty && it.qty.value === eq);
      }
    }
    if (e.price_requested) field("price ask", !!d.price_request, d.price_request && d.price_request.paise === e.price_requested * 100);
    rows.push([c.id, notes.join(" · ") + (cc.ok ? ` · total ${cc.total / 100}` : "") + (ms ? ` · ${ms} ms` : "")]);
  }
  rows.forEach(r => console.log(r[0].padEnd(5), r[1]));
  console.log(`\n${MOCK ? "MOCK" : process.env.CLAUDE_MODEL || "claude-sonnet-5-5"} · ${F1.length} F1 cases · correct & accepted ${tally.correct} · flagged ${tally.flagged} · SILENT ERRORS ${tally.silent}`);
  fs.writeFileSync(path.join(root, "extraction-test", MOCK ? "eval-mock.json" : "eval-live.json"), JSON.stringify({ when: new Date().toISOString(), model: MOCK ? "mock" : process.env.CLAUDE_MODEL || "claude-sonnet-5-5", tally, rows }, null, 2));
  process.exit(tally.silent ? 1 : 0);
})();
