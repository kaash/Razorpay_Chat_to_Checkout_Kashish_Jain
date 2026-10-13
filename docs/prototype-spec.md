# Build prompt: "Chat to Checkout" interactive prototype (single HTML file)

You are a senior product designer and front-end engineer. Turn the attached reference file **`research_workbench_demo_2.html`** (a walkthrough for a different product) into a **self-explaining, working prototype** for a new product called **Chat to Checkout**: a proposed feature for the Razorpay mobile app.

Judges will open your file with nobody there to present it. Within 30 seconds they must understand:
- the problem
- who it's for
- what the merchant does
- what the AI and the code do behind the screen
- what's real and what's simulated

They must then be able to try it themselves.

Read this whole prompt before writing code. Then build, then test against the checklist in §13.

---

## 0. Inputs you have
1. **`research_workbench_demo_2.html`** (reference, ~2.1 MB). It has four parts:
   - (a) base app CSS
   - (b) a **walkthrough shell**: a fixed top journey "swimlane", a right-hand "behind the screen" pane with an SVG box-and-arrow diagram, an intro modal and a recap modal (look for `#rw-top`, `#rw-flow`, `#rw-intro`, `#rw-recap`, and the `STEPS`, `PHASES`, `FLOW`, `TYPE`, `diagram()`, `caption()` code)
   - (c) a 1.7 MB JSON blob of recorded data (`#rw-preview-data`) plus an "offline preview layer" that fakes an API
   - (d) a bundled React app for a research tool

   **Keep the *design patterns* of (b)** (layout, swimlane, diagram, node states, captions, legend, intro and recap cards, compact mode, narrow-screen drawer). **Delete (c) and (d) entirely.** Rewrite (b)'s content for our product. Don't carry over any research-tool text, data or behaviour.
2. **The solution document (v9)** for Chat to Checkout. If anything below conflicts with it, this prompt wins for the prototype.

**Output:** one self-contained `index.html`:
- vanilla HTML, CSS and JS; no build step and no framework
- external resources **only** from Google Fonts and cdn.jsdelivr.net (for one OCR library, §8.3)
- target size under 400 KB excluding the lazily loaded OCR library

---

## 1. The product in one paragraph (use this understanding everywhere)
Meera sells kurtis on Instagram and WhatsApp and already uses Razorpay Payment Links. When a buyer agrees in chat ("ok done, bhej do link"), Meera still carries the order across by hand: she works out the item, size, quantity, price and delivery, fills the Payment Link form and types a reply.

**Chat to Checkout** lets her capture the chat (screenshot or pasted text):
1. **AI proposes** a draft request, with every fact linked to the words it came from.
2. Uncertain fields are marked for her to resolve.
3. **Code** calculates the amount from her own price list.
4. **She approves** one card. A standard Razorpay Payment Link is created and a reply is copied for her to send in the same chat.
5. Payment status comes from Razorpay.
6. For a request that stays unpaid, she can **copy a follow-up** (F2).

**Rules that must hold:**
- AI never sets money or sends anything.
- "Copied" never means "Sent".
- Returns and exchanges are *future work* and aren't built.

---

## 2. Non-negotiables
1. **No overflow, ever.**
   - No horizontal page scroll at any width from 360px to 2560px.
   - No text cut off without an ellipsis plus a tooltip.
   - No element bleeding outside its pane.
   - Each pane scrolls inside itself; the page itself doesn't scroll on desktop.
2. **Great proportions.** On desktop, the phone is the visual hero and keeps a true phone aspect ratio (390 × 844 design canvas) at every height (§4.3).
3. **Instagram is primary, WhatsApp secondary.** Instagram is the default everywhere; WhatsApp is one click away.
4. **Two top-level tabs:**
   - **"Sample demo"**: a scripted walkthrough
   - **"Try it live"**: a working prototype on the judge's own input
5. **Human copy** (§10). It must not read as AI-generated.
6. **Self-explanatory.** The problem statement is visible at the top, the intro card explains how to read the page, and every step has a one-line caption saying who does what and why it matters.
7. **Honest labelling, always visible:**
   - "Concept prototype of a proposed Razorpay feature · not an official Razorpay product · sample data · no real money moves"
   - simulated steps (native share, sending in Instagram or WhatsApp, buyer payment) carry a small "Simulated" tag
8. **Razorpay look and feel,** including the logo (§3).
9. **Accessibility:**
   - keyboard operable, visible focus
   - `prefers-reduced-motion` respected
   - AA contrast
   - ≥ 44 px touch targets inside the phone
   - `aria-live` on the backend caption

---

## 3. Brand: Razorpay theme
**Colours** (define as CSS variables; single light theme by design; set `color-scheme: light` and an explicit body background):

