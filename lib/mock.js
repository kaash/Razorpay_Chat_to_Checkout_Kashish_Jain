"use strict";
// MOCK_AI=1: no API key needed. Turns the rules parser's result into the same shape the AI returns,
// so the whole server path (guard, pricing, links) can be tested locally and in CI.
const { P } = require("./core");

function rawFromRules({ text, channel, buyer }) {
  if (!text) text = "[reel: Blue Bandhani Kurti]\nRitu: Hi di ye blue wala M size me hai? 2 chahiye. Pune bhejoge?\nMe: Haan di M available hai\nRitu: ok done, bhej do link";
  const d = P.parse(text, channel, buyer ? { buyer } : {});
  const raw = {
    lines: d.lines.map(l => ({ who: l.who, name: l.who === "seller" ? null : l.name, text: l.text, reel: !!l.reel })),
    buyer: d.buyer, multiple_customers: !!(d.multiple_customers && !d.buyer), buyers: d.buyers || [],
    agreement: d.agreement ? { state: d.agreement.state, quote: d.agreement.quote || null } : { state: "unclear", quote: null },
    items: [], price_request: d.price_request ? { rupees: d.price_request.paise / 100, quote: d.price_request.quote } : null,
    delivery_mention: d.delivery && d.delivery.source === "chat" ? { rupees: d.delivery.paise / 100, free: d.delivery.paise === 0, quote: d.delivery.quote, who: d.delivery.who || "buyer" } : null,
    city: d.city ? d.city.value : null
  };
  const it = d.items[0];
  if (it) {
    const f = (x, isQty) => !x || x.state === "na" ? { value: null, quote: null, confidence: 0 }
      : x.state === "supported" ? { value: x.value, quote: x.auto && isQty ? (it.quote || null) : x.quote, confidence: 0.95, changed: !!x.changed, was: x.wasValue == null ? null : x.wasValue, was_quote: x.was || null }
      : x.state === "needs" ? { value: (x.candidates || [])[x.reason === "seller" ? 0 : 1] || null, quote: null, confidence: 0.4 }
      : { value: null, quote: null, confidence: 0 };
    raw.items.push({
      mention: it.quote || it.name || null,
      candidates: it.notInList ? [] : it.state === "supported" ? [{ item_id: it.product_id, score: 0.95 }] : it.candidates.map((id, k) => ({ item_id: id, score: k ? 0.5 : 0.55 })),
      not_found: !!it.notInList, size: f(it.size), qty: f(it.qty, true)
    });
  }
  return raw;
}

module.exports = { rawFromRules };
