# Wireframe brief and build decisions

Source: *Skalr - Alteon Meta Ads Landing Page Wireframe* (mid-fidelity, prepared
for Hannah London). This file records how that document was translated into the
build, what was deliberately not carried over, and what is still outstanding.

## What was built

The landing page the wireframe specifies. The agency document's own chrome -
sections 00 to 07, the rationale notes, the decision tables - is the brief, not
the deliverable, so it is not reproduced as a web page.

Section order, mobile, exactly as drawn:

| # | Section | Component |
|---|---------|-----------|
| - | Sticky header: wordmark, call | `layout/SiteHeader` |
| 1 | Hero: location eyebrow, headline, body, media, four trust tiles, CTA | `sections/Hero` |
| 2 | Request a call back | `sections/CallbackForm` |
| 3 | Value anchor: comparable platform against £750 | `sections/ValueAnchor` |
| 4 | Offer: course of three recommended, single session | `sections/Offer` |
| 5 | How it works: three mechanism steps | `sections/HowItWorks` |
| 6 | Before and after, gated on the image pack | `sections/BeforeAfter` |
| 7 | Suitability: good fit against not suitable | `sections/Suitability` |
| 8 | FAQ: six questions, first open | `sections/Faq` |
| 9 | Finding us: map, address, travel | `sections/ClosingBand` |
| 10 | Final CTA: book and call | `sections/ClosingBand` |
| - | Legal footer | `layout/SiteFooter` |
| - | Sticky book and call bar | `layout/StickyCtaBar` |

Desktop follows section 04: hero and form card two-up above the fold with the
form pinned while the hero scrolls, then full width bands in the same order,
three columns for how it works, two for suitability, and location merged with
the final call to action into one closing band.

## Form build requirements (section 03)

All implemented in `sections/CallbackForm` and `app/api/lead/route.ts`:

- labels above every field, never placeholder-only
- `type="tel"` with `inputmode="numeric"`, `type="email"`, autocomplete on all three
- validation on blur, not on submit
- UK numbers accepted in any format and normalised to E.164 for the CRM
- the submit button never disables; pressing it explains what is missing
- 44px minimum tap targets on chips and buttons
- confirmation on submit that repeats the promise and says who calls and when
- `Lead` fired on success, concern and timing passed to the CRM

## Tracking (section 06)

- `ViewContent` on load, `Lead` on form submission and on click to call
- Browser and server share an event ID so the Conversions API deduplicates
- `Schedule` helper exists but is not fired from the page: booking happens on
  the call, so it should be sent server-side from the CRM
- UTMs, `fbclid` and `gclid` captured on landing and submitted with the lead

## Deliberate deviations

Each of these departs from the drawing. Say the word and any can be reverted.

Mobile geometry was matched by diffing computed styles against the wireframe's
own rendered phone frame, element by element. Heights are identical for the
header, hero, trust tiles, buttons, chips, form fields, price cards, steps,
suitability cards, FAQ rows, placeholders and footer.

1. **Chips are not pre-selected.** The wireframe shows "Firmness and lift" and
   "Afternoon" in the selected state. Pre-selecting them would record a default
   answer for anyone who does not tap, which corrupts the qualification data the
   call team relies on, and it removes the engagement step the wireframe says
   lifts completion. Both questions are required instead.
2. **Chip text is darker and bolder than drawn**, at the client's request:
   `#1A1A1A` unselected rather than `#4A4A4A`, and weight 700 selected rather
   than 600. Box geometry is the wireframe's exactly.
3. **Two colour tokens darkened.** The wireframe accent (`#8C6B4F`) is 4.4:1 on
   the soft background and its muted grey (`#8A8279`) is 3.8:1 on white, both
   below WCAG AA for small text. They carry the legal and compliance micro-copy,
   so `accent-ink` (`#7A5C42`) and `muted` (`#6E675F`) are used for text. The
   original tones remain for borders and for the logo placeholder.
4. **Form inputs are 16px on mobile**, not the 12px drawn. Anything smaller makes
   iOS Safari zoom the viewport on focus, which throws the visitor out of the
   form mid-entry. Padding and line-height are tuned so the box still lands
   within 2px of the drawn 42px.
5. **Tap targets are extended invisibly, not by inflating boxes.** The drawn chip
   is 35px and the header call link 17px, both below a comfortable thumb target.
   Rather than growing them, a transparent `::after` extends the tappable area
   to 41px and 45px, so the visual matches the wireframe and the page still
   works with a thumb. Everything else already meets 44px.
6. **A typographic breakpoint at 768px.** The wireframe draws one mobile frame
   and one desktop layout. Between them, 13px copy across a full tablet width is
   unreadable, so `md` raises the type scale and caps the measure while the
   layout stays single column until `lg`.
7. **The FAQ is a real accordion.** The wireframe draws six closed rows plus a
   separate box demonstrating an open answer, because a static mockup cannot
   show interaction. The build renders one accordion with the first item open.
8. **`.micro` keeps its 8px top margin.** The wireframe's own `.micro` class
   declares `margin-top: 8px`, but a `.screen p { margin: 0 }` rule in the mockup
   overrides it, so the rendered brief has none. The declared intent is used.
9. **An API route exists.** The scaffold was scoped as static-only, but the form
   has to post somewhere. `app/api/lead/route.ts` is the only server code.

## Additions beyond the wireframe

**Toasts on the call back form**, requested after the first build. Pressing
submit with anything missing raises a warning toast; a successful send raises a
success toast; a failed send raises an error toast.

The inline field errors and the confirmation panel both stay. A toast is
transient, so it cannot be the only place a visitor is told what is wrong, and
the wireframe's requirement to "show a confirmation that repeats the promise" is
not something that should disappear after seven seconds. The toast is the
attention-getter; the inline errors and the panel are the record.

With one field wrong, the toast carries that field's own message. With several,
it carries the count and the inline errors say which. A failed send also leaves
a persistent block above the button, because a visitor may act on it minutes
later.

## Outstanding, from section 07

Nothing below is invented in the build; each renders as a visible placeholder.

1. **The price conflict.** The build uses £750 and £1,500 as the wireframe does.
   The live Alteon page still advertises £900 and £2,100. That must be resolved
   and the live page corrected before launch, or stated plainly as a founding
   offer against a standard price.
2. **Founding places closing date** - `[TO CONFIRM]` in the offer micro-copy.
   Drop the sentence if the deadline is not real.
3. **Consented, unretouched before and after pack.** `beforeAfter.imagePackApproved`
   in `lib/content.ts` is `false`, so the caption carries the wireframe's "Do not
   publish until the consent and image pack is signed off" sentence. Flip it once
   the pack is signed off and the sentence drops away on its own.
4. **Practitioner name and registration** - the "Who carries out the treatment?"
   answer.
5. **Clinic legal name, registration and privacy policy link** - footer, and
   `clinic.legalName` / `clinic.privacyUrl` in `lib/site-config.ts`.
6. **Hero asset** - still or short clip. Placeholder in place.

Also outstanding: five of the six FAQ answers. Only the downtime answer exists
in the approved claim set. The rest render `[TO CONFIRM]` and are excluded from
the FAQ structured data. The clinic phone number in `site-config.ts` is a
placeholder, so every call link currently dials nothing real.

## Compliance note

Carried over from the wireframe: this page is written to the claim set approved
in the CAP review of the campaign. It has not itself been through a fresh
compliance review, and it should go through one once the final copy, prices and
images are locked, before it goes live.
