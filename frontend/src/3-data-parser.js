"use strict";
/* Optional real-AI hook. Leave null. If set, POST {chat, catalogue, rules} and expect DATA.schemaExample shape back.
   Never put an API key in this page. */
const AI_ENDPOINT = null;

/* ===== DATA: all wording, numbers and sample chats live here ===== */
const DATA = {
  merchant: { name: "Meera Threads", handle: "@meerathreads", seller: "Meera" },
  catalogue: [
    { id: "MT-KUR-014", name: "Blue Bandhani Kurti", ini: "BB", sizes: ["S","M","L","XL"], paise: 119900, colour: ["blue"], sw: "linear-gradient(135deg,#1f4fd1,#6d93f0)" },
    { id: "MT-KUR-016", name: "Navy Bandhani Kurti", ini: "NB", sizes: ["S","M","L","XL"], paise: 129900, colour: ["navy","blue"], sw: "linear-gradient(135deg,#0f1d4a,#3a5596)" },
    { id: "MT-COR-003", name: "Black Linen Co-ord Set", ini: "BC", sizes: ["S","M","L","XL"], paise: 189900, colour: ["black"], sw: "linear-gradient(135deg,#1c1c1f,#5a5c63)" },
    { id: "MT-KUR-030", name: "White Cotton Kurti", ini: "WC", sizes: ["S","M","L","XL"], paise: 99900, colour: ["white"], sw: "linear-gradient(135deg,#eef1f6,#ffffff)", light: true },
    { id: "MT-SAR-005", name: "Maroon Banarasi Saree", ini: "MS", sizes: ["Free"], paise: 399900, colour: ["maroon"], sw: "linear-gradient(135deg,#5c0f1f,#a3283f)" }
  ],
  settings: { deliveryPaise: 8000, freeAbovePaise: 299900, dispatch: "Dispatch within 24 hrs of payment", lang: "hinglish", expiryHrs: 24, followCap: 2 },
  schemaExample: {"channel":"instagram","buyer":"Ritu","multiple_customers":false,
    "agreement":{"state":"agreed","quote":"ok done, bhej do link"},
    "items":[{"product_id":"MT-KUR-014","candidates":["MT-KUR-014"],"state":"supported","quote":"ye blue wala",
      "size":{"value":"M","state":"supported","quote":"M size me hai"},"qty":{"value":2,"state":"supported","quote":"2 chahiye"}}],
    "price_request":null,"delivery":{"paise":8000,"source":"setting"},"city":"Pune"},
  scenarios: [
    { key: "ritu", title: "Ritu: clean order → Paid", short: "Clean order → Paid", ch: "instagram", buyer: "Ritu", handle: "ritu.styles", av: "linear-gradient(135deg,#f59e0b,#ec4899)", link: "CT-1042", clock: [11,5,2],
      chat: [["reel","Blue Bandhani Kurti"],["Ritu","Hi di ye blue wala M size me hai? 2 chahiye. Pune bhejoge? kitna hua total"],["Me","Haan di M available hai 😊"],["Ritu","ok done, bhej do link"]] },
    { key: "kavya", title: "Kavya: unclear product + price ask → Unpaid → follow-up", short: "Unclear product + price ask → Unpaid", ch: "instagram", buyer: "Kavya", handle: "kavya.closet", av: "linear-gradient(135deg,#8b5cf6,#06b6d4)", link: "CT-1043", clock: [12,18,40],
      chat: [["Kavya","wo blue wala kurti 1 chahiye, L size, 1,100 kar do na"],["Me","dekhti hoon"],["Kavya","ok link bhejo"]],
      pick: { product: "MT-KUR-014", price: "keep" } },
    { key: "sana", title: "Sana: size missing → ask → Paid", short: "Size missing → ask → Paid", ch: "whatsapp", buyer: "Sana", phone: "+91 98XXX XXX21", av: "linear-gradient(135deg,#10b981,#0ea5e9)", link: "CT-1044", clock: [16,2,15],
      chat: [["Sana","Hi, black co-ord set chahiye. Ahmedabad bhejna hai. link bhejo"]], later: [["Sana","L"]] }
  ],
  examples: [
    { label: "Clean order", ch: "instagram", text: "[reel: Blue Bandhani Kurti]\nRitu: Hi di ye blue wala M size me hai? 2 chahiye. Pune bhejoge?\nMe: Haan di M available hai\nRitu: ok done, bhej do link" },
    { label: "Unclear product + price ask", ch: "instagram", text: "Kavya: wo blue wala kurti 1 chahiye, L size, 1,100 kar do na\nMe: dekhti hoon\nKavya: ok link bhejo" },
    { label: "Size missing", ch: "whatsapp", text: "Sana: Hi, black co-ord set chahiye. Ahmedabad bhejna hai. link bhejo" },
    { label: "Two customers", ch: "instagram", text: "Ritu: 2 white kurti M\nSana: mujhe 1 black co-ord L\nRitu: ok link bhejo\nSana: mujhe bhi" },
    { label: "Item not in list", ch: "whatsapp", text: "Neha: Mustard dupatta 1, Pune. link bhejo" }
  ],
  tests: [
    { in: "[reel: Blue Bandhani Kurti]\nHi di ye blue wala M size me hai? 2 chahiye. Pune bhejoge?\nMe: Haan di M available hai\nok done, bhej do link", expect: "Blue, M, 2; agreed; ₹2,478" },
    { in: "Is the blue kurti available? price kya hai?", expect: "Purchase not confirmed (question)" },
    { in: "black co-ord set chahiye, Ahmedabad bhejna hai. link bhejo", expect: "Black co-ord; size Missing; Create disabled" },
    { in: "blue bandhani 1 piece, L size. done, link bhejo", expect: "Blue (full name, supported), L, 1; ₹1,279" },
    { in: "wo blue wala kurti 1 chahiye, L size. done, link bhejo", expect: "Product needs confirmation (Blue / Navy)" },
    { in: "Di 2 white kurti M bhejna\nMe: ok\nsorry sorry 1 hi chahiye, L size. ok link bhejo", expect: "White, L, 1 (changed); ₹1,079" },
    { in: "[reel: Blue Bandhani Kurti]\ndi 2 le rahi hoon M size, 1,100 each kar do na\nMe: dekhti hoon\nok then link bhejo", expect: "Blue, M, 2; price needs confirmation (₹1,199 vs ₹1,100)" },
    { in: "Didi ek maroon Banarasi saree chahiye, Mumbai bhejna hai, link bhej do please", expect: "Saree, Free, 1; ₹3,999 (free delivery)" },
    { in: "ok", expect: "Unclear; no draft items" },
    { in: "Ritu: 2 white kurti M\nSana: mujhe 1 black co-ord L\nRitu: ok link bhejo\nSana: mujhe bhi", expect: "Two customers → picker" },
    { in: "Mustard dupatta 1, Pune. link bhejo", expect: "Not in your list → manual price" }
  ]
};

