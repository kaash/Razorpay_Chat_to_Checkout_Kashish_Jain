
/* ===== state ===== */
const S = { tab: "demo", ch: "instagram", sc: 0, fi: 0, auto: false, lastStep: 0, lastKey: "", userProb: false, userCompact: false };
const U = { hl: null, ck: false, fill: 99, timers: [], chk: 0 };
let FR = [];
const clearTimers = () => { U.timers.forEach(clearTimeout); U.timers = []; };
const later = (fn, ms) => { const t = setTimeout(fn, RM() ? Math.min(ms, 30) : ms); U.timers.push(t); return t; };
const SIM = (why) => `<span class="sim" title="${esc(why)}">Simulated</span>`;
const scText = (sc, withLater) => sc.chat.concat(withLater && sc.later ? sc.later : []).map(([w, t]) => w === "reel" ? `[reel: ${t}]` : `${w}: ${t}`).join("\n");
const DCACHE = {};
const draftFor = (sc, withLater) => { const k = sc.key + (withLater ? "+" : ""); return DCACHE[k] || (DCACHE[k] = P.parse(scText(sc, withLater), sc.ch)); };
const chName = ch => ch === "whatsapp" ? "WhatsApp" : "Instagram";
const ICON = {
  cam: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
  gear: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  send: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
  cog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>`,
  upi: `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#0F9D6B" d="M7 3l6 9-6 9z"/><path fill="#E9771A" d="M12 3l6 9-6 9z"/></svg>`,
  card: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2451" stroke-width="2" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>`,
  bank: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2451" stroke-width="2" aria-hidden="true"><path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></svg>`
};

/* 3. swimlane */
function buildLane() {
  const J = DATA.journey; const R = { buy: 3, me: 4, ai: 5, rz: 6 };
  let h = `<div class="colhl" id="colhl" style="grid-row:2/7;grid-column:2"></div>`;
  h += `<div class="ln-title r-ph" style="grid-row:1;grid-column:1">Who does what</div>`;
  J.phases.forEach((p, i) => { h += `<div class="ph r-ph" data-ph="${i}" style="grid-row:1;grid-column:${p.from + 1}/${p.to + 2}">${esc(p.l)}</div>`; });
  h += `<div class="lnl" style="grid-row:2;grid-column:1">Step</div>`;
  J.steps.forEach(s => { h += `<button class="stp" data-step="${s.n}" style="grid-row:2;grid-column:${s.n + 1}" title="Go to step ${s.n}: ${esc(s.l)}"><span class="dot">${s.n}</span><span class="tt">${esc(s.l)}</span></button>`; });
  J.lanes.forEach(([k, label]) => {
    h += `<div class="lnl r-${k}" style="grid-row:${R[k]};grid-column:1"><i></i>${esc(label)}</div>`;
    J.steps.forEach((s, i) => {
      const v = s[k] || ""; const [t, full] = Array.isArray(v) ? v : [v, v];
      if (k === "rz") h += `<div class="band r-rz${i === 0 ? " first" : ""}${i === 7 ? " last" : ""}" data-step="${s.n}" style="grid-row:${R[k]};grid-column:${s.n + 1}" title="${esc("Razorpay + code: " + full)}"><span>${esc(t)}</span></div>`;
      else h += `<div class="lc r-${k}${t ? "" : " e"}${(k === "me" && s.meOpt) || (k === "buy" && s.buyOpt) ? " k-opt" : ""}" data-step="${s.n}" style="grid-row:${R[k]};grid-column:${s.n + 1}" ${t ? `title="${esc(label + ": " + full)}"` : 'aria-hidden="true"'}>${t ? `<span>${esc(t)}</span>` : ""}</div>`;
    });
  });
  $("#ln-map").innerHTML = h;
}
function setLane(step, o = {}) {
  $$("#ln-map .stp").forEach(b => { const n = +b.dataset.step; b.classList.toggle("done", n < step); b.classList.toggle("here", n === step); b.setAttribute("aria-current", n === step ? "step" : "false"); });
  $$("#ln-map .band").forEach(b => { const n = +b.dataset.step; b.classList.remove("done", "now", "idle"); if (n === 1) b.classList.add("idle"); else if (n < step) b.classList.add("done"); else if (n === step) b.classList.add("now"); });
  $$("#ln-map .lc:not(.e)").forEach(b => { const n = +b.dataset.step; b.classList.toggle("done", n < step); b.classList.toggle("now", n === step); });
  $$("#ln-map .skip").forEach(b => { b.classList.remove("skip"); if (b.dataset.t0) b.title = b.dataset.t0; });
  const skip = (sel, why) => { const b = $(sel); if (!b) return; b.classList.add("skip"); b.classList.remove("done", "now"); b.dataset.t0 = b.title; b.title = why; };
  if (o.noPay && step >= 7) { skip('#ln-map .lc.r-buy[data-step="7"]', "No payment yet: the buyer went quiet"); skip('#ln-map .band[data-step="7"]', "No payment to confirm yet"); }
  if (o.noAsk && step >= 4) skip('#ln-map .lc.r-buy[data-step="4"]', "Not needed: nothing was missing to ask about");
  if (o.paid && step >= 8) skip('#ln-map .lc.r-me[data-step="8"]', "Not needed: this order is paid");
  const hl = $("#colhl"); if (hl) hl.style.gridColumn = String(step + 1);
  DATA.journey.phases.forEach((p, i) => { const el = $(`#ln-map .ph[data-ph="${i}"]`); if (el) el.classList.toggle("on", step >= p.from && step <= p.to); });
  const cur = $(`#ln-map .stp[data-step="${step}"]`), sc = $("#lane .ln-scroll");
  if (cur && sc && sc.scrollWidth > sc.clientWidth) { const cr = cur.getBoundingClientRect(), sr = sc.getBoundingClientRect(); if (cr.left < sr.left + 130 || cr.right > sr.right) sc.scrollLeft += cr.left - sr.left - 140; }
}