| Token | Hex | Use |
|---|---|---|
| `--rzp-navy` | `#0C2451` (Razorpay navy per its brand-assets listing; logo dark is also cited as `#012652`) | Headings, wordmark, top bar text, "Result" nodes |
| `--rzp-blue` | `#3395FF` (Razorpay blue; logo light blue also cited as `#0D94FB`) | Primary buttons, links, active states, logo light shape |
| `--rzp-blue-600` | `#1F6FE5` | Button hover / pressed |
| `--rzp-blue-50` | `#EAF3FF` | Selected rows, soft highlights |
| `--ink` | `#14213D` | Body text |
| `--muted` | `#5B6B86` | Secondary text |
| `--line` | `#DCE3EE` | Borders |
| `--bg` | `#F5F7FB` | Page background |
| `--panel` | `#FFFFFF` | Cards, panes |
| `--ok` | `#0F9D6B` / bg `#E3F6EE` | Supported fields, Paid |
| `--warn` | `#B76E00` / bg `#FFF3DC` | Needs confirmation |
| `--miss` | `#6B7A90` / bg `#EEF1F6` | Missing |
| `--bad` | `#C2412D` / bg `#FDE8E4` | Blocking errors, Expired |

**Actor colours** for the swimlane and diagram (keep these distinct from the brand blue):

| Actor | Colour | Background |
|---|---|---|
| Merchant | `#C2570C` | `#FFF0E3` |
| AI model | `#6B46C1` | `#F1EBFF` |
| Plain code | `#1D5FC4` | `#E8F0FF` |
| Data in | `#0F7A73` | `#E2F5F3` |
| Outside Razorpay | dashed `#8593A8` on `#F4F6FA` | |
| Result | `--rzp-navy` | |

