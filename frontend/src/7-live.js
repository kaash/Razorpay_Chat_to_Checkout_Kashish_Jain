
/* ===== live tab ===== */
const TESS_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
const LS_KEY = "c2c-live-v1";
const L = { screen: "input", text: "", ch: "instagram", imgUrl: null, draft: null, res: {}, set: Object.assign({}, DATA.settings), reqs: [], cur: null, nextId: 1101, filter: "all", sheet: false, ocr: null, copyFail: false, sent: false, notice: "", follow: {}, ai: false };
function lsLoad() { try { const j = JSON.parse(localStorage.getItem(LS_KEY) || "null"); if (j) { L.reqs = j.reqs || []; L.nextId = j.nextId || 1101; Object.assign(L.set, j.set || {}); } } catch (e) { /* storage blocked: keep in memory */ } }
function lsSave() { try { localStorage.setItem(LS_KEY, JSON.stringify({ reqs: L.reqs, nextId: L.nextId, set: L.set })); } catch (e) { /* ignore */ } }
const nowHM = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const curReq = () => L.reqs.find(r => r.id === L.cur);

/* ===== server features (AI + Razorpay test mode). Detected at load; the page works without them. ===== */
const API = { checked: false, ai: false, aiMode: "off", model: null, pay: false, payMode: "off" };
async function fetchJson(url, body, ms, method) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms || 15000);
  try {
    const r = await fetch(url, { method: method || (body ? "POST" : "GET"), headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || ("HTTP " + r.status));
    return j;
  } finally { clearTimeout(t); }
}
async function detectApi() {
  try {
    if (location.protocol === "file:") throw new Error("file");
    const h = await fetchJson("api/health", null, 3000);
    Object.assign(API, { ai: !!h.ai, aiMode: h.ai_mode || "off", model: h.model || null, pay: !!h.payments, payMode: h.payments_mode || "off" });
  } catch (e) { /* static hosting or offline: rules + simulation, as before */ }
  API.checked = true;
  if (S.tab === "live") { if (!L.draft) liveFlowReset(); liveRender(); }
  logLine(API.ai ? `AI on (${API.model}) · payments ${API.pay ? API.payMode + " mode" : "simulated"}` : "Running without a server: rules in the browser, payments simulated");
}
function fileToDataUrl(file, max) {
  return new Promise((res, rej) => { const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => { const k = Math.min(1, (max || 1600) / Math.max(im.naturalWidth, im.naturalHeight)); const cv = document.createElement("canvas"); cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k); cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height); res(cv.toDataURL("image/jpeg", 0.85)); }; im.onerror = rej; im.src = u; });
}
function hydrate(d, meta) {
  d.lines = (d.lines || []).map((l, i) => Object.assign({}, l, { i }));
  if (!d.used) d.used = d.lines.map(l => l.i);
  d.t = { total: meta ? meta.total_ms : 0, match: 0 }; d.ai = meta || null;
  return d;
}

async function copyText(t) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch (e) { /* fall through */ }
  try { const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return !!ok; } catch (e) { return false; }
}

