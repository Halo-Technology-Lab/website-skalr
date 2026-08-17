/**
 * Every word on the landing page, in one file.
 *
 * Copy is taken verbatim from the Skalr mid-fidelity wireframe, which states it
 * uses the claim set approved in the CAP review of the campaign. Do not reword
 * anything here without a fresh compliance check - the wireframe is explicit
 * that the softened claim wording is what makes the page defensible.
 *
 * Items marked TO CONFIRM are the open questions listed in section 07 of the
 * wireframe. They render as visible placeholders rather than invented copy.
 */

export const TO_CONFIRM = '[TO CONFIRM]';

export const hero = {
  eyebrow: 'Beaufort Park, Colindale',
  headline: 'The Korean Magic Lift has landed in North London',
  body:
    'Alteon combines dual wavelength laser and radiofrequency to lift, tighten and sculpt without surgery or needles. Many patients notice a visible difference from their first session, with results developing over the following weeks.',
  mediaLabel: 'Hero image or 8 second treatment clip',
  trust: [
    '30 to 45 minutes',
    'Little to no downtime',
    'No surgery, no needles',
    'Practitioner led',
  ],
  cta: 'Book your consultation',
  micro:
    'Free consultation. Booking simply holds your place and there is no obligation to proceed.',
} as const;

export const form = {
  heading: 'Request a call back',
  intro:
    'One tap, three details, and we will call you back within five minutes during clinic hours.',
  concernLabel: 'What would you most like to improve?',
  concerns: [
    'Firmness and lift',
    'Jawline definition',
    'Fine lines',
    'Texture and pores',
  ],
  timingLabel: 'When suits you best?',
  timings: ['Morning', 'Afternoon', 'Evening', 'Any time'],
  firstNameLabel: 'First name',
  firstNamePlaceholder: 'Jane',
  phoneLabel: 'Mobile number',
  phonePlaceholder: '07700 000000',
  phoneHint: 'The number we will ring you on.',
  emailLabel: 'Email',
  emailPlaceholder: 'jane@example.com',
  consent:
    'I am happy to be contacted about this enquiry. I can opt out at any time.',
  submit: 'Request my call back',
  micro:
    'Three fields, about twenty seconds. We use your details only to contact you about this enquiry. Over 18s only, and there is no obligation to proceed.',
  success: {
    heading: 'Thank you, we have your details',
    body:
      'A member of the clinic team will call you back within five minutes during clinic hours, on the number you gave us. If we miss you, we will email you instead.',
    micro:
      'Nothing is booked yet and there is no obligation to proceed. Your consultation slot is confirmed on the call.',
  },
  failure: {
    heading: 'That did not send',
    body: 'Something went wrong at our end. Please try again, or call the clinic directly.',
  },
} as const;

export const valueAnchor = {
  eyebrow: 'Why the price looks like this',
  heading: 'The same category of technology, without the usual price tag',
  body:
    'Comparable dual laser and radiofrequency platforms carry a device cost several times higher, and clinics typically charge in the region of £2,000 per session to cover it. Alteon delivers the same class of treatment on a more affordable platform, so we can offer it at a fraction of that.',
  comparisonLabel: 'Comparable platform',
  comparisonPrice: 'around £2,000',
  ourLabel: 'Alteon at Colindale',
  ourPrice: '£750',
  micro:
    'Comparison based on typical published pricing for that device class. Individual clinics vary.',
} as const;

export const offer = {
  heading: 'Choose how you start',
  cards: [
    {
      name: 'Course of three',
      price: '£1,500',
      body:
        'Works out at £500 a session. The full course most patients are recommended for the fullest result.',
      recommended: true,
      badge: 'Most chosen',
    },
    {
      name: 'Single session',
      price: '£750',
      body: 'See how your own skin responds before committing to a course.',
      recommended: false,
    },
  ],
  // The closing date is question 2 in section 07 of the wireframe. It must be a
  // date the clinic will actually honour, or the sentence gets dropped.
  micro: `Prices include the treatment as described. Your practitioner confirms what is suitable for you at consultation. Founding places at Colindale are limited by clinic diary capacity and close on ${TO_CONFIRM}.`,
  cta: 'Book your consultation',
} as const;

