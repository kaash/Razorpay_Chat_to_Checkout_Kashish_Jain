# Chat to Checkout: extraction test results (13 Oct 2026)

## What was tested
- **Step tested:** the AI extraction step of Chat to Checkout (reading a chat into structured fields), followed by the plain-code rules that decide what is accepted, what is flagged for the merchant, and the money amounts.
- **Models:** two Claude models, run as independent agents with no access to the expected answers:
  - **Claude Haiku**: small and fast, the kind of model the product would use first
  - **Claude Sonnet**: mid-size
- **Cases:** 17 synthetic Hinglish/English chats (Instagram and WhatsApp), covering all four features:
  - **F1** agreed orders
  - **F3** returns
  - **F4** exchanges and add-ons
  - edge cases: an enquiry rather than an order, missing size, ambiguous product, a change of mind, a price haggle, a voice note, an item not in the catalogue, two customers in one chat, an unclear "ok"

  F2 (nudges) uses no AI and was checked in code only.
- **Labels:** the expected answers were written and locked **before** running the models. One label was later revised (see below).

## Pipeline rules applied by code
- A field is accepted only if:
  - its confidence is at least 0.85
  - its quoted source text appears in the chat, or the value matches the paid order the change or return refers to
- A product match is accepted only if:
  - the top score is at least 0.80
  - it leads the next candidate by at least 0.15
- Otherwise the field is **flagged** for the merchant. Prices and totals are calculated by code from the catalogue: ₹80 delivery, free above ₹2,999.

## Results
| | Haiku | Sonnet |
|---|---|---|
| Cases | 17 | 17 |
| Fields scored | 66 | 66 |
| Correct and accepted | 52 | 48 |
| Correctly flagged (genuinely missing or unclear) | 8 | 9 |
| Over-flagged (right, but flagged anyway, costing an extra tap) | 4 | 9 |
| Wrong but caught (flagged) | 1 | 0 |
| **Silent errors** (wrong and accepted), thresholds only | **1** | **0** |
| **Silent errors** with the ambiguity rule (below) | **0** | **0** |
| **Money amounts correct** (8 cases with a link, difference or refund) | **8/8** | **8/8** |
| Cases with no flag at all ("clean") | 9/17 | 7/17 |

Amounts checked included ₹2,478, ₹1,279, ₹1,079, ₹3,999, +₹100 (swap), −₹2,020 (exchange refund), ₹1,199 (return) and +₹919 (add-on).

## What we learned
1. **The model's confidence scores are not reliable on their own.** On a truly ambiguous chat ("wo blue wala kurti", with both a Blue and a Navy kurti in the catalogue), Haiku chose Blue with a score of 0.92, which would have gone through as a **silent error**. Sonnet scored it 0.70, so it was flagged.
   - **Fix (plain code):** if the customer's words match the colour of more than one catalogue item, and there is no product image and no full product name, both items are always shown for the merchant to pick. With this rule there were zero silent errors for both models.
   - **Caveat:** we added this rule after seeing the failure, so it must be confirmed on new, held-out chats.
2. **One test label was wrong, not the AI.** We had labelled "blue bandhani" as ambiguous, but the catalogue contains a product literally named "Blue Bandhani Kurti", and both models picked it. We revised the label and added a truly ambiguous case (T4b) instead.
3. **The trade-off is speed versus safety.** Haiku flagged less (4 unnecessary flags) and needed the code rule to stay safe. Sonnet was more cautious (9 unnecessary flags, for example quantity confidence 0.6 on "ek blue ki jagah navy"), which means more taps for the merchant.
   - **Next:** tune the thresholds on a larger set. The aim is to cut over-flags without letting any silent errors through.
4. **Money was always right when the reading was right.** Because code, not AI, calculates every rupee, all 8 amounts were exact for both models.
5. **Enquiries, unclear messages and multiple customers were handled safely in every case.**
   - "Is it available? price?" was read as a question by both models, so no link was created.
   - "ok" was read as unclear by both.
   - Two customers in one chat were detected by both.
   - "Mustard dupatta" was correctly reported as not in the catalogue.

## Limitations (be careful how these numbers are used)
- **Very small sample.** With 0 silent errors in 17 cases, the true silent-error rate could still be as high as about 16% (95% confidence). This shows the design is workable; it does not prove a low error rate.
- **Text only.** Screenshots were described in text (e.g. "[shared image: reel 'Blue Bandhani Kurti']"). Real OCR and image matching were not tested.
- **Synthetic chats** written by the same team that wrote the labels.
- **Run method.** The models ran as Claude agents in a development environment, not through the production API. Speed and cost were not measured.

## Files
- `cases.json`: the test cases and catalogue
- `expected.json`: the locked labels, plus the T4 revision
- `prompt.txt`: the extraction rules
- `haiku.json`, `sonnet.json`: raw model outputs
- `score.py`: the scoring code. Run `python3 score.py --rule --cases` to reproduce.
