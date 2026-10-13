# Architecture

```
Browser (public/index.html)                       Vercel functions (api/)                 Outside
──────────────────────────                        ───────────────────────                 ───────
Sample demo tab (scripted, no server)
Try it live tab
  GET  /api/health  ───────────────────────────▶  health.js  (which features are on)
  POST /api/draft {text | image, channel}  ─────▶  draft.js
                                                    ├─ anthropic.js ───────────────────▶ Claude Messages API
                                                    │    forced tool call "record_draft"   (reads text or screenshot)
                                                    └─ guard.js  (code checks, see below)
  ◀── draft card fields + transcript + timings
  compute() in the page: price list × qty + delivery, in paise; 6-point checklist
  POST /api/links {approved order} ────────────▶  links.js
                                                    ├─ order.js  (re-price on the server; must match the card)
                                                    └─ razorpay.js ───────────────────────▶ Razorpay Payment Links (TEST mode)
  ◀── short_url, reference, amount
  GET  /api/links?id=… (every 8 s while unpaid) ▶  links.js → Razorpay status: unpaid / paid / expired / cancelled
```

## Who does what
| Step | Buyer | Seller (Meera) | AI model | Razorpay + code |
|---|---|---|---|---|
| 1 Buyer agrees | Agrees in the DM | Answers questions | | |
| 2 Capture | | Shares only this chat | | Receives one screenshot or text |
| 3 AI drafts | | | Reads the chat; quotes each detail; no prices | Checks every quote; matches the price list |
| 4 Resolve | Answers if asked | Decides what's unclear | | Holds Create until clear |
| 5 Approve | | Checks one card, taps Create | | Prices in paise; 6 checks |
| 6 Send | | Pastes and sends | | Creates the Payment Link; copies the reply |
| 7 Buyer pays | Pays on Razorpay checkout | | | Confirms payment |
| 8 Status | | Follows up only if unpaid | | Paid / Unpaid from Razorpay; re-check before follow-up |

AI appears in exactly one step. The reply text is built from the seller's saved wording by code, so the AI never touches the amount, link or reference.

## Code checks on the AI output (`lib/guard.js`)
- **Source check:** every quote must be a substring of a chat line. If it isn't, the field is dropped or sent to the seller, and the log says what was dropped.
- **Product:** the top candidate needs a score of 0.80 or more and a lead of 0.15 or more, plus a real quote or a reel naming the same product.
- **Colour rule:** if the words contain a colour that fits more than one product (for example "blue" fits Blue Bandhani and Navy Bandhani), and there's no full product name or matching reel, the seller picks. This holds even when the model is 92% sure. That exact case was a silent error in the earlier test.
- **Size and quantity:** confidence of 0.85 or more and a real quote; otherwise the seller checks. Sarees are always Free size.
- **Agreement:** "agreed" without real words from the buyer becomes "unclear". This is the prompt-injection guard.
- **Price asks** are recorded and never applied. **Delivery** mentioned in the chat must be confirmed. **City** is shown but never used for money.

## Server pricing (`lib/order.js`)
- Recomputes the total from the price list in integer paise.
- A unit price different from the list is accepted only when the seller marked it "changed by you".
- Size must be one the product has.
- The browser's `expected_total_paise` must match the server total exactly, or no link is made.
- There is a demo cap per link (₹50,000 by default).

## Privacy and abuse
- Chats and screenshots are sent to the model for that request only. Nothing is stored, and request bodies are not logged.
- Keys live only in Vercel environment variables.
- Only `rzp_test_` keys are accepted.
- Best-effort per-IP rate limits apply. The real cost guard is the monthly spend limit in the Anthropic console.
- Same-origin by default; set `ALLOWED_ORIGINS` to allow embedding elsewhere.

## Fallback
If `/api/health` can't be reached (static hosting, file://, a sandboxed viewer), the page runs the same rules parser in the browser and simulates the buyer. The UI and labels stay honest: "Live demo, runs in your browser … Payments are simulated."