function LFLOW() {
  const ai = API.ai || !!AI_ENDPOINT, img = !!L.useImage;
  return { title: "Live run", nodes: [
    N("in", "data", img || (L.imgUrl && L.ocr && L.ocr.state === "done") ? "Input: screenshot" : "Input: text", 0, 0, ai ? "What you pasted or uploaded. Sent to the server for this request only." : "What you pasted or uploaded. It stays in this page."),
    ai ? N("ocr", "ai", "AI reads screenshot", 1, 0, "Only for screenshots. The model reads the image and writes the chat out as lines.") : N("ocr", "code", "On-device OCR", 1, 0, "Only for screenshots. Runs in your browser with Tesseract."),
    N("ext", ai ? "ai" : "code", ai ? "AI extraction" : "Field extraction (rules)", 2, 0, ai ? `${API.model || "AI model"} suggested each field with the words it came from. No prices.` : "Rules here. In the real app, an AI model suggests the fields."),
    N("src", "code", "Source check", 2, 1, ai ? "Server code checks every quote is really in the chat. Fields without a real quote are dropped." : "Every quote must really be in the chat."),
    N("match", "code", "Product matching", 1, 1, "Matches words and reels to the price list."),
    N("amb", "code", "Colour-ambiguity rule", 0, 1, "If a colour fits more than one item, the seller picks."),
    N("price", "code", "Pricing in paise", 0, 2, "Quantity × list price + delivery, in integer paise."),
    N("ck", "code", "Approval checklist", 1, 2, "All 6 checks must pass before Create."),
    N("link", "code", API.pay ? "Payment Link (test)" : "Link (simulated)", 2, 2, API.pay ? "A real Razorpay Payment Link in test mode. The server re-prices the order before creating it." : "A demo Payment Link reference. Nothing is created for real."),
    N("st", "out", "Status", 2, 3, "Unpaid, Paid or Expired, from the simulated buyer.")
  ], edges: [["in", "ocr"], ["ocr", "ext", "text"], ["ext", "src", "fields"], ["src", "match"], ["match", "amb"], ["amb", "price"], ["price", "ck"], ["ck", "link"], ["link", "st"]] };
}
function liveFlowReset() { F.timers.forEach(clearTimeout); F.flow = LFLOW(); F.sts = {}; F.ms = {}; F.flow.nodes.forEach(n => F.sts[n.id] = "idle"); setStat("idle", "Waiting for a chat"); draw(); }
const fmtMs = v => v < 0.1 ? "<0.1 ms" : v < 10 ? v.toFixed(1) + " ms" : Math.round(v) + " ms";
function sourceCheck(d) {
  const all = d.lines.map(l => (l.reel ? "Reel: " + l.text : l.text).toLowerCase()); const qs = [];
  const it = d.items[0];
  if (d.agreement && d.agreement.quote) qs.push(d.agreement.quote);
  if (it) { [it.quote, it.reel, it.size && !it.size.auto && it.size.quote, it.qty && !it.qty.auto && it.qty.quote].forEach(q => q && qs.push(q)); }
  if (d.price_request) qs.push(d.price_request.quote);
  const pass = qs.filter(q => all.some(t => t.includes(q.toLowerCase()))).length; return { pass, total: qs.length };
}
function liveFlowUpdate() {
  if (!L.draft || S.tab !== "live") return; const d = L.draft, c = compute(d, L.res, L.set), it = d.items[0], n = F.flow.nodes, by = id => n.find(x => x.id === id);
  if (d.multiple_customers && !d.buyer) { F.sts.ck = "wait"; by("ck").say = "Two people are ordering. The seller picks one first."; }
  else { F.sts.price = c.lines.length ? "done" : "idle"; by("price").say = c.lines.length ? `${c.lines[0].qty} × ${c.lines[0].unit} paise + delivery ${c.delivery == null ? "?" : c.delivery} = ${c.ok ? c.total + " paise" : "waiting"}` : "Waiting for an item and price.";
    F.sts.ck = c.ok ? "done" : "wait"; by("ck").say = c.ok ? "6 of 6 ready. Create is on." : `${6 - c.todo} of 6 ready. Waiting for: ${c.checks.filter(x => !x.ok).map(x => x.k.toLowerCase()).join(", ")}.`; }
  const r = curReq();
  if (r) { F.sts.link = "done"; by("link").say = `${r.url || "rzp.io/demo/" + r.id}${r.url ? " (Razorpay " + (API.payMode === "mock" ? "mock" : "test mode") + ")" : " (demo)"}. Reply ${r.copied ? "copied" : "shown for manual copy"}.`; F.sts.st = "done"; by("st").l = "Status: " + statusWord(r.status); by("st").say = r.status === "paid" ? (r.plink ? "Paid, read from Razorpay." : "Simulated buyer paid.") : r.status === "cancelled" ? "Cancelled. Make a new request from the chat; prices are checked again." : r.status === "expired" ? "The link expired. Make a new request from the chat; prices are checked again." : r.aged ? "No payment after 26 hrs (simulated). Follow-up is available." : "Waiting for the buyer."; }
  else { F.sts.link = "idle"; F.sts.st = "idle"; by("st").l = "Status"; }
  setStat(r ? "ok" : c.ok ? "ok" : "wait", r ? (r.status === "unpaid" ? "Link ready" : statusWord(r.status)) : c.ok ? "Ready to create" : "Seller's turn");
  draw(); showJson();
}
function showJson() { const pre = $("#json-out"); if (!pre) return; const c = L.draft ? compute(L.draft, L.res, L.set) : null; pre.textContent = JSON.stringify(L.draft ? Object.assign(toSchema(L.draft), { _decisions: L.res, _total_paise: c && c.ok ? c.total : null, _checklist: c ? c.checks.map(x => (x.ok ? "✓ " : "· ") + x.k) : [] }) : { note: "Draft a request to see the parsed fields." }, null, 2); }

