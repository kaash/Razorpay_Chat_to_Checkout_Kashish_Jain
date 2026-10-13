# Decision trail: how Chat to Checkout was chosen, challenged and shaped

This is the "why" behind the build log. It collects the moments in my two days of working with AI (12–13 Oct 2026) where I pushed back, changed direction or made a call the AI didn't.

- **Quotes in blockquotes are my own messages to Claude, copied from the session.** I dictated many of them, so a few are trimmed with "…" but not reworded.
- The full raw chat isn't published. It's hundreds of turns, most of it AI-written, and it includes personal account details I asked to be deleted. This page is the curated record.
- Every claim here points to a file in this repo that you can check.

---

## 1. Ideas I killed before Chat to Checkout

I didn't start with this idea. I explored Track 2 first, then moved to Track 1, and rejected most of what AI suggested there too. Every idea had to pass the same tests:
- Is it a real, frequent merchant problem with evidence?
- Is it practical for every party involved?
- Does it avoid conflict with Razorpay's merchants or partners?
- Is it something Razorpay doesn't already do?

| Idea (what AI proposed) | Why it was dropped |
|---|---|
| **Track 2:** Refill Agent (reorder before a customer runs out) | Quick commerce wins once the customer has run out, and it competes with Razorpay's own partners |
| **Track 2:** prepaid-discount optimiser, Refund Saver, high-ticket payment completion, settlement-hold clearance | Weak practicality, crowded, or already partly in Razorpay |
| **"Is it paid?"** (share a "Paid ✅" screenshot, get a verdict) | The Razorpay app can already search payments, so it would be a better search screen at best |
| **"Release My Money"** (clear settlement holds from the phone) | It touches Razorpay's own risk process, and an Account Review Dashboard already exists |
| **"Dues"** (chase unpaid links) | Too common a problem. Reminders already exist. |
| **"Save this payment"** (fight chargebacks from the phone) | Felt like a fix, not a product. Dispute tools already exist for larger merchants. |
| **Photo to Quote** (custom orders, advance and balance) | AI pricing of custom work is subjective, and partial payments already exist. Kept as a "later" note. |
| **Reseller Split** (split payment between supplier and reseller) | Split payouts have eligibility requirements small resellers are unlikely to meet |
| **Hostel Group Order, Community Drop** (group orders paid per person) | Food ordering is Zomato's and Swiggy's space, and I chose not to go there (see below) |

AI produced each idea with research and evidence. The decision to drop or keep was mine, against the tests above.

What I said when ideas weren't good enough:

> "I am not liking the solution at all. This sounds like a very common problem…"

> "not a good problem and solution, scrap this and restart"

When Claude asked me what was wrong with its shortlist, I answered "none of these ideas is good enough". My reasons:
- not wow or AI-native
- merchant not vivid
- problem feels small
- feels like a fix

Those four became my bar for every idea after that.

When Chat to Checkout came up, I didn't accept it straight away. I asked for siblings, to make sure it wasn't just the least-bad option:

> "I like this idea. I like your approach also. Give me one or two more similar ideas… rate all… suggest one…"

> "Can we have a problem and solution that merchants face with college students?…"

> "I would not want to go into the domain of Zomato and Swiggy. Can you suggest more problems and solutions for Track 1, just like the one you had shared from chat to checkout?…"

Chat to Checkout scored highest against my bar (`docs/solution-document-v9.md`, and the idea scoring in the project notes): a frequent job, real money, done by hand on a phone today, AI-native in the right place, and easy to demo.

## 2. "Are you sure Razorpay doesn't do this?"

AI's first version claimed the idea was new. I didn't take that on trust. I sent a screenshot from Razorpay's site and asked:

> "are you sure razorpay does not do this currently"

**What we found:**
- RAY, Razorpay's WhatsApp assistant, can already create payment links from a text or voice command.
- Konnect, the Agentic Commerce Stack and an n8n workflow cover chat commerce for brands.

**What changed:**
- I narrowed the claim to what is actually new: a **no-setup, merchant-reviewed, screenshot-to-request flow inside the mobile app, that works for Instagram as well as WhatsApp.**
- Whether an activated account already has this is still listed as **unverified** in every document, including the limitations in `BUILD_LOG.md`.

I then pushed for what RAY *doesn't* cover:

> "If it already kind of is possible with Razorpay RAY, what are some additional pain points…"

That's where these came from:
- the source quotes on every field
- the colour-ambiguity check
- delivery and price-ask handling
- the "Unpaid → check before following up" flow

## 3. Instagram first, and the scope I chose

> "I agree with the three additions… primary source of business… Instagram…"

> "I would suggest you incorporate both Instagram and WhatsApp… check the entire solution workflow recursively…"

**Decision:** Instagram is the default and WhatsApp is secondary, built as separate tracks. They differ for real:
- an Instagram DM has no phone number, so the reply is copied and pasted
- WhatsApp can pre-fill the message when the number is known

Returns and exchanges were designed, then cut to "next" so the core flow stays sharp (solution document §18).