/* ===== small utils ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const rs = p => INR.format(Math.round(p) / 100);
const PROD = id => DATA.catalogue.find(p => p.id === id);
const uniq = a => Array.from(new Set(a));
const capWord = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const RM = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const GLYPH = (w = 22) => `<svg viewBox="0 0 24 24" aria-hidden="true" width="${w}" height="${w}"><path fill="#3395FF" d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24z"/><path fill="#0C2451" d="M14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/></svg>`;

/* 7. live parser (deterministic rules; also builds the sample demo cards) */
const P = (() => {
  const SELLER = /^(me|you|meera|seller)$/i;
  const NOT_NAMES = /^(size|price|qty|quantity|total|delivery|address|note|link|ref|order|item|items|amount|rate|pay|upi|city|time|date|http|https|rzp)$/i;
  const COLOURS = { blue: ["MT-KUR-014","MT-KUR-016"], navy: ["MT-KUR-016"], black: ["MT-COR-003"], white: ["MT-KUR-030"], maroon: ["MT-SAR-005"] };
  const KURTIS = ["MT-KUR-014","MT-KUR-016","MT-KUR-030"];
  const GARMENTS = { kurti: KURTIS, kurtis: KURTIS, kurtie: KURTIS, bandhani: ["MT-KUR-014","MT-KUR-016"], "co-ord": ["MT-COR-003"], "co-ords": ["MT-COR-003"], linen: ["MT-COR-003"], cotton: ["MT-KUR-030"], saree: ["MT-SAR-005"], sari: ["MT-SAR-005"], sarees: ["MT-SAR-005"], banarasi: ["MT-SAR-005"] };
  const PLURAL = /^(kurtis|sarees|co-ords|tops|dresses|shirts|dupattas)$/;
  const UNKNOWN = ["dupatta","dupattas","lehenga","kurta","top","tops","jeans","dress","shirt","gown","blouse","palazzo","skirt","suit","stole","shawl"];
  const FULL = [
    [/\bblue bandhani\b/, "MT-KUR-014"],
    [/\bnavy (?:blue )?(?:bandhani|kurti)\b/, "MT-KUR-016"],
    [/\bblack (?:linen )?co-ord\b|\bblack linen\b/, "MT-COR-003"],
    [/\bwhite (?:cotton )?kurti\b|\bwhite cotton\b/, "MT-KUR-030"],
    [/\bmaroon (?:banarasi )?(?:saree|sari)\b|\bbanarasi\b/, "MT-SAR-005"]
  ];
  const NUMW = { ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, one: 1, two: 2, three: 3, four: 4, five: 5 };
  const DO_VERBS = /^(bhej|kar|de|dedo|karo|dikha|bata|send|rakh|bol|bhijwa|pack)$/;
  const CTX = new Set(["piece","pieces","pcs","pc","chahiye","chahie","chaiye","chahiya","lena","lene","le","lungi","lunga","set","sets"]);
  const DEMONS = new Set(["ye","yeh","wo","woh","vo","the","this","that","ek","a","an"]);
  const AFTER = new Set(["wala","wali","vala","wale","set","piece","kurti","saree"]);
  const CUE = /\b(sorry|actually|nahi|nahin|instead|jagah|make it|change)\b|\bhi chahiye\b/i;
  const AGREE = /\b(ok(?:ay)? done|done|link bhejo|link bhej(?:na| do| dena| dijiye| de)|bhej do link|send (?:me )?(?:the )?link|link send|confirm(?:ed)?|pakka|le lung[ie]|book kar(?:o| do| dijiye))\b/i;
  const QUESTION = /\?|\bavailable\b|price kya|\bkitn[ae]\b|hai kya|how much|\bprice\b|\brate\b/i;
  const PRICE_CUE = /kar do|kardo|\beach\b|discount|\bkam\b|\bless\b|₹|\brs\.?\b|\brupees\b|\bme de do\b|\bmein\b/i;
  const CITIES = ["pune","mumbai","delhi","new delhi","bengaluru","bangalore","hyderabad","chennai","kolkata","ahmedabad","surat","jaipur","lucknow","kanpur","nagpur","indore","bhopal","patna","vadodara","ludhiana","agra","nashik","rajkot","varanasi","chandigarh","coimbatore","kochi","guwahati","noida","gurgaon","gurugram","thane","visakhapatnam","mysuru"];
  const TOK = /\d{1,3}(?:,\d{2,3})+|\d+|[\p{L}\p{M}][\p{L}\p{M}\p{N}'’-]*|[.,!?;₹]/gu;

  function toks(s) { const a = []; let m; TOK.lastIndex = 0; while ((m = TOK.exec(s))) a.push({ t: m[0], l: m[0].toLowerCase(), s: m.index, e: m.index + m[0].length }); return a; }
  const isPunct = t => /^[.,!?;]$/.test(t.t);
  const numVal = t => /^\d/.test(t.t) ? parseInt(t.t.replace(/,/g, ""), 10) : null;
  function fwd(text, tk, i, n) { let j = i, c = 0; while (j + 1 < tk.length && !isPunct(tk[j + 1]) && c < n) { j++; c++; } return text.slice(tk[i].s, tk[j].e); }
  function sentence(text, idx) {
    const pick = (parts, base) => { let pos = 0; for (const p of parts) { const at = text.indexOf(p, pos); if (idx >= at && idx < at + p.length) return p.replace(/[.!,]+$/, "").trim(); pos = at + p.length; } return text.trim(); };
    let s = pick(text.split(/(?<=[.!?])\s+/));
    if (s.length > 40) s = pick(text.split(/,\s+/));
    return s;
  }

  function splitLines(text) {
    const out = [];
    String(text || "").replace(/\r/g, "").split("\n").forEach(raw => {
      let l = raw.trim(); if (!l) return;
      l = l.replace(/\bco[\s]+ords?\b|\bcoords?\b/gi, m => /s$/i.test(m) ? "co-ords" : "co-ord");
      const reel = l.match(/^\[(?:reel|shared image|shared post|image|photo|post|product)\s*:\s*(.+?)\]$/i);
      if (reel) { out.push({ who: "buyer", name: null, text: reel[1].trim(), reel: true }); return; }
      const m = l.match(/^([A-Za-z][A-Za-z .'_-]{0,24}?)\s*:\s*(.+)$/);
      if (m && !NOT_NAMES.test(m[1].trim())) {
        const nm = m[1].trim();
        if (SELLER.test(nm)) out.push({ who: "seller", name: "Me", text: m[2].trim() });
        else out.push({ who: "buyer", name: capWord(nm.split(/\s+/)[0]), text: m[2].trim() });
        return;
      }
      out.push({ who: "buyer", name: null, text: l });
    });
    const first = (out.find(x => x.who === "buyer" && x.name && !x.reel) || {}).name || null;
    out.forEach((x, i) => {
      if (x.who !== "buyer" || x.name) return;
      if (x.reel) { const nx = out.slice(i + 1).find(y => y.who === "buyer" && !y.reel && y.name); const pv = out.slice(0, i).reverse().find(y => y.who === "buyer" && !y.reel && y.name); x.name = (nx || pv || {}).name || first; }
      else x.name = first;
    });
    out.forEach((x, i) => { x.i = i; });
    return out;
  }

  function mentionsItem(text) {
    const l = " " + text.toLowerCase() + " ";
    return Object.keys(GARMENTS).some(g => l.includes(" " + g)) || UNKNOWN.some(g => new RegExp("\\b" + g + "\\b").test(l)) || Object.keys(COLOURS).some(c => new RegExp("\\b" + c + "\\b").test(l));
  }

  function reelProduct(t) {
    const l = t.toLowerCase();
    for (const [re, id] of FULL) if (re.test(l)) return id;
    const p = DATA.catalogue.find(p => l.includes(p.name.toLowerCase())); return p ? p.id : null;
  }

  function productField(lines) {
    const buyerTxt = lines.filter(x => x.who === "buyer" && !x.reel);
    const reels = lines.filter(x => x.reel);
    const reelIds = uniq(reels.map(r => reelProduct(r.text)).filter(Boolean));
    const reelQuote = reels.length ? "Reel: " + reels[reels.length - 1].text : null;
    // full names
    const full = [];
    buyerTxt.forEach(ln => { const lo = ln.text.toLowerCase(); FULL.forEach(([re, id]) => { const m = lo.match(re); if (m) full.push({ id, ln, at: m.index, end: m.index + m[0].length }); }); });
    const quoteAt = (ln, s, e) => { // extend with demonstratives / wala
      const tk = toks(ln.text); let i = tk.findIndex(t => t.s >= s), j = -1; tk.forEach((t, k) => { if (t.e <= e) j = k; });
      if (i < 0) return ln.text.slice(s, e); if (j < i) j = i;
      if (i > 0 && DEMONS.has(tk[i - 1].l)) i--;
      if (j + 1 < tk.length && AFTER.has(tk[j + 1].l)) j++;
      return ln.text.slice(tk[i].s, tk[j].e);
    };
    if (full.length) {
      const ids = uniq(full.map(f => f.id)); const f = full[0]; const q = quoteAt(f.ln, f.at, f.end);
      if (reelIds.length && !reelIds.some(r => ids.includes(r))) return { state: "needs", reason: "conflict", candidates: uniq(ids.concat(reelIds)), quote: q, reel: reelQuote, line: f.ln.i };
      if (ids.length > 1) return { state: "needs", reason: "two", candidates: ids, quote: q, line: f.ln.i };
      return { state: "supported", product_id: ids[0], candidates: [ids[0]], quote: q, reel: reelIds.includes(ids[0]) ? reelQuote : null, line: f.ln.i };
    }
    // keywords
    let colours = [], garments = [], unk = null, hitLine = null, span = null;
    buyerTxt.forEach(ln => {
      const tk = toks(ln.text); let first = -1, last = -1;
      tk.forEach((t, k) => {
        const isC = COLOURS[t.l], isG = GARMENTS[t.l];
        if (isC) colours.push(t.l); if (isG) garments.push(t.l);
        if (isC || isG) { if (first < 0) first = k; last = k; }
        if (!unk && UNKNOWN.includes(t.l)) { let a = k; if (k > 0 && !numVal(tk[k - 1]) && !DEMONS.has(tk[k - 1].l) && /^[a-z]+$/.test(tk[k - 1].l) && !["mujhe","di","didi","hi","hello","ek"].includes(tk[k - 1].l)) a = k - 1; unk = { name: capWord(ln.text.slice(tk[a].s, tk[k].e)), ln, s: tk[a].s, e: tk[k].e, plural: PLURAL.test(t.l) }; }
      });
      if (first >= 0 && !hitLine) { hitLine = ln; span = [tk[first].s, tk[last].e]; }
    });
    colours = uniq(colours); garments = uniq(garments);
    let cand = null;
    if (colours.length) cand = uniq([].concat(...colours.map(c => COLOURS[c])));
    if (garments.length) { const g = garments.map(x => GARMENTS[x]).reduce((a, b) => a.filter(x => b.includes(x))); cand = cand ? (cand.filter(x => g.includes(x)).length ? cand.filter(x => g.includes(x)) : cand) : g; }
    const q = hitLine ? quoteAt(hitLine, span[0], span[1]) : null;
    const plural = hitLine ? toks(hitLine.text).some(t => PLURAL.test(t.l)) : false;
    if (cand && cand.length) {
      if (reelIds.length) {
        if (cand.includes(reelIds[0])) return { state: "supported", product_id: reelIds[0], candidates: [reelIds[0]], quote: q, reel: reelQuote, line: hitLine.i, plural };
        return { state: "needs", reason: "conflict", candidates: uniq(cand.concat(reelIds)), quote: q, reel: reelQuote, line: hitLine.i, plural };
      }
      if (cand.length === 1) return { state: "supported", product_id: cand[0], candidates: cand, quote: q, line: hitLine.i, plural };
      const colourCaused = colours.some(c => COLOURS[c].length > 1);
      return { state: "needs", reason: colourCaused ? "colour" : "type", candidates: cand, quote: q, colour: colours.find(c => COLOURS[c].length > 1) || null, line: hitLine.i, plural };
    }
    if (reelIds.length) return { state: "supported", product_id: reelIds[0], candidates: [reelIds[0]], quote: null, reel: reelQuote, line: reels[0].i };
    if (unk) return { state: "missing", notInList: true, name: unk.name, candidates: [], quote: unk.ln.text.slice(unk.s, unk.e), line: unk.ln.i, plural: unk.plural };
    return null;
  }

  function collect(lines, who, fn) { const out = []; lines.filter(x => x.who === who && !x.reel).forEach(ln => { const tk = toks(ln.text); tk.forEach((t, k) => { const v = fn(t, k, tk, ln); if (v != null) out.push({ value: v, line: ln.i, quote: fwd(ln.text, tk, k, v === "Free" ? 1 : 3).replace(/[?]$/, ""), cue: CUE.test(ln.text) }); }); }); return out; }

  function sizeOf(t, k, tk) {
    const nx = tk[k + 1] ? tk[k + 1].l : "", pv = tk[k - 1] ? tk[k - 1].l : "";
    if (["S","M","L"].includes(t.t)) return t.t;
    if (["xs","xl","xxl","xxxl"].includes(t.l)) return t.l.toUpperCase();
    if (["s","m","l"].includes(t.l) && (nx === "size" || pv === "size")) return t.l.toUpperCase();
    if (t.l === "medium") return "M"; if (t.l === "large") return "L"; if (t.l === "small") return "S";
    return null;
  }
  function sizeQuote(lines, who) { // nicer quote: start at size token, stop at punctuation, up to 3 more words
    return collect(lines, who, sizeOf);
  }
  function qtyOf(t, k, tk) {
    const nx = tk[k + 1] ? tk[k + 1].l : "", nx2 = tk[k + 2] ? tk[k + 2].l : "", pv = tk[k - 1] ? tk[k - 1].l : "";
    let v = null;
    if (/^\d+$/.test(t.t)) { v = parseInt(t.t, 10); if (v < 1 || v > 20) return null; if (pv === "₹" || pv === "rs" || nx === "size" || nx === "rs") return null; }
    else if (NUMW[t.l] != null) { if (t.l === "do" && DO_VERBS.test(pv)) return null; v = NUMW[t.l]; }
    else return null;
    const item = w => !!(GARMENTS[w] || COLOURS[w] || UNKNOWN.includes(w) || w === "set");
    const ok = item(nx) || CTX.has(nx) || (nx === "hi" && /chah/.test(nx2)) || (nx && item(nx2) && /^[a-z]+$/.test(nx)) || (/^\d/.test(t.t) && (item(pv) || pv === "co-ord"));
    if (!ok) return null;
    if (t.l === "do" && !(item(nx) || item(nx2) || /piece|pcs|pc/.test(nx))) return null;
    return v;
  }
  function resolveField(ms, sellerMs) {
    if (!ms.length) return null;
    const vals = uniq(ms.map(m => m.value)); let f;
    if (vals.length === 1) f = { value: vals[0], state: "supported", quote: ms[0].quote, line: ms[0].line };
    else {
      const last = ms[ms.length - 1], prev = ms.slice().reverse().find(m => m.value !== last.value);
      if (last.cue) f = { value: last.value, state: "supported", changed: true, quote: last.quote, was: prev.quote, wasValue: prev.value, wasLine: prev.line, line: last.line };
      else f = { value: null, state: "needs", reason: "two", candidates: vals, quote: prev.quote + " / " + last.quote, line: last.line };
    }
    const lastBuyer = ms[ms.length - 1].line;
    const sug = (sellerMs || []).filter(m => m.line > lastBuyer && f.value != null && m.value !== f.value);
    if (sug.length) f = { value: null, state: "needs", reason: "seller", candidates: uniq([f.value, sug[sug.length - 1].value]), quote: "You: " + sug[sug.length - 1].quote, line: sug[sug.length - 1].line };
    return f;
  }

  function agreementOf(lines) {
    const b = lines.filter(x => x.who === "buyer" && !x.reel);
    for (let i = b.length - 1; i >= 0; i--) { const m = b[i].text.match(AGREE); if (m) return { state: "agreed", quote: sentence(b[i].text, m.index), line: b[i].i }; }
    for (let i = b.length - 1; i >= 0; i--) { const m = b[i].text.match(QUESTION); if (m) return { state: "question", quote: sentence(b[i].text, m.index), line: b[i].i }; }
    const last = b[b.length - 1]; return { state: "unclear", quote: last ? last.text : "", line: last ? last.i : null };
  }

  function priceRequestOf(lines) {
    let out = null; const prices = DATA.catalogue.map(p => p.paise / 100);
    lines.filter(x => x.who === "buyer" && !x.reel).forEach(ln => {
      if (!PRICE_CUE.test(ln.text) || /delivery|shipping|courier/i.test(ln.text)) return;
      const tk = toks(ln.text);
      tk.forEach((t, k) => { const v = numVal(t); if (v != null && v >= 50 && v <= 500000 && !prices.includes(v)) out = { paise: v * 100, quote: fwd(ln.text, tk, k, 3), line: ln.i }; });
    });
    return out;
  }
  function deliveryOf(lines) {
    let out = { source: "setting" };
    lines.filter(x => !x.reel).forEach(ln => {
      const l = ln.text.toLowerCase(); let m;
      if ((m = l.match(/free (?:delivery|shipping)|(?:delivery|shipping) (?:free|muft)/))) out = { source: "chat", state: "needs", paise: 0, quote: sentence(ln.text, m.index), who: ln.who, line: ln.i };
      else if ((m = l.match(/(?:delivery|shipping|courier)(?: charge| charges)?\s*(?:₹|rs\.?)?\s*(\d{2,4})|(?:₹|rs\.?)?\s*(\d{2,4})\s*(?:rs\s*)?(?:delivery|shipping|courier)/))) out = { source: "chat", state: "needs", paise: parseInt(m[1] || m[2], 10) * 100, quote: sentence(ln.text, m.index), who: ln.who, line: ln.i };
    });
    return out;
  }
  function cityOf(lines) {
    for (const ln of lines.filter(x => x.who === "buyer" && !x.reel)) { const lo = ln.text.toLowerCase(); for (const c of CITIES) { const m = lo.match(new RegExp("\\b" + c + "\\b")); if (m) return { value: capWord(c), quote: fwd(ln.text, toks(ln.text), toks(ln.text).findIndex(t => t.s >= m.index), 1), line: ln.i }; } }
    return null;
  }

  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  function parse(text, channel, opt = {}) {
    const T0 = now();
    const all = splitLines(text);
    const buyers = uniq(all.filter(x => x.who === "buyer" && !x.reel && x.name).map(x => x.name));
    const ordering = buyers.filter(n => all.some(x => x.who === "buyer" && x.name === n && mentionsItem(x.text)));
    const multiple = ordering.length >= 2;
    const draft = { channel, buyer: null, buyers: ordering.length ? ordering : buyers, multiple_customers: multiple, agreement: null, items: [], price_request: null, delivery: { source: "setting" }, city: null, lines: all, di: false };
    let buyer = opt.buyer || (multiple ? null : buyers[0] || null);
    if (multiple && !buyer) return draft;
    draft.buyer = buyer;
    const lines = all.filter(x => x.who === "seller" || x.name === buyer || (!buyer));
    draft.used = lines.map(x => x.i);
    draft.di = lines.some(x => x.who === "buyer" && /\b(di|didi)\b/i.test(x.text));
    draft.agreement = agreementOf(lines);
    const tm0 = now(); const prod = productField(lines); const tm1 = now();
    if (prod) {
      const pid = prod.product_id, p = pid ? PROD(pid) : null;
      const item = Object.assign({ product_id: pid || null }, prod);
      // size
      const free = p && p.sizes[0] === "Free";
      const candSized = prod.candidates.length && prod.candidates.every(id => PROD(id).sizes[0] !== "Free");
      if (prod.notInList) item.size = { value: null, state: "na" };
      else if (free) item.size = { value: "Free", state: "supported", quote: "Saree · free size", auto: true };
      else {
        const sz = resolveField(sizeQuote(lines, "buyer"), sizeQuote(lines, "seller"));
        item.size = sz || { value: null, state: candSized || p ? "missing" : "na" };
      }
      // quantity
      const q = resolveField(collect(lines, "buyer", qtyOf), []);
      if (q) item.qty = q;
      else if (!prod.plural) item.qty = { value: 1, state: "supported", quote: prod.quote || (prod.reel || ""), auto: true };
      else item.qty = { value: null, state: "missing" };
      draft.items.push(item);
    }
    if (draft.agreement.state === "unclear" && !draft.items.length) draft.items = [];
    draft.price_request = priceRequestOf(lines);
    draft.delivery = deliveryOf(lines);
    draft.city = cityOf(lines);
    draft.t = { total: now() - T0, match: tm1 - tm0 };
    return draft;
  }

  // Code-side colour-ambiguity rule, shared with the server guard: a colour word that fits more than one
  // product, with no full product name, means the seller must choose.
  function colourCheck(text) {
    const lo = String(text || "").toLowerCase();
    if (FULL.some(([re]) => re.test(lo))) return { ambiguous: false };
    for (const c of Object.keys(COLOURS)) if (new RegExp("\\b" + c + "\\b").test(lo) && COLOURS[c].length > 1) return { ambiguous: true, colour: c, candidates: COLOURS[c].slice() };
    return { ambiguous: false };
  }
  return { parse, splitLines, toks, colourCheck, reelProduct };
})();

/* ===== money + checklist (integer paise, code only) ===== */
function compute(d, res, set) {
  res = res || {}; set = set || DATA.settings;
  const it = d && d.items[0];
  const out = { ok: false, lines: [], subtotal: 0, delivery: null, discount: res.discountPaise || 0, total: null, checks: [], todo: 0, pid: null, unit: null, qty: null, size: null, name: null };
  if (!d) return out;
  let pid = null, name = null, unit = null, size = null, qty = null, sizeNeeded = true;
  if (it) {
    if (it.notInList) { name = (res.manualName || it.name || "").trim() || null; unit = res.manualPaise > 0 ? res.manualPaise : null; sizeNeeded = false; size = res.manualSize || null; }
    else {
      pid = it.state === "supported" ? it.product_id : (res.product || null);
      const p = pid ? PROD(pid) : null;
      if (p) { name = p.name; unit = p.paise; if (p.sizes[0] === "Free") { size = "Free"; sizeNeeded = false; } }
    }
    if (pid && d.price_request) { if (res.price === "keep") unit = PROD(pid).paise; else if (res.price === "use") unit = d.price_request.paise; else unit = null; }
    if (sizeNeeded) { const s = it.size || {}; size = res.size || (s.state === "supported" ? s.value : null); }
    const q = it.qty || {}; qty = res.qty || (q.state === "supported" ? q.value : null);
  }
  out.pid = pid; out.name = name; out.unit = unit; out.size = size; out.qty = qty;
  const haveItem = !!(it && name && qty);
  if (haveItem && unit != null) { out.subtotal = unit * qty; out.lines.push({ name, size, qty, unit, amount: unit * qty }); }
  // delivery
  let delOk = false;
  if (res.deliveryPaise != null) { out.delivery = res.deliveryPaise; delOk = true; out.delSrc = "changed by you"; }
  else if (d.delivery && d.delivery.source === "chat" && !res.delSetting) { out.delivery = null; delOk = false; out.delSrc = "chat"; }
  else if (haveItem && unit != null) { out.delivery = out.subtotal > set.freeAbovePaise ? 0 : set.deliveryPaise; delOk = true; out.delSrc = out.delivery === 0 ? "free above " + rs(set.freeAbovePaise) : "your setting"; }
  else delOk = true; // her delivery setting applies as soon as the order is priced
  const agreed = d.agreement && (d.agreement.state === "agreed" || res.agree);
  out.checks = [
    { k: "Product and quantity", ok: haveItem },
    { k: "Size", ok: !sizeNeeded || !!size, na: !sizeNeeded && !(it && it.notInList) ? "free size" : (!sizeNeeded ? "not needed" : null) },
    { k: "Payable unit price", ok: unit != null },
    { k: "Delivery", ok: delOk },
    { k: "Tax or discount", ok: true, na: out.discount ? "discount " + rs(out.discount) : "none" },
    { k: "Buyer agreed", ok: !!agreed }
  ];
  out.todo = out.checks.filter(c => !c.ok).length;
  out.ok = !!it && out.todo === 0;
  if (out.ok) out.total = Math.max(0, out.subtotal + out.delivery - out.discount);
  return out;
}

function replyText(d, c, link, set, url) {
  set = set || DATA.settings; url = url || `rzp.io/demo/${link}`; const L = c.lines[0]; const nm = d.buyer;
  const hi = set.lang === "english" ? `Hi${nm ? " " + nm : ""} 😊` : `Hi${nm ? " " + nm : ""}${d.di && nm ? " di" : ""} 😊`;
  const item = `${L.qty} ${L.name}${L.size && L.size !== "Free" ? ` (${L.size})` : ""}`;
  const del = c.delivery ? ` + delivery ${rs(c.delivery)}` : "";
  const disc = c.discount ? ` − discount ${rs(c.discount)}` : "";
  const money = (c.delivery || c.discount) ? `${rs(c.subtotal)}${del}${disc} = ${rs(c.total)}` : `${rs(c.total)}${c.delivery === 0 ? ", free delivery" : ""}`;
  if (set.lang === "english") return `${hi} Your order: ${item}, ${money}. Pay here: ${url} · Ref ${link} · ${set.dispatch}.`;
  return `${hi} ${item} ${money}. Pay here 👉 ${url} · Ref ${link} · ${set.dispatch} 🙏`;
}
function followText(name, link, url) { return `Hi${name ? " " + name : ""}, sharing your payment link again in case you'd like to go ahead: ${url || "rzp.io/demo/" + link} (Ref ${link}).`; }
function priceReplyText(d) {
  const it = d.items[0]; const nm = d.buyer ? " " + d.buyer : "";
  if (it && it.candidates && it.candidates.length) return `Hi${nm} 😊 ` + it.candidates.map(id => `${PROD(id).name} is ${rs(PROD(id).paise)}`).join(", ") + ". Which one and which size would you like?";
  return `Hi${nm} 😊 Which item would you like? I'll share the price and a payment link.`;
}

function toSchema(d) {
  if (!d) return null;
  return { channel: d.channel, buyer: d.buyer, multiple_customers: d.multiple_customers, agreement: d.agreement && { state: d.agreement.state, quote: d.agreement.quote },
    items: d.items.map(i => ({ product_id: i.product_id || null, candidates: i.candidates, state: i.state, quote: i.quote || i.reel || null, not_in_list: !!i.notInList,
      size: i.size && { value: i.size.value, state: i.size.state, quote: i.size.quote || null, changed: !!i.size.changed }, qty: i.qty && { value: i.qty.value, state: i.qty.state, quote: i.qty.quote || null, changed: !!i.qty.changed } })),
    price_request: d.price_request ? { paise: d.price_request.paise, quote: d.price_request.quote } : null,
    delivery: d.delivery.source === "chat" ? { paise: d.delivery.paise, source: "chat", state: "needs", quote: d.delivery.quote } : { paise: null, source: "setting" },
    city: d.city ? d.city.value : null };
}
