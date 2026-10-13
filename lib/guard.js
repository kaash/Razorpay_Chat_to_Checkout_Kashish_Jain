"use strict";
// Code checks on everything the AI proposes. The AI suggests; this file decides what counts as "supported".
//  - every quote must really be in the chat (source check)
//  - product IDs must exist in the price list; a top score must be >= 0.80 and lead the next by >= 0.15
//  - the colour-ambiguity rule is re-applied in code, whatever the AI said
//  - size and quantity need confidence >= 0.85 and a real quote, otherwise the seller checks them
//  - a price the buyer asked for is recorded, never applied
const { DATA, P } = require("./core");

const TH_FIELD = 0.85, TH_PRODUCT = 0.80, MARGIN = 0.15;
const PROD = id => DATA.catalogue.find(p => p.id === id);
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const norm = s => String(s || "").toLowerCase().replace(/\s+/g, " ").trim().replace(/^["'“”]+|["'“”?.!,]+$/g, "");
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free"];

function buildLines(raw, text) {
  if (text) return P.splitLines(text); // exact lines from what the seller pasted
  const first = (raw.lines || []).find(l => l.who === "buyer" && !l.reel && l.name);
  return (raw.lines || []).slice(0, 200).map((l, i) => ({
    i, who: l.who === "seller" ? "seller" : "buyer", reel: !!l.reel, text: String(l.text || "").slice(0, 1000),
    name: l.who === "seller" ? "Me" : (l.name ? cap(String(l.name).split(/\s+/)[0]) : (raw.buyer ? cap(raw.buyer) : (first ? cap(first.name) : null)))
  }));
}

function guard(raw, { text, channel, buyer }) {
  const t0 = Date.now();
  raw = raw || {};
  const lines = buildLines(raw, text);
  const pick = buyer ? cap(buyer) : null;
  const usedLines = pick ? lines.filter(l => l.who === "seller" || l.name === pick || l.reel) : lines;
  const checks = { pass: 0, total: 0, dropped: [] };
  const findLine = (q, label) => {
    if (!q) return -1;
    checks.total++;
    const n = norm(q).replace(/^reel: /, "");
    const hit = usedLines.find(l => norm(l.text).includes(n) || (l.reel && n && norm("reel: " + l.text).includes(n)));
    if (hit) { checks.pass++; return hit.i; }
    checks.dropped.push(label + ": " + q);
    return -1;
  };

  const names = Array.from(new Set(lines.filter(l => l.who === "buyer" && !l.reel && l.name).map(l => l.name)));
  const draft = { channel, buyer: pick || (raw.buyer ? cap(raw.buyer) : names[0] || null), buyers: (raw.buyers || []).map(cap).filter(Boolean), multiple_customers: false,
    agreement: null, items: [], price_request: null, delivery: { source: "setting" }, city: null, lines, used: usedLines.map(l => l.i), di: false };
  if (!draft.buyers.length) draft.buyers = names;

  if (raw.multiple_customers && !pick && draft.buyers.length >= 2) { draft.multiple_customers = true; draft.buyer = null; return finish(draft, checks, t0); }

  // agreement
  const a = raw.agreement || { state: "unclear", quote: null };
  let st = ["agreed", "question", "unclear"].includes(a.state) ? a.state : "unclear";
  const aLine = findLine(a.quote, "agreement");
  if (st === "agreed" && aLine < 0) st = "unclear"; // no real words, no agreement
  draft.agreement = { state: st, quote: a.quote || (usedLines.filter(l => l.who === "buyer").pop() || {}).text || "", line: aLine >= 0 ? aLine : null };

  // item (one item per request in this prototype)
  const it = (raw.items || [])[0];
  if (it) {
    const mention = it.mention || null; const mLine = findLine(mention, "item");
    const reelLine = usedLines.find(l => l.reel); const reelId = reelLine ? P.reelProduct(reelLine.text) : null;
    const cands = (it.candidates || []).filter(c => PROD(c.item_id)).sort((x, y) => y.score - x.score);
    let item;
    if (it.not_found || !cands.length) {
      if (mention || reelLine) item = { product_id: null, candidates: [], state: "missing", notInList: true, name: cap(mention || "Item"), quote: mLine >= 0 ? mention : null, line: mLine >= 0 ? mLine : null };
    } else {
      const top = cands[0], second = cands[1] ? cands[1].score : 0;
      const cc = P.colourCheck(mention || "");
      const reelBacks = reelId && reelId === top.item_id;
      const accept = top.score >= TH_PRODUCT && top.score - second >= MARGIN && (mLine >= 0 || reelBacks) && (!cc.ambiguous || reelBacks);
      if (accept) item = { product_id: top.item_id, candidates: [top.item_id], state: "supported", quote: mLine >= 0 ? mention : null, reel: reelLine ? "Reel: " + reelLine.text : null, line: mLine >= 0 ? mLine : (reelLine ? reelLine.i : null) };
      else {
        let ids = cands.filter(c => c.score >= 0.2).map(c => c.item_id);
        if (cc.ambiguous) ids = cc.candidates.concat(ids);
        if (reelId) ids.push(reelId);
        ids = Array.from(new Set(ids)).slice(0, 3); if (!ids.length) ids = [top.item_id];
        const reason = cc.ambiguous ? "colour" : (reelId && reelId !== top.item_id ? "conflict" : ids.length > 1 ? "type" : "low");
        item = { product_id: null, candidates: ids, state: "needs", reason, colour: cc.colour || null, quote: mLine >= 0 ? mention : (mention || ""), reel: reelLine ? "Reel: " + reelLine.text : null, line: mLine >= 0 ? mLine : null };
      }
    }
    if (item) {
      const p = item.product_id ? PROD(item.product_id) : (item.candidates[0] ? PROD(item.candidates[0]) : null);
      const allFree = item.candidates.length && item.candidates.every(id => PROD(id).sizes[0] === "Free");
      // size
      const s = it.size || {};
      if (item.notInList) item.size = { value: null, state: "na" };
      else if (allFree) item.size = { value: "Free", state: "supported", quote: "Saree · free size", auto: true };
      else {
        const valid = v => v && (p ? p.sizes : ALL_SIZES).includes(String(v).toUpperCase());
        const v = s.value ? String(s.value).toUpperCase() : null;
        if (!valid(v)) item.size = { value: null, state: "missing" };
        else {
          const li = findLine(s.quote, "size");
          if ((s.confidence || 0) >= TH_FIELD && li >= 0) item.size = { value: v, state: "supported", quote: s.quote, line: li, changed: !!s.changed, was: s.was_quote || null, wasValue: s.was || null };
          else item.size = { value: null, state: "needs", reason: (s.confidence || 0) < 0.5 ? "seller" : "low", candidates: [v], quote: s.quote || null, line: li >= 0 ? li : null };
        }
      }
      // quantity
      const q = it.qty || {};
      const qv = Number.isInteger(q.value) && q.value >= 1 && q.value <= 50 ? q.value : null;
      if (!qv) item.qty = { value: null, state: "missing" };
      else {
        const li = findLine(q.quote, "quantity");
        if ((q.confidence || 0) >= TH_FIELD && li >= 0) item.qty = { value: qv, state: "supported", quote: q.quote, line: li, changed: !!q.changed, was: q.was_quote || null, wasValue: q.was || null, auto: !/\d|\b(ek|do|teen|one|two|three)\b/i.test(q.quote || "") };
        else item.qty = { value: null, state: "needs", candidates: [qv], quote: q.quote || null, line: li >= 0 ? li : null };
      }
      draft.items.push(item);
    }
  }

  // a price the buyer asked for: recorded, never applied
  const pr = raw.price_request;
  if (pr && pr.rupees > 0 && pr.rupees < 1000000) { const li = findLine(pr.quote, "price request"); const it0 = draft.items[0]; const own = it0 ? (it0.product_id ? [it0.product_id] : it0.candidates || []) : [];
    if (li >= 0 && !own.some(id => PROD(id).paise === Math.round(pr.rupees * 100))) draft.price_request = { paise: Math.round(pr.rupees * 100), quote: pr.quote, line: li }; }
  // delivery mentioned in the chat: the seller confirms it
  const dm = raw.delivery_mention;
  if (dm && dm.quote) { const li = findLine(dm.quote, "delivery"); if (li >= 0) draft.delivery = { source: "chat", state: "needs", paise: dm.free ? 0 : Math.max(0, Math.round((dm.rupees || 0) * 100)), quote: dm.quote, who: dm.who === "seller" ? "seller" : "buyer", line: li }; }
  // city: shown, never used for money
  if (raw.city) { const c = String(raw.city).slice(0, 40); const hit = usedLines.find(l => norm(l.text).includes(norm(c))); if (hit) draft.city = { value: cap(c), quote: c, line: hit.i }; }
  draft.di = usedLines.some(l => l.who === "buyer" && /\b(di|didi)\b/i.test(l.text));
  return finish(draft, checks, t0);
}

function finish(draft, checks, t0) { draft.checks = checks; draft.guard_ms = Date.now() - t0; return draft; }

module.exports = { guard, TH_FIELD, TH_PRODUCT, MARGIN };
