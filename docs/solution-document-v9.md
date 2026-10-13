# Chat to Checkout
### Razorpay AI PM Build Challenge (ISB) · Track 1: Razorpay in Your Pocket
*Solution document v9 (final for build) · 13 Oct 2026 · A **proposed Razorpay mobile extension**. The reviewer-facing one-pager is §21.*

---

## 0. The one-minute version
**Merchant.** Small fashion and lifestyle sellers already on Razorpay who sell through **Instagram DMs and WhatsApp chats** and already send Razorpay Payment Links for some chat sales.

**Job.** *The buyer has agreed in chat. Prepare the correct Razorpay payment request on the phone, share it in that chat, and see whether it was paid.*

**Today.** The agreed order already exists in the chat, but the merchant has to carry it across by hand:
- read the chat and work out the item, size, quantity, price and delivery
- add it up, fill the Payment Link form and write a reply

Each option she has today involves a trade-off, which she makes for good reasons:
- **Manual link:** the merchant moves every detail across herself.
- **Saved product or store link:** quick for her, but on complex orders the buyer may have to rebuild the selection.
- **Personal UPI QR:** quick and free for her, but the amount isn't fixed to the order and the payment isn't confirmed by a gateway.

**Chat to Checkout**
1. Meera captures the relevant chat (screenshot or pasted text) into **Create from chat** in the Razorpay app.
2. AI **proposes** a draft request, with every fact linked to its source.
3. Uncertain fields are marked for her to resolve.
4. Code calculates the amount from her approved prices.
5. She approves on **one review screen**.
6. Razorpay creates a standard Payment Link, and a reply is copied for her to send in the same chat.
7. Status comes from Razorpay's records.
8. For any request still unpaid, she can **copy a follow-up message** with one tap (F2).

**Scope**
- **F1:** chat → reviewed payment request → verified status. This is the core.
- **F2:** a manual "copy follow-up" on an unpaid request. A small supporting action.
- **Later:** returns and exchanges (§18).

**Expected value** *(to be measured)*
- **Merchant:** fewer fields to enter, fewer wrong amounts, and the buyer doesn't rebuild the order.
- **Target:** under one minute from capture to handing the request off in the chat (median), at least 30% below her fastest current method.
- **Razorpay:** its existing collection tools become easier to use for chat sales.

**Positioning**
Razorpay already offers chat commerce through integrations (n8n for any merchant willing to build a workflow; Konnect and the Agentic Commerce Stack aimed at brands on WhatsApp) and payment operations through RAY. We propose a **merchant-reviewed screenshot-to-request flow inside mobile collections**, with **no messaging integration to configure**, that works for Instagram as well as WhatsApp. Public documentation doesn't describe this, but that doesn't prove it's absent. The equivalence check on an activated account is the first validation step (§16).

---

## 1. Brief and submission form → where answered
| Requirement | Section |
|---|---|
| **Track 1:** merchant and job | §2 |
| **Track 1:** current method and friction | §3 |
| **Track 1:** why mobile | §5 |
| **Track 1:** a clear flow, ideally within 2 minutes | §8 (target: median ≤ 60s from capture to handoff; ≥ 90% within 2 min) |
| **Track 1:** key decisions; what was left out | §14 |
| **Track 1:** how success is measured | §15 |
| **Eval:** problem, merchant, judgment, AI in build, communication | §3–4, §2–3, §6–7, §12, §14, §16, §20, §11, §19, §21–22 |
| **Form · one-pager · video · prototype · AI build log** | §21 · §22 · §19 · §20 |
| **FAQ:** assumptions and validation; external services | §4, §16, §12 |

---

## 2. The merchant

### 2.1 First segment
Activated Razorpay merchants selling apparel or accessories through Instagram and WhatsApp who:
- already use Payment Links for some chat sales
- keep a product and price list
- have no messaging integration (WhatsApp API, chatbot, n8n)
- take 5–30 chat orders a day, ₹800–₹4,000 each

**Why existing link users first:** the feature improves something they already do. It adds no new fee for those orders, and its value can be measured against their own current method.

### 2.2 Persona: Meera Shah, 29, Surat *(illustrative; to be validated)*
- **Business:** Meera Threads (kurtis, co-ords, sarees). Pooja packs.
- **Channels:** 18k Instagram followers. Buyers DM after reels; regulars move to WhatsApp.
- **Orders:** 15–25 a day, about ₹1,500 each.
- **On Razorpay:** a price list for 24 products; delivery ₹80, free above ₹2,999; dispatch "within 24 hours".
- **Phone only,** between reels, packing and courier pickups.

**Job to be done:** *"When a buyer says 'ok, send the link', let me send exactly what she agreed to, correctly priced, quickly, and know when she's paid."*

### 2.3 Where we expect value (to be confirmed by observation)
| Situation | Expected benefit |
|---|---|
| Multi-item orders; size or quantity changed mid-chat; details spread across messages; product known only from a reel screenshot; price haggles | **Expected benefit,** depending on extraction quality and how much correcting is needed |
| A simple single-item sale with a saved product link | **Low.** The saved link stays the recommended route, and the app says so |

---

## 3. How it's done today

