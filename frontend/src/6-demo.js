
/* 6. demo scripts */
function framesFor(key) {
  const C = DATA.steps[key];
  const f = (st, id, at, x) => Object.assign({ st, id, scr: id, at, copy: C[id] }, x || {});
  const KP = { product: "MT-KUR-014" }, KF = { product: "MT-KUR-014", price: "keep" };
  if (key === "ritu") return [f(1, "chat1", 0), f(2, "share", 6), f(3, "draft", 8, { fill: 1 }), f(4, "check", 12), f(5, "approve", 15, { ck: 1 }), f(6, "ready", 29), f(6, "compose", 33), f(6, "sent", 40, { done: 1 }), f(7, "checkout", 220, { buyer: 1 }), f(7, "paidok", 236, { buyer: 1, done: 1 }), f(8, "noti", 238), f(8, "detail", 245, { done: 1, end: 1 })];
  if (key === "kavya") return [f(1, "chat1", 0), f(2, "share", 5), f(3, "draft", 7, { fill: 1 }), f(4, "pick", 11), f(4, "price", 15, { res: KP }), f(5, "approve", 19, { res: KF, ck: 1 }), f(6, "ready", 26, { res: KF }), f(6, "compose", 30, { res: KF }), f(6, "sent", 36, { res: KF, done: 1 }), f(7, "later", 93636, { res: KF, done: 1 }), f(8, "links", 93650, { res: KF }), f(8, "follow", 93655, { res: KF, done: 1, end: 1, wait: 1 })];
  return [f(1, "chat1", 0), f(2, "share", 5), f(3, "draft", 7, { fill: 1 }), f(4, "ask", 11), f(4, "reply", 120), f(4, "resolved", 128, { later: 1, done: 1 }), f(5, "approve", 132, { later: 1, ck: 1 }), f(6, "ready", 138, { later: 1 }), f(6, "compose", 141, { later: 1 }), f(6, "sent", 146, { later: 1, done: 1 }), f(7, "checkout", 410, { later: 1, buyer: 1 }), f(7, "paidok", 424, { later: 1, buyer: 1, done: 1 }), f(8, "noti", 426, { later: 1 }), f(8, "detail", 430, { later: 1, done: 1, end: 1 })];
}
function clockAt(sc, sec) { const b = sc.clock[0] * 3600 + sc.clock[1] * 60 + sc.clock[2] + sec; const t = ((b % 86400) + 86400) % 86400; return [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60]; }
const hm = a => String(a[0]).padStart(2, "0") + ":" + String(a[1]).padStart(2, "0");