**Logo:** inline SVG, no external image. This is the official Razorpay glyph path (from Razorpay's brand assets, as published by the Simple Icons project), viewBox `0 0 24 24`. Use two paths so it renders two-tone: the larger shape in `--rzp-blue`, the smaller lower-left shape in `--rzp-navy`.
```html
<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
  <path fill="#3395FF" d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24z"/>
  <path fill="#0C2451" d="M14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/>
</svg>
```
Pair it with the wordmark **"Razorpay"** set in the UI font, weight 800, colour `--rzp-navy`, slight negative letter-spacing. The full header lockup reads: `[glyph] Razorpay | Chat to Checkout  ·  concept`.

Also use the glyph:
- in the phone's Razorpay app header
- on the buyer checkout page ("Secured by Razorpay")
- as the favicon (data-URI SVG)

**Typography:**
- **UI font:** **Lato** (Google Fonts; 400, 700, 900), with the fallback stack `"Lato", "Segoe UI", Roboto, Arial, sans-serif`.
- **Numbers:** `font-variant-numeric: tabular-nums`.
- **Code and JSON:** **IBM Plex Mono**.
- **Type scale:** 12 / 13 / 14 / 16 / 20 / 24 px. Headings use `text-wrap: balance`.

**Shape:**
- **Radius:** 12 px on cards, 10 px on buttons, 999 px on chips.
- **Shadows:** subtle, `0 6px 20px rgba(12,36,81,.08)`.
- **Spacing:** comfortable, on a 4 px grid.

**Inside the phone, three surfaces look different:**
- **Razorpay app screens:** Razorpay style (white, navy text, blue primary button).
- **Instagram and WhatsApp screens:** simplified, generic chat UIs that are recognisable but **not copies**. No Instagram or WhatsApp logos; use a text label "Instagram" or "WhatsApp" and neutral chat bubbles. WhatsApp: green header `#0B6B57`, beige chat background `#EFEAE2`, outgoing bubble `#D9FDD3`. Instagram: white background, grey incoming bubbles `#EFEFEF`, outgoing `#3797F0` with white text.
- **Buyer checkout:** Razorpay-hosted style, with a blue header band, merchant name, amount, payment options and "Secured by Razorpay".

---

## 4. Page architecture (desktop ≥ 1280 px)
```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER (56px): logo lockup · [Sample demo | Try it live] tabs ·             │
│   channel switch [Instagram ● | WhatsApp] · buttons: Guide, Today vs new,   │
│   Restart · "Concept prototype · sample data" pill                          │
├────────────────────────────────────────────────────────────────────────────┤
│ PROBLEM STRIP (collapsible, ~48px): one-line problem + 3 fact chips         │
├────────────────────────────────────────────────────────────────────────────┤
│ JOURNEY SWIMLANE (~124px; "Collapse" toggles to ~56px)                      │
├───────────────────────────────────────────────────┬────────────────────────┤
│ MAIN (center)                                      │ BEHIND THE SCREEN       │
│  ┌──────────────┐   ┌───────────────────────────┐ │ (right pane, 420–480px) │
│  │   PHONE      │   │ STEP CARD (who / what /    │ │ SVG diagram + caption + │
│  │ (hero, 390×844│   │ so what) + Next/Back       │ │ live log + legend       │
│  │  scaled)     │   │ SCENARIO LIST (demo tab)   │ │                         │
│  └──────────────┘   └───────────────────────────┘ │                         │
└───────────────────────────────────────────────────┴────────────────────────┘
```

### 4.1 Header
- **Left:** the logo lockup.
- **Center:** segmented tabs, **Sample demo** and **Try it live** (the selected one is filled `--rzp-blue`).
- **Next to the tabs:** the channel switch, **Instagram** (default) | **WhatsApp**.
- **Right:**
  - **Guide** reopens the intro
  - **Today vs new** opens the comparison modal
  - **Restart**
  - a grey pill reading "Concept · sample data"

### 4.2 Problem strip (always visible unless collapsed)
- **Text:**
  > **The problem:** When a buyer says "ok, send the link" in a DM, the seller still copies the order into Razorpay by hand: item, size, quantity, price, delivery, then a reply. It's slow, and easy to get wrong when the chat changed halfway.
- **Chips:**
  - "Who: small Instagram & WhatsApp sellers already on Razorpay"
  - "Job: send the right payment request from the chat"
  - "Target: under 1 minute, capture → send"

### 4.3 Sizing rules (stop overflow)
- **Layout:** `html, body { height: 100% }`. The app root is a CSS grid of `auto auto auto 1fr` rows filling `100dvh`. Only the panes scroll (`overflow:auto; min-height:0`).
- **The phone** is a fixed 390 × 844 design canvas inside a frame, scaled uniformly:
  - `k = min( (mainHeight − 32) / 868, (phoneColumnWidth − 16) / 414, 1 )`
  - set `transform: scale(k)` on the canvas, and size the wrapper to `414k × 868k` so the layout reserves exactly that space
  - recompute on `resize` with a `ResizeObserver`
  - never let it go below 0.6. If it would, collapse the problem strip first, then switch the swimlane to compact, then hide the step card's secondary text
- **Inside the phone:** each screen is a flex column. Header and footer are fixed; the middle scrolls (`overflow:auto`). Long words wrap (`overflow-wrap:anywhere`) and amounts never wrap.
- **The right pane** is 420–480 px wide (`clamp`). The SVG diagram uses `viewBox` with `preserveAspectRatio="xMidYMin meet"`, and labels are wrapped to at most 2 lines and 16 characters per line.
- **The swimlane** is a grid of 8 columns plus a lane-label column. On narrow widths it scrolls horizontally *inside its own container*, never the page.

### 4.4 Responsive behaviour
| Width | Behaviour |
|---|---|
| **1280–1599** | Everything as above; the step card narrows to ~320 px |
| **1024–1279** | The right pane becomes a slide-over drawer, opened by a floating "Behind the screen" button. The step card moves under the phone if it doesn't fit |
| **< 1024 (tablet / phone)** | Single column: header (tabs wrap) → problem strip → phone (no frame below 480 px; full width, still 390-wide canvas scaled) → step card → buttons that open the swimlane and backend as bottom sheets. The page may scroll vertically here; no horizontal scroll at 360 px |

A **"Phone only"** toggle in the header hides the swimlane, the right pane and the step card, so a judge can use the app alone.

---

## 5. Intro card, recap card, "Today vs new" modal

### 5.1 Intro (opens on first load; the Guide button reopens it; Esc or Start closes it)
- **Title:** **"Turn an agreed chat into a correct Razorpay payment request"**
- **Body:** 2 short paragraphs: the problem and our idea. Use the §1 paragraph, compressed.
- **Layout map** (mirror the reference's `in-map`):
  1. **Top: the journey.** "Every step, and who does it. Orange pins are the seller's moments."
  2. **Middle: the Razorpay app.** "Tap through it like the seller would. Orange outlines show what to tap."
  3. **Right: behind the screen.** "What happens out of sight, and which parts are AI versus plain code."
- **Key:** Merchant · AI model · Plain code · Data · Outside Razorpay · Result.
- **Two buttons:** **"Watch the sample demo"** (primary) and **"Try it with your own chat"** (secondary).
- **Footnote:** "Concept prototype of a proposed Razorpay feature. Sample data. No real payments."

### 5.2 Recap (after the last scenario of the sample demo, or the Recap button)
- **Title:** **"What just happened"**
- **Three columns:**
  - **The seller did:** captured the chat · checked one card · made 2 calls the AI couldn't · sent the link
  - **AI did:** read the chat · linked each detail to its words · flagged what was unclear
  - **Code and Razorpay did:** priced from her list · added up in paise · created the link · reported Paid / Unpaid
- **"What we left out on purpose"** row: auto-sending, reminders that send themselves, returns and exchanges (next), address collection, inventory.
- **"How we'll know it works"** row: median ≤ 60s from capture to send, at least 30% faster than her fastest current method, with no more wrong requests or buyer questions (**targets, not results**).
- **"What we've tested"** row: "11 sample chats through two Claude models: after one rule fix, no silent errors and every amount right. Text only; real screenshots still to test."

### 5.3 "Today vs new" modal
A table with columns **Personal UPI QR · Manual Payment Link · Store or product link · Saved reply + product link · Chat to Checkout**, and rows:
- who works out the order
- typing
- does the buyer re-select?
- amount fixed to the order?
- payment confirmed by Razorpay?
- time

**Every time cell for today's methods says "to be measured";** only Chat to Checkout shows "target ≤ 60s".

Add one honest line: "Each of today's methods is a sensible trade-off. A personal QR is quick and free for the seller. We're testing whether this saves effort on orders that changed or have several items."

---

## 6. The journey swimlane (top)
**Eight steps in four phases.** Same visual language as the reference: dot + label row, a continuous band lane, pin lanes.

| # | Step label | Phase | Band (AI + code + Razorpay) | Merchant pin | Buyer pin |
|---|---|---|---|---|---|
| 1 | Buyer agrees | In the chat | · | Replies | **Agrees** |
| 2 | Capture | Prepare | Receives images or text | **Shares chat** (decide) | |
| 3 | AI drafts | Prepare | Reads + links sources | — | |
| 4 | Resolve | Prepare | Flags what's unclear | **Picks / confirms** (decide) | |
| 5 | Approve | Prepare | Prices in paise | **Approves total** (decide) | |
| 6 | Send | Send | Creates link + copies reply | **Sends in chat** (decide) | |
| 7 | Buyer pays | Get paid | Checkout | | **Pays** |
| 8 | Status | Get paid | Paid / Unpaid from Razorpay | Follows up if unpaid (optional) | |

**Band states:**
- done: solid blue
- running now: animated stripes
- ahead: pale

**Other behaviour:**
- The current step has an orange outline highlight (`#E9771A`).
- Clicking a step jumps there.
- **Collapse** reduces the swimlane to dots only.
- **Summary chips** in the swimlane header: "4 seller moments", "4 steps handled for her", "Target < 1 min".

---

## 7. Tab 1: Sample demo (scripted, always works)
**Scenario picker** (in the step card area, above Next/Back):

| Order | Scenario | Channel |
|---|---|---|
| 1 | **"Ritu: clean order → Paid"** | Instagram |
| 2 | **"Kavya: unclear product + price ask → Unpaid → follow-up"** | Instagram |
| 3 | **"Sana: size missing → ask → Paid"** | WhatsApp |

- The channel switch filters the list: Instagram shows 1 and 2; WhatsApp shows 3.
- The default is scenario 1.
- When a scenario ends, show "Next scenario →".
- After the last one, open the Recap.

**Every scenario is internally consistent:** each decision on a card must trace to a message visible in *that* chat, and a Paid request never appears in the Unpaid list.

### 7.1 Sample catalogue and settings (identical in both tabs)
| ID | Product | Sizes | Price | Swatch |
|---|---|---|---|---|
| MT-KUR-014 | Blue Bandhani Kurti | S M L XL | ₹1,199 | blue gradient |
| MT-KUR-016 | Navy Bandhani Kurti | S M L XL | ₹1,299 | navy gradient |
| MT-COR-003 | Black Linen Co-ord Set | S M L XL | ₹1,899 | charcoal |
| MT-KUR-030 | White Cotton Kurti | S M L XL | ₹999 | white with border |
| MT-SAR-005 | Maroon Banarasi Saree | Free | ₹3,999 | maroon |

**Seller settings** (shown inside the first card as "your settings", editable in the live tab):
- delivery suggestion ₹80, free above ₹2,999
- dispatch wording "Dispatch within 24 hrs of payment"
- reply language Hinglish
- link expiry 24 hrs
- follow-up cap 2 per request

Product images are **CSS gradient swatches with the product initials.** No external images.

### 7.2 Scenario 1: Ritu (Instagram) → Paid
**Chat** (Instagram DM look):
- Ritu: [reel card: "@meerathreads · Blue Bandhani Kurti", blue swatch]
- Ritu: "Hi di ye blue wala M size me hai? 2 chahiye. Pune bhejoge? kitna hua total"
- Meera (outgoing): "Haan di M available hai 😊"
- Ritu: "ok done, bhej do link"

**Steps** (phone screen · step-card text · backend diagram):
1. **Buyer agrees.**
   - **Phone:** the chat, with an orange-outlined **"Screenshot"** pill top-right.
   - **Caption:** "The order is agreed, in Ritu's own words. Today Meera would now retype all of it."
2. **Capture (simulated share).**
   - **Phone:** screenshot preview thumbnail → share sheet → **"Razorpay · Create from chat"** highlighted, tagged "Simulated". A secondary line: "Or in the app: Collect payments → Create from chat."
   - **Caption:** "She shares only this chat. Razorpay never reads her inbox."
3. **AI drafts.**
   - **Phone:** Razorpay screen "Create from chat · NEW". The card fills progressively over ~1.6 s: Customer → Agreement → Item → Size/Qty → Total.
   - **Caption:** "AI suggests the order and shows where each detail came from. It doesn't set the price."
4. **Resolve** (nothing to resolve here).
   - **Phone:** all fields green.
   - **Caption:** "Everything has a clear source, so there's nothing to fix. That's the fast path."
5. **Approve.** The review card:
   - "Payment request · Ritu *(chat name)* · Instagram"
   - 🟢 "Agreed: 'ok done, bhej do link'"
   - "Blue Bandhani Kurti · M · 2 × ₹1,199 = ₹2,398 *(your price list)*"
   - "Delivery ₹80 *(your setting · tap to change)*"
   - **"Total ₹2,478"**
   - "Sources" row with three tappable chips; tapping highlights the words in a mini chat preview
   - the six-item **approval checklist** collapsed as "6/6 ready ✓", expandable
   - primary button **"Create link & copy reply"**

   **Caption:** "One screen to check. Every rupee comes from her own list and is added up by code."
6. **Send.**
   - **Phone:** a "Link ready · Copied" toast showing the link `rzp.io/demo/CT-1042` (labelled demo), plus the reply text:
     > "Hi Ritu di 😊 2 Blue Bandhani Kurti (M) ₹2,398 + delivery ₹80 = ₹2,478. Pay here 👉 rzp.io/demo/CT-1042 · Ref CT-1042 · Dispatch within 24 hrs of payment 🙏"
   - Button **"Open Instagram"** → the DM with the text pasted in the composer → orange-outlined **Send** (tagged "Simulated") → the message appears as sent.
   - **Caption:** "She sends it herself, from her own account. We only ever say 'Copied', because we can't see her press Send."
7. **Buyer pays (simulated).**
   - **Phone:** Ritu's phone shows the Razorpay checkout: blue band, "Meera Threads", "2 × Blue Bandhani Kurti (M) · delivery ₹80", **₹2,478**, UPI / Cards / Netbanking, "Secured by Razorpay" with the glyph. **"Pay ₹2,478"** → success tick.
   - **Caption:** "This is Ritu's time, not Meera's. Any Razorpay link already gives confirmed payment; we don't claim that part."
8. **Status.**
   - **Phone:** a notification "₹2,478 received · Ritu · 2 × Blue Bandhani Kurti (M)" → the Payment Link detail with a green **Paid** pill and the order summary.
   - **Caption:** "Paid comes from Razorpay's own records, not a screenshot."

### 7.3 Scenario 2: Kavya (Instagram) → Unpaid → follow-up
**Chat:**
- Kavya: "wo blue wala kurti 1 chahiye, L size, 1,100 kar do na"
- Meera: "dekhti hoon"
- Kavya: "ok link bhejo"

**At step 3**, two fields turn amber:
- **Product:** "'blue wala' fits 2 items". Show two tappable cards, Blue Bandhani ₹1,199 and Navy Bandhani ₹1,299, each with its swatch.
- **Price:** "Kavya asked ₹1,100. Your price is ₹1,199." Two chips: **Keep ₹1,199** / **Use ₹1,100 (marked 'changed by you')**.

**Create** is disabled ("2 things to decide") until both are resolved.

**Scripted choices:** Blue + keep ₹1,199 → total ₹1,199 + ₹80 = **₹1,279**.

**Captions:**
- "AI wasn't sure which kurti 'blue wala' means. In our tests a model was 92% 'sure' and still wrong here, so the code makes her choose."
- "A price request is never applied by the AI. She decides, and the card records it."

**Steps 6–7:** send as before. At step 7, the scripted buyer **doesn't pay**. Fast-forward the clock to "26 hrs later".

**Step 8:**
- The Payment Links list with an **"Unpaid"** filter chip active; Kavya's row is labelled "Unpaid request · check before following up".
- Tap **Copy follow-up** → "Checking status…" (Razorpay still says unpaid) → copied text:
  > "Hi Kavya, sharing your payment link again in case you'd like to go ahead: rzp.io/demo/CT-1043 (Ref CT-1043)."
- A counter "Follow-ups copied: 1 of 2"; a "Stop follow-ups" link.

**Captions:**
- "It double-checks first, so a paid buyer never gets chased."
- "The wording is neutral. We don't know if her order is 'ready', so we don't say so."

### 7.4 Scenario 3: Sana (WhatsApp) → Paid
**Chat** (WhatsApp look, header "Sana · +91 98XXX XXX21" with a masked number, so the number is known):
- Sana: "Hi, black co-ord set chahiye. Ahmedabad bhejna hai. link bhejo"

**Steps:**
- **Step 3:**
  - the **Size** field is grey ("Missing"), and Create is disabled
  - button **"Ask Sana"** copies "Sure! Which size, S, M, L or XL? 😊"
  - **Caption:** "Only Sana knows her size. Asking costs one message; guessing costs a return."
- **The chat continues:** Sana: "L". Meera re-shares (a quick "Add to draft" action), and the size turns green.
- **Total:** ₹1,899 + ₹80 = **₹1,979**.
- **Step 6:**
  - "Open WhatsApp" opens Sana's chat **with the text pre-filled** (because the number is known), and she still taps Send (tagged "Simulated")
  - **Caption:** "On WhatsApp, a known number lets us pre-fill the chat. On Instagram it's copy and paste. Either way, she presses Send."
- **Step 7:** pays. **Step 8:** Paid.

### 7.5 Demo controls
- **Next / Back** in the step card.
- ← → keys.
- Orange-outlined tap targets inside the phone also advance.
- **Auto-play** (optional toggle) advances every 3.5 s and pauses on hover.
- Step 3's progressive fill must finish before Next is enabled.

---

## 8. Tab 2: Try it live (works on the judge's own input)

### 8.1 What the judge sees
- **Phone screen 1: "Create from chat"**
  - channel chips (Instagram / WhatsApp, synced with the header switch)
  - a large text area: "Paste the chat here. Put each message on its own line. Start your own lines with 'Me:'" with a light placeholder example
  - an **"Upload screenshot"** button (accepts png/jpg/webp; shows a thumbnail)
  - **five example chips** that fill the box:
    - "Clean order"
    - "Unclear product + price ask"
    - "Size missing"
    - "Two customers"
    - "Item not in list"
  - primary button **"Draft request"**
- **A banner inside the tab** (not in the phone):
  > "**Live demo, runs in your browser.** It reads text with simple rules (and on-device OCR for screenshots) instead of the production AI model. Nothing you paste leaves this page. Payments are simulated."

### 8.2 Flow
**Draft request** → the same review card as the demo (§7.2 step 5), now built from the judge's input:
- **Field states and checklist** follow the rules in §9.
- **Every field shows its source quote;** tapping it highlights the words in a mini chat preview.
- **Create** stays disabled until the checklist is complete.

**Create link & copy reply:**
- generates `rzp.io/demo/CT-####` (incrementing) and the reply text
- copies via `navigator.clipboard.writeText` inside the click handler; on failure, selects the text and shows "Press Ctrl/Cmd+C to copy"
- **Open Instagram / Open WhatsApp** simulates the handoff, as in the demo

**Then three demo buttons** under the result, clearly labelled **"Simulate the buyer"**:
- **Buyer pays** → Paid
- **Buyer goes quiet** → after a fast-forward, Unpaid → Copy follow-up enabled
- **Link expires** → Expired → "Create a new request from chat" (re-confirm prices; no auto-renew)

**A "Requests" list** (the Payment Links list) keeps every request created in this session, with Paid / Unpaid / Expired pills and the Unpaid filter. Store it in memory, mirrored to `localStorage` wrapped in try/catch, plus a "Clear" button.

**Settings gear** inside the card: delivery suggestion, free-above threshold, dispatch wording, reply language (Hinglish / English), follow-up cap.

### 8.3 Screenshot reading (on-device)
- **Library:** lazy-load **Tesseract.js** from `https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js` only when a screenshot is uploaded.
- **Progress:** show "Reading screenshot… 40%".
- **Language:** `eng`. If load fails or confidence is low, show "Couldn't read this clearly. Paste the text instead?" and keep the image as a reference.
- **After OCR:** show the extracted text in the text area, *editable*, before drafting.
- **Line grouping:** heuristic. Lines starting near the right edge are "Me:" if the bounding box data allows; otherwise treat all lines as the buyer and let the judge fix them.

### 8.4 Optional real-AI hook (off by default)
- **Hook:** a single config object `const AI_ENDPOINT = null;`. If set to a URL, send `{chat, catalogue, rules}` and expect the JSON schema in §9.4.
- **Rule:** the same code rules then apply. **Never embed API keys in the page.**
- **Banner when on:** "AI model on".

### 8.5 Backend pane in live mode
It animates the real pipeline as it runs. Each node shows actual timings in ms and its output, and a **"Show JSON"** toggle reveals the parsed fields (monospace, scrollable, copy button). The pipeline:

`Input (text or image) → On-device OCR (if image) → Field extraction (rules) → Source check → Product matching → Colour-ambiguity rule → Pricing in paise → Approval checklist → Link (simulated) → Status`

---

## 9. Live parser specification (deterministic; must pass the tests in §9.5)

### 9.1 Input normalisation
- Split into lines. A line `Name: text` sets the speaker.
- `Me:`, `You:`, `Meera:` or `Seller:` mark the **seller**. Other names mark buyers. Lines with no prefix are the buyer (the first buyer seen).
- Normalise: lowercase for matching, keep the original for quotes; replace "co ord" / "coord" with "co-ord"; Indian number formats ("1,100" → 1100).

### 9.2 Field rules
- **Buyers:** if ≥ 2 distinct buyer names each mention an item, set `multiple_customers=true`. Show **"Two people are ordering here: Ritu or Sana?"** with a picker, and use only the picked buyer's lines.
- **Products:** match catalogue keywords (from buyer lines only):

  | Product | Keywords |
  |---|---|
  | Blue Bandhani Kurti | blue, bandhani, kurti |
  | Navy Bandhani Kurti | navy, bandhani, kurti |
  | Black Linen Co-ord Set | black, co-ord, linen, set |
  | White Cotton Kurti | white, cotton, kurti |
  | Maroon Banarasi Saree | maroon, banarasi, saree, sari |

  - A **full name** match ("blue bandhani", "navy bandhani", "black co-ord", "white kurti", "maroon saree" or "banarasi") is **Supported**.
  - **Colour-ambiguity rule** (one tested safeguard): if the buyer's words include a colour word that appears in the colour of more than one product ("blue" fits Blue and Navy, whose colour is "navy blue"), and there's no full product name, the field is **Needs confirmation** with both candidates.
  - A reel line `[reel: Blue Bandhani Kurti]` (or OCR text containing a full product name) supports that product. If it conflicts with the text, show both.
  - Unknown garment words with no catalogue match (dupatta, lehenga, kurta set, top, jeans) → **Missing: "Not in your list"**, which offers the manual price entry. Don't create a catalogue item.
- **Size:** tokens `XS|S|M|L|XL|XXL` as standalone words, or "M size", "size M", "medium/large" → M/L. Saree → "Free" automatically.
  - No size for a sized product → **Missing**.
  - Two different sizes in buyer lines → apply the **confirmed-change rule** (below).
- **Quantity:** a digit (1–20) or a Hindi/English number word (ek=1, do=2, teen=3, char=4, one, two, three) **adjacent to** an item word, "piece/pcs/pc", or "chahiye/lena/le rahi".
  - Never treat "do" as 2 in "bhej do / kar do / de do".
  - Default 1 **only** if the item is named with "a/ek" or singular and nothing else is found; otherwise **Missing**.
- **Confirmed-change rule:** if a later buyer line changes size or quantity with a correction cue ("sorry", "actually", "nahi", "instead", "jagah", "hi chahiye", "make it"), apply it to that field only, keep the other agreed details, and mark the field **Supported (changed)** with both quotes shown. If the change comes from the seller, or it's unclear whether the buyer accepted it, mark it **Needs confirmation**.
- **Agreement:**
  - **"Agreed"** if the buyer's last relevant line contains: "ok done", "done", "link bhejo", "link bhej do", "bhej do link", "send link", "send the link", "confirm", "pakka", or "le lungi/lunga".
  - **"Question"** if the buyer only asks ("?", "available", "price kya", "kitna", "hai kya", "how much") with no agreement phrase.
  - **"Unclear"** for a bare "ok", "hmm" or "👍" with no items.
  - Question or unclear → banner **"Purchase not confirmed"**, with buttons "Draft a price reply" or "She agreed: continue (I confirm)".
- **Price request:** a buyer number with "kar do", "each", "discount", "kam", "less", or "₹" not matching a catalogue price → **Needs confirmation**: "Keep ₹X" / "Use ₹Y (changed by you)".
- **Delivery:** suggestion from settings (₹80, or ₹0 if the subtotal is above ₹2,999), always shown with its source. If the chat mentions a delivery amount or "free delivery" → **Needs confirmation**.
- **City:** first match from a list of 30 major Indian cities (Pune, Mumbai, Ahmedabad, Surat, Delhi, Bengaluru, …). Shown, not used for money.

### 9.3 Money
- **Calculation:** all in **integer paise**; display with `Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0})`.
- **Total:** sum(qty × unit price) + delivery (+ any explicit tax or discount line the user adds; default none).
- **Approval checklist** (all must be ✓ to enable Create):
  1. product and quantity
  2. size where applicable
  3. payable unit price
  4. delivery (explicit ₹0 allowed)
  5. tax or discount (default "none")
  6. agreement (buyer's words or "I confirm")

### 9.4 Internal JSON (also the AI-hook schema)
```json
{"channel":"instagram","buyer":"Ritu","multiple_customers":false,
 "agreement":{"state":"agreed","quote":"ok done, bhej do link"},
 "items":[{"product_id":"MT-KUR-014","candidates":["MT-KUR-014"],"state":"supported",
   "quote":"ye blue wala","size":{"value":"M","state":"supported","quote":"M size me hai"},
   "qty":{"value":2,"state":"supported","quote":"2 chahiye"}}],
 "price_request":null,"delivery":{"paise":8000,"source":"setting"},"city":"Pune"}
```

### 9.5 Acceptance tests for the live parser (build a hidden `?test=1` mode that runs these and shows pass/fail)
| Input | Expected |
|---|---|
| "[reel: Blue Bandhani Kurti]\nHi di ye blue wala M size me hai? 2 chahiye. Pune bhejoge?\nMe: Haan di M available hai\nok done, bhej do link" | Blue, M, 2; agreed; ₹2,478 |
| "Is the blue kurti available? price kya hai?" | Purchase not confirmed (question) |
| "black co-ord set chahiye, Ahmedabad bhejna hai. link bhejo" | Black co-ord; **size Missing**; Create disabled |
| "blue bandhani 1 piece, L size. done, link bhejo" | Blue (full name, supported), L, 1; ₹1,279 |
| "wo blue wala kurti 1 chahiye, L size. done, link bhejo" | **Product needs confirmation** (Blue / Navy) |
| "Di 2 white kurti M bhejna\nMe: ok\nsorry sorry 1 hi chahiye, L size. ok link bhejo" | White, **L**, **1** (changed); ₹1,079 |
| "[reel: Blue Bandhani Kurti]\ndi 2 le rahi hoon M size, 1,100 each kar do na\nMe: dekhti hoon\nok then link bhejo" | Blue, M, 2; **price needs confirmation** (₹1,199 vs ₹1,100) |
| "Didi ek maroon Banarasi saree chahiye, Mumbai bhejna hai, link bhej do please" | Saree, Free, 1; ₹3,999 (free delivery) |
| "ok" | Unclear; no draft items |
| "Ritu: 2 white kurti M\nSana: mujhe 1 black co-ord L\nRitu: ok link bhejo\nSana: mujhe bhi" | Two customers → picker |
| "Mustard dupatta 1, Pune. link bhejo" | **Not in your list** → manual price |

---

## 10. Writing style (human, plain, specific)
**Voice:** a thoughtful product person explaining their work to a busy judge. Short sentences. Concrete nouns. Indian English is fine; Hinglish appears only inside chats and replies.

**Do:**
- name people and amounts
- say who does what
- use active verbs ("Meera picks the kurti")
- tell the judge why a step matters in one line

**Don't:**
- **stock AI words:** "seamless", "leverage", "unlock", "empower", "revolutionise", "effortless", "cutting-edge", "game-changer", "delve", "robust", "harness"
- **"It's not X, it's Y" lines,** rhetorical questions, or em-dash asides
- **emoji outside the chat or reply bubbles**
- **exclamation marks in UI copy**

**Examples:**
- ✗ "Seamlessly transform conversations into payments with AI-powered magic!"
- ✓ "Meera shares the chat. AI suggests the order and shows where each detail came from. She checks it and sends the link."
- ✗ "Our robust system leverages cutting-edge models."
- ✓ "The AI reads. Plain code adds up the money. Meera decides."

**Status words:** "Link ready", "Copied", "Paid", "Unpaid", "Expired". **Never "Sent"** for anything the system can't see.

**Every simulated step** carries a small grey tag **"Simulated"** with a tooltip saying why ("In the real app, this happens in Instagram").

---

## 11. Behind-the-screen diagrams (right pane)
**Reuse the reference's diagram approach:**
- nodes 3 columns wide
- typed and colour-coded
- states idle → active (pulse) → done (green tick), and **wait** = orange ring with a "Seller's turn" badge
- edges animated while active, with small labels on key edges
- hover or focus shows a caption at the bottom
- `aria-live` caption

**Per demo step** (8 diagrams; reuse them in live mode with real timings):

| Step | Nodes (type) |
|---|---|
| 1 | Buyer (outside) → Chat (data) → Seller decides (merchant) → Ready to capture (result) |
| 2 | Seller picks screenshot (merchant) → Share target (code) → Input queue (code) → Images/text (result) |
| 3 | Screenshot or text (data) → OCR (code) → AI drafts fields (AI) → Source check (code) → Product list (data) → Matching rules (code) → Draft, no prices (result) |
| 4 | Draft (data) → Ambiguity rule (code) → Seller resolves (merchant) → Resolved fields (result) |
| 5 | Price list (data) + Settings (data) → Price in paise (code) → Checklist (code) → Seller approves (merchant) → Frozen order (result) |
| 6 | Frozen order (data) → Payment Links API (code, tagged "test mode / simulated") → Reply draft (AI) → Fill amount + link (code) → Seller sends (merchant) → Link ready · Copied (result) |
| 7 | Buyer opens link (outside) → Razorpay checkout (code) → Bank/UPI (outside) → Webhook: paid (code) → Payment confirmed (result) |
| 8 | Webhook/refresh (code) → Status Paid/Unpaid (result); if Unpaid: Re-check status (code) → Copy follow-up (merchant) |

**Below the diagram:**
- **a one-line caption** (the reference's `fl-cap`)
- **a "live log" ticker** (the reference's `fl-tick`), e.g. "11:05:12 · Source check passed for 4 of 4 fields"
- **the legend**

**Header:** "Behind step 3 of 8 · AI drafts", with a status pill: **Working** (blue spinner) / **Seller's turn** (orange) / **Done** (green).

---

## 12. Step card (beside the phone)
- **Eyebrow:** "Scenario 1 of 3 · Step 5 of 8 · Prepare".
- **Title:** for example "Meera checks one card".
- **Three labelled lines:**
  - **Seller:** what she does
  - **Behind the screen:** one line
  - **Buyer:** what they see, or "—"
- **A navy "Why it matters" box:** one sentence.
- **Back / Next,** plus "Restart scenario".
- **In live mode,** the card switches to "What to try" tips:
  - "Paste a chat where the buyer changes her mind."
  - "Try 'blue wala kurti' without saying bandhani."
  - "Upload a screenshot of any chat."

---

## 13. Quality checklist (test before you hand over)
**Layout:**
- [ ] No horizontal scroll at 360, 390, 768, 1024, 1280, 1440, 1920 and 2560 px wide; heights 700, 800, 900 and 1080.
- [ ] The phone keeps its 390 × 844 aspect at all sizes; nothing inside it is clipped; only its middle area scrolls.
- [ ] The right pane, swimlane and step card never overlap the phone.

**Sample demo:**
- [ ] All 3 scenarios run end to end with Next only, and by tapping orange targets.
- [ ] Totals are exact: ₹2,478; ₹1,279; ₹1,979. Follow-up only appears for Kavya.

**Live tab:**
- [ ] All 11 tests in §9.5 pass in `?test=1`.
- [ ] Clipboard fallback works.
- [ ] Screenshot upload works with OCR progress and a failure message.
- [ ] Requests persist and clear.

**Copy and honesty:**
- [ ] Copy passes the §10 rules: search the file for the banned words and remove any hits.
- [ ] Every simulated step carries a tag.
- [ ] The concept label is visible in the header.
- [ ] The word "Sent" is never used as a status.

**Accessibility:**
- [ ] Keyboard only: tabs, phone targets, modals (Esc closes), Next/Back.
- [ ] Visible focus rings.
- [ ] Reduced motion stops the stripes, pulses and auto-play.

**Technical:**
- [ ] No console errors.
- [ ] No network calls except Google Fonts and jsDelivr (Tesseract, only on upload).
- [ ] Brand: logo glyph renders two-tone in the header, app header, checkout and favicon; buttons use `--rzp-blue`.

---

## 14. Deliverable
- **One `index.html`.**
- **Code layout:** comments at the top of each section:
  - `/* 1. tokens */`
  - `/* 2. layout */`
  - `/* 3. swimlane */`
  - `/* 4. phone screens */`
  - `/* 5. diagrams */`
  - `/* 6. demo scripts */`
  - `/* 7. live parser */`
  - `/* 8. tests */`
- **Data in one place:** all scenario data, catalogue and copy live in one `DATA` object near the top, so wording and numbers can be edited without touching logic.
- **A short README block** in an HTML comment at the top: what's real vs simulated, how to run the `?test=1` mode, how to set `AI_ENDPOINT`.
