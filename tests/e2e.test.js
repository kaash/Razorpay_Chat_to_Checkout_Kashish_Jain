"use strict";
// End-to-end check in a real browser against the local server with MOCK_AI=1 and MOCK_PAY=1.
//   npm i && npx playwright install chromium && npm run test:e2e
// Set CHROMIUM_PATH to use an already-installed Chromium.
const { spawn } = require("child_process");
const path = require("path");
const { chromium } = require("playwright");

const PORT = 3999 + Math.floor(Math.random() * 500);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, "..", "dev-server.js")], { env: Object.assign({}, process.env, { PORT: String(PORT), MOCK_AI: "1", MOCK_PAY: "1", ANTHROPIC_API_KEY: "", RAZORPAY_KEY_ID: "" }), stdio: "inherit" });
  await sleep(800);
  const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, headless: false, args: ["--headless=new", "--no-sandbox"] } : {};
  const browser = await chromium.launch(launch);
  const errors = []; let ok = true;
  const check = (cond, msg) => { console.log((cond ? "  ✓ " : "  ✗ ") + msg); if (!cond) ok = false; };
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push(e.message));
    p.on("console", m => { if (m.type() === "error" && !/fonts\.g|ERR_|net::/.test(m.text())) errors.push(m.text()); });
    await p.goto(`http://localhost:${PORT}/?intro=0`);
    await p.waitForFunction(() => typeof API !== "undefined" && API.checked, null, { timeout: 5000 }).catch(() => {});
    check(await p.evaluate(() => API.ai && API.pay), "page detects the server (AI + payments on)");

    // Sample demo still runs end to end by tapping the orange targets
    for (let i = 0; i < 60; i++) {
      if (await p.evaluate(() => !!document.querySelector("#ov-recap.open"))) break;
      await p.waitForFunction(() => frameReady() && !U.busy, null, { timeout: 5000 }).catch(() => {});
      const hot = await p.$("#screen .hot");
      if (hot) await hot.click(); else await p.click("#d-next");
      await sleep(150);
    }
    check(await p.evaluate(() => !!document.querySelector("#ov-recap.open")), "sample demo reaches the recap");
    await p.keyboard.press("Escape");

    // Live tab, through the server
    await p.click("#tab-live");
    await p.click('#screen [data-a=ex][data-v="0"]');
    await p.click("#screen [data-a=draft]");
    await p.waitForSelector("#screen [data-a=create]", { timeout: 10000 });
    check(await p.evaluate(() => !!(L.draft && L.draft.ai)), "draft came from /api/draft");
    await p.click("#screen [data-a=create]");
    await p.waitForFunction(() => L.screen === "ready", null, { timeout: 10000 });
    const r = await p.evaluate(() => curReq());
    check(r && r.plink && r.total === 247800, "Payment Link created and re-priced on the server (₹2,478)");
    check(/^Hi Ritu di 😊 2 Blue Bandhani Kurti \(M\) ₹2,398 \+ delivery ₹80 = ₹2,478\. Pay here 👉 http/.test(r.reply), "reply carries the real link");
    // Pay as the buyer on the (mock) checkout, then come back
    const pay = await ctx.newPage(); await pay.goto(r.url); await pay.click("#pay"); await pay.close();
    await p.click("#side [data-a=refresh]");
    await p.waitForFunction(() => curReq() && curReq().status === "paid", null, { timeout: 10000 }).catch(() => {});
    check(await p.evaluate(() => curReq().status === "paid"), "status shows Paid after the buyer pays");

    // Colour rule on the AI path
    await p.click('#screen [data-a="nav-input"]');
    await p.click('#screen [data-a=ex][data-v="1"]');
    await p.click("#screen [data-a=draft]");
    await p.waitForSelector('#screen [data-a=pick][data-v="MT-KUR-016"]', { timeout: 10000 });
    check(true, "'blue wala' asks the seller to pick (Blue or Navy)");
    await p.click('#screen [data-a=pick][data-v="MT-KUR-014"]'); await p.click("#screen [data-a=price][data-v=keep]");
    await p.click("#screen [data-a=create]");
    await p.waitForFunction(() => L.screen === "ready", null, { timeout: 10000 });
    await p.click("#side [data-a=squiet]"); await p.click("#screen [data-a=follow]");
    await p.waitForFunction(() => { const q = curReq(); return q && q.follows === 1; }, null, { timeout: 10000 }).catch(() => {});
    check(await p.evaluate(() => curReq().follows === 1), "follow-up re-checks status, then copies");
    await p.click("#side [data-a=cancel]");
    await p.waitForFunction(() => curReq().status === "cancelled", null, { timeout: 10000 }).catch(() => {});
    check(await p.evaluate(() => curReq().status === "cancelled"), "cancel works and offers a new request");
    // Screenshot path: the image goes to the model, the transcript comes back editable
    await p.click("#screen [data-a=renew]").catch(() => p.click('#screen [data-a="nav-input"]'));
    await p.waitForSelector("#lfile", { state: "attached" });
    await p.setInputFiles("#lfile", path.join(__dirname, "fixtures", "chat.png"));
    await p.waitForFunction(() => L.screen === "card" && L.draft && L.draft.ai, null, { timeout: 15000 }).catch(() => {});
    check(await p.evaluate(() => L.screen === "card" && /Ritu/.test(L.text)), "screenshot → AI transcript → draft card");
    check(errors.length === 0, "no page errors" + (errors.length ? ": " + errors.join(" | ") : ""));
  } finally { await browser.close(); srv.kill(); }
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