async function liveDraft(opt = {}) {
  const ta = $("#lta"); if (ta) L.text = ta.value; const text = (L.text || "").trim();
  const useImg = !!(opt.image && API.ai);
  if (!text && !useImg) { L.notice = "Paste a chat first, or tap one of the examples."; liveRender(); return; }
  if (U.drafting) return;
  L.notice = ""; L.useImage = useImg; liveFlowReset(); F.flow.nodes.forEach(n => F.sts[n.id] = "idle");
  const usedOcr = !useImg && !!(L.imgUrl && L.ocr && L.ocr.state === "done");
  F.sts.in = "done"; F.sts.ocr = useImg ? "active" : usedOcr ? "done" : "skip"; if (usedOcr) F.ms.ocr = fmtMs(L.ocr.ms || 0);
  F.flow.nodes.find(x => x.id === "ocr").say = useImg ? "The model is reading the screenshot." : usedOcr ? `Read ${L.ocr.lines || "?"} lines at ${Math.round(L.ocr.conf || 0)}% confidence.` : "Skipped: you pasted text.";
  setStat("run", API.ai ? "AI is reading" : "Working"); draw();
  let d = null, tAI = null, meta = null;
  if (API.ai) {
    U.drafting = true; if (!opt.quiet) { L.busy = useImg ? "Reading the screenshot with AI…" : "AI is reading the chat…"; liveRender(); }
    F.sts.ext = "active"; draw();
    try {
      const body = { channel: L.ch }; if (useImg) body.image = opt.image; else body.text = text; if (opt.buyer) body.buyer = opt.buyer;
      const j = await fetchJson("api/draft", body, 60000);
      meta = j.meta; d = hydrate(j.draft, meta); tAI = meta.ai_ms;
      if (useImg) { L.text = d.lines.map(l => l.reel ? `[reel: ${l.text}]` : (l.who === "seller" ? "Me" : (l.name || "Buyer")) + ": " + l.text).join("\n"); F.ms.ocr = fmtMs(meta.ai_ms); F.sts.ocr = "done"; }
      logLine(`AI draft in ${fmtMs(meta.ai_ms)} (${meta.model}) · source check ${meta.source_check.pass}/${meta.source_check.total}`);
      (meta.source_check.dropped || []).forEach(x => logLine("Dropped, no matching words in the chat: " + x));
    } catch (e) { logLine("AI unavailable (" + e.message + "). Using the rules in this page instead."); L.notice = useImg ? "The AI couldn't read this screenshot. Paste the text instead?" : ""; d = null; }
    U.drafting = false; L.busy = "";
    if (!d && useImg) { L.screen = "input"; liveFlowReset(); liveRender(); return; }
  } else if (AI_ENDPOINT) {
    try { const t0 = performance.now(); const j = await fetchJson(AI_ENDPOINT, { chat: text, catalogue: DATA.catalogue.map(p => ({ id: p.id, name: p.name, sizes: p.sizes })), rules: "Return fields with exact quotes. Never set prices." }, 30000); d = fromSchema(j, text); tAI = performance.now() - t0; }
    catch (e) { logLine("AI endpoint failed, using rules instead"); d = null; }
  }
  if (!d) d = P.parse(text, L.ch, opt.buyer ? { buyer: opt.buyer } : {});
  L.draft = d; L.res = {}; U.hl = null; U.ck = false; U.asked = null; U.priceReply = null; U.delEdit = false; U.discEdit = false; L.cur = null; L.sent = false;
  const t1 = performance.now(); const sc = meta ? meta.source_check : sourceCheck(d); const tSrc = meta ? meta.guard_ms : performance.now() - t1;
  const t2 = performance.now(); const amb = d.items[0] && d.items[0].state === "needs"; const tAmb = performance.now() - t2;
  const it = d.items[0], n = F.flow.nodes, by = id => n.find(x => x.id === id);
  by("ext").say = `Found: ${d.multiple_customers && !d.buyer ? "two customers" : [it ? (it.product_id || it.name || "item ?") : "no item", it && it.size && it.size.value ? "size " + it.size.value : "size ?", it && it.qty && it.qty.value ? "qty " + it.qty.value : "qty ?", "agreement: " + (d.agreement ? d.agreement.state : "?")].join(" · ")}`;
  by("src").say = `${sc.pass} of ${sc.total} quotes found in the chat.` + (meta && meta.source_check.dropped && meta.source_check.dropped.length ? ` Dropped: ${meta.source_check.dropped.length}.` : "");
  by("match").say = it ? (it.notInList ? `No match for "${it.name}". Not in your list.` : it.state === "supported" ? `Matched ${it.product_id}.` : `Candidates: ${it.candidates.join(", ")}.`) : "No item words found.";
  by("amb").say = amb ? `Flagged: ${it.reason === "colour" ? `"${it.colour}" fits ${it.candidates.length} items` : "more than one reading fits"}. The seller picks.` : "Nothing ambiguous.";
  const seq = [["ext", tAI != null ? tAI : d.t ? d.t.total - d.t.match : 0], ["src", tSrc], ["match", meta ? 0 : d.t ? d.t.match : 0], ["amb", tAmb]];
  const gap = RM() ? 0 : 220;
  seq.forEach(([id, ms], i) => F.timers.push(setTimeout(() => { F.sts[id] = "active"; F.ms[id] = fmtMs(ms); draw(); }, i * gap)));
  F.timers.push(setTimeout(() => { seq.forEach(([id]) => F.sts[id] = "done"); liveFlowUpdate(); }, seq.length * gap + 60));
  if (!meta) logLine(`Parsed ${d.lines.length} line${d.lines.length === 1 ? "" : "s"} in ${fmtMs(d.t ? d.t.total : 0)} · source check ${sc.pass}/${sc.total}`);
  if (amb) logLine("Colour-ambiguity rule: seller must pick the item");
  L.screen = "card"; liveRender();
}
function fromSchema(j, text) {
  const d = P.parse(text, L.ch); if (!j || !Array.isArray(j.items)) return d;
  d.agreement = j.agreement ? Object.assign({ line: null }, j.agreement) : d.agreement;
  d.items = j.items.map(i => ({ product_id: i.product_id || null, candidates: i.candidates || (i.product_id ? [i.product_id] : []), state: i.state || "needs", quote: i.quote || null, size: i.size || { value: null, state: "missing" }, qty: i.qty || { value: null, state: "missing" }, notInList: !!i.not_in_list, name: i.name || null }));
  d.price_request = j.price_request || null; d.buyer = j.buyer || d.buyer; return d;
}

