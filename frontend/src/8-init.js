
/* ===== shared painting, tabs, modals, sizing ===== */
function paintScreen() {
  const scr = $("#screen"); const old = scr.querySelector(".bd"); const prevTop = old ? old.scrollTop : 0; const sig = S.tab === "demo" ? "d" + S.sc + ":" + S.fi : "l" + L.screen;
  const ae = document.activeElement; const focusId = ae && scr.contains(ae) ? (ae.id || null) : null; const sel = focusId && ae.selectionStart != null ? [ae.selectionStart, ae.selectionEnd] : null;
  const focusKey = ae && scr.contains(ae) && !ae.id ? (ae.dataset.a || "") + "|" + (ae.dataset.v || "") + "|" + (ae.dataset.hot || "") : null;
  scr.innerHTML = S.tab === "demo" ? demoScreen(FR[S.fi], DATA.scenarios[S.sc]) : liveScreen();
  const hb = $("#homebar"); hb.classList.toggle("lt", !!scr.querySelector(".lock"));
  const bd = scr.querySelector(".bd");
  if (bd) { if (bd.classList.contains("chatbd") && !(scr.dataset.sig === sig)) bd.scrollTop = bd.scrollHeight; else if (scr.dataset.sig === sig) bd.scrollTop = prevTop; }
  if (bd && bd.classList.contains("chatbd") && scr.dataset.sig !== sig) bd.scrollTop = bd.scrollHeight;
  scr.dataset.sig = sig;
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } } }
  else if (focusKey) { const [a, v, h] = focusKey.split("|"); const el = $$("#screen button").find(b => (b.dataset.a || "") === a && (b.dataset.v || "") === v && (b.dataset.hot || "") === h); if (el) el.focus({ preventScroll: true }); }
  // keep the orange target in view
  const hot = scr.querySelector(".hot"); if (hot && bd && scr.dataset.hotSig !== sig + (hot.dataset.hot || "")) { scr.dataset.hotSig = sig + (hot.dataset.hot || ""); const br = bd.getBoundingClientRect(), hr = hot.getBoundingClientRect(); if (bd.contains(hot) && (hr.bottom > br.bottom || hr.top < br.top)) bd.scrollTop += (hr.top - br.top) - bd.clientHeight / 3; }
}
function syncChannel() { $$("#hdr [data-ch]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.ch === S.ch))); }
function setTab(t) {
  S.tab = t; document.body.classList.toggle("live", t === "live");
  $$("#hdr [data-tab]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === t)));
  clearTimers(); stopAuto();
  if (t === "demo") { $("#fl-tick").innerHTML = ""; startScenario(S.ch === "whatsapp" ? 2 : (DATA.scenarios[S.sc].ch === S.ch ? S.sc : 0)); }
  else { L.ch = S.ch; $("#fl-tick").innerHTML = ""; logLine("Live mode · rules run in this browser"); if (!L.draft) liveFlowReset(); liveRender(); }
  fit();
}
function setChannel(ch) {
  S.ch = ch; syncChannel();
  if (S.tab === "demo") { if (DATA.scenarios[S.sc].ch !== ch) startScenario(ch === "whatsapp" ? 2 : 0); else renderSide(); }
  else { L.ch = ch; if (L.draft) L.draft.channel = ch; liveRender(); }
}
let lastFocus = null;
function openModal(id) { stopAuto(); lastFocus = document.activeElement; $$(".ov.open").forEach(o => o.classList.remove("open")); const o = $("#" + id); o.classList.add("open"); const b = o.querySelector(".btn") || o.querySelector("button"); if (b) setTimeout(() => b.focus(), 30); }
function closeModal() { $$(".ov.open").forEach(o => o.classList.remove("open")); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
function setCompact(on, auto) { document.body.classList.toggle("lane-compact", on); $("#b-compact").textContent = on ? "Expand" : "Collapse"; $("#b-compact").setAttribute("aria-pressed", String(on)); if (auto) S.autoCompact = on; }
function setProb(hidden, auto) { document.body.classList.toggle("prob-off", hidden); $("#b-prob-show").hidden = !hidden; if (auto) S.autoProb = hidden; }
function fit() {
  const w = window.innerWidth, cw = document.documentElement.clientWidth || w, b = document.body; let k;
  if (w < 1024) { k = Math.min(1, (cw - 34) / (w < 480 ? 390 : 414)); }
  else {
    if (S.autoProb) setProb(false, true); if (S.autoCompact) setCompact(false, true);
    const calc = () => { const st = $("#stage"); const H = st.clientHeight, W = st.clientWidth; const sideW = b.classList.contains("phone-only") ? 0 : 294; return Math.min((H - 20 - 22) / 868, (W - 40 - sideW) / 414, 1); };
    k = calc();
    if (k < 0.6 && !S.userCompact && !b.classList.contains("lane-compact")) { setCompact(true, true); k = calc(); }
    if (k < 0.6 && !S.userProb && !b.classList.contains("prob-off")) { setProb(true, true); k = calc(); }
    b.classList.toggle("k-tight", k < 0.6);
    k = Math.max(k, 0.42);
  }
  document.documentElement.style.setProperty("--k", k.toFixed(4));
}
let autoT = null, hovering = false;
function startAuto() { stopAuto(); if (RM()) return; S.auto = true; autoT = setInterval(() => { if (hovering || $(".ov.open") || S.tab !== "demo") return; if (frameReady()) next(); }, 3500); }
function stopAuto() { if (autoT) clearInterval(autoT); autoT = null; S.auto = false; const c = $("#d-auto"); if (c) c.checked = false; }

/* 8. tests */
function runTests() {
  const ok = (cond) => !!cond;
  const checks = [
    (d, c, it) => ok(it && it.product_id === "MT-KUR-014" && it.state === "supported" && c.size === "M" && c.qty === 2 && d.agreement.state === "agreed" && c.total === 247800),
    (d) => ok(d.agreement.state === "question"),
    (d, c, it) => ok(it && it.product_id === "MT-COR-003" && it.size.state === "missing" && !c.ok),
    (d, c, it) => ok(it && it.product_id === "MT-KUR-014" && it.state === "supported" && /bandhani/i.test(it.quote) && c.size === "L" && c.qty === 1 && c.total === 127900),
    (d, c, it) => ok(it && it.state === "needs" && it.candidates.join() === "MT-KUR-014,MT-KUR-016" && !c.ok),
    (d, c, it) => ok(it && it.product_id === "MT-KUR-030" && it.size.value === "L" && it.size.changed && it.qty.value === 1 && it.qty.changed && c.total === 107900),
    (d, c, it) => ok(it && it.product_id === "MT-KUR-014" && c.size === "M" && c.qty === 2 && d.price_request && d.price_request.paise === 110000 && !c.checks[2].ok && !c.ok),
    (d, c, it) => ok(it && it.product_id === "MT-SAR-005" && c.size === "Free" && c.qty === 1 && c.delivery === 0 && c.total === 399900),
    (d) => ok(d.agreement.state === "unclear" && d.items.length === 0),
    (d) => ok(d.multiple_customers && d.buyers.includes("Ritu") && d.buyers.includes("Sana") && !d.buyer),
    (d, c, it) => ok(it && it.notInList && it.state === "missing" && !c.checks[2].ok)
  ];
  const rows = DATA.tests.map((t, i) => { const d = P.parse(t.in, "instagram"), c = compute(d, {}), it = d.items[0]; let pass = false, got = ""; try { pass = checks[i](d, c, it); } catch (e) { got = String(e); }
    got = got || [d.multiple_customers && !d.buyer ? "two customers" : "", it ? (it.notInList ? "not in list: " + it.name : (it.product_id || "?") + " [" + it.state + "]") : "no item", it && it.size ? "size " + (it.size.value || it.size.state) + (it.size.changed ? " (changed)" : "") : "", it && it.qty ? "qty " + (it.qty.value || it.qty.state) + (it.qty.changed ? " (changed)" : "") : "", d.agreement ? d.agreement.state : "", d.price_request ? "asked " + rs(d.price_request.paise) : "", c.ok ? "total " + rs(c.total) : "Create disabled (" + c.todo + ")"].filter(Boolean).join(" · ");
    return { i: i + 1, input: t.in, expect: t.expect, got, pass }; });
  const passed = rows.filter(r => r.pass).length; window.C2C_TESTS = { passed, total: rows.length, rows };
  $("#test-out").innerHTML = `<p><b class="${passed === rows.length ? "pass" : "fail"}">${passed} of ${rows.length} passed</b> · the same rules power the live tab.</p><div class="tbl-wrap"><table><thead><tr><th>#</th><th>Input</th><th>Expected</th><th>Got</th><th></th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.i}</td><td style="white-space:pre-wrap;font-family:var(--mono);font-size:11.5px">${esc(r.input)}</td><td>${esc(r.expect)}</td><td>${esc(r.got)}</td><td class="${r.pass ? "pass" : "fail"}">${r.pass ? "Pass" : "Fail"}</td></tr>`).join("")}</tbody></table></div>`;
  return window.C2C_TESTS;
}

/* ===== init ===== */
function buildCompare() {
  const C = DATA.compare; const last = C.cols.length - 1;
  $("#cmp-table").innerHTML = `<thead><tr><th></th>${C.cols.map((c, i) => `<th class="${i === last ? "us" : ""}" scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody>${C.rows.map(r => `<tr><th scope="row">${esc(r[0])}</th>${r.slice(1).map((v, i) => `<td class="${i === last ? "us" : ""}">${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}
function buildIllus() {
  $("#ill1").innerHTML = `<svg viewBox="0 0 200 64" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${18 + i * 23}" cy="18" r="7" fill="${i < 3 ? "#0C2451" : i === 3 ? "#E9771A" : "#fff"}" stroke="${i === 3 ? "#E9771A" : "#c9d3e1"}" stroke-width="2"/>`).join("")}<rect x="10" y="32" width="180" height="9" rx="4.5" fill="#e9eff8"/><rect x="10" y="32" width="75" height="9" rx="4.5" fill="#1F6FE5"/>${[1, 3, 4, 5].map(i => `<circle cx="${18 + i * 23}" cy="54" r="5" fill="#C2570C"/>`).join("")}</svg>`;
  $("#ill2").innerHTML = `<svg viewBox="0 0 200 64" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect x="76" y="4" width="48" height="58" rx="9" fill="#0d1526"/><rect x="80" y="8" width="40" height="50" rx="6" fill="#fff"/><rect x="85" y="16" width="30" height="6" rx="3" fill="#e9eff8"/><rect x="85" y="26" width="22" height="6" rx="3" fill="#e9eff8"/><rect x="85" y="44" width="30" height="8" rx="3" fill="#1F6FE5" stroke="#E9771A" stroke-width="2"/></svg>`;
  $("#ill3").innerHTML = `<svg viewBox="0 0 200 64" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect x="12" y="8" width="48" height="20" rx="6" fill="#E2F5F3" stroke="#0F7A73"/><rect x="76" y="8" width="48" height="20" rx="6" fill="#F1EBFF" stroke="#6B46C1"/><rect x="140" y="8" width="48" height="20" rx="6" fill="#E8F0FF" stroke="#1D5FC4"/><rect x="76" y="38" width="48" height="20" rx="6" fill="#0C2451"/><path d="M60 18h16M124 18h16M164 28 L124 44" stroke="#0C2451" stroke-width="1.5" fill="none"/></svg>`;
}
function wire() {
  $$("#hdr [data-tab]").forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));
  $("#hdr .seg[role=tablist]").addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const t = S.tab === "demo" ? "live" : "demo"; setTab(t); $(`#tab-${t}`).focus(); e.preventDefault(); e.stopPropagation(); } });
  $$("#hdr [data-ch]").forEach(b => b.addEventListener("click", () => setChannel(b.dataset.ch)));
  $("#b-guide").addEventListener("click", () => openModal("ov-intro"));
  $("#b-cmp").addEventListener("click", () => openModal("ov-cmp"));
  $("#b-restart").addEventListener("click", () => { if (S.tab === "demo") { S.ch = "instagram"; startScenario(0); } else { L.text = ""; L.draft = null; L.res = {}; L.cur = null; L.screen = "input"; L.imgUrl = null; L.ocr = null; L.notice = ""; liveFlowReset(); liveRender(); } });
  $("#b-phone").addEventListener("click", () => { const on = !document.body.classList.contains("phone-only"); document.body.classList.toggle("phone-only", on); $("#b-phone").setAttribute("aria-pressed", String(on)); fit(); });
  $("#b-prob-hide").addEventListener("click", () => { S.userProb = true; S.autoProb = false; setProb(true); fit(); });
  $("#b-prob-show").addEventListener("click", () => { S.userProb = true; S.autoProb = false; setProb(false); fit(); });
  $("#b-compact").addEventListener("click", () => { S.userCompact = true; S.autoCompact = false; setCompact(!document.body.classList.contains("lane-compact")); fit(); });
  const openFlow = () => { document.body.classList.add("flow-open"); document.body.classList.remove("lane-open"); setTimeout(() => $("#b-flow-close").focus(), 50); };
  const closeSheets = () => { document.body.classList.remove("flow-open", "lane-open"); };
  $("#b-fab").addEventListener("click", openFlow); $("#b-m-flow").addEventListener("click", openFlow);
  $("#b-m-lane").addEventListener("click", () => { document.body.classList.add("lane-open"); document.body.classList.remove("flow-open"); $("#b-lane-close").hidden = false; setTimeout(() => $("#b-lane-close").focus(), 50); });
  $("#b-lane-close").addEventListener("click", () => { closeSheets(); $("#b-lane-close").hidden = true; });
  $("#b-flow-close").addEventListener("click", closeSheets); $("#shade").addEventListener("click", () => { closeSheets(); $("#b-lane-close").hidden = true; });
  $$(".ov").forEach(o => { o.addEventListener("click", e => { if (e.target === o || e.target.closest("[data-close]")) closeModal(); }); });
  $("#b-in-demo").addEventListener("click", () => { closeModal(); if (S.tab !== "demo") setTab("demo"); });
  $("#b-in-live").addEventListener("click", () => { closeModal(); setTab("live"); });
  $("#b-rc-live").addEventListener("click", () => { closeModal(); setTab("live"); });
  $("#b-rc-again").addEventListener("click", () => { closeModal(); setTab("demo"); S.ch = "instagram"; startScenario(0); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if ($(".ov.open")) { closeModal(); return; } if (L.sheet && S.tab === "live") { L.sheet = false; liveRender(); return; } if (document.body.classList.contains("flow-open") || document.body.classList.contains("lane-open")) { closeSheets(); return; } }
    if ($(".ov.open")) { if (e.key === "Tab") { const f = $$(".ov.open button, .ov.open a"); if (f.length) { const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { f[f.length - 1].focus(); e.preventDefault(); } else if (!e.shiftKey && i === f.length - 1) { f[0].focus(); e.preventDefault(); } } } return; }
    const tag = (e.target.tagName || "").toLowerCase(); if (["input", "textarea", "select"].includes(tag)) return;
    if (S.tab === "demo" && e.key === "ArrowRight") { next(); e.preventDefault(); }
    if (S.tab === "demo" && e.key === "ArrowLeft") { back(); e.preventDefault(); }
  });
  $("#screen").addEventListener("click", e => {
    const h = e.target.closest("[data-hot]");
    if (h && !h.disabled) { if (S.tab === "demo") demoHot(h.dataset.hot, h); else if (h.dataset.a) liveAction(h, e); else if (h.dataset.hot === "send") liveAction({ dataset: { a: "send" } }); return; }
    const a = e.target.closest("[data-a]"); if (!a || a.disabled || a.tagName === "INPUT") return;
    if (S.tab === "demo") demoAction(a); else liveAction(a, e);
  });
  $("#screen").addEventListener("input", e => { if (S.tab === "live" && (e.target.dataset.a || e.target.id === "lta")) { if (e.target.id === "lta" || e.target.dataset.a === "mname") { liveInput(e); } else liveInput(e); } });
  $("#screen").addEventListener("change", e => { if (S.tab !== "live") return; if (e.target.id === "lfile") { const f = e.target.files && e.target.files[0]; if (f) runOCR(f); return; } if (e.target.dataset.s) liveInput(e); });
  $("#side").addEventListener("click", e => {
    const t = e.target.closest("button,input"); if (!t) return;
    if (S.tab === "live") { if (t.dataset.a && !t.disabled) liveAction(t, e); return; }
    if (t.id === "d-next") next(); else if (t.id === "d-back") back(); else if (t.id === "d-rs") { S.fi = 0; S.lastKey = ""; renderDemo(); }
    else if (t.id === "d-auto") { if (t.checked) startAuto(); else stopAuto(); }
    else if (t.dataset.sc != null) startScenario(+t.dataset.sc);
  });
  $("#ln-map").addEventListener("click", e => { const c = e.target.closest("[data-step]"); if (c && S.tab === "demo") goStep(+c.dataset.step); });
  $("#stage").addEventListener("mouseenter", () => hovering = true); $("#stage").addEventListener("mouseleave", () => hovering = false);
  const fm = $("#fl-map");
  fm.addEventListener("mouseover", e => { const g = e.target.closest(".nd"); if (g && g.dataset.id !== F.hover) { F.hover = g.dataset.id; flowCaption(); } });
  fm.addEventListener("mouseleave", () => { F.hover = ""; flowCaption(); });
  fm.addEventListener("focusin", e => { const g = e.target.closest(".nd"); if (g) { F.hover = g.dataset.id; flowCaption(); } });
  $("#b-json").addEventListener("click", () => { const p = $("#json-out"); const open = p.hidden; p.hidden = !open; $("#b-json").setAttribute("aria-expanded", String(open)); $("#b-json").textContent = open ? "Hide JSON" : "Show JSON"; $("#b-json-copy").hidden = !open; showJson(); });
  $("#b-json-copy").addEventListener("click", () => copyText($("#json-out").textContent).then(ok => { $("#b-json-copy").textContent = ok ? "Copied" : "Select to copy"; setTimeout(() => $("#b-json-copy").textContent = "Copy JSON", 1500); }));
  window.addEventListener("resize", fit);
  if (window.ResizeObserver) { let raf = 0; new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); }).observe($("#main")); }
  if (window.matchMedia) { const mq = window.matchMedia("(prefers-reduced-motion: reduce)"); const f = () => { if (mq.matches) stopAuto(); }; mq.addEventListener ? mq.addEventListener("change", f) : mq.addListener(f); }
}
function init() {
  lsLoad(); buildLane(); buildCompare(); buildIllus(); wire();
  FR = framesFor(DATA.scenarios[0].key); startScenario(0); fit();
  detectApi(); // switches the live tab to the real AI and Razorpay test mode when the server offers them
  const q = new URLSearchParams(location.search), hash = (location.hash || "").slice(1);
  if (q.get("test") === "1" || hash === "test") { runTests(); openModal("ov-test"); }
  else if (q.get("intro") !== "0" && hash !== "nointro") openModal("ov-intro");
  if (q.get("tab") === "live" || hash === "live") setTab("live");
}
document.addEventListener("DOMContentLoaded", init);