### 3.1 Worked example (exact numbers)
**Instagram DM:**
> Ritu shares Meera's "Blue Bandhani Kurti" reel: *"Hi di ye blue wala M size me hai? 2 chahiye. Pune bhejoge? kitna hua total"*
> Meera: *"Haan di M available hai 😊"*
> Ritu: *"ok done, bhej do link"*

**Correct request:** 2 × Blue Bandhani Kurti (M) × ₹1,199 = ₹2,398, plus delivery ₹80 = **₹2,478**.

### 3.2 Current methods: merchant and buyer effort
*Times for current methods are not yet observed and will be measured **from capture or selection of the chat** to sending the request in the chat, against each merchant's fastest method (§16). Only C's target is stated.*

| | A · Personal UPI QR | B1 · Manual Payment Link / RAY command | B2 · Store or product link | B3 · Saved reply + product link | **C · Chat to Checkout** |
|---|---|---|---|---|---|
| Who works out item, size, qty, total | Merchant | Merchant | Buyer (selects) | Merchant picks the link; buyer selects size/qty | **AI proposes; merchant verifies and resolves uncertainty** |
| Merchant typing | Total + message | Amount, description, message | Message | Edit message | **Reduced on supported cases; corrections may need typing** |
| Buyer re-selects | No | No | Yes | Size or qty | No |
| Amount fixed to the agreed order | No (buyer types it) | Yes | No (buyer's cart) | No | Yes |
| Payment confirmed by Razorpay | No | Yes | Yes | Yes | Yes |
| Merchant fee on that order | ₹0 | Razorpay fee | Razorpay fee | Razorpay fee | Razorpay fee (same as B) |
| Merchant time | To be measured | To be measured | To be measured, plus buyer questions | To be measured | **Target: median ≤ 60s, including capture, corrections and sending** |

**What this says about the merchant**
- Each method is a rational trade-off. A personal QR is quick and free, so a merchant may well prefer it. That's a Razorpay business concern, not automatically her problem.
- For **complex agreed orders**, saved links may make the buyer rebuild the selection, while manual requests make the merchant move every detail across.
- **We test whether C reduces that work** without adding errors or buyer questions.

---

## 4. Evidence and assumptions (stated once)
| Type | Item |
|---|---|
| **Documented** | Indian social commerce ~US$29B (2025) → ~US$144B (2030); ~90% on smartphones (Unicommerce). 85% of social-commerce sellers are small, offline-oriented retailers (Bain & Sequoia via Inc42) |
| **Documented** | Razorpay's n8n guide describes a "customer messages you in DMs → collect product and amount → link" workflow that the merchant builds. **The job is recognised, but it needs setup** |
| **Documented** | Konnect and the Agentic Commerce Stack: WhatsApp catalogues and in-chat checkout, presented for brands. Instagram not mentioned |
| **Documented** | RAY on WhatsApp: text or voice; payment links, refunds, settlements. Screenshots and product pricing are **not mentioned** in 4 public sources. This **does not establish absence** |
| **Documented** | Mobile Payment Link creation is manual. Payment Links support a fixed amount, description, notes, reference ID, expiry and cancel; webhooks for paid / expired / cancelled |
| **Marketed (not validated demand)** | SoldBy markets AI reading of DM screenshots into orders, with money to personal UPI |
| **Observed** | Live iOS app (new unactivated account, view only): Home "Collect payments"; Products → Links, Pages, Invoices, Magic Checkout; RAY under Support; Payment Link reminders say "Go to dashboard" |
| **Tested (exploratory)** | 11 synthetic text chats × 2 Claude models (§16.1). Images and voice notes were given as **text representations**; image and audio processing were not tested |
| **Assumed** | Persona, volumes, per-method timings, share of chat orders on links vs QR, unpaid rates, willingness to route more volume through Razorpay |
| **Dependency** | A readable product and price list with variant mapping. A common catalogue across Items, Webstore and Payment Pages is not established; the prototype uses a labelled sample catalogue |

---

## 5. Why mobile
1. **The agreed order is in a phone chat,** and the request goes back to that chat.
2. **Screenshots are phone-native,** with a Share button on the preview.
3. **These sellers have no desk,** and reply speed matters.
4. **Payment status reaches the merchant on the same device.**

*Limit:* opening Instagram or WhatsApp doesn't open the original conversation, so she selects it. That time is included in the measurement.

---

## 6. What exists vs what's proposed
| Capability | Status | Role here |
|---|---|---|
| Payment Links (fixed amount, reference, expiry, cancel, webhooks) | Exists | The rail for F1 |
| Chat-to-order via n8n (DM → link) | Exists, needs a merchant-built workflow | Benchmark; we remove the setup |
| WhatsApp catalogues and in-chat checkout | Exists, needs setup (brand-focused) | Different setup and segment |
| Payment operations by talking to RAY | Exists | Benchmark; candidate home for this feature |
| Payment Link reminders (SMS/email, web setup) | Exists | F2 adds an in-chat follow-up the merchant sends herself |
| **Merchant-selected screenshots or text → source-backed, editable request in mobile collections** | Proposed; current availability unverified | **The differentiation to validate** |
| **Copy follow-up on an unpaid request** | Proposed | F2 |

---

## 7. The solution

### 7.1 Scope
| | Feature | v1 |
|---|---|---|
| **F1** | Chat → reviewed payment request → verified status | **Core** |
| **F2** | Copy a follow-up message for an unpaid request | **Small supporting action** |
| Later | Return and exchange preparation | Roadmap only (§18) |

### 7.2 Changes to the existing app (only these)
| # | Change | Where | So what |
|---|---|---|---|
| C1 | **"Create from chat ✨"** | Home → Collect payments; Payment Link form ("Fill from chat") | Found where merchants already collect |
| C2 | **Share target "Razorpay · Create from chat"** (production) | iOS share extension / Android share intent | Shortest path from a screenshot; the prototype simulates it and labels it |
| C3 | **Review card** | Opens from C1 or C2 | The single decision screen |
| C4 | **"Copy follow-up"** on unpaid chat requests | Existing Payment Link detail screen; an "Unpaid" filter on the existing list | F2 without a new dashboard |
| C5 | **Chat-request settings, on first use, inside the review card** | First use | Delivery suggestion, dispatch wording, reply language and tone |

**Reused:** Payment Links, checkout, settlement, RAY, the merchant's product data.

### 7.3 States
- **Preparation:** `Draft` → `Creating` → `Link ready` → `Copied`
- **Payment** (Razorpay records only): `Unpaid` → `Paid` / `Expired` / `Cancelled`
- **Exception:** `Outcome unknown` → reconcile before retry

"Copied" ≠ sent. "Unpaid" ≠ abandoned. "Paid" ≠ settled. A buyer's screenshot never changes status.

---

## 8. F1 user journey (Instagram; WhatsApp differences in §10)
*Timed **from capture** to sending in the chat (handoff). Target: median ≤ 60s including corrections; to be measured.*

**Step 1: Capture and import** *(Meera)*
- **Capture:** take a screenshot of the relevant part of the chat (one or more), then **Share → Razorpay · Create from chat** in production. Or open **Create from chat** and upload or paste.
- **Preview:** she can remove, add or reorder images. If the screenshot order is uncertain or two screenshots overlap, the draft asks her to review instead of guessing the sequence.
- **Access:** no inbox access is requested.
- *So what:* the merchant controls exactly what's read. There's no messaging integration to configure (an activated account and a price list are still needed).

**Step 2: AI proposes a draft** *(AI and code, ~4–6s; the card fills in progressively)*
- OCR produces ordered, attributed text.
- The model extracts candidate items, size, quantity, apparent agreement and any explicit price or delivery mention, each **linked to its source**.
- **Field states:**
  - **Supported:** source found, rules pass
  - **Needs confirmation:** uncertain, conflicting or haggled
  - **Missing**
- **Code rules:**
  - source quotes must be in the OCR text
  - **change rule:** apply the latest *explicitly confirmed* change to the relevant field and keep the other agreed details. A later question, a seller suggestion or an unaccepted change does not replace the agreed order. If acceptance or message order is unclear, the field needs confirmation
  - product matches need a score threshold *and* a clear lead
  - **colour-ambiguity rule** (one tested safeguard, not a complete matching policy): if the buyer's words fit the colour of more than one product and there's no full product name, both are shown. A product image does not automatically resolve ambiguity; image matches still need the threshold and lead, and show the image for her to check
  - model confidence alone never authorises money
- *So what:* she checks evidence, not a confident summary.

**Step 3: Resolve what matters** *(Meera)*
- **One fix per amber or grey field:** pick between products (with images and prices), a size chip, a quantity stepper, accept or reject a haggled price.
- **What blocks creation:** missing size or quantity, an uncertain price, conflicting corrections or an unresolved haggle. "Ask Ritu" copies a question instead.
- **An enquiry** becomes "Purchase not confirmed"; she can confirm the sale herself. The system never contacts the buyer.
- **An unknown product** opens the normal form, pre-filled; she may type a price.
- *So what:* ambiguity becomes a targeted decision.

**Step 4: Review the exact amount**
> **Payment request · Ritu** *(chat label)* · Instagram
> 🟢 Agreed: "ok done, bhej do link"
> Blue Bandhani Kurti · **M** · 2 × ₹1,199 = **₹2,398** *(your price list)*
> Delivery **₹80** *(suggested from your chat-request setting · tap to change)*
> **Total ₹2,478**
> Sources: "2 chahiye" · "M size me hai" · reel image
> [Edit] **[Create link & copy reply]**

- **Price source:** the merchant-approved price list only, or a price she confirms.
- **Delivery:** a visible suggestion with its source; "needs confirmation" if the chat mentions something different.
- **Calculation:** totals in **integer paise** by code.
- **Taxes and discounts:** the card uses her approved *payable* prices. If she adds tax or a discount separately, it's an explicit line she confirms. Nothing is silently added or silently left out.

**Approval checklist.** "Create" stays disabled until every item is resolved:
1. Product and quantity
2. Size or variant, where the product has one
3. Payable unit price (from her list, or typed and confirmed)
4. Delivery charge, including an explicit ₹0 where none applies
5. Any separately added tax or discount, or none
6. Purchase agreed: either the buyer's confirmation is shown, or Meera confirms the sale herself

- *So what:* she sees and controls exactly what will be charged, and no uncertainty hides behind a green field.

**Step 5: Create and copy**
- **Approval freezes the snapshot.**
- **One standard Payment Link is created:** amount, short description, unique reference (e.g. CT-1042), bounded notes, expiry from her setting, partial payments off. The full snapshot stays in app storage.
- **The reply is built from her saved wording** (greeting, language, dispatch line; no AI here). Code fills the amount, link and reference:
  > "Hi Ritu di 😊 2 Blue Bandhani Kurti (M) ₹2,398 + delivery ₹80 = **₹2,478**. Pay here 👉 [link] · Ref CT-1042 · Dispatch within 24 hrs of payment 🙏"
- **Copy:** the reply is copied, and the link stays retrievable if copying fails.

**Step 6: Hand off in the same chat**
- **Open Instagram** → select Ritu's DM → paste → **send**.
- **The merchant's task ends when she sends it.** That's where timing stops. On WhatsApp, a pre-filled chat still needs her to tap Send.
- In the prototype this handoff is **simulated and labelled**.

**Step 7: The buyer pays** *(buyer's time; not counted as merchant time)*
- On Razorpay's page by UPI, card or netbanking.

**Step 8: Verified status**
- A webhook, or an authenticated refresh, marks the request Paid.
- Out-of-order or duplicate events never undo Paid.
- The link detail screen shows the short order summary.

---

## 9. F2: copy a follow-up on an unpaid request (simple by design)
- **Where:** the existing Payment Links list, with an **"Unpaid"** filter showing chat-created requests and their Razorpay status. The label reads *"Unpaid request · check before following up"*, because a copied link may never have been sent.
- **Action:** **Copy follow-up** re-checks status first. If still unpaid, it copies a neutral message with the same link:
  > *"Hi Ritu, sharing your payment link again in case you'd like to go ahead: [link] (Ref CT-1042)."*
- **Limits:**
  - a cap on copied follow-ups **per request** (default 2, merchant setting)
  - "Stop follow-ups" per request
  - nothing is sent automatically
  - no aggregate push nudges in v1
- **Expired link:** shown as expired. To proceed, she creates a **new request from chat**, re-confirming prices, delivery and availability. Automatic renewal is deferred.
- **So what:** it helps the merchant follow up on selected unpaid requests from the same place, including Instagram buyers that SMS or email reminders can't reach. **The incremental completion it brings must be measured.**

---

## 10. Two tracks: Instagram and WhatsApp
| | **Instagram** | **WhatsApp** |
|---|---|---|
| Capture | Screenshot → Share; copy a single message (DMs can't be shared to other apps) | Screenshot → Share; copy or forward messages |
| Buyer identity | Username; usually **no phone number** | Contact name; number often known |
| Return the reply | Copy → Open Instagram → select DM → paste (no pre-filled DM link exists) | `wa.me/<number>?text=` opens the chat pre-filled **when the number is known**; otherwise copy → paste |
| F2 follow-up | Copy follow-up only | Copy follow-up; an existing Razorpay SMS reminder is possible when the number is known |
| Typical input | Reel screenshots as the product reference; short Hinglish | Longer threads; forwarded messages; repeat buyers |
| Distinct edge cases | Product known only from an image; cropped DMs | Two customers in a forwarded thread; long history above the order |

---

## 11. UX principles (stated honestly)
1. **One review screen** with fewer fields to enter. Target: under one minute from capture to sending in the chat.
2. **Shortest path:** screenshot → Share → review → **Create link & copy reply** → open chat → select conversation → paste → send.
3. **The card fills in progressively** (customer → items → total) within ~5s.
4. **Tap before typing.** Size chips, steppers and a product picker with images. Typing is only needed for corrections, haggles or unknown items.
5. **Three field states, each with one fix:** green = supported, amber = needs confirmation, grey = missing.
6. **Evidence one tap away.** Tap a field to see its quote or the reel it came from.
7. **Money is the largest text,** with the source of each price shown.
8. **Never a dead end.** If AI is slow, unsure or fails, the normal form opens pre-filled, with the screenshot beside it.
9. **Settings on first use, inside the card.** No messaging integration to configure. An activated account and a price list are still prerequisites.
10. **Honest words:** "Link ready", "Copied", "Paid". Never "Sent".
11. **Undo** until created; cancel the link until it's paid.
12. **The buyer sees only Razorpay's familiar page:** seller name, description, amount.
13. **Accessibility:** English or Hindi UI, ≥ 44pt targets, AA contrast, labelled chips.

---

## 12. Safety and reliability
**Money**
- Amounts in paise, calculated by code.
- The snapshot is frozen at approval.
- A price change before creation requires re-approval.
- Haggles need explicit confirmation.
- Partial payments are off.
- No inferred tax.

**Payments**
- **Repeated taps:** create is locked to the same internal request.
- **Timeouts:** become `Outcome unknown`, reconciled by reference before any retry.
- **Re-imported screenshot:** a "possible existing request" warning.
- **Late or duplicate webhooks:** an authenticated refresh, with no regression from Paid.
- **No "zero double charges" promise.**

**Security and privacy**
- **Screenshots are untrusted input.** Text in a chat can never call payment APIs; only the merchant-approved structured request reaches creation.
- **Platform controls:** merchant-scoped authentication, server-held credentials, authenticated payment events.
- **Retention:** a defined short retention period with deletion controls. Immediate disposal isn't promised until logging, storage and AI-provider retention are verified.

**AI**
- Model confidence isn't treated as probability until calibrated.
- Code applies the quote, confirmed-change, threshold and colour-ambiguity rules. The colour rule is one tested safeguard, not a complete matching policy.
- Quality is measured on the final approved request.

---

## 13. Messy chats
| # | Situation | Behaviour |
|---|---|---|
| X1 | Question, not an order | "Purchase not confirmed"; Meera may confirm the sale or send a price reply |
| X2 | Size or quantity missing | Blocks creation; "Ask Ritu" question copied |
| X3 | Two similar products | Both shown with images and prices; Meera picks |
| X4 | Changed mind mid-chat | The latest *explicitly confirmed* change is applied to that field, other agreed details are kept, and the change is highlighted. If it's unclear whether the change was accepted, the field needs confirmation |
| X5 | Haggle ("1,100 kar do") | Price needs confirmation: ₹1,199 or ₹1,100 ("changed by you") |
| X6 | Product not in her list | Editable manual form, pre-filled with what was read; she types and confirms the price. No catalogue entry is created |
| X7 | Cropped, unreadable or mixed-customer input | Ask for more context, or open the manual form |
| X8 | Repeated tap or timeout | Locked / `Outcome unknown` → reconcile |
| X9 | Buyer changes the order after creation | Opens existing link management. Payment status and **successful cancellation** must both be confirmed before a replacement can be prepared. If the link is paid or its status is unresolved, stop and use the existing payment-management workflow. No automatic replacement |
| X10 | Link expired | Shown as expired; a new request from chat, with re-confirmation |
| X11 | AI slow or failing | Manual form with the screenshot beside it |

---

## 14. Key decisions and exclusions
| # | Decision | Rejected | Why |
|---|---|---|---|
| D1 | **F1 core + F2 as a manual copy action** | Automated reminders or renewals; F3/F4 in v1 | Keeps collection continuity without new complex workflows |
| D2 | **Payment Links as the output** | Pre-filled store cart | Fixed amount, reference, cancel and webhooks are documented |
| D3 | **Merchant-selected screenshots or text** | Inbox access or integrations | Privacy; no messaging setup; works on any phone |
| D4 | **Draft, not action;** three field states | Auto-create on high confidence | Our test showed overconfident model scores |
| D5 | **AI proposes; code calculates in paise; merchant approves** | AI totals | Money must be exact |
| D6 | **Delivery as a visible, sourced suggestion** | Silently applying a store setting | No invisible charges |
| D7 | **Copy and paste in the original chat** | Auto-send | Platform limits; her voice; copied ≠ sent |
| D8 | **Separate Instagram and WhatsApp tracks** | One flow | Real differences in capture, identity and sending |
| D9 | **Start with existing Payment Link users** | Start with personal-QR sellers | No new fee; isolates the feature's value |
| D10 | **Extend existing screens and RAY** | A new app or dashboard | Smallest change |

**Not in v1:**
- automatic reminders, push nudges and link renewal
- refunds and exchanges
- address collection
- inventory
- inbox integration
- catalogue creation
- voice input
- COD
- dashboards
- desktop changes

---

## 15. How success is measured
| Objective | Measure | Proposed target |
|---|---|---|
| **Less merchant effort (primary)** | Active time **from capture or selection of the chat** to **sending** a correct request in the chat, including corrections | **Target: median ≤ 60s and ≥ 30% below her fastest comparable method** |
| Complete on mobile | % of tasks completed within 2 minutes | ≥ 90%; fallbacks reported separately |
| Correctness | Approved requests with a wrong amount or product (counts, severity, uncertainty) | No increase vs baseline |
| Buyer effort | Buyer clarification messages caused by the request | No increase vs baseline |
| F2 usefulness | Follow-ups copied, and payment within 48h. Comparing followed-up vs not followed-up requests is **observational only**, since merchants may follow up on their most promising buyers. For a causal estimate, the "Copy follow-up" option is **randomly offered** on half of eligible unpaid requests during the pilot | Measured; no target until there's a baseline |
| AI quality | Raw, flagged, silent and post-review errors; flag rate | Silent errors tracked as the critical count |
| Cost and latency | AI/OCR cost and time per completed request, including retries | Measured before rollout thresholds |

**Decision rule:**
- Continue only if C beats the fastest eligible method on the full task, without more errors or buyer questions.
- Where a saved link is better (simple sales), the app recommends it.

---

## 16. Evidence so far and next tests

### 16.1 Extraction test (exploratory; 13 Oct 2026)
**Setup:**
- 11 synthetic Hinglish/English text chats (Instagram and WhatsApp) in F1 scope:
  - **T1:** agreed order with reel image
  - **T2:** enquiry
  - **T3:** size missing
  - **T4:** "blue bandhani"
  - **T4b:** truly ambiguous "blue wala kurti"
  - **T5:** changed mind
  - **T6:** haggle
  - **T7:** voice-note transcript
  - **T16:** a bare "ok"
  - **T17:** two customers
  - **T18:** item not in catalogue
- **Models:** Claude Haiku and Claude Sonnet, run as independent agents.
- **Scoring:** the §8 code rules.
- **Labels:** initial labels were defined before testing. One (T4) was later revised, because the catalogue literally contains "Blue Bandhani Kurti", and T4b was added. **Results are exploratory and need confirmation on held-out data.**

| Fields (37 per model) | Haiku, original rules | Haiku, with ambiguity rule | Sonnet (same either way) |
|---|---|---|---|
| Correct and accepted | 26 | 26 | 27 |
| Correctly flagged | 6 | 7 | 7 |
| Over-flagged (right but flagged) | 3 | 3 | 3 |
| Wrong but caught by a flag | 1 | 1 | 0 |
| **Silent errors** | **1** (T4b) | **0** | **0** |
| Amounts correct (T1 ₹2,478 · T4 ₹1,279 · T5 ₹1,079 · T7 ₹3,999) | 4/4 | 4/4 | 4/4 |

**How T1 and T7 were represented:** T1's reel image and T7's voice note were given as **text representations** ("[shared image: reel 'Blue Bandhani Kurti']", "[voice note transcript] …"). Image and audio processing were not tested.

**Models:** Claude Haiku and Claude Sonnet, run as Claude Code agents. The exact version identifiers weren't exposed in that environment. Raw outputs, labels and the scoring script are published with the build log.

**Plain statement:** after an in-sample rule correction, no silent errors were observed in 11 synthetic text cases, and the four priced cases had correct amounts. Screenshot (OCR) performance is untested. 0 errors in 11 cases still allows a true rate of up to about 24% at 95% confidence.

**What it changed:** model confidence proved unreliable (Haiku gave 0.92 to an ambiguous match). That's why the product is "draft, not action" and has the ambiguity rule.

### 16.2 Next tests (priority order)
1. **Equivalence check:** on an activated account, attempt the same task in the current app and in RAY. Record inputs, outputs, corrections and time.
2. **Merchant observation:** 5 sellers × 3 tasks, using their fastest current method. Record time from capture, typing, corrections and buyer follow-ups.
3. **Held-out screenshot set:** real screenshots, ordinary sales plus stress cases. Labels adjudicated by a person.
4. **Payment integration (test mode):** creation, repeated taps, timeouts, delayed or duplicate events, refresh.
5. **Phone handoff timing:** Instagram and WhatsApp, from capture to **sending** in the right chat.

---

## 17. Impact for Razorpay (illustrative; assumptions explicit)
**Lead hypothesis (H1):** the existing Razorpay-link workflow gets faster and more correct for chat sales, so merchants use it more often. This needs no change in payment method and no new fee for those orders.
- **Illustration:** 5.6 link requests a day × ~90s saved (≈ 2.5 min → ≈ 1 min) ≈ 8 minutes a day, about 3.6 hours a month. *These are estimates to be measured.*

**Secondary hypothesis (H2): migrated volume**
Some chat orders currently paid by personal QR move to Razorpay links because links become easier. This is the only volume in the financial illustration.

| Cohort (per merchant, per day) | Definition | Assumption |
|---|---|---|
| **E · existing link requests** | Chat orders already sent as Razorpay links | 40% of 8 chat orders = 3.2 (no new revenue; H1 value only) |
| **M · migrated requests** | Orders that move from personal QR to links | +30 points = 2.4 |

| Item | Per merchant | Note |
|---|---|---|
| M volume | ₹74,880 a month (2.4 × ₹1,200 × 26) | **Costs the merchant ~₹1,767 a month in fees** (2% + GST), so it depends on her accepting that |
| Net revenue (1% of M) | ~₹9,000 a year | Assumption |
| AI cost (5.6 requests × 1.5 attempts × ₹1) | ~₹2,600 a year | Including retries |
| **Contribution** | **~₹6,400 a year** | After assumed AI cost only; not profit |

**F2 is measured separately and kept out of the financials.** Payments attributable to copied follow-ups are measured in the pilot through the randomised offer (§15). They're excluded here so no payment can be counted twice.

**Pilot:** 50 merchants. H1 is measured directly. H2 is observed: about ₹37 lakh a month of M volume *if* the assumptions hold.

**Scale (appendix only):**
- **Pool:** 50,000 eligible merchants.
- **Adoption:** 0 → 5,000 in Y1, → 12,500 in Y2, → 20,000 in Y3. **Average active merchants:** 2,500 / 8,750 / 16,250.

| Year | Contribution |
|---|---|
| Y1 | ~₹1.6 Cr |
| Y2 | ~₹5.6 Cr |
| Y3 | ~₹10.3 Cr |

These figures sit on unvalidated behaviour (M depends on fee acceptance). **H1 is the success condition. H2 is upside.**

**Non-financial value**
- An approved order snapshot on every chat payment.
- Fewer wrong-amount requests.
- No-integration chat collection for small Instagram and WhatsApp sellers.
- RAY's step from "do what I type" to "prepare what my buyer asked for".

---

## 18. Roadmap (beyond v1)
Future extensions could support **return and exchange preparation**, subject to:
- explicit payment matching
- item-level refund history
- payment-state validation

Each F1 request's frozen snapshot is a useful starting point, but it doesn't solve these on its own.

---

## 19. Prototype and deployment
**Landing page:** two tracks (Instagram, WhatsApp), each with two modes.

| | Guided demo (scripted) | Try it yourself (live) |
|---|---|---|
| **Instagram** | **Request 1 · Ritu** (the §3.1 chat, a clean agreed order): capture → draft → approve → copy → send in DM (simulated) → **Paid**. **Request 2 · Kavya**, a separate chat that actually contains the ambiguity and the haggle ("wo blue wala kurti 1 chahiye, L size, 1,100 kar do na… ok link bhejo"): pick Blue or Navy, decide the price → approve → send → stays **Unpaid** → Unpaid filter → **copy follow-up** | Paste Instagram-style text or upload a screenshot → review card → demo link |
| **WhatsApp** | **Request 3 · Sana:** "Black co-ord chahiye, Ahmedabad, link bhejo" → size missing → "Ask Sana" → Sana: "L" → approve → pre-filled chat (number known); she taps Send (simulated) → Paid | Same with WhatsApp-style input |

**Consistency rule:** every decision shown on a card must trace back to a message visible in that request's chat. A paid request is never eligible for follow-up.

**Guided-demo layout:**
- **Top:** journey swimlane (Capture → Draft → Resolve → Approve → Send → Paid / Unpaid → Follow-up).
- **Middle:** the phone (hero).
- **Right:** "behind the screen" boxes and arrows, colour-coded for merchant, AI model, plain code, data, outside Razorpay and result.
- **Collapsible side panels** ("Phone only").
- **Intro and recap cards.**

**Live mode:**
- **AI:** real extraction with the same code rules.
- **Payments:** simulated and labelled **"Demo, no real money"** unless Razorpay test mode is wired in.
- **Keys:** none in the page.
- **Native share:** simulated and labelled.

**Implementation status:** the landing page and the form state exactly which steps run for real (e.g. AI extraction) and which are simulated (native share, sending, payment). It's presented as a **prototype of a proposed Razorpay mobile extension**, not a Razorpay product.

**Deployment:** a public link that opens without login, on mobile and desktop.

---

## 20. AI build log (decision-focused; publish as markdown)
**Tools and models**
- **Claude (Anthropic) agentic sessions:** web search, browser, files.
- **Claude with computer use:** iPhone Mirroring, view-only app walkthrough.
- **Claude Haiku and Claude Sonnet:** extraction test, run as Claude Code agents (exact version identifiers weren't exposed in that environment).
- **Independent AI reviewers:** four rounds.
- **Proposed product stack:** multimodal LLM, OCR, Razorpay Payment Links (test mode).

**Key prompts and workflows**
1. **Current-state analysis:** of Razorpay's agentic products, from their pages and videos.
2. **App walkthrough:** "list every feature; change nothing; avoid personal screens".
3. **Idea screen:** a recursive so-what and practicality check on every idea.
4. **Claims audit:** exists / needs setup / not documented / proposed.
5. **Extraction prompt:** extract only what is written; quote the source; no prices; "agreed" only on clear confirmation; null if unsure; match only from the list; JSON.
6. **Test harness:** labels → two models → code rules → field-level scoring script (published).

**Product decisions that came from AI work**
- **Draft, not action, plus the ambiguity rule.** Haiku matched an ambiguous "blue wala kurti" at 0.92, so confidence-based acceptance was **rejected**.
- **Payment Links as the output; Razorpay products reused.** A claims audit showed Webstore, Payment Pages and Magic Checkout already cover catalogue, checkout and order tracking, and cart variants and references aren't documented.
- **F2 stays a manual "copy follow-up"; automated reminders, renewal, refunds and exchanges are deferred.** Review showed they need identity, sale-history and payment-state models that v1 doesn't have.
- **Earlier ideas were rejected after checking the live app and docs.** For example, "Is it paid?" was dropped because the app already searches payments by phone.

**AI vs me**
- **AI did:** research, documentation checks, drafting, test runs, the scoring script, prototype code (once built).
- **I decided:**
  - track and segment
  - scope
  - separate channel tracks
  - the money-approval boundary
  - which review points to accept or reject

**Limitations**
- No merchant observations yet.
- Equivalence with the current app and RAY is untested (needs an activated account).
- Extraction tested on 11 text cases only; images and voice were text representations.
- The app walkthrough used an unactivated account.
- Financials are illustrative.
- No keys or personal data in any artifact.

---

## 21. One-page product note (draft, ~500 words; fits one page at 10pt)
**Chat to Checkout: prepare the agreed payment request from the chat**
*Track 1 · Razorpay in Your Pocket*

**Merchant and problem**
Meera sells kurtis through Instagram DMs and WhatsApp and already sends Razorpay Payment Links for some chat sales. When a buyer writes "blue wala M, 2 chahiye… ok done, bhej do link", the order is agreed, but Meera still carries it across by hand: she works out the item, size, price and delivery, totals it, fills the Payment Link form and writes a reply. Saved product links are faster for her but can make the buyer rebuild a complex selection. A personal QR is quick and free, but the amount isn't tied to the order.

**Evidence and current workaround**
- **Razorpay's own n8n guide** describes this DM-to-link job, but it needs a merchant-built workflow.
- **RAY** takes text or voice commands.
- **In our walkthrough of the live app** (new, unactivated account), link creation is manual.
- **Limitation:** we haven't yet tested whether the current app or RAY already does the equivalent on an activated account. That's our first validation step.

**What we built, for whom**
A **prototype of a proposed Razorpay mobile extension**: a flow inside Razorpay collections, for chat-first sellers already using links, on separate Instagram and WhatsApp tracks.
1. She captures the chat (screenshot or text).
2. AI proposes a draft with every fact linked to its source.
3. Uncertain fields are marked for a one-tap fix.
4. Code calculates the amount in paise from her approved prices.
5. She approves on one screen, a standard Payment Link is created, and a reply is copied for her to send in the same chat.
6. Status comes from Razorpay.
7. For unpaid requests, she can copy a neutral follow-up (F2).

*Prototype status: [fill in at submission: which steps run, e.g. AI extraction; which are simulated, e.g. native share, sending, payment].*

**Left out:** automatic reminders and renewals, refunds and exchanges, address collection, inventory, inbox access, voice input.

**Key product and AI decisions**
- **Draft, not action:** model confidence never authorises money.
- **Three field states:** supported, needs confirmation, missing.
- **An ambiguity rule,** added after our test caught an overconfident match.
- **Approval freezes the order.**
- **Repeated taps are locked; timeouts are reconciled,** not retried blindly.
- **Text inside screenshots can't trigger payments.**
- **"Copied" is never "sent".**

**Primary metric and what we'll test next**
- **Primary metric (target):** median time from capture to sending a correct request ≤ 60 seconds and ≥ 30% below the merchant's fastest current method, with no increase in wrong requests or buyer clarifications.
- **So far:** after an in-sample rule correction, no silent errors were observed in 11 synthetic text cases (images and voice given as text), and four priced cases had correct amounts. Screenshot and image performance is untested. Whether the current app or RAY already offers an equivalent is unverified.
- **Next:**
  1. activated-account equivalence check
  2. observe 5 sellers using their fastest method
  3. a held-out real-screenshot set
  4. test-mode payment edge cases

---

## 22. 90-second video
| Time | Scene | Voice-over |
|---|---|---|
| 0–12s | Ritu's DM: "ok done, bhej do link" | "Meera already uses Razorpay links. The order is agreed, but she still has to carry it across by hand." |
| 12–22s | Today: price lookup, form, typing; or a store link → "size kahan?" | "Either she retypes it, or her buyer rebuilds it." |
| 22–45s | Screenshot → Create from chat → card fills in; green and amber fields; ₹2,478 | "She captures the chat. AI proposes the request with sources; code calculates every rupee." |
| 45–58s | Second chat (Kavya): ambiguous Blue/Navy → pick; "1,100 kar do" → keep price | "When the chat is unclear, she decides in a tap." |
| 58–70s | Create link & copy → open Instagram → paste → send (simulated) | "Create, copy, send. Our target: under a minute." |
| 70–82s | Ritu's request: Paid. Kavya's: Unpaid → copy follow-up | "Status from Razorpay, and a follow-up she can copy for an unpaid request." |
| 82–90s | Instagram / WhatsApp tracks | "Chat to Checkout: the agreed order, requested correctly." |

---

## 23. Risks
| Risk | Mitigation |
|---|---|
| An equivalent exists in the app or RAY | Activated-account check first; target a specific unresolved friction |
| Savings small vs saved links | Best-fit targeting; recommend saved links for simple sales; decision rule |
| Extraction, OCR or matching errors | Draft-not-action, field states, ambiguity rule, post-review error tracking |
| Catalogue access or variants | Explicit dependency; manual price fallback |
| Duplicate or uncertain creation | Tap lock, outcome-unknown reconciliation, webhook ordering |
| Prompt injection via screenshots | Only the approved structured request reaches APIs |
| Fee resistance on migrated volume (H2) | H1 is the success test; existing link users first |
| Handoff friction | Copy + open app; measured from capture to send |

---

## 24. Sources
1. [Razorpay docs: Payment Links (mobile app)](https://razorpay.com/docs/payments/mobile-app/accept-payments/payment-links/)
2. [Razorpay API: create a standard Payment Link](https://razorpay.com/docs/api/payments/payment-links/create-standard/)
3. [Razorpay docs: Payment Link webhooks](https://razorpay.com/docs/payments/payment-links/subscribe-to-webhooks/)
4. [Razorpay blog: n8n chat-to-order](https://razorpay.com/blog/razorpay-n8n-node-no-code-payment-automation/)
5. [Razorpay Konnect](https://razorpay.com/konnect/)
6. [Razorpay at GFF 2026](https://razorpay.com/m/gff2026/)
7. [Razorpay: RAY on WhatsApp](https://razorpay.com/ray-on-whatsapp/)
8. [Razorpay newsroom: RAY launch](https://newsroom.razorpay.in/newsroom/razorpay-launches-a-conversational-ai-account-manager-ray-on-whatsapp-for-businesses-in-partnership-with-indusind-bank/)
9. [Razorpay docs: Webstore](https://razorpay.com/docs/payments/webstore/)
10. [Razorpay pricing](https://razorpay.com/pricing/)
11. [SoldBy](https://soldby.in/)
12. [Unicommerce: social commerce in India](https://unicommerce.com/blog/social-commerce-india/)
13. [Inc42: Bain & Sequoia social commerce report](https://inc42.com/buzz/social-commerce-in-india-poised-to-hit-16-bn-gmv-by-2025)
14. Extraction test results and scoring script (published with the build log)