/* 5. diagrams */
const TYPE = { me: { c: "#C2570C", b: "#FFF0E3", i: "M", n: "Seller" }, ai: { c: "#6B46C1", b: "#F1EBFF", i: "AI", n: "AI model" }, code: { c: "#1D5FC4", b: "#E8F0FF", i: "{ }", n: "Plain code" }, data: { c: "#0F7A73", b: "#E2F5F3", i: "D", n: "Data" }, ext: { c: "#8593A8", b: "#F4F6FA", i: "↗", n: "Outside Razorpay" }, out: { c: "#0C2451", b: "#E6EAF2", i: "✓", n: "Result" } };
const N = (id, t, l, c, r, say, o) => ({ id, t, l, c, r, say, o });
function FLOW(st, key) {
  const sc = DATA.scenarios.find(s => s.key === key) || DATA.scenarios[0]; const b = sc.buyer, ch = chName(sc.ch);
  const unpaid = key === "kavya", needs = key === "kavya", miss = key === "sana";
  switch (st) {
    case 1: return { title: "Buyer agrees", nodes: [N("bu", "ext", `${b} (buyer)`, 0, 0, `${b} writes in ${ch}. Outside Razorpay.`), N("chat", "data", `${ch} chat`, 1, 0, "The order exists only as words in the chat."), N("me", "me", "Seller decides", 1, 1, "Meera decides the order is agreed and it's time to ask for payment."), N("out", "out", "Ready to capture", 1, 2, "Nothing has been typed yet.")], edges: [["bu", "chat", "messages"], ["chat", "me"], ["me", "out"]] };
    case 2: return { title: "Capture", nodes: [N("me", "me", "Seller picks screenshot", 0, 0, "She chooses what to share. Only this chat.", 1), N("share", "code", "Share target", 1, 0, "The phone's share sheet hands one image to Razorpay.", 2), N("q", "code", "Input queue", 1, 1, "Images or pasted text wait to be read. Nothing else on the phone is touched.", 3), N("out", "out", "Images / text", 1, 2, "One screenshot, ready to read.", 4)], edges: [["me", "share", "share"], ["share", "q"], ["q", "out"]] };
    case 3: return { title: "AI drafts", nodes: [N("in", "data", "Screenshot or text", 0, 0, "The shared chat. Treated as untrusted input: instructions inside it are ignored."), N("ocr", "code", "OCR", 1, 0, "Turns the image into text and keeps which side each message is on.", 1), N("ai", "ai", "AI drafts fields", 2, 0, "Suggests buyer, item, size, quantity and agreement, each with the exact words it came from. No prices.", 2), N("src", "code", "Source check", 2, 1, "Code confirms every quoted phrase really is in the chat. A field without a real source is dropped.", 3), N("list", "data", "Product list", 0, 1, "Meera's own items and prices."), N("match", "code", "Matching rules", 1, 1, needs ? "'blue' fits two products, so both stay as candidates." : "Finds the one item that fits the words and the reel.", 4), N("out", "out", "Draft, no prices", 1, 2, "A draft with sources. Money comes next, from code.", 5)], edges: [["in", "ocr"], ["ocr", "ai", "text"], ["ai", "src", "fields"], ["src", "match"], ["list", "match"], ["match", "out"]] };
    case 4: if (needs || miss) return { title: "Resolve", nodes: [N("d", "data", "Draft", 1, 0, "Fields with their sources."), N("rule", "code", "Ambiguity rule", 1, 1, needs ? "Two kurtis fit 'blue wala' and a lower price was asked. Code stops and asks." : "Size is missing. Code blocks the request until it's filled.", 1), N("me", "me", "Seller resolves", 0, 2, needs ? "Meera picks the kurti and decides the price." : "Meera asks Sana and shares her reply."), N("out", "out", "Resolved fields", 1, 3, "Every field now has a source or a decision by Meera.")], edges: [["d", "rule"], ["rule", "me", needs ? "2 to decide" : "size missing"], ["me", "out"]] };
      return { title: "Resolve", nodes: [N("d", "data", "Draft", 1, 0, "Fields with their sources."), N("rule", "code", "Ambiguity rule", 1, 1, "One product, one size, one quantity, each with a source. Nothing to ask.", 1), N("out", "out", "Resolved fields", 1, 2, "The fast path. Nothing for Meera to fix.", 2)], edges: [["d", "rule"], ["rule", "out", "all clear"]] };
    case 5: return { title: "Approve", nodes: [N("pl", "data", "Price list", 0, 0, "Her item prices, in paise."), N("set", "data", "Settings", 2, 0, "Delivery ₹80, free above ₹2,999. Set once."), N("calc", "code", "Price in paise", 1, 1, "Quantity × unit price + delivery. Integer paise, no AI.", 1), N("ck", "code", "Checklist", 1, 2, "Product and quantity, size, unit price, delivery, tax or discount, agreement. All six must pass.", 2), N("me", "me", "Seller approves", 0, 3, "One card. She can still edit anything."), N("out", "out", "Frozen order", 1, 4, "Snapshot of items and total. If a price changes later, she approves again.")], edges: [["pl", "calc"], ["set", "calc"], ["calc", "ck"], ["ck", "me", "6 of 6"], ["me", "out", "approve"]] };
    case 6: return { title: "Send", nodes: [N("fo", "data", "Frozen order", 0, 0, "What Meera approved."), N("api", "code", "Payment Links API", 1, 0, "Creates a standard Razorpay Payment Link with the order in its notes. Test mode, simulated here.", 1), N("rd", "data", "Her reply wording", 0, 1, "Language, greeting and dispatch line, set once in her settings. No AI here."), N("fill", "code", "Fill amount + link", 1, 1, "Code puts the items, total, link and reference into her wording, so nothing can change the money.", 2), N("out", "out", "Link ready · Copied", 2, 1, "The reply is on her clipboard. We can't see whether she sends it.", 3), N("me", "me", "Seller sends", 2, 2, sc.ch === "whatsapp" ? "WhatsApp opens with the text filled in. She taps Send." : "She pastes it in the same DM and taps Send.")], edges: [["fo", "api"], ["api", "fill", "link"], ["rd", "fill"], ["fill", "out"], ["out", "me", "copied"]] };
    case 7: if (unpaid) return { title: "Buyer pays", nodes: [N("bu", "ext", `${b} (buyer)`, 0, 0, "Has the link. Hasn't opened it."), N("wait", "code", "Waiting for webhook", 1, 1, "No payment_link.paid event in 26 hours.", 1), N("out", "out", "Still Unpaid", 1, 2, "Razorpay's records say Unpaid.", 2)], edges: [["bu", "wait", "no payment"], ["wait", "out"]] };
      return { title: "Buyer pays", nodes: [N("bu", "ext", "Buyer opens link", 0, 0, `${b} taps the link on her phone.`), N("co", "code", "Razorpay checkout", 1, 0, "Hosted page with the merchant name, items and amount.", 1), N("bank", "ext", "Bank / UPI", 2, 0, "Her UPI app or bank approves the payment."), N("wh", "code", "Webhook: paid", 2, 1, "payment_link.paid updates the request.", 2), N("out", "out", "Payment confirmed", 1, 1, "Confirmed by Razorpay. Already true of any Payment Link today.", 3)], edges: [["bu", "co"], ["co", "bank", "pay"], ["bank", "wh", "success"], ["wh", "out"]] };
    case 8: if (unpaid) return { title: "Status", nodes: [N("wh", "code", "Webhook / refresh", 1, 0, "No paid event, so the request stays Unpaid.", 1), N("st", "out", "Status: Unpaid", 1, 1, "Shown in the Unpaid filter. Paid requests never appear here.", 2), N("re", "code", "Re-check status", 0, 2, "Before copying a follow-up, code asks Razorpay again. If it's paid, nothing is copied.", 3), N("me", "me", "Copy follow-up", 0, 3, "Neutral wording. At most 2 per request. She sends it herself.")], edges: [["wh", "st"], ["st", "re", "unpaid"], ["re", "me", "still unpaid"]] };
      return { title: "Status", nodes: [N("wh", "code", "Webhook / refresh", 1, 0, "payment_link.paid arrived.", 1), N("st", "out", "Status: Paid", 1, 1, "Read from Razorpay, with the items named.", 2), N("re", "code", "Re-check status", 0, 2, "Only used for unpaid requests."), N("me", "me", "Copy follow-up", 0, 3, "Not needed. This one is paid.")], edges: [["wh", "st"], ["st", "re", "if unpaid"], ["re", "me"]], skip: ["re", "me"] };
  }
}
const DW = 420, NW = 128, NH = 46, PX = [4, 146, 288], TOP = 14; let PITCH = 80;
function anchors(a, b) { const ax = PX[a.c], ay = TOP + a.r * PITCH, bx = PX[b.c], by = TOP + b.r * PITCH; if (b.r > a.r) return [ax + NW / 2, ay + NH, bx + NW / 2, by]; if (b.r < a.r) return [ax + NW / 2, ay, bx + NW / 2, by + NH]; return b.c > a.c ? [ax + NW, ay + NH / 2, bx, by + NH / 2] : [ax, ay + NH / 2, bx + NW, by + NH / 2]; }
function epath(a, b) { const [x1, y1, x2, y2] = anchors(a, b); if (a.r === b.r) return `M${x1},${y1} L${x2},${y2}`; const my = (y1 + y2) / 2; return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`; }
function wrapL(s, n) { const w = String(s).split(" "), out = []; let cur = ""; w.forEach(x => { if ((cur + " " + x).trim().length > n && cur) { out.push(cur); cur = x; } else cur = (cur + " " + x).trim(); }); if (cur) out.push(cur); if (out.length > 2) { out[1] = out.slice(1).join(" "); out.length = 2; if (out[1].length > n) out[1] = out[1].slice(0, n - 1) + "…"; } return out; }
const F = { flow: null, sts: {}, hover: "", ms: {}, timers: [] };
function runFlow(flow) {
  F.timers.forEach(clearTimeout); F.timers = []; F.flow = flow; F.sts = {}; F.ms = {}; F.hover = "";
  const mach = flow.nodes.filter(x => x.o).sort((a, b) => a.o - b.o);
  flow.nodes.forEach(x => { F.sts[x.id] = (x.t === "data" || x.t === "ext") ? "done" : "idle"; if ((flow.skip || []).includes(x.id)) F.sts[x.id] = "skip"; });
  const orders = uniq(mach.map(x => x.o));
  const finish = () => {
    const waiting = flow.nodes.filter(x => x.t === "me" && !x.o && F.sts[x.id] !== "skip");
    waiting.forEach(x => F.sts[x.id] = "wait");
    flow.nodes.forEach(x => { if (x.t === "out" && !x.o) F.sts[x.id] = waiting.length ? "idle" : "done"; });
    setStat(waiting.length ? "wait" : "ok"); draw();
  };
  if (!orders.length) { finish(); return; }
  setStat("run"); const gap = RM() ? 0 : 520;
  orders.forEach((o, i) => F.timers.push(setTimeout(() => { mach.forEach(x => { if (x.o === o) F.sts[x.id] = "active"; else if (x.o < o) F.sts[x.id] = "done"; }); draw(); }, i * gap)));
  F.timers.push(setTimeout(() => { mach.forEach(x => F.sts[x.id] = "done"); finish(); }, orders.length * gap + (RM() ? 0 : 160)));
  draw();
}
function flowDone() { if (!F.flow) return; F.timers.forEach(clearTimeout); F.flow.nodes.forEach(x => { if (F.sts[x.id] !== "skip") F.sts[x.id] = "done"; }); setStat("ok"); draw(); }
function setStat(k, txt) { const el = $("#fl-stat"); el.className = "stat " + k; el.innerHTML = k === "run" ? `<span class="sp"></span>${txt || "Working"}` : esc(txt || (k === "wait" ? "Seller's turn" : k === "ok" ? "Done" : "Ready")); }
function draw() {
  const flow = F.flow; if (!flow) return;
  const byId = Object.fromEntries(flow.nodes.map(x => [x.id, x])); const maxR = Math.max(...flow.nodes.map(x => x.r));
  PITCH = maxR <= 2 ? 96 : maxR === 3 ? 86 : 78; const H = TOP + maxR * PITCH + NH + 12;
  let g = `<svg viewBox="0 0 ${DW} ${H}" preserveAspectRatio="xMidYMin meet" role="img" aria-label="${esc(flow.title)}: what happens behind this step"><defs>${[["idle", "#b9c5d6"], ["done", "#0C2451"], ["active", "#1D5FC4"], ["wait", "#E9771A"]].map(([k, c]) => `<marker id="ah-${k}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1,1 L9,5 L1,9 z" fill="${c}"/></marker>`).join("")}</defs>`;
  flow.edges.forEach(([a, b, lab]) => {
    const A = byId[a], B = byId[b]; const sa = F.sts[a], sb = F.sts[b];
    const cls = sb === "active" ? "active" : (sb === "done" || ((sb === "wait" || sb === "idle") && sa === "done" && B.t !== "out")) ? (sb === "wait" ? "wait" : "done") : "idle";
    g += `<path class="ed e-${cls}" d="${epath(A, B)}" marker-end="url(#ah-${cls})"/>`;
    if (lab && A.r !== B.r) { const [x1, y1, x2, y2] = anchors(A, B); const w = lab.length * 5.6 + 12; g += `<g class="elab" transform="translate(${(x1 + x2) / 2},${(y1 + y2) / 2})"><rect x="${-w / 2}" y="-8" width="${w}" height="15" rx="7"/><text y="3" text-anchor="middle">${esc(lab)}</text></g>`; }
  });
  flow.nodes.forEach(x => {
    const s = F.sts[x.id] || "idle", ty = TYPE[x.t], px = PX[x.c], py = TOP + x.r * PITCH, lines = wrapL(x.l, 16), y0 = lines.length === 1 ? 27 : 21;
    const dark = x.t === "out" && s === "done"; const fill = dark ? "#0C2451" : ty.b, txt = dark ? "#fff" : "#14213D";
    g += `<g class="nd s-${s}" data-id="${x.id}" transform="translate(${px},${py})" tabindex="0" role="button" aria-label="${esc(ty.n + ": " + x.l + ". " + (x.say || ""))}">
      <rect class="ring" x="-3" y="-3" width="${NW + 6}" height="${NH + 6}" rx="13" stroke="${s === "wait" ? "#E9771A" : ty.c}"/>
      <rect class="bg" width="${NW}" height="${NH}" rx="11" fill="${fill}" stroke="${ty.c}" ${x.t === "ext" ? 'stroke-dasharray="5 3"' : ""}/>
      <circle class="ic" cx="16" cy="${NH / 2}" r="10" fill="${dark ? "rgba(255,255,255,.18)" : "#fff"}" stroke="${ty.c}" stroke-width="1"/>
      <text x="16" y="${NH / 2 + 3.2}" text-anchor="middle" font-size="${ty.i.length > 1 ? 7.5 : 9}" font-weight="900" fill="${dark ? "#fff" : ty.c}" font-family="Lato, Arial">${esc(ty.i)}</text>
      <text class="lb" x="31" y="${y0}" style="fill:${txt}">${lines.map((ln, i) => `<tspan x="31" dy="${i ? 12.5 : 0}">${esc(ln)}</tspan>`).join("")}</text>
      ${s === "done" && !["data", "ext", "out"].includes(x.t) ? `<g transform="translate(${NW - 5},-2)"><circle r="7.5" fill="#0F9D6B" stroke="#fff" stroke-width="1.5"/><path d="M-3.2,0 L-1,2.4 L3.4,-2.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>` : ""}
      ${s === "wait" ? `<g transform="translate(${NW - 66},-10)"><rect width="70" height="16" rx="8" fill="#C2570C"/><text x="35" y="11.5" text-anchor="middle" font-size="9.5" font-weight="900" fill="#fff" font-family="Lato, Arial">Seller's turn</text></g>` : ""}
      ${F.ms[x.id] != null ? `<g transform="translate(4,-9)"><rect width="${String(F.ms[x.id]).length * 5.6 + 10}" height="14" rx="7" fill="#0f1b33"/><text class="ms" x="5" y="10" fill="#cfe0ff">${esc(F.ms[x.id])}</text></g>` : ""}
    </g>`;
  });
  $("#fl-map").innerHTML = g + "</svg>"; flowCaption();
}
function flowCaption() {
  const flow = F.flow; if (!flow) return; let node = F.hover ? flow.nodes.find(x => x.id === F.hover) : null;
  if (!node) node = flow.nodes.find(x => F.sts[x.id] === "active") || flow.nodes.find(x => F.sts[x.id] === "wait") || flow.nodes.filter(x => x.t === "out").pop();
  const ty = TYPE[node.t]; $("#fl-cap").innerHTML = `<span class="ci" style="background:${ty.b};color:${ty.c};border:1.5px ${node.t === "ext" ? "dashed" : "solid"} ${ty.c}">${esc(ty.i)}</span><p><b>${esc(node.l)}.</b> ${esc(node.say || "")}</p>`;
}
function logLine(txt, clockArr) {
  const el = $("#fl-tick"); const t = clockArr ? clockArr.map(n => String(n).padStart(2, "0")).join(":") : new Date().toTimeString().slice(0, 8);
  $$("#fl-tick .fresh").forEach(x => x.classList.remove("fresh"));
  const d = document.createElement("div"); d.className = "fresh"; d.title = txt; d.innerHTML = `<span class="t">${t}</span> · ${esc(txt)}`; el.appendChild(d);
  while (el.children.length > 40) el.removeChild(el.firstChild); el.scrollTop = el.scrollHeight;
}

/* 4. phone screens */
const sbar = (time, color, bg) => `<div class="sbar" style="color:${color || "#111"}${bg ? ";background:" + bg : ""}"><span class="num">${esc(time)}</span><span class="ic">5G <span class="batt"></span></span></div>`;
const swatch = (p, sm) => `<div class="sw${sm ? " sm" : ""}${p.light ? " lt" : ""}" style="background:${p.sw}">${esc(p.ini)}</div>`;
function rHead(title, sub, o = {}) {
  return `<div class="rh">${o.back ? `<button class="bk" data-a="${o.back}" aria-label="Back">‹</button>` : `<span style="flex:none;display:grid;place-items:center;width:36px;height:36px">${GLYPH(24)}</span>`}<div class="tt"><b>${esc(title)}${o.isNew ? '<span class="new">NEW</span>' : ""}</b>${sub ? `<span class="ell">${esc(sub)}</span>` : ""}</div>${o.gear ? `<button class="icb" data-a="gear" aria-label="Your settings">${ICON.gear}</button>` : ""}</div>`;
}
const appScr = (time, head, body, foot, extra) => `<div class="scr rz">${sbar(time)}${head}<div class="bd"><div class="rbody">${body}</div></div>${foot ? `<div class="ft">${foot}</div>` : ""}${extra || ""}</div>`;
const HB = (o, k) => o.hot === k ? ` hot" data-hot="${k}` : "";
const linkify = t => esc(t).replace(/(https?:\/\/[^\s<]+|rzp\.io\/demo\/CT-\d+)/g, '<a>$1</a>');

function chatScr(sc, o = {}) {
  const wa = sc.ch === "whatsapp";
  const head = `<div class="chd"><span style="font-size:22px;padding:0 4px" aria-hidden="true">‹</span><span class="av" style="background:${sc.av}">${esc((sc.buyer || "B")[0])}</span><div class="nm"><b>${esc(sc.buyer || "Buyer")}</b><span class="ell">${wa ? esc(sc.phone || "Number not shown") + " · WhatsApp" : esc(sc.handle || "buyer") + " · Instagram DM"}</span></div>${o.shot !== false ? `<button class="shot${HB(o, "shot")}" aria-label="Take screenshot">${ICON.cam}Screenshot</button>` : ""}</div>`;
  let msgs = `<div class="tsep">${esc(o.day || "Today")} ${esc(o.at || "")}</div>`;
  (o.msgs || []).forEach(m => {
    if (m.sep) { msgs += `<div class="tsep">${esc(m.sep)}</div>`; return; }
    if (m.who === "reel") { const p = DATA.catalogue.find(x => x.name === m.text) || DATA.catalogue[0]; msgs += `<div class="reelc"><div class="im" style="background:${p.sw}">${esc(p.ini)}</div><div class="cp">${esc(DATA.merchant.handle)} · ${esc(m.text)}</div></div>`; return; }
    msgs += `<div class="bub${m.who === "me" ? " me" : ""}${m.new ? " nb" : ""}">${m.link ? linkify(m.text) : esc(m.text)}${wa ? `<small>${esc(m.t || "")}${m.who === "me" ? " ✓" : ""}</small>` : ""}</div>`;
    if (m.act) msgs += `<button class="act${HB(o, m.act.k)}" data-a="${m.act.a || ""}">${GLYPH(14)} ${esc(m.act.label)} ${m.act.sim ? SIM(m.act.sim) : ""}</button>`;
  });
  if (o.end) msgs += o.end;
  const comp = o.composer != null ? `${o.simline ? `<div class="simline">${SIM(o.simline)}<span>${esc(o.simline)}</span></div>` : ""}<div class="cmp-row"><div class="cmp-in${o.composer ? " full" : ""}">${o.composer ? linkify(o.composer) : "Message…"}</div>${wa ? `<button class="wsend${HB(o, "send")}" aria-label="Send">${ICON.send}</button>` : `<button class="sendt${HB(o, "send")}">Send</button>`}</div>` : `<div class="cmp-row"><div class="cmp-in">Message…</div>${wa ? `<button class="wsend" aria-label="Send" tabindex="-1">${ICON.send}</button>` : `<button class="sendt" tabindex="-1" style="color:#9cc8f5">Send</button>`}</div>`;
  return `<div class="scr ${wa ? "wa" : "ig"}">${sbar(o.time || "11:05", wa ? "#fff" : "#111", wa ? "#0B6B57" : "")}${head}<div class="bd chatbd">${o.top || ""}<div class="cbody">${msgs}</div></div>${comp}${o.overlay || ""}</div>`;
}
const scMsgs = (sc, withLater, times) => sc.chat.concat(withLater && sc.later ? sc.later : []).map(([w, t], i) => ({ who: w === "reel" ? "reel" : w === "Me" ? "me" : "buyer", text: t, t: (times || [])[i] }));

function shareOverlay(o) {
  return `<div class="sheetbg"></div><div class="sheet" role="dialog" aria-label="Share sheet (simulated)">
    <div class="shotprev"><div class="mini-shot" aria-hidden="true"><i></i><i></i><i class="me"></i><i></i></div><div><b>Screenshot</b><div class="hint">Share to…</div><div style="margin-top:4px">${SIM("In the real app, this is the phone's own share sheet.")}</div></div></div>
    <div class="apps">
      <button class="app" tabindex="-1"><span class="appi" style="background:#8e99ab">N</span>Nearby</button>
      <button class="app" tabindex="-1"><span class="appi" style="background:#4a90d9">F</span>Files</button>
      <button class="app" tabindex="-1"><span class="appi" style="background:#e3b23c">N</span>Notes</button>
      <button class="app${HB(o, "share")}"><span class="appi" style="background:#fff;border:1px solid #dce3ee">${GLYPH(30)}</span><b style="color:#0C2451">Razorpay</b><span style="margin-top:-4px">Create from chat</span></button>
    </div>
    <div class="hint" style="text-align:center">Or in the app: Collect payments → Create from chat.</div>
  </div>`;
}

/* review card, shared by the sample demo and the live tab */
function card(d, res, o) {
  const set = o.set || DATA.settings, c = compute(d, res, set), it = d.items[0], R = o.reveal == null ? 99 : o.reveal, live = o.mode === "live";
  const nm = d.buyer || "Buyer", chn = chName(d.channel); const plural = s => s === 1 ? "" : "s";
  const fr = (label, val, chip, extra, full) => `<div class="fr"><span class="fl">${label}</span><span class="fv ell" title="${esc(String(val).replace(/<[^>]+>/g, ""))}">${val}</span>${chip || "<span></span>"}</div>${extra ? `<div class="fx${full ? " full" : ""}">${extra}</div>` : ""}`;
  const qt = q => q ? `<div class="qt">“${esc(q)}”</div>` : "";
  const skel = n => `<div class="rsec">${Array.from({ length: n }, (_, i) => `<div class="skel" style="width:${[72, 48, 60][i % 3]}%"></div>`).join("")}</div>`;
  let h = `<div class="rc">`;
  h += `<div class="rc-h reveal"><div style="min-width:0"><div class="ey">Payment request</div><div class="nm ell">${esc(nm)} <small>(chat name) · ${chn}</small></div></div>${d.city ? `<span class="chip c-miss" title="Shown for reference. Not used for money.">${esc(d.city.value)}</span>` : ""}</div>`;
  if (d.multiple_customers && !d.buyer) {
    h += `<div class="rsec"><div class="wbox"><div class="h">Two people are ordering here: ${d.buyers.slice(0, 2).map(esc).join(" or ")}?<span class="chip c-warn">You choose</span></div><div class="s">Pick one. The card will use only that person's messages.</div><div class="chips">${d.buyers.map(b => `<button class="cb" data-a="buyer" data-v="${esc(b)}">${esc(b)}</button>`).join("")}</div></div></div></div>`;
    return { body: h, foot: `<button class="pb" disabled>Pick the customer first</button>`, c };
  }
  // agreement
  if (R >= 1) {
    const a = d.agreement || { state: "unclear", quote: "" };
    if (a.state === "agreed") h += `<div class="rsec reveal"><div class="agr"><span class="dotst d-ok"></span><div><b>Agreed:</b> “${esc(a.quote)}”</div></div></div>`;
    else if (res.agree) h += `<div class="rsec reveal"><div class="agr"><span class="dotst d-set"></span><div><b>Agreed:</b> confirmed by you <span class="chip c-set">I confirm</span></div></div></div>`;
    else h += `<div class="rsec reveal"><div class="wbox bad"><div class="h">Purchase not confirmed<span class="chip c-bad">${a.state === "question" ? "Question" : "Unclear"}</span></div><div class="s">${a.state === "question" ? "This reads like a question" : "There's no clear yes"}${a.quote ? `: “${esc(a.quote)}”` : ""}. A payment link now could feel pushy.</div><div class="chips"><button class="cb" data-a="pricereply">Draft a price reply</button><button class="cb" data-a="agree">She agreed: continue (I confirm)</button></div>${U.priceReply ? `<div class="fcopy">${esc(U.priceReply)}<div class="hint" style="margin-top:4px">${U.priceReplyOk ? "Copied. No link was created." : "Select and copy this text. No link was created."}</div></div>` : ""}</div></div>`;
  } else h += skel(1);
  // item
  if (R >= 2) {
    h += `<div class="rsec reveal">`;
    if (!it) h += `<div class="wbox miss"><div class="h">No item found in this chat<span class="chip c-miss">Missing</span></div><div class="s">Paste the part of the chat where the buyer names the item, or use the normal Payment Link form.</div></div>`;
    else if (it.notInList) {
      h += `<div class="wbox miss"><div class="h">Not in your list: “${esc(it.name)}”<span class="chip c-miss">Missing</span></div><div class="s">Type the price once for this request. Nothing is added to your list.</div>
        <div class="fld"><label class="lbl" for="m-name">Item name</label><input id="m-name" data-a="mname" value="${esc(res.manualName != null ? res.manualName : it.name)}" ${live ? "" : "disabled"}></div>
        <div class="fld"><label class="lbl" for="m-price">Price for one (₹)</label><input id="m-price" data-a="mprice" inputmode="numeric" placeholder="e.g. 599" value="${res.manualPaise ? res.manualPaise / 100 : ""}" ${live ? "" : "disabled"}></div></div>`;
    } else if (it.state === "supported" || res.product) {
      const p = PROD(it.state === "supported" ? it.product_id : res.product);
      h += `<div class="item">${swatch(p)}<div style="min-width:0;flex:1"><div class="nmx ell">${esc(p.name)}</div><div class="meta">${p.id} · your price list</div></div>${it.state === "supported" ? `<span class="chip c-ok">From chat</span>` : `<span class="chip c-set">Picked by you</span>`}</div>`;
      h += `<div class="fx full">${it.quote ? qt(it.quote) : ""}${it.reel ? qt(it.reel) : ""}${it.state !== "supported" && live ? `<button class="xbtn" data-a="unpick">Change</button>` : ""}</div>`;
    } else {
      const head = it.reason === "conflict" ? "The reel and the words point to different items" : it.reason === "two" ? "Two items are named" : it.reason === "low" || it.candidates.length < 2 ? `Not sure which item “${esc(it.quote || "this")}” means` : `“${esc(it.quote)}” fits ${it.candidates.length} items`;
      h += `<div class="wbox"><div class="h">${head}<span class="chip c-warn">You choose</span></div><div class="s">${it.reason === "colour" ? `“${esc(it.colour)}” is the colour of more than one item. ` : ""}Pick the one ${esc(nm)} meant.</div>
        ${it.candidates.map(id => { const p = PROD(id); return `<button class="opt${HB(o, "pick:" + id)}" data-a="pick" data-v="${id}" aria-pressed="${res.product === id}">${swatch(p, 1)}<div class="ell"><b>${esc(p.name)}</b><div class="meta">${rs(p.paise)} · ${p.id}</div></div></button>`; }).join("")}</div>`;
    }
    h += `</div>`;
  } else h += skel(2);
  // size, qty, price
  if (R >= 3 && it) {
    h += `<div class="rsec reveal">`;
    const s = it.size || {};
    if (c.size === "Free" && !it.notInList) h += fr("Size", "Free size", `<span class="chip c-ok">Saree</span>`);
    else if (s.state === "na") { /* no size for a one-off item */ }
    else if (s.state === "supported") h += fr("Size", s.changed ? `<s style="color:#8592a6">${esc(s.wasValue)}</s> → ${esc(s.value)}` : esc(s.value), `<span class="chip c-ok">${s.changed ? "Changed in chat" : "From chat"}</span>`, (s.changed ? qt(s.was) : "") + qt(s.quote));
    else {
      const picked = res.size; const st = s.state === "needs" ? "warn" : "miss";
      const note = s.state === "needs" ? (s.reason === "seller" && s.candidates[1] ? `You suggested ${esc(s.candidates[1])}. Did ${esc(nm)} accept?` : s.candidates.length > 1 ? `Two sizes in the chat: ${s.candidates.map(esc).join(" and ")}.` : `Not sure about the size. Is it ${esc(s.candidates[0])}?`) : `Only ${esc(nm)} knows her size.`;
      const opts = (s.candidates && s.candidates.length > 1 ? s.candidates : (PROD(c.pid || (it.candidates || [])[0] || "MT-KUR-014") || {}).sizes || ["S", "M", "L", "XL"]);
      h += fr("Size", picked ? esc(picked) : "—", picked ? `<span class="chip c-set">Picked by you</span>` : `<span class="chip c-${st}">${s.state === "needs" ? "Check" : "Missing"}</span>`,
        `<span class="hint">${note}</span>${s.quote ? qt(s.quote) : ""}<div class="chips">${s.state === "missing" ? `<button class="cb${HB(o, "ask")}" data-a="ask">Ask ${esc(nm)}</button>` : ""}${opts.map(z => `<button class="cb" data-a="size" data-v="${esc(z)}" aria-pressed="${picked === z}" ${live ? "" : "tabindex='-1'"}>${esc(z)}</button>`).join("")}</div>${U.asked ? `<div class="fcopy">${esc(U.asked)}<div class="hint">${U.askedOk ? "Copied. Paste it in the chat." : "Select and copy this text."}</div></div>` : ""}`);
    }
    const q = it.qty || {};
    if (q.state === "supported") h += fr("Quantity", q.changed ? `<s style="color:#8592a6">${esc(q.wasValue)}</s> → ${q.value}` : String(q.value), `<span class="chip c-ok">${q.changed ? "Changed in chat" : q.auto ? "One item named" : "From chat"}</span>`, q.auto ? "" : (q.changed ? qt(q.was) : "") + qt(q.quote));
    else h += fr("Quantity", res.qty ? String(res.qty) : "—", res.qty ? `<span class="chip c-set">Picked by you</span>` : `<span class="chip c-${q.state === "needs" ? "warn" : "miss"}">${q.state === "needs" ? "Check" : "Missing"}</span>`, `<div class="chips">${[1, 2, 3, 4, 5].map(n => `<button class="cb" data-a="qty" data-v="${n}" aria-pressed="${res.qty === n}">${n}</button>`).join("")}</div>${q.quote ? qt(q.quote) : ""}`);
    // price
    if (d.price_request && !it.notInList) {
      const pr = d.price_request, list = c.pid ? PROD(c.pid).paise : null;
      if (res.price) h += fr("Price", res.price === "use" ? `${rs(pr.paise)} each` : `${rs(list)} each`, `<span class="chip c-set">${res.price === "use" ? "Changed by you" : "Kept your price"}</span>`, qt(pr.quote) + (live ? `<button class="xbtn" data-a="price" data-v="">Change</button>` : ""));
      else h += `<div class="wbox" style="margin-top:4px"><div class="h">${esc(nm)} asked ${rs(pr.paise)}<span class="chip c-warn">You decide</span></div><div class="s">${list ? `${esc(nm)} asked ${rs(pr.paise)}. Your price is ${rs(list)}.` : `${esc(nm)} asked ${rs(pr.paise)}. Pick the item first to see your price.`} The AI never applies a price.</div>${qt(pr.quote)}
        <div class="chips"><button class="cb${HB(o, "price:keep")}" data-a="price" data-v="keep" ${list ? "" : "disabled"}>Keep ${list ? rs(list) : "your price"}</button><button class="cb" data-a="price" data-v="use" ${list ? "" : "disabled"} ${live ? "" : "tabindex='-1'"}>Use ${rs(pr.paise)} (marked 'changed by you')</button></div></div>`;
    }
    if (c.lines.length) { const L1 = c.lines[0]; h += fr("Amount", `<span class="amt">${L1.qty} × ${rs(L1.unit)} = ${rs(L1.amount)}</span>`, "", `<span class="hint">${it.notInList ? "Price typed by you" : res.price === "use" ? "Price changed by you" : "Price from your list, added up by code"}</span>`); }
    h += `</div>`;
  } else if (it) h += skel(2);
  // delivery, tax, total
  if (R >= 4 && it) {
    h += `<div class="rsec reveal">`;
    if (d.delivery.source === "chat" && res.deliveryPaise == null) h += `<div class="wbox"><div class="h">The chat mentions delivery<span class="chip c-warn">Check</span></div>${qt(d.delivery.quote)}<div class="s">${d.delivery.who === "seller" ? "You wrote this." : "The buyer wrote this."} Confirm what to charge.</div><div class="chips"><button class="cb" data-a="del" data-v="${d.delivery.paise}">Use ${rs(d.delivery.paise)} (from chat)</button><button class="cb" data-a="del" data-v="setting">Use my setting</button></div></div>`;
    else if (U.delEdit) h += fr("Delivery", `<span class="inr">₹ <input id="del-in" data-a="delin" inputmode="numeric" value="${c.delivery != null ? c.delivery / 100 : ""}" aria-label="Delivery in rupees"></span>`, `<button class="cb" data-a="deldone">Done</button>`);
    else h += fr("Delivery", c.delivery != null ? `<span class="amt">${rs(c.delivery)}</span>` : "—", `<span class="chip c-set">${esc(c.delivery != null ? (c.delSrc || "your setting") : "your setting, once priced")}</span>`, live ? `<button class="xbtn" data-a="deledit">Change</button>` : `<span class="hint">tap to change</span>`);
    if (U.discEdit) h += fr("Discount", `<span class="inr">₹ <input id="disc-in" data-a="discin" inputmode="numeric" value="${res.discountPaise ? res.discountPaise / 100 : ""}" aria-label="Discount in rupees"></span>`, `<button class="cb" data-a="discdone">Done</button>`);
    else h += fr("Discount", res.discountPaise ? `− <span class="amt">${rs(res.discountPaise)}</span>` : "None", `<span class="chip c-set">${res.discountPaise ? "Added by you" : "Prices include tax"}</span>`, live ? `<button class="xbtn" data-a="discedit">${res.discountPaise ? "Change" : "Add discount"}</button>` : "");
    h += `</div><div class="tot reveal"><span>Total</span><b class="amt">${c.ok ? rs(c.total) : "—"}</b></div>`;
  } else if (it) h += skel(1);
  // sources + checklist
  if (R >= 5) {
    const src = [];
    if (d.agreement && d.agreement.quote && d.agreement.state === "agreed") src.push([d.agreement.quote, d.agreement.line, "Agreement"]);
    if (it && it.reel) src.push([it.reel, (d.lines.find(l => l.reel) || {}).i, "Item"]);
    if (it && it.quote) src.push([it.quote, it.line, "Item"]);
    if (it && it.size && it.size.quote && !it.size.auto) src.push([it.size.quote, it.size.line, "Size"]);
    if (it && it.qty && it.qty.quote && !it.qty.auto) src.push([it.qty.quote, it.qty.line, "Quantity"]);
    if (d.price_request) src.push([d.price_request.quote, d.price_request.line, "Price ask"]);
    const seen = new Set(); const chips = src.filter(x => { const k = x[0] + "|" + x[1]; if (seen.has(k)) return false; seen.add(k); return true; });
    const hotIdx = o.hot === "src" ? Math.max(0, chips.findIndex(x => x[2] === "Item")) : -1;
    h += `<div class="rsec reveal"><div class="ey">Sources · tap to see the words</div><div class="chips">${chips.map(([q, l, k], ci) => `<button class="q${U.hl && U.hl.q === q ? " on" : ""}${ci === hotIdx ? ' hot" data-hot="src' : ""}" data-a="hl" data-l="${l}" data-q="${esc(q)}" title="${esc(k)}">${esc(k)}: “${esc(q.length > 26 ? q.slice(0, 25) + "…" : q)}”</button>`).join("")}</div>${miniChat(d)}</div>`;
    const okN = 6 - c.todo;
    h += `<div class="rsec reveal"><button class="ckbtn${HB(o, "ck")}" data-a="ck" aria-expanded="${U.ck}"><span>Approval checklist</span><span class="${c.todo ? "chip c-warn" : "chip c-ok"}">${okN}/6 ready${c.todo ? "" : " ✓"}</span></button>${U.ck ? `<div class="ckl">${c.checks.map(x => `<div><span class="${x.ok ? "y" : "n"}">${x.ok ? "✓" : "•"}</span><span>${esc(x.k)}${x.na ? ` <span class="hint">(${esc(x.na)})</span>` : ""}</span></div>`).join("")}</div>` : ""}</div>`;
  } else h += skel(1);
  h += `</div>`;
  if (o.note) h += o.note;
  let foot = o.foot;
  if (foot == null) foot = c.ok ? `<button class="pb${HB(o, "create")}" data-a="create">Create link &amp; copy reply</button><div class="hint" style="text-align:center">Creates a standard Razorpay Payment Link · expires in ${set.expiryHrs} hrs</div>` : `<button class="pb" disabled>${c.todo} thing${plural(c.todo)} to decide</button>`;
  return { body: h, foot, c };
}
function miniChat(d) {
  const used = new Set(d.used || d.lines.map(l => l.i));
  return `<div class="mini" aria-label="The chat, for checking sources">${d.lines.map(l => {
    let t = esc(l.reel ? "Reel: " + l.text : l.text);
    if (U.hl && +U.hl.l === l.i) { const q = U.hl.q.replace(/^Reel: /, ""); const src = l.reel ? "Reel: " + l.text : l.text; const at = src.toLowerCase().indexOf(q.toLowerCase()); if (at >= 0) t = esc(src.slice(0, at)) + "<mark>" + esc(src.slice(at, at + q.length)) + "</mark>" + esc(src.slice(at + q.length)); else if (l.reel) t = "<mark>" + t + "</mark>"; }
    return `<div class="ml${l.who === "seller" ? " me" : ""}${l.reel ? " reel" : ""}" style="${used.has(l.i) ? "" : "opacity:.45"}" data-line="${l.i}">${l.who === "buyer" && l.name && !l.reel ? `<b>${esc(l.name)}:</b> ` : ""}${t}</div>`;
  }).join("")}</div>`;
}