/* OCR (lazy) */
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.async = true; s.onload = res; s.onerror = () => rej(new Error("load failed")); document.head.appendChild(s); }); }
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
async function runOCR(file) {
  if (L.imgUrl) try { URL.revokeObjectURL(L.imgUrl); } catch (e) { /* ignore */ }
  if (API.ai) {
    L.imgUrl = URL.createObjectURL(file); L.ocr = null; logLine("Screenshot added · sending to the AI model");
    try { const data = await fileToDataUrl(file, 1600); await liveDraft({ image: data }); } catch (e) { L.notice = "Couldn't open this image. Try a PNG or JPG screenshot."; liveRender(); }
    return;
  }
  L.imgUrl = URL.createObjectURL(file); L.ocr = { state: "load", pct: 0 }; liveRender(); logLine("Screenshot added · loading on-device OCR");
  const t0 = performance.now();
  try {
    if (!window.Tesseract) await withTimeout(loadScript(TESS_URL), 20000);
    const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = L.imgUrl; });
    L.ocr.state = "read"; updateOcr();
    const r = await withTimeout(window.Tesseract.recognize(file, "eng", { logger: m => { if (m && m.status === "recognizing text") { L.ocr.pct = Math.round((m.progress || 0) * 100); updateOcr(); } } }), 120000);
    const data = r && r.data ? r.data : {}; const lines = (data.lines || []).filter(l => l.text && l.text.trim());
    if (!lines.length || (data.confidence || 0) < 45) throw new Error("low confidence");
    const W = img.naturalWidth || 1;
    L.text = lines.map(l => { const t = l.text.replace(/\s+/g, " ").trim(); const right = l.bbox && l.bbox.x0 > W * 0.32; return (right ? "Me: " : "") + t; }).join("\n");
    L.ocr = { state: "done", conf: data.confidence, lines: lines.length, ms: performance.now() - t0 };
    logLine(`OCR read ${lines.length} lines · ${Math.round(data.confidence)}% confidence · ${fmtMs(L.ocr.ms)}`);
  } catch (e) {
    L.ocr = { state: "fail", why: String(e && e.message || e) }; logLine("OCR could not read this screenshot (" + L.ocr.why + ")");
  }
  liveRender();
}
function updateOcr() { const el = $("#ocr-st"); if (el) el.innerHTML = ocrStatus(); }
function ocrStatus() {
  const o = L.ocr; if (!o) return "";
  if (o.state === "load") return `<div class="hint">Loading the reader…</div><div class="prog"><i style="width:8%"></i></div>`;
  if (o.state === "read") return `<div class="hint">Reading screenshot… ${o.pct || 0}%</div><div class="prog"><i style="width:${o.pct || 0}%"></i></div>`;
  if (o.state === "done") return `<div class="hint" style="color:var(--ok-ink)">Read ${o.lines} lines. Check the text below, fix who said what if needed, then draft.</div>`;
  return `<div class="wbox miss"><div class="h">Couldn't read this clearly. Paste the text instead?</div><div class="s">The screenshot stays here for reference. ${/load|timeout/.test(o.why || "") ? "The reader couldn't be downloaded in this viewer; it works when the page is opened directly." : ""}</div></div>`;
}