export const howItWorks = {
  eyebrow: 'The science',
  heading: 'What the device actually does',
  steps: [
    {
      title: 'Dual wavelength laser',
      body:
        'Two wavelengths, 980 and 1064 nanometres, work at different depths in the skin.',
    },
    {
      title: 'Monopolar and bipolar radiofrequency',
      body:
        'Controlled thermal energy is delivered through several specialised modes, including column and fractional.',
    },
    {
      title: 'Your own collagen responds',
      body:
        'The energy stimulates fibroblast activity, which supports collagen and elastin production over the following weeks.',
    },
  ],
} as const;

export const beforeAfter = {
  heading: 'Before and after',
  pairs: [{ before: 'Before', after: 'After' }],
  micro:
    'Real patients, photographed under the same lighting and angle, unretouched, shared with written consent. Individual results vary.',
  // Wireframe note 6: this section stays a placeholder until the consented,
  // unretouched image pack exists. Flip to true only once it is signed off.
  imagePackApproved: false,
} as const;

export const suitability = {
  heading: 'Is it right for you?',
  columns: [
    {
      title: 'A good fit if',
      body:
        'You want firmer, more defined skin without surgery or injectables, you are comfortable with a result that develops over several weeks, and you can get to Colindale.',
    },
    {
      title: 'Not suitable if',
      body:
        'You are pregnant or breastfeeding, have an active skin infection in the area, or have certain implanted electronic devices. Your practitioner will go through your full history at consultation. We treat over 18s only.',
    },
  ],
  micro: 'If it is not right for you, we will tell you so at the consultation.',
} as const;

/**
 * Six questions in the order the wireframe sets, which is how often they stop a
 * booking. Only the downtime answer is written in the wireframe; the other five
 * are held as placeholders on purpose. These are medical advertising claims and
 * must come from the approved claim set, not from us.
 */
export const faq = {
  heading: 'Your questions',
  items: [
    {
      question: 'Is there any downtime?',
      answer:
        'Very little. Most people return to their usual activities the same day. Mild redness or warmth is possible and usually settles within a few hours.',
    },
    { question: 'Does it hurt?', answer: null },
    { question: 'When will I see a difference?', answer: null },
    { question: 'How long do results last?', answer: null },
    { question: 'How many sessions will I need?', answer: null },
    // Section 07, item 4: needs the practitioner name and registration.
    { question: 'Who carries out the treatment?', answer: null },
  ] as ReadonlyArray<{ question: string; answer: string | null }>,
  placeholderAnswer: `${TO_CONFIRM} Awaiting approved wording from the CAP-reviewed claim set.`,
} as const;

export const location = {
  heading: 'Finding us',
  mapLabel: 'Map',
  venue: 'Beaufort Park',
  address: '12 Boulevard Drive, London NW9 5QF',
  travel: 'Northern line to Colindale, then a short walk. Parking on site.',
} as const;

export const finalCta = {
  heading: 'Ready to see if Alteon suits your skin?',
  body:
    'Book a consultation and we will assess your skin honestly, with no obligation to go ahead.',
  primary: 'Book your consultation',
  secondary: 'Call the clinic',
} as const;

export const stickyBar = {
  primary: 'Book consultation',
  secondary: 'Call',
} as const;

// Section 07, item 5: clinic legal name, registration and privacy policy link.
export const footer = {
  legal:
    'Over 18s only. Results vary between individuals and are not guaranteed. Suitability is confirmed at consultation. Treatment carried out by a qualified practitioner.',
  placeholder: `${TO_CONFIRM} Clinic legal name, registration and privacy policy link.`,
} as const;

/** Anchor the booking CTAs point at. */
export const FORM_ANCHOR = 'request-a-call-back';
