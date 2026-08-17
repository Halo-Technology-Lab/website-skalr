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

1. **Chips are not pre-selected.** The wireframe shows "Firmness and lift" and
   "Afternoon" in the selected state. Pre-selecting them would record a default
   answer for anyone who does not tap, which corrupts the qualification data the
   call team relies on, and it removes the engagement step the wireframe says
   lifts completion. Both questions are required instead.
2. **Two colour tokens darkened.** The wireframe accent (`#8C6B4F`) is 4.4:1 on
   the soft background and its muted grey (`#8A8279`) is 3.8:1 on white, both
   below WCAG AA for small text. They carry the legal and compliance micro-copy,
   so `accent-ink` (`#7A5C42`) and `muted` (`#6E675F`) are used for text. The
   original tones remain for borders.
3. **Form inputs are 16px on mobile**, not the 12px drawn. Anything smaller makes
   iOS Safari zoom the viewport on focus, which throws the visitor out of the
   form mid-entry.
4. **A typographic breakpoint at 768px.** The wireframe draws one mobile frame
   and one desktop layout. Between them, 13px copy across a full tablet width is
   unreadable, so `md` raises the type scale and caps the measure while the
   layout stays single column until `lg`.
5. **An API route exists.** The scaffold was scoped as static-only, but the form
   has to post somewhere. `app/api/lead/route.ts` is the only server code.

## Outstanding, from section 07

Nothing below is invented in the build; each renders as a visible placeholder.

1. **The price conflict.** The build uses £750 and £1,500 as the wireframe does.
   The live Alteon page still advertises £900 and £2,100. That must be resolved
   and the live page corrected before launch, or stated plainly as a founding
   offer against a standard price.
2. **Founding places closing date** - `[TO CONFIRM]` in the offer micro-copy.
   Drop the sentence if the deadline is not real.
3. **Consented, unretouched before and after pack.** `beforeAfter.imagePackApproved`
   in `lib/content.ts` is `false`, and the section renders a hold notice. Flip it
   only once the pack is signed off, and remove the notice.
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