## 4. Reviewing the reviewers

I used outside AIs (ChatGPT and others; see `BUILD_LOG.md`) as critics, five times. I never pasted their feedback in directly:

> "Critically analyze the feedback… Before going ahead, let me know your understanding."

> "…only accept the ones that you feel are actually worth solving for… pay heed to the user experience…"

> "See what all feedback actually makes sense and incorporate it if it makes logical sense."

**What I accepted and what I didn't (from rounds 2, 4 and 5):**

| Reviewer point | My call | Result |
|---|---|---|
| "Not documented" doesn't mean "new" | Accepted | Separate status levels: exists / needs setup / not documented / proposed |
| Status "Sent" can't be observed | Accepted | States are Draft → Link ready → **Copied** → Paid. "Sent" is never shown. |
| The output should be a documented Razorpay object | Accepted | A standard Payment Link, not a pre-filled store cart (variants and references aren't documented) |
| Compare against her *fastest* current method, not the slowest | Accepted | Today's times are "to be measured"; target is ≥ 30% faster than her fastest method |
| Convenience overstated ("three taps", "no typing") | Accepted | Rewritten. Time is measured from capture, and the target is labelled a target. |
| Follow-ups: avoid "order ready" wording and auto-renewal | Accepted | Manual "copy follow-up", neutral wording, status re-check, cap of 2 |
| The impact model counted recovered payments twice | Accepted | Recovery taken out of the financials |
| **Simplify the presentation and drop the three-pane walkthrough** | **Partly rejected** | I kept the three panes (journey, app, behind the screen) because judges need to see what AI does versus code. I added a "Phone only" toggle instead. |
| **More evidence and a working core instead of more document** | **Accepted in priority, not in scope then** | I stopped expanding the document. The working core came later as the deployed prototype. |
| Reviewer gave merchant understanding a lower score | **Noted, not "fixed" on paper** | Only real seller observation fixes this, so it's listed as the top limitation rather than written around |
| "Stop rewriting; the scope is right" (final reviewer, 8/10) | Accepted | No more conceptual rewrites. The time went into testing and the prototype. |

## 5. Test before building

> "Go ahead with step 2… run 15 sample chats through Claude with extraction rules and record correct, flagged, and silent errors."

**What I asked for:**
- I locked the expected answers before any model ran.
- The test counts **silent errors** (wrong but accepted), not just accuracy.

**What it caught:**
- Haiku matched "wo blue wala kurti" to Blue Bandhani at **0.92** confidence. It was wrong.
- I chose a code rule over a higher threshold (full story in `BUILD_LOG.md` §3).

The test also caught **my own mislabel** (T4). I corrected it in the open and added T4b. Files: `extraction-test/`.

## 6. The prototype: what I asked for and what I changed after seeing it

> "One tab should show the sample demo, and the other tab should show something that works in real time as a prototype… The language should be humanized… very self-explanatory… explain the problem statement at the top… make sure that the UI follows Razorpay's themes…"

After the first build, I rejected parts of it:

> "Rethink if the user experience is smooth here or not, and make any changes to the workflow if you feel like it can be a source of cross-questioning to the judges."

> "I don't like the user journey bar at the top. I would like to see, in the user journey, exactly what step is required to be done by the customer, what is to be done by the merchant, and where it is that AI is getting into the picture."

**What changed because of these two messages:**
- **The journey bar was rebuilt** as four rows across eight steps: Buyer, Seller, AI model, Razorpay + code. AI now visibly appears in **one** step. Steps that didn't happen are crossed out (for example, "Pays" when Kavya never paid).
- **Placeholder buttons were removed.** "Review the draft" and "Looks right" weren't real app controls and added taps. The orange targets now sit only on real controls: a source chip, the checklist, Create.
- **"Buyer pays" moved out of Meera's phone.** It was a demo control sitting inside the seller's app, which would invite the question "why can the seller mark it paid?"
- **AI no longer writes the buyer's reply.** The diagram had said AI drafts the reply, while the app used her saved wording. Now it's code only, and the documents say so.

## 7. Making it real, and checking whether AI could even grade it

> "I want to understand simply whether this is a working prototype, whether the AI would actually help to grade it or not, and if it can be shared as per the submission guidelines."

> "…so that it gives me the exact same prototype, but one that is working, wherein all the AI and everything is working behind the scenes."

**What changed:**
- A real Claude model now reads chats and screenshots on the server.
- Razorpay Payment Links run in **test mode**.
- The server re-prices every order.
- It's deployed publicly with no login.

**What I did myself:**
- created the keys
- approved each merge
- made the test payment on my phone, which turned **Paid** from Razorpay's records

## 8. Holding myself to the same standard

> "In the AI build log, I still feel that things are missing. We have not explicitly shown: the entire brainstorming… the limitation… risk… how I verified… one AI output I rejected or corrected and why"

That's why this page exists. It's also why the build log now corrects one of its own earlier lines: it had called a live-eval flag on a non-ambiguous case (T4) "the right outcome", when it was really an unnecessary extra tap.
