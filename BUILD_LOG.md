# AI build log: Chat to Checkout

> Draft prepared with Claude. Items in [square brackets] are for me to confirm or fill in before submitting. No keys, credentials or personal data appear here.

## 1. Tools and models
| Tool / model | What I used it for |
|---|---|
| **Claude (claude.ai, Claude Opus-class model)** | Research on Razorpay's current products, idea generation and kill decisions, the solution document (9 versions), the HTML prototype, the test harness, this log |
| **Claude Haiku and Claude Sonnet**, run as separate agents | Extraction test: 17 synthetic chats read by each model, with expected answers locked beforehand |
| **Claude Code** | Deploying the repo, wiring the real Claude and Razorpay test-mode APIs, running the live evaluation |
| **Claude model in the live prototype** ([MODEL ID from /api/health]) | Reads a pasted chat or a screenshot and proposes the order fields with quotes |
| **[Other AI assistants used for critique, e.g. name them]** | Independent reviews of the solution document. I accepted only the points I agreed with (see section 4). |
| **Playwright** (headless Chromium) | Screenshots at 32 screen sizes, overflow checks, end-to-end runs of every demo path |
| **Razorpay Payment Links API, test mode** | Real links and real test checkout in the hosted prototype |

## 2. Key prompts and workflows
1. **Landscape first, ideas second.** I had AI read Razorpay's agentic pages, app listings and reviews and write a current-state analysis *before* proposing ideas. I then asked it to check every idea against what Razorpay already ships: RAY on WhatsApp, Payment Pages, Magic Checkout, Konnect. Its job here was to verify, not guess.
2. **Recursive "so what?" and rejection.** I rejected several rounds of ideas as too common, a fight with Razorpay's partners, or impractical, and asked for evidence-backed alternatives each time. Chat to Checkout survived because the job is frequent and money-critical, and today it's done by hand on a phone.
3. **Adversarial review loop.** I gave the solution document to other AI reviewers five times. Each time I asked Claude to critique the feedback first and accept only what made logical sense. Changes that survived:
   - an honest baseline ("to be measured")
   - separate success and upside hypotheses
   - a 6-item approval checklist
   - a confirmed-change rule
   - no double counting in the impact model
4. **Test before building.** I didn't trust the extraction step until I'd measured it. The extraction prompt (in `extraction-test/full_prompt.txt`) asks for:
   - fields with exact quotes and confidence
   - no prices
   - candidate products with scores

   Code then decides what's accepted. The scorer counts correct, flagged, over-flagged, caught errors and **silent errors**.
5. **Prototype from a spec.** I wrote a ~6,000-word build prompt (in `docs/prototype-spec.md`) with layout rules, honesty labels, copy rules (banned words, no "Sent") and 11 acceptance tests. Then I built and tested against it.
6. **Live AI behind a guard.** In the hosted version:
   - the model fills a forced tool call (`record_draft`)
   - `lib/guard.js` re-checks every quote and re-applies the colour rule
   - `lib/order.js` re-prices on the server before Razorpay sees anything

## 3. One AI output I rejected or corrected, and why
**The 92%-sure wrong kurti.** In the extraction test, a buyer wrote "wo blue wala kurti" with no picture. Claude Haiku matched it to *Blue Bandhani Kurti* with 0.92 confidence. It was wrong: the catalogue also has *Navy Bandhani Kurti*, whose colour is navy blue, so the words fit both. My score and margin thresholds accepted it, which made it a **silent error**: a wrong payment request that would have looked right.

I didn't accept "raise the threshold" as the fix, because confidence was the thing that was wrong. Instead I added a **code rule**: if the buyer's words contain a colour that fits more than one product, and there's no full product name or matching reel, the seller must pick. After that rule, both models had **0 silent errors** on the F1 cases, and every amount was right. The prototype shows this moment in Kavya's order, and the server applies the rule even when the model is confident.

**Two smaller corrections:**
- **One of my own test labels was wrong.** I had marked "blue bandhani" as ambiguous, but it literally names the product. I revised that label and added a truly ambiguous case (T4b) instead of quietly changing results.
- **An AI-suggested design had the AI drafting the reply message.** I removed it. The reply is built from the seller's saved wording, and code fills the amount and link, so AI appears in exactly one step and never near money.

## 4. What AI did vs what I decided
| AI did | I decided |
|---|---|
| Summarised Razorpay's products and app reviews | Which merchant to serve (small Instagram/WhatsApp sellers already on Razorpay) and which job (send the right payment request from the chat) |
| Generated and stress-tested many ideas | To kill ideas that were common, competed with Razorpay's partners, or already existed, and to keep Instagram primary and WhatsApp secondary |
| Proposed fields, flows and edge cases | That AI only reads; code prices; the seller approves one card; "Copied" never means "Sent"; no auto-sending, no auto-reminders |
| Reviewed my document from several angles | Which feedback to accept and which to reject |
| Wrote the extraction test, scorer, prototype and server code | The thresholds (0.85 field, 0.80 product, 0.15 margin), the colour rule, the 6-item checklist and the metrics (median ≤ 60 s capture to send, ≥ 30% faster, no rise in wrong requests) |
| [Anything else, e.g. video script help] | [What I changed in it] |

## 5. Limitations, risks and how I verified
**Verified**
- Extraction test: 17 chats × 2 models, expected answers locked first. After the colour rule, 0 silent errors and 8/8 money amounts right (`extraction-test/RESULTS.md`).
- Live re-run on the deployed model: [DATE] · [MODEL] · [N] F1 cases · [X] silent errors (`npm run eval`).
- 33 unit tests: the 11 acceptance chats through both the browser rules and the server path, the guard overriding an over-confident model, and server re-pricing.
- 11 end-to-end browser checks:
  - the demo
  - a live draft
  - creating a link
  - paying
  - Paid status
  - the follow-up re-check
  - cancel
  - a screenshot upload
- No horizontal overflow at 32 screen sizes; no console errors.

**Limitations**
- Synthetic data. I haven't yet watched real sellers do this. The time target is a target, not a measurement.
- I haven't checked on an activated Razorpay account whether RAY or the app already offers an equivalent screenshot-to-request flow. I treat this as unverified.
- Earlier tests used text versions of images and voice notes. Real screenshots are tested only in the live prototype, on a small number of samples.
- One item per request in this prototype. Returns and exchanges are designed but not built.
- Sending in Instagram or WhatsApp and the share sheet are simulated. Payments run in Razorpay test mode.

**Risks and mitigations**

| Risk | Mitigation |
|---|---|
| Wrong item or size gets through | Quote check, thresholds, colour rule, the seller approves one card |
| Wrong amount | AI never outputs prices; code computes in paise; the server re-prices and must match the card |
| Instructions hidden in a chat (prompt injection) | The chat is untrusted input; "agreed" needs real buyer words; the money path ignores the model |
| Chasing a buyer who already paid | Status is re-checked before any follow-up; at most 2 per request |
| Cost or abuse of the public demo | Per-IP limits and a monthly spend cap; test-mode keys only |
| Privacy | Chats go to the model for that request only and aren't stored; keys aren't in the page or the repo |