function demoScreen(fr, sc) {
  const d = draftFor(sc, fr.later), res = fr.res || {}, c = Object.assign(compute(d, res), { ref: sc.link }), T = hm(clockAt(sc, fr.at)), nm = sc.buyer, wa = sc.ch === "whatsapp";
  let msgs = scMsgs(sc, fr.later, wa ? ["16:02", "16:05"] : []);
  if (sc.key === "sana" && fr.later) msgs = [msgs[0], { who: "me", text: "Sure! Which size, S, M, L or XL? 😊", t: "16:03" }].concat(msgs.slice(1));
  const reply = c.ok ? replyText(d, c, sc.link) : "";
  const meReply = { who: "me", text: reply, link: 1, t: hm(clockAt(sc, 140)) };
  const head = rHead("Create from chat", `From ${nm}'s chat · ${chName(sc.ch)}`, { isNew: 1, gear: 1 });
  const simSend = `In the real app, this happens in ${chName(sc.ch)}.`;
  const L1 = c.lines[0];
  const itemLine = L1 ? `${L1.qty} × ${L1.name}${L1.size && L1.size !== "Free" ? ` (${L1.size})` : ""}` : "";
  switch (fr.scr) {
    case "chat1": return chatScr(sc, { msgs, hot: "shot", time: T, at: hm(clockAt(sc, -120)) });
    case "share": return chatScr(sc, { msgs, shot: false, time: T, at: hm(clockAt(sc, -120)), overlay: shareOverlay({ hot: "share" }) });
    case "draft": {
      const done = U.fill >= 6;
      const k = card(d, res, { reveal: U.fill, hot: done && !U.busy ? "src" : null, foot: done ? null : `<button class="pb" disabled>Reading the chat…</button>` });
      return appScr(T, head, k.body, k.foot);
    }
    case "check": { const k = card(d, res, { hot: U.ck ? null : "ck" }); return appScr(T, head, `<div class="okbanner"><span style="width:26px;height:26px;border-radius:50%;background:var(--ok);color:#fff;display:grid;place-items:center;font-weight:900;flex:none">✓</span><div><b>Nothing to resolve.</b> Every detail has a source in the chat.</div></div>` + k.body, k.foot); }
    case "ask": { const k = card(d, res, { hot: "ask" }); return appScr(T, head, k.body, k.foot); }
    case "pick": { const k = card(d, res, { hot: "pick:MT-KUR-014" }); return appScr(T, head, k.body, k.foot); }
    case "price": { const k = card(d, res, { hot: "price:keep" }); return appScr(T, head, k.body, k.foot); }
    case "resolved": { const k = card(d, res, { hot: U.ck ? null : "ck" }); return appScr(T, head, k.body, k.foot); }
    case "approve": { const k = card(d, res, { hot: "create" }); return appScr(T, head, k.body, k.foot); }
    case "ready": return readyScr(T, d, c, sc.link, sc.ch, { hot: "open", reply, prefill: wa });
    case "compose": return chatScr(sc, { msgs, shot: false, time: T, composer: reply, hot: "send", simline: simSend + (wa ? " Pre-filled because Sana's number is known." : " Pasted by Meera.") });
    case "sent": return chatScr(sc, { msgs: msgs.concat([Object.assign({}, meReply, { new: 1 })]), shot: false, time: T,
      end: sc.key === "kavya" ? `<div class="endcard" style="margin-top:10px"><div class="hint">Kavya doesn't reply. Let's skip ahead a day.</div><button class="pb hot" data-hot="ff">Fast-forward 26 hrs</button>${SIM("The clock is moved forward for the demo.")}</div>`
        : `<div class="endcard" style="margin-top:10px"><div class="hint">Request: <b>Link ready · Copied</b>. Payment: <b>Unpaid</b>.</div><button class="pb hot" data-hot="buyer">See it on ${esc(nm)}'s phone</button>${SIM("The buyer's side is simulated.")}</div>` });
    case "checkout": return checkoutScr(T, c, sc.link, itemLine, { hot: "pay" });
    case "paidok": return paidScr(T, c, sc.link, nm);
    case "noti": return notiScr(T, c, nm, itemLine);
    case "detail": return detailScr(T, d, c, sc, itemLine, fr);
    case "later": return chatScr(sc, { msgs: msgs.concat([meReply]), shot: false, time: T, day: "Yesterday",
      top: `<div class="clock"><b class="num">+26 hrs</b><span>Next day, ${T}. No reply from Kavya, no payment.</span>${SIM("The clock is moved forward for the demo.")}</div>`,
      end: `<button class="act hot" data-hot="links" style="margin-top:8px">${GLYPH(14)} Open Payment Links in Razorpay</button>` });
    case "links": case "follow": return linksScr(T, sc, c, fr);
    case "reply": return chatScr(sc, { time: T, shot: false, msgs: [msgs[0], { sep: "Meera pasted and sent the question" }, { who: "me", text: "Sure! Which size, S, M, L or XL? 😊", t: "16:03" }, { who: "buyer", text: "L", t: "16:05", new: 1, act: { k: "add", label: "Share to Razorpay · Add to draft", sim: "In the real app, this is the phone share sheet." } }], hot: "add" });
  }
  return "";
}
function readyScr(T, d, c, link, ch, o) {
  const st = o.status || "unpaid"; const pill = st === "paid" ? `<span class="st-pill p-paid">Paid</span>` : st === "expired" || st === "cancelled" ? `<span class="st-pill p-exp">${st === "expired" ? "Expired" : "Cancelled"}</span>` : `<span class="st-pill p-unpaid">Unpaid</span>`;
  const copied = o.copyFail ? `<span class="st-pill p-copied">Link ready</span>` : `<span class="st-pill p-copied">Link ready · Copied</span>`;
  const body = `${o.copyFail ? `<div class="wbox"><div class="h">Couldn't copy automatically</div><textarea class="selbox" id="selbox" readonly>${esc(o.reply)}</textarea><div class="s">Press Ctrl/Cmd+C to copy. On a phone, long-press and choose Copy.</div></div>` : `<div class="toast"><span class="tk">✓</span><div><b>Link ready · Copied</b><div style="font-size:12.5px;opacity:.85">Paste it in ${esc(d.buyer || "the buyer")}'s chat.</div></div></div>`}
    <div class="linkbox"><span class="ell">${esc((o.url || "rzp.io/demo/" + link).replace(/^https?:\/\//, ""))}</span><span class="chip c-miss">${esc(o.modeChip || "demo link")}</span></div>
    <div class="kv"><span>Request</span><span>${copied}</span><span>Payment</span><span>${pill}</span><span>Amount</span><span class="amt">${rs(c.total)}</span><span>Expires</span><span>in ${o.expiry || 24} hrs, not renewed</span></div>
    <div><div class="lbl" style="margin-bottom:4px">Reply</div><div class="reply">${linkify(o.reply)}</div></div>${o.extra || ""}`;
  const foot = st === "expired" || st === "cancelled" ? `<button class="pb" data-a="renew" data-v="${esc(link)}">Create a new request from chat</button><div class="hint" style="text-align:center">Prices are checked again. Expired links are never renewed automatically.</div>` : `<button class="pb${o.hot === "open" ? " hot\" data-hot=\"open" : ""}" data-a="open">Open ${chName(ch)} ${SIM("In the real app, this opens " + chName(ch) + ".")}</button>${o.prefill ? `<div class="hint" style="text-align:center">Number known, so WhatsApp opens with the text filled in.</div>` : ""}<button class="pb sec" data-a="copyagain">Copy reply again</button>`;
  return appScr(T, rHead("Payment link", `Ref ${link}`, { back: o.back }), body, foot);
}
function checkoutScr(T, c, link, itemLine, o) {
  return `<div class="scr">${sbar(T, "#fff", "#1F6FE5")}<div class="bd"><div class="co-top"><div style="display:flex;gap:10px;align-items:center"><span class="av" style="background:#fff;color:#1F6FE5">MT</span><div style="min-width:0"><b>${esc(DATA.merchant.name)}</b><div style="font-size:12px;opacity:.9" class="ell">rzp.io/demo/${esc(link)}</div></div></div><div style="margin-top:14px;font-size:13px;opacity:.9">Amount to pay</div><div style="font-size:32px;font-weight:900" class="amt">${rs(c.total)}</div></div>
    <div class="co-card"><div class="ey">Order</div><div style="font-weight:700">${esc(itemLine)}${c.delivery ? ` · delivery ${rs(c.delivery)}` : c.delivery === 0 ? " · free delivery" : ""}</div><div class="kv"><span>Items</span><span class="amt">${rs(c.subtotal)}</span><span>Delivery</span><span class="amt">${rs(c.delivery || 0)}</span>${c.discount ? `<span>Discount</span><span class="amt">− ${rs(c.discount)}</span>` : ""}<span>Total</span><span class="amt">${rs(c.total)}</span></div></div>
    <div class="rbody"><div class="lbl">Pay with</div><div class="payopt">${ICON.upi}<span style="flex:1;margin-left:10px">UPI</span><span class="hint">Any UPI app</span></div><div class="payopt">${ICON.card}<span style="flex:1;margin-left:10px">Cards</span><span class="hint">Debit / credit</span></div><div class="payopt">${ICON.bank}<span style="flex:1;margin-left:10px">Netbanking</span><span class="hint">All banks</span></div></div></div>
    <div class="ft"><button class="pb${o.hot ? " hot\" data-hot=\"pay" : ""}" data-a="pay">Pay ${rs(c.total)} ${SIM("The buyer's payment is simulated. No money moves.")}</button><div class="secured">${GLYPH(14)} Secured by Razorpay</div></div></div>`;
}
function paidScr(T, c, link, nm) {
  return `<div class="scr">${sbar(T)}<div class="bd"><div class="rbody" style="padding-top:70px;text-align:center;gap:14px"><div class="big-tick"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h3 style="font-size:24px;color:#0C2451">${rs(c.total)} paid</h3><div>to ${esc(DATA.merchant.name)} · Ref ${esc(link)}</div><div class="hint">Razorpay sends ${esc(nm)} a receipt. ${SIM("The payment is simulated.")}</div></div></div><div class="ft"><div class="secured">${GLYPH(14)} Secured by Razorpay</div><button class="pb hot" data-hot="back">Back to Meera's phone</button></div></div>`;
}
function notiScr(T, c, nm, itemLine) {
  return `<div class="scr lock">${sbar(T, "#fff")}<div class="bd"><div style="text-align:center;padding:30px 0 26px"><div style="font-size:15px;opacity:.85">Today</div><div class="num" style="font-size:72px;font-weight:300;line-height:1">${esc(T)}</div></div>
    <button class="noti hot" data-hot="noti"><span class="ap">${GLYPH(16)} <b style="color:#0C2451">Razorpay</b> · now</span><b class="amt" style="font-size:15px">${rs(c.total)} received · ${esc(nm)}</b><span style="font-size:13.5px">${esc(itemLine)} · Ref ${esc(c.ref || "")}</span></button></div></div>`;
}
function detailScr(T, d, c, sc, itemLine, fr) {
  const last = S.sc === DATA.scenarios.length - 1;
  const nextSc = DATA.scenarios[S.sc + 1];
  return appScr(T, rHead("Payment link", `Ref ${sc.link}`), `<div class="lrow"><div class="top"><span class="nm">${esc(sc.buyer)} · ${chName(sc.ch)}</span><span class="st-pill p-paid">Paid</span></div><div class="amt" style="font-size:26px;font-weight:900;color:#0C2451">${rs(c.total)}</div><div class="kv"><span>Items</span><span>${esc(itemLine)}</span><span>Items total</span><span class="amt">${rs(c.subtotal)}</span><span>Delivery</span><span class="amt">${rs(c.delivery)}</span><span>Paid via</span><span>UPI</span><span>Created</span><span>${hm(clockAt(sc, 29))}</span><span>Paid</span><span>${esc(T)}</span></div></div>
    <div class="okbanner"><div><b>From Razorpay's records.</b> The paid webhook updated this request. Nothing to check in a screenshot.</div></div>
    <div class="endcard"><b style="color:#0C2451">End of ${esc(sc.buyer)}'s order</b><button class="pb hot" data-hot="nextsc">${last ? "See the recap" : `Next: ${esc(nextSc.buyer)}'s order →`}</button></div>`, "");
}
function linksScr(T, sc, c, fr) {
  const ritu = DATA.scenarios[0], dR = draftFor(ritu), cR = compute(dR, {});
  const follow = fr.scr === "follow";
  let row = `<div class="lrow" style="border-color:#f0c27a"><div class="top"><span class="nm">Kavya · Instagram</span><span class="st-pill p-unpaid">Unpaid</span></div><div class="sub">${esc(sc.link)} · ${rs(c.total)} · created yesterday ${hm(clockAt(sc, 26))}</div><div style="font-size:12.5px;color:var(--warn-ink);font-weight:700">Unpaid request · check before following up</div>`;
  if (!follow) row += `<div class="chips"><button class="cb hot" data-hot="follow">Copy follow-up</button><button class="xbtn" data-a="nope">Stop follow-ups</button></div><div class="hint">Follow-ups copied: 0 of ${DATA.settings.followCap}</div>`;
  else if (!U.chk) row += `<div style="display:flex;gap:8px;align-items:center;font-size:13px;color:var(--cd)"><span class="stat run" style="padding:2px 8px"><span class="sp"></span>Checking status…</span></div>`;
  else row += `<div class="hint" style="color:var(--ok-ink);font-weight:700">Razorpay still says Unpaid. Follow-up copied.</div><div class="fcopy">${linkify(followText("Kavya", sc.link))}</div><div style="display:flex;justify-content:space-between;align-items:center"><span class="hint">Follow-ups copied: 1 of ${DATA.settings.followCap}</span><button class="xbtn" data-a="nope">Stop follow-ups</button></div>`;
  row += `</div>`;
  const body = `<div class="chips"><button class="cb" tabindex="-1">All (2)</button><button class="cb" aria-pressed="true" tabindex="-1">Unpaid (1)</button><button class="cb" tabindex="-1">Paid (1)</button></div><div class="hint">Ritu's ${rs(cR.total)} (CT-1042) is Paid, so it isn't in this list.</div>${row}${follow && U.chk ? `<div class="endcard"><b style="color:#0C2451">End of Kavya's order</b><button class="pb hot" data-hot="nextsc">Next: Sana's order on WhatsApp →</button></div>` : ""}`;
  return appScr(T, rHead("Payment Links", "Filter: Unpaid"), body, "");
}

/* demo engine */
function startScenario(i, keepFrame) {
  S.sc = i; const sc = DATA.scenarios[i]; S.ch = sc.ch; syncChannel(); FR = framesFor(sc.key); S.fi = keepFrame === "last" ? FR.length - 1 : 0; S.lastKey = ""; $("#fl-tick").innerHTML = ""; renderDemo();
}
function frameReady() { const fr = FR[S.fi]; if (!fr) return false; if (fr.fill && U.fill < 6) return false; if (fr.wait && !U.chk) return false; return true; }
function renderDemo() {
  const sc = DATA.scenarios[S.sc], fr = FR[S.fi]; clearTimers();
  U.hl = null; U.ck = !!fr.ck; U.busy = false; U.chk = 0; U.asked = null; U.priceReply = null; U.delEdit = false; U.discEdit = false; U.fill = fr.fill ? (RM() ? 6 : 0) : 99;
  const cRef = compute(draftFor(sc, fr.later), fr.res || {}); cRef.ref = sc.link;
  paintScreen();
  const who = $("#whose"); who.classList.toggle("buyer", !!fr.buyer); who.querySelector("span").textContent = fr.buyer ? `${sc.buyer}'s phone (the buyer)` : "Meera's phone (the seller)";
  setLane(fr.st, { noPay: sc.key === "kavya", paid: sc.key !== "kavya", noAsk: sc.key !== "sana" }); renderSide();
  const key = sc.key + ":" + fr.st, step = DATA.journey.steps[fr.st - 1];
  $("#fl-ey").textContent = "Behind the screen"; $("#fl-title").textContent = `Behind step ${fr.st} of 8 · ${step.l}`; $("#fl-title").title = $("#fl-title").textContent;
  if (key !== S.lastKey) { runFlow(FLOW(fr.st, sc.key)); S.lastKey = key; if (fr.done) later(flowDone, 1700); }
  else if (fr.done) flowDone();
  (fr.copy.log || []).forEach((t, i) => logLine(t, clockAt(sc, fr.at + i)));
  if (fr.fill && U.fill < 6) { const tick = () => { U.fill++; paintScreen(); if (U.fill < 6) later(tick, 300); else updateNav(); }; later(tick, 300); }
  if (fr.wait) later(() => { U.chk = 1; paintScreen(); updateNav(); logLine("Status re-checked: Unpaid · follow-up copied", clockAt(sc, fr.at + 2)); }, 1000);
}
function renderSide() {
  const sc = DATA.scenarios[S.sc], fr = FR[S.fi], cp = fr.copy, ph = DATA.journey.phases.find(p => fr.st >= p.from && fr.st <= p.to).l;
  const list = DATA.scenarios.map((s, i) => ({ s, i })).filter(x => x.s.ch === S.ch);
  const other = S.ch === "instagram" ? "Switch to WhatsApp for Sana's order (size missing)." : "Switch to Instagram for Ritu's and Kavya's orders.";
  $("#side").innerHTML = `<div class="card" id="stepcard">
    <div class="ey">Scenario ${S.sc + 1} of 3 · Step ${fr.st} of 8 · ${esc(ph)}</div>
    <h2>${esc(cp.t)}</h2>
    <div class="who"><span class="k m">Seller</span><span>${esc(cp.s)}</span><span class="k c">Behind the screen</span><span>${esc(cp.b)}</span><span class="k b">Buyer</span><span>${esc(cp.u || "—")}</span></div>
    <div class="why"><span class="ey">Why it matters</span><p>${esc(cp.w)}</p></div>
    <div class="nav"><button class="btn sec" id="d-back" ${S.sc === 0 && S.fi === 0 ? "disabled" : ""}>Back</button><button class="btn" id="d-next"></button><button class="btn ghost" id="d-rs">Restart scenario</button></div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><label class="tog"><input type="checkbox" id="d-auto" ${S.auto ? "checked" : ""} ${RM() ? "disabled" : ""}> Auto-play${RM() ? " (off: reduced motion)" : ""}</label><span class="hint">← → keys work too</span></div>
    <div class="hint" id="d-hint" aria-live="polite"></div>
  </div>
  <div class="card sec2"><div class="ey">Sample orders · ${chName(S.ch)}</div><div class="scl">${list.map(x => `<button class="scb" data-sc="${x.i}" aria-current="${x.i === S.sc}"><b>${x.i + 1}</b><span class="ell" title="${esc(x.s.title)}">${esc(x.s.title)}</span><small>${chName(x.s.ch)}</small></button>`).join("")}</div><div class="hint">${other}</div></div>`;
  updateNav();
}
function updateNav() {
  const b = $("#d-next"); if (!b) return; const fr = FR[S.fi]; const lastF = S.fi === FR.length - 1;
  b.textContent = lastF ? (S.sc === DATA.scenarios.length - 1 ? "See the recap" : "Next scenario →") : "Next";
  b.disabled = !frameReady();
}
function next() {
  if (S.tab !== "demo" || !frameReady()) return;
  if (S.fi < FR.length - 1) { S.fi++; renderDemo(); return; }
  if (S.sc < DATA.scenarios.length - 1) { startScenario(S.sc + 1); return; }
  openModal("ov-recap");
}
function back() { if (S.tab !== "demo") return; if (S.fi > 0) { S.fi--; renderDemo(); } else if (S.sc > 0) startScenario(S.sc - 1, "last"); }
function goStep(n) { if (S.tab !== "demo") return; const i = FR.findIndex(f => f.st === n); if (i >= 0) { S.fi = i; renderDemo(); } }
function demoHot(k, el) {
  if (U.busy) return;
  const sc = DATA.scenarios[S.sc], fr = FR[S.fi], d = draftFor(sc, fr.later), c = compute(d, fr.res || {});
  if (k === "src" && el) { U.hl = { l: el.dataset.l, q: el.dataset.q }; U.busy = true; paintScreen(); later(() => { U.busy = false; next(); }, RM() ? 400 : 1400); return; }
  if (k === "ck") { U.ck = true; U.busy = true; paintScreen(); later(() => { U.busy = false; next(); }, RM() ? 400 : 1100); return; }
  if (k === "create" && c.ok) copyText(replyText(d, c, sc.link));
  if (k === "ask") copyText("Sure! Which size, S, M, L or XL? 😊");
  if (k === "follow") copyText(followText("Kavya", sc.link));
  if (k === "nextsc") { if (S.sc < DATA.scenarios.length - 1) startScenario(S.sc + 1); else openModal("ov-recap"); return; }
  next();
}
function demoAction(a) {
  const k = a.dataset.a;
  if (k === "hl") { U.hl = { l: a.dataset.l, q: a.dataset.q }; paintScreen(); return; }
  if (k === "ck") { U.ck = !U.ck; paintScreen(); return; }
  if (k === "create") { const sc = DATA.scenarios[S.sc], fr = FR[S.fi], d = draftFor(sc, fr.later), c = compute(d, fr.res || {}); const i = FR.findIndex(f => f.id === "ready"); if (c.ok && i > S.fi) { copyText(replyText(d, c, sc.link)); S.fi = i; renderDemo(); return; } }
  const h = $("#d-hint"); if (h) h.textContent = "This is the scripted demo. Tap the orange outline to move on, or use Try it live to change things yourself.";
}
