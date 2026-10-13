# Chat to Checkout

**Concept prototype of a proposed Razorpay mobile feature. Not an official Razorpay product. Sample data. Test-mode payments only.**

Built for the Razorpay x ISB AI PM Build Challenge, Track 1 ("Razorpay in Your Pocket").

- **Live prototype:** [LIVE_URL] (opens without a login)
- **AI build log:** [BUILD_LOG.md](BUILD_LOG.md)
- **No-server version:** [`submission/prototype-standalone.html`](submission/prototype-standalone.html) (download and open; rules in the browser, simulated payments)

## The problem
Meera sells kurtis on Instagram and WhatsApp and already uses Razorpay Payment Links. When a buyer writes "ok done, bhej do link", the order is agreed, but Meera still carries it across by hand:
- she works out the item, size, quantity, price and delivery
- she fills the Payment Link form
- she types a reply

It's slow on a phone, and easy to get wrong when the chat changed halfway.

## What Chat to Checkout does
1. Meera shares only that chat (a screenshot or pasted text).
2. **AI** reads it and suggests the order, showing the exact words behind each detail. It never sets a price.
3. **Code** checks every quote is really in the chat and stops on anything unclear. For example, "blue wala" fits two kurtis, so Meera picks. Code then prices the order from her own list in integer paise.
4. Meera checks **one card** and taps **Create link & copy reply**. A standard Razorpay Payment Link is created.
5. She pastes the reply into the same chat and sends it herself. The app says "Copied", never "Sent".
6. Paid or Unpaid comes from Razorpay. For an unpaid request she can copy one neutral follow-up, after a fresh status check.

**Target:** median 60 seconds or less from capture to send, at least 30% faster than her fastest current method, with no more wrong requests. These are targets, not results.

## Try it
**Sample demo** tab: three scripted orders.
- **Ritu** (clean order, Paid)
- **Kavya** ("blue wala" fits two kurtis, plus a price ask; she stays Unpaid and gets a follow-up)
- **Sana** on WhatsApp (size missing, Meera asks)

Tap the orange outlines or use the arrow keys.

**Try it live** tab: paste any chat, tap an example, or upload a screenshot.
- **On the hosted site:** the chat is read by a Claude model on the server, and **Create** makes a real Razorpay Payment Link in **test mode**. Open it, pay with Razorpay's test details, and the status turns Paid.
- **Without the server:** the same page falls back to rules in the browser and a simulated buyer.

## What is real and what is simulated

| Part | On the hosted site | In the standalone HTML |
|---|---|---|
| Reading the chat or screenshot | Claude model (server) | Rules in the browser, on-device OCR |
| Checking quotes, colour rule, thresholds | Code (server) | Code (browser) |
| Prices and totals | Code, in paise, recomputed on the server | Code, in paise |
| Payment Link and checkout | Razorpay **test mode** | Simulated |
| Share sheet, sending in Instagram/WhatsApp | Simulated (tagged) | Simulated (tagged) |

## How it's built
- One HTML page with no framework: `frontend/src` is built into `public/index.html`.
- Three small serverless functions in `api/`, deployed on Vercel from this repo:
  - `health`
  - `draft`: Claude reading the chat
  - `links`: Razorpay Payment Links

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full picture.

**Safety rules in code:**
- The AI's output is checked by `lib/guard.js`: real quotes only, confidence thresholds, and the colour-ambiguity rule even when the model is confident.
- `lib/order.js` re-prices every link on the server and refuses a total that doesn't match the approved card.
- The chat is treated as untrusted input.
- Only Razorpay test keys are accepted.
- No keys are in the page or this repo.

## Evidence
Before building the UI, I ran 17 synthetic Hinglish/English chats through two Claude models (Haiku and Sonnet), with expected answers locked first ([extraction-test/RESULTS.md](extraction-test/RESULTS.md)).
- After adding one code rule (the colour-ambiguity rule), there were **0 silent errors**, and every money amount was right.
- The test used text representations of images and voice notes. Real screenshots are tested live on the hosted site.

Live re-run on the deployed model: [DATE] · [MODEL] · [N] F1 cases · [X] silent errors (`npm run eval`).

## Run it yourself
```bash
npm install
npm test                 # 33 unit tests, no keys needed
npm run dev:mock         # http://localhost:3000 with a mock model and mock payments
cp .env.example .env     # add your own Claude key and Razorpay TEST keys
npm run dev              # the real thing, locally
npm run eval             # F1 cases through the real model + code checks
```

## What I left out on purpose
- auto-sending
- reminders that send themselves
- returns and exchanges (designed, not built)
- address collection
- inventory
- catalogue creation