/* live screens */
function bnav(cur) { const n = L.reqs.length; return `<nav class="bnav" aria-label="App"><button data-a="nav" data-v="input" ${cur === "input" ? 'aria-current="page"' : ""}>${ICON.plus}Create from chat</button><button data-a="nav" data-v="requests" ${cur === "requests" ? 'aria-current="page"' : ""}>${ICON.list}Requests${n ? ` (${n})` : ""}</button><button data-a="gear">${ICON.cog}Settings</button></nav>`; }
function liveScreen() {
  const T = nowHM(); let html = "";
  if (L.screen === "input") {
    html = `<div class="scr rz">${sbar(T)}${rHead("Create from chat", "Paste a chat or upload a screenshot", { isNew: 1, gear: 1 })}<div class="bd"><div class="rbody">
      <div class="chips" role="group" aria-label="Chat app">${["instagram", "whatsapp"].map(c => `<button class="cb" data-a="lch" data-v="${c}" aria-pressed="${L.ch === c}">${chName(c)}</button>`).join("")}</div>
      <div class="fld"><label class="lbl" for="lta">Paste the chat here. Put each message on its own line. Start your own lines with "Me:"</label><textarea id="lta" class="ta" spellcheck="false" placeholder="Ritu: Hi di ye blue wala M size me hai? 2 chahiye&#10;Me: Haan di M available hai&#10;Ritu: ok done, bhej do link">${esc(L.text)}</textarea></div>
      <div class="upl"><button class="pb out" data-a="upload" style="flex:1">Upload screenshot</button><input type="file" id="lfile" accept="image/png,image/jpeg,image/webp" class="vh" tabindex="-1" aria-hidden="true">${L.imgUrl ? `<img class="thumbimg" src="${L.imgUrl}" alt="Your screenshot">` : ""}</div>
      <div id="ocr-st">${ocrStatus()}</div>
      <div class="lbl">Or try an example</div><div class="exs">${DATA.examples.map((e, i) => `<button class="ex" data-a="ex" data-v="${i}">${esc(e.label)}</button>`).join("")}</div>
      ${L.notice ? `<div class="wbox bad"><div class="s">${esc(L.notice)}</div></div>` : ""}
    </div></div><div class="ft" style="padding-bottom:10px">${L.busy ? `<button class="pb" disabled><span class="stat run" style="background:none;color:inherit;padding:0"><span class="sp"></span></span>${esc(L.busy)}</button>` : `<button class="pb" data-a="draft">Draft request</button>`}</div>${bnav("input")}${settingsSheet()}</div>`;
  } else if (L.screen === "card") {
    const d = L.draft, k = card(d, L.res, { mode: "live", set: L.set, foot: U.creating ? `<button class="pb" disabled>Creating the Payment Link…</button>` : (L.notice && L.screen === "card" ? null : null) });
    if (L.notice && !U.creating) k.body = `<div class="wbox bad"><div class="s">${esc(L.notice)}</div></div>` + k.body;
    html = appScr(T, rHead("Create from chat", `From ${d.buyer ? d.buyer + "'s" : "the"} chat · ${chName(d.channel)}`, { back: "toinput", gear: 1, isNew: 1 }), k.body, k.foot, settingsSheet());
  } else if (L.screen === "ready") {
    const r = curReq(); if (!r) { L.screen = "input"; return liveScreen(); }
    const extra = `<div class="lrow">${reqActions(r)}</div><button class="pb sec" data-a="nav" data-v="requests">See all requests</button>`;
    html = readyScr(T, { buyer: r.buyer }, { total: r.total }, r.id, r.ch, { reply: r.reply, copyFail: L.copyFail, status: r.status, expiry: L.set.expiryHrs, extra, hot: L.sent || r.status !== "unpaid" ? "" : "open", back: "nav-input", url: r.url, modeChip: r.plink ? (r.mode === "mock" ? "mock link" : "test mode") : "demo link" });
  } else if (L.screen === "handoff") {
    const r = curReq(), d = L.draft; const ps = { buyer: r.buyer || "Buyer", handle: (r.buyer || "buyer").toLowerCase(), ch: r.ch, av: "linear-gradient(135deg,#94a3b8,#64748b)", phone: "Number not in a pasted chat" };
    const msgs = (d ? d.lines : []).filter(l => !d.used || d.used.includes(l.i)).map(l => ({ who: l.reel ? "reel" : l.who === "seller" ? "me" : "buyer", text: l.text, t: "" }));
    const reel = msgs.find(m => m.who === "reel"); if (reel && !DATA.catalogue.some(p => p.name === reel.text)) reel.who = "buyer";
    if (L.sent) html = chatScr(ps, { msgs: msgs.concat([{ who: "me", text: r.reply, link: 1, new: 1, t: T }]), shot: false, time: T, end: `<div class="endcard" style="margin-top:10px"><div class="hint">Status stays <b>Link ready · Copied</b>. We can't see her press Send.</div><button class="pb" data-a="backrz">Back to Razorpay</button></div>` });
    else html = chatScr(ps, { msgs, shot: false, time: T, composer: r.reply, hot: "send", simline: `In the real app, this happens in ${chName(r.ch)}.${r.ch === "whatsapp" ? " Pasted, because a pasted chat has no number." : ""}` });
  } else if (L.screen === "requests") {
    const cnt = k => L.reqs.filter(r => k === "all" || r.status === k).length;
    const rows = L.reqs.filter(r => L.filter === "all" || r.status === L.filter).slice().reverse();
    html = `<div class="scr rz">${sbar(T)}${rHead("Payment Links", "Made in this session", {})}<div class="bd"><div class="rbody">
      <div class="chips">${[["all", "All"], ["unpaid", "Unpaid"], ["paid", "Paid"], ["expired", "Expired"], ["cancelled", "Cancelled"]].filter(([k]) => k !== "cancelled" || L.reqs.some(r => r.status === "cancelled")).map(([k, l]) => `<button class="cb" data-a="filter" data-v="${k}" aria-pressed="${L.filter === k}">${l} (${cnt(k)})</button>`).join("")}</div>
      ${rows.length ? rows.map(r => `<div class="lrow"><div class="top"><span class="nm ell">${esc(r.buyer || "Buyer")} · ${chName(r.ch)}</span>${pillFor(r.status)}</div><div class="sub">${esc(r.id)} · ${rs(r.total)} · ${esc(r.items)} · ${esc(r.at)}</div>${reqActions(r)}</div>`).join("") : `<div class="hint" style="padding:20px 0;text-align:center">No requests ${L.filter === "all" ? "yet. Draft one from a chat." : "in this filter."}</div>`}
      ${L.reqs.length ? `<button class="xbtn" data-a="clear" style="justify-self:start">Clear this session's requests</button>` : ""}
    </div></div>${bnav("requests")}${settingsSheet()}</div>`;
  }
  return html;
}
const statusWord = s => s === "paid" ? "Paid" : s === "expired" ? "Expired" : s === "cancelled" ? "Cancelled" : "Unpaid";
const pillFor = s => s === "paid" ? `<span class="st-pill p-paid">Paid</span>` : s === "expired" || s === "cancelled" ? `<span class="st-pill p-exp">${statusWord(s)}</span>` : `<span class="st-pill p-unpaid">Unpaid</span>`;
function reqActions(r) {
  const fo = L.follow[r.id];
  if (r.status === "paid") return `<div class="hint" style="color:var(--ok-ink);font-weight:700">Paid · from Razorpay's records${r.plink ? "" : " (simulated)"}</div>`;
  if (r.status === "expired" || r.status === "cancelled") return `<div class="hint">${statusWord(r.status)}. Links are not renewed automatically.</div><button class="cb" data-a="renew" data-v="${r.id}">Create a new request from chat</button>`;
  let h = `<div style="font-size:12.5px;color:var(--warn-ink);font-weight:700">Unpaid request · check before following up</div>`;
  if (r.stopped) return h + `<div class="hint">Follow-ups stopped for this request.</div>`;
  if (!r.aged) return h + `<div class="hint">Follow-up opens once the buyer has had time. Use "Buyer goes quiet" to skip ahead.</div>`;
  const cap = L.set.followCap, used = r.follows || 0;
  if (fo === "checking") h += `<span class="stat run" style="justify-self:start"><span class="sp"></span>Checking status…</span>`;
  else h += `<div class="chips"><button class="cb" data-a="follow" data-v="${r.id}" ${used >= cap ? "disabled" : ""}>${used >= cap ? "Follow-up limit reached" : "Copy follow-up"}</button><button class="xbtn" data-a="stop" data-v="${r.id}">Stop follow-ups</button></div>`;
  if (fo && fo !== "checking") h += `<div class="fcopy">${linkify(fo.text)}<div class="hint">${fo.ok ? "Copied. Razorpay still said Unpaid." : "Select and copy this text."}</div></div>`;
  return h + `<div class="hint">Follow-ups copied: ${used} of ${cap}</div>`;
}
function settingsSheet() {
  if (!L.sheet) return ""; const s = L.set;
  return `<div class="sheetbg" data-a="closesheet"></div><div class="sheet" role="dialog" aria-label="Your settings"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:16px;color:#0C2451">Your settings</b><button class="icb" data-a="closesheet" aria-label="Close">×</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="fld"><label class="lbl" for="s-del">Delivery (₹)</label><input id="s-del" data-s="deliveryPaise" inputmode="numeric" value="${s.deliveryPaise / 100}"></div><div class="fld"><label class="lbl" for="s-free">Free above (₹)</label><input id="s-free" data-s="freeAbovePaise" inputmode="numeric" value="${s.freeAbovePaise / 100}"></div></div>
    <div class="fld"><label class="lbl" for="s-dis">Dispatch wording</label><input id="s-dis" data-s="dispatch" value="${esc(s.dispatch)}"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px"><div class="fld"><label class="lbl" for="s-lang">Reply</label><select id="s-lang" data-s="lang"><option value="hinglish" ${s.lang === "hinglish" ? "selected" : ""}>Hinglish</option><option value="english" ${s.lang === "english" ? "selected" : ""}>English</option></select></div><div class="fld"><label class="lbl" for="s-cap">Follow-ups</label><select id="s-cap" data-s="followCap">${[1, 2, 3].map(n => `<option ${s.followCap === n ? "selected" : ""}>${n}</option>`).join("")}</select></div><div class="fld"><label class="lbl" for="s-exp">Expiry (hrs)</label><select id="s-exp" data-s="expiryHrs">${[24, 48, 72].map(n => `<option ${s.expiryHrs === n ? "selected" : ""}>${n}</option>`).join("")}</select></div></div>
    <button class="pb" data-a="closesheet">Done</button></div>`;
}

function liveLaneStep() {
  if (L.screen === "input") return 2; if (L.screen === "requests") return 8;
  if (L.screen === "card") { const c = compute(L.draft, L.res, L.set); return c.ok ? 5 : 4; }
  const r = curReq(); if (!r) return 6; if (r.status === "paid") return 8; if (r.status === "expired" || r.aged) return 8; return 6;
}
function liveRender() {
  const rq = curReq(); paintScreen(); setLane(liveLaneStep(), { noPay: !!(rq && rq.status !== "paid"), paid: !!(rq && rq.status === "paid"), noAsk: true }); if (S.tab === "live") { const sd = $("#side"), st = sd.scrollTop; renderLiveSide(); sd.scrollTop = st; }
  $("#fl-ey").textContent = "Behind the screen · live run"; $("#fl-title").textContent = L.screen === "input" ? (L.draft ? "Last run · draft again to update" : "Waiting for a chat") : L.screen === "requests" ? "Requests and status" : "Your chat, step by step"; $("#fl-title").title = $("#fl-title").textContent;
  if (L.draft) liveFlowUpdate(); else showJson();
  const who = $("#whose"); who.classList.remove("buyer"); who.querySelector("span").textContent = "Meera's phone (the seller)";
}
function simCard() {
  const r = curReq();
  if (!r) return `<div class="card sim-card"><div class="ey">${API.pay ? "Pay as the buyer" : "Simulate the buyer"}</div><p class="hint" style="margin:0">Create a link first. ${API.pay ? "You can then open the real Razorpay test-mode checkout and pay as the buyer." : "These buttons then act as the buyer, outside Meera's phone."}</p></div>`;
  if (r.plink) return `<div class="card sim-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="ey">Pay as the buyer · ${esc(r.id)}</span>${pillFor(r.status)}</div>
    <p class="hint" style="margin:0">${r.mode === "mock" ? "Mock checkout for local testing." : "A real Razorpay Payment Link in <b>test mode</b>. No real money moves."} Outside Meera's phone, this is ${esc(r.buyer || "the buyer")}'s side.</p>
    ${r.status === "unpaid" ? `<a class="btn" href="${esc(r.url)}" target="_blank" rel="noopener">Open the payment page</a>
    <p class="hint" style="margin:0">Use Razorpay's test-mode payment details (for example the test UPI ID <b>success@razorpay</b>). Come back and the status updates by itself.</p>` : ""}
    <div class="chips"><button class="cb" data-a="refresh">Refresh status</button><button class="cb" data-a="squiet" ${r.status !== "unpaid" || r.aged ? "disabled" : ""}>Buyer goes quiet (+26 hrs, simulated)</button><button class="cb" data-a="cancel" ${r.status !== "unpaid" ? "disabled" : ""}>Cancel link</button></div></div>`;
  return `<div class="card sim-card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="ey">Simulate the buyer · ${esc(r.id)}</span>${pillFor(r.status)}</div><p class="hint" style="margin:0">Demo controls, not part of the app. In real life ${esc(r.buyer || "the buyer")} does this on her own phone.</p><div class="chips"><button class="cb" data-a="spay" ${r.status !== "unpaid" ? "disabled" : ""}>Buyer pays</button><button class="cb" data-a="squiet" ${r.status !== "unpaid" || r.aged ? "disabled" : ""}>Buyer goes quiet (+26 hrs)</button><button class="cb" data-a="sexp" ${r.status !== "unpaid" ? "disabled" : ""}>Link expires</button></div></div>`;
}
function modeBanner() {
  if (API.ai) return `<div class="banner" style="background:#F1EBFF;border-color:#d9c9ff;color:#3d2580"><b>AI model on${API.aiMode === "mock" ? " (mock)" : ""}.</b> ${API.aiMode === "mock" ? "Local test mode: the server stands in for the model with rules." : `${esc(API.model)} reads the chat or screenshot on the server.`} Code still checks every quote and does all the money. ${API.pay ? (API.payMode === "mock" ? "Payment links are mocked locally." : "Payment Links are real, in Razorpay <b>test mode</b>. No real money moves.") : "Payments are simulated."} What you paste is sent to the server for this request only and isn't stored.</div>`;
  return `<div class="banner"><b>Live demo, runs in your browser.</b> It reads text with simple rules (and on-device OCR for screenshots) instead of the production AI model. Nothing you paste leaves this page. Payments are simulated.</div>`;
}
function renderLiveSide() {
  $("#side").innerHTML = simCard() + modeBanner() + `
    <div class="card"><div class="ey">Try it live</div><h2>What to try</h2><ul class="tips">${DATA.liveTips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="legend3 sec2"><div><span class="chip c-ok">From chat</span> has a quote you can tap</div><div><span class="chip c-warn">Check</span> two readings fit, you choose</div><div><span class="chip c-miss">Missing</span> not in the chat, ask or type it</div><div><span class="chip c-set">Your setting</span> from your settings or your choice</div></div></div>
    <div class="card sec2"><div class="ey">Rules the card always follows</div><ul class="tips"><li>AI never sets money. Code prices from your list, in paise.</li><li>Create stays off until all 6 checks pass.</li><li>"Copied" never means "Sent".</li><li>Follow-ups re-check status first, at most ${L.set.followCap} per request.</li></ul></div>`;
}

/* status polling for real links */
let pollT = null;
async function refreshStatus(r, quiet) {
  if (!r || !r.plink) return r && r.status;
  try { const j = await fetchJson("api/links?id=" + encodeURIComponent(r.plink), null, 10000); if (j.status && j.status !== r.status) { r.status = j.status; lsSave(); logLine(`Razorpay says ${r.id} is ${statusWord(r.status)}`); liveRender(); } else if (!quiet) logLine(`Checked ${r.id}: still ${statusWord(r.status)}`); }
  catch (e) { if (!quiet) logLine("Couldn't reach Razorpay: " + e.message); }
  return r.status;
}
function startPolling() { stopPolling(); pollT = setInterval(() => { const r = curReq(); if (S.tab !== "live" || !r || !r.plink || r.status !== "unpaid" || document.hidden) return; refreshStatus(r, true); }, 8000); }
function stopPolling() { if (pollT) clearInterval(pollT); pollT = null; }
document.addEventListener("visibilitychange", () => { const r = curReq(); if (!document.hidden && r && r.plink && r.status === "unpaid" && S.tab === "live") refreshStatus(r, true); });

function liveAction(a, ev) {
  const k = a.dataset.a, v = a.dataset.v; const r = curReq();
  switch (k) {
    case "lch": L.ch = v; S.ch = v; syncChannel(); break;
    case "ex": { const e = DATA.examples[+v]; L.text = e.text; L.ch = e.ch; S.ch = e.ch; syncChannel(); L.notice = ""; break; }
    case "upload": { const f = $("#lfile"); if (f) f.click(); return; }
    case "draft": liveDraft(); return;
    case "toinput": case "nav-input": L.screen = "input"; L.sheet = false; break;
    case "nav": L.screen = v; L.sheet = false; break;
    case "gear": L.sheet = true; break;
    case "closesheet": L.sheet = false; break;
    case "buyer": logLine(`Seller picked ${v}; using only ${v}'s messages`); if (API.ai) { liveDraft({ buyer: v, quiet: true }); return; } L.draft = P.parse(L.text, L.ch, { buyer: v }); L.res = {}; break;
    case "agree": L.res.agree = true; break;
    case "pricereply": U.priceReply = priceReplyText(L.draft); U.priceReplyOk = null; copyText(U.priceReply).then(ok => { U.priceReplyOk = ok; liveRender(); }); break;
    case "pick": L.res.product = v; logLine(`Seller picked ${v}`); break;
    case "unpick": delete L.res.product; delete L.res.price; break;
    case "price": if (v) L.res.price = v; else delete L.res.price; break;
    case "size": L.res.size = v; break;
    case "qty": L.res.qty = +v; break;
    case "ask": U.asked = "Sure! Which size, S, M, L or XL? 😊"; U.askedOk = null; copyText(U.asked).then(ok => { U.askedOk = ok; liveRender(); }); break;
    case "hl": U.hl = { l: a.dataset.l, q: a.dataset.q }; break;
    case "ck": U.ck = !U.ck; break;
    case "del": if (v === "setting") { L.res.delSetting = true; delete L.res.deliveryPaise; } else L.res.deliveryPaise = +v; break;
    case "deledit": U.delEdit = true; break;
    case "deldone": U.delEdit = false; break;
    case "discedit": U.discEdit = true; break;
    case "discdone": U.discEdit = false; break;
    case "create": {
      const d = L.draft, c = compute(d, L.res, L.set); if (!c.ok || U.creating) return;
      const L1 = c.lines[0]; const items = `${L1.qty} × ${L1.name}${L1.size && L1.size !== "Free" ? ` (${L1.size})` : ""}`;
      const finish = (req) => {
        L.reqs.push(req); L.cur = req.id; L.sent = false; L.screen = "ready"; L.copyFail = false; L.notice = ""; lsSave();
        copyText(req.reply).then(ok => { req.copied = ok; L.copyFail = !ok; lsSave(); logLine(ok ? "Reply copied to clipboard" : "Clipboard blocked: showing text to copy by hand"); liveRender(); if (!ok) { const sb = $("#selbox"); if (sb) { sb.focus(); sb.select(); } } });
        if (req.plink) startPolling();
      };
      if (API.pay) {
        const order = { line: { product_id: c.pid || null, name: c.name, size: c.size, qty: c.qty, unit_paise: c.unit, price_changed_by_seller: L.res.price === "use" }, delivery_paise: c.delivery, discount_paise: c.discount || 0, expected_total_paise: c.total };
        U.creating = true; liveRender();
        fetchJson("api/links", { order, buyer: d.buyer, channel: d.channel, expiry_hrs: L.set.expiryHrs }, 20000).then(j => {
          U.creating = false;
          const req = { id: j.reference_id, plink: j.id, url: j.short_url, mode: j.mode, buyer: d.buyer, ch: d.channel, items, total: j.amount, status: j.status || "unpaid", aged: false, follows: 0, stopped: false, text: L.text, reply: replyText(d, c, j.reference_id, L.set, j.short_url), at: nowHM(), copied: true };
          logLine(`Razorpay Payment Link ${j.id} created (${j.mode === "mock" ? "mock" : "test mode"}) · ${j.amount} paise, re-priced on the server`);
          finish(req);
        }).catch(e => { U.creating = false; L.notice = "Couldn't create the link: " + e.message; logLine("Link creation failed: " + e.message); liveRender(); });
        return;
      }
      const id = "CT-" + (L.nextId++);
      const req = { id, buyer: d.buyer, ch: d.channel, items, total: c.total, status: "unpaid", aged: false, follows: 0, stopped: false, text: L.text, reply: replyText(d, c, id, L.set), at: nowHM(), copied: true };
      logLine(`Link ${id} created (simulated) · ${c.total} paise`);
      finish(req);
      break;
    }
    case "refresh": if (r) refreshStatus(r, false); return;
    case "cancel": if (r && r.plink) { fetchJson("api/links?id=" + encodeURIComponent(r.plink) + "&action=cancel", {}, 10000).then(j => { r.status = j.status; lsSave(); logLine(`${r.id} cancelled on Razorpay`); liveRender(); }).catch(e => { logLine("Cancel failed: " + e.message); refreshStatus(r, true); }); } return;
    case "copyagain": if (r) copyText(r.reply).then(ok => { L.copyFail = !ok; logLine(ok ? "Reply copied again" : "Clipboard blocked"); liveRender(); }); return;
    case "open": L.screen = "handoff"; L.sent = false; logLine(`Opening ${chName(r ? r.ch : L.ch)} (simulated)`); break;
    case "send": L.sent = true; logLine("Seller tapped Send in the chat app (simulated). Status stays Copied."); break;
    case "backrz": L.screen = "ready"; break;
    case "spay": if (r) { r.status = "paid"; logLine(`Webhook payment_link.paid · ${r.id} (simulated)`); lsSave(); } break;
    case "squiet": if (r) { r.aged = true; logLine(`+26 hrs · no payment for ${r.id} (simulated)`); lsSave(); } break;
    case "sexp": if (r) { r.status = "expired"; logLine(`Webhook payment_link.expired · ${r.id} (simulated)`); lsSave(); } break;
    case "follow": {
      const q = L.reqs.find(x => x.id === v); if (!q || q.status !== "unpaid" || (q.follows || 0) >= L.set.followCap) return;
      L.follow[v] = "checking"; liveRender(); logLine(`Re-checking ${v} with Razorpay before copying`);
      const txt = followText(q.buyer, q.id, q.url); const p = copyText(txt);
      if (q.plink) { refreshStatus(q, true).then(st => { if (st !== "unpaid") { delete L.follow[v]; logLine(`${v} is ${statusWord(st)}: nothing to follow up`); liveRender(); return; } p.then(ok => { q.follows = (q.follows || 0) + 1; L.follow[v] = { text: txt, ok }; lsSave(); logLine(`Razorpay still says Unpaid · follow-up ${q.follows} of ${L.set.followCap} copied`); liveRender(); }); }); return; }
      setTimeout(() => { if (q.status !== "unpaid") { delete L.follow[v]; logLine(`${v} is ${q.status}: nothing copied`); liveRender(); return; } p.then(ok => { q.follows = (q.follows || 0) + 1; L.follow[v] = { text: txt, ok }; lsSave(); logLine(`Still Unpaid · follow-up ${q.follows} of ${L.set.followCap} copied`); liveRender(); }); }, RM() ? 50 : 700);
      return;
    }
    case "stop": { const q = L.reqs.find(x => x.id === v); if (q) { q.stopped = true; lsSave(); } break; }
    case "renew": { const q = L.reqs.find(x => x.id === v); if (q) { L.text = q.text; L.ch = q.ch; L.screen = "input"; L.notice = ""; L.draft = null; L.cur = null; liveFlowReset(); logLine(`New request from ${q.id}'s chat · prices will be checked again`); } break; }
    case "filter": L.filter = v; break;
    case "clear": L.reqs = []; L.cur = null; L.follow = {}; lsSave(); logLine("Session requests cleared"); break;
    default: return;
  }
  liveRender();
}
function liveInput(e) {
  const t = e.target;
  if (t.id === "lta") { L.text = t.value; return; }
  if (t.dataset.s) { const key = t.dataset.s; let v = t.value; if (key === "deliveryPaise" || key === "freeAbovePaise") v = Math.max(0, Math.round(parseFloat(v || "0") * 100)) || 0; if (key === "followCap" || key === "expiryHrs") v = parseInt(v, 10); L.set[key] = v; lsSave(); if (e.type === "change") { liveRender(); renderLiveSide(); } return; }
  const a = t.dataset.a; if (!a) return;
  const rupees = () => { const n = parseFloat(String(t.value).replace(/[^\d.]/g, "")); return isFinite(n) && n > 0 ? Math.round(n * 100) : 0; };
  if (a === "mname") L.res.manualName = t.value;
  if (a === "mprice") L.res.manualPaise = rupees();
  if (a === "delin") { const n = parseFloat(String(t.value).replace(/[^\d.]/g, "")); L.res.deliveryPaise = isFinite(n) ? Math.round(n * 100) : 0; }
  if (a === "discin") L.res.discountPaise = rupees();
  liveRender();
}
