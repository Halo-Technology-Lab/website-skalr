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

/**
 * DE-BRANDED FROM "ALTEON", and it was not a find-and-replace.
 *
 * The device name has been taken off the page in favour of the clinic brand.
 * Three of the five occurrences could not simply become "Hannah London" without
 * breaking the sentence or changing what it claims:
 *
 *   hero.body        "Alteon combines dual wavelength laser and radiofrequency"
 *                    -> "The treatment combines ...". The clinic is not a laser
 *                    platform, so the clinic name cannot be the subject here.
 *   finalCta.heading "if Alteon suits your skin" -> "if the treatment suits your
 *                    skin". Asking whether HANNAH LONDON suits your skin asks
 *                    about the clinic, not the treatment.
 *   video label      the device name simply dropped.
 *
 * The other two - the price row label and the value-anchor sentence, where the
 * subject really is the clinic - took the clinic name directly.
 *
 * Nothing was added and no claim was strengthened: every edit either swaps a
 * proper noun or replaces it with the neutral "the treatment". It still touches
 * the CAP-reviewed claim set, so it needs sign-off before go-live.
 */

export const TO_CONFIRM = '[TO CONFIRM]';

export const hero = {
  eyebrow: 'Beaufort Park, Colindale',
  headline: 'The Korean Magic Lift has landed in North London',
  body:
    'The treatment combines dual wavelength laser and radiofrequency to lift, tighten and sculpt without surgery or needles. Many patients notice a visible difference from their first session, with results developing over the following weeks.',
  media: {
    /**
     * The client's own brand film, which runs as the hero on hannahlondon.com.
     * It plays full-bleed behind the whole fold, under the sage scrim.
     *
     * DECORATIVE. It is aria-hidden and has no accessible name on purpose: it
     * carries nothing the headline and body beside it do not already say, and
     * announcing a wordless montage adds noise rather than meaning. Only its
     * pause control is exposed.
     *
     * Trimmed from a 53.6s 1920x1080 15.5MB master to a 16s loop at 1600x900
     * and 1.4MB, with the audio dropped, by scripts/optimize-video.mjs - which
     * also records why that particular 16 seconds.
     */
    brandVideo: {
      src: '/video/brand-hero.mp4',
      poster: '/video/brand-hero-poster.webp',
      width: 1600,
      height: 900,
      play: 'Play background video',
      pause: 'Pause background video',
    },

    /**
     * A 9:16 social cut, kept in its native portrait shape on purpose.
     *
     * It cannot be cropped to landscape: the clip carries burnt-in subtitles at
     * roughly two thirds height, and it ends on a full-frame before and after.
     * Any crop to a wide box destroys both.
     *
     * It fills the width of its column at every breakpoint - see
     * .treatment-video in globals.css for why. It now lives in the How it works
     * band rather than the hero; the key `hero.media.video` is kept because the
     * clip is still the hero of that section's argument.
     *
     * Encoded from a 20MB 1080x1920 50fps master down to 3.1MB at 810x1440 and
     * 25fps by scripts/optimize-video.mjs, which explains the settings.
     */
    video: {
      src: '/video/hero-treatment.mp4',
      poster: '/video/hero-treatment-poster.webp',
      width: 810,
      height: 1440,
      /**
       * The accessible name for the clip. It autoplays MUTED, because every
       * browser blocks autoplay with sound - so this description and the clip's
       * own burnt-in subtitles are what carry it to anyone not hearing the
       * voiceover.
       */
      label:
        'A practitioner explains how the treatment works, a patient is treated, and the clip ends on that patient’s before and after. Subtitles are shown on the clip itself.',
      play: 'Play video',
      pause: 'Pause video',
    },

  },
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
  toasts: {
    success: {
      title: 'Request sent',
      message:
        'We will call you back within five minutes during clinic hours.',
    },
    warning: {
      title: 'Check the form',
      // {n} is replaced with the number of fields still to fix. When only one
      // is wrong, the field's own message is used instead of a count.
      message: '{n} things to check before we can call you back.',
    },
    error: {
      title: 'That did not send',
      message: 'Please try again, or call the clinic directly.',
    },
  },
} as const;

export const valueAnchor = {
  eyebrow: 'Why the price looks like this',
  heading: 'The same category of technology, without the usual price tag',
  body:
    'Comparable dual laser and radiofrequency platforms carry a device cost several times higher, and clinics typically charge in the region of £2,000 per session to cover it. Hannah London delivers the same class of treatment on a more affordable platform, so we can offer it at a fraction of that.',
  comparisonLabel: 'Comparable platform',
  comparisonPrice: 'around £2,000',
  ourLabel: 'Hannah London at Colindale',
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
  beforeLabel: 'Before',
  afterLabel: 'After',
  /**
   * One entry per consented pair, stepped through by the navigation toggle.
   *
   * Patients are numbered, not named. These paths and this alt text are public,
   * and consent to publish a photograph is not consent to publish a name. If the
   * consent does cover names, they can be added here and nowhere else.
   *
   * Frames are the front-on view of each subject, cropped 4:5 by
   * scripts/optimize-images.mjs. Nothing is retouched, rescaled or colour
   * corrected - the caption below claims as much, and normalising one half of a
   * pair to match the other would make that claim untrue.
   */
  pairs: [
    {
      id: 'pair-1',
      before: '/images/results/patient-1-before.webp',
      after: '/images/results/patient-1-after.webp',
      beforeAlt: 'Patient one before treatment, facing the camera',
      afterAlt: 'Patient one after treatment, facing the camera',
    },
    {
      id: 'pair-2',
      before: '/images/results/patient-2-before.webp',
      after: '/images/results/patient-2-after.webp',
      beforeAlt: 'Patient two before treatment, facing the camera',
      afterAlt: 'Patient two after treatment, facing the camera',
    },
    {
      id: 'pair-3',
      before: '/images/results/patient-3-before.webp',
      after: '/images/results/patient-3-after.webp',
      beforeAlt: 'Patient three before treatment, facing the camera',
      afterAlt: 'Patient three after treatment, facing the camera',
    },
  ],
  /** Intrinsic size of every results image. Set by scripts/optimize-images.mjs. */
  imageWidth: 800,
  imageHeight: 1000,
  groupLabel: 'Before and after results',
  previous: 'Previous pair',
  next: 'Next pair',
  /** {n} and {total} are substituted. Used for the dot labels. */
  pairLabel: 'Pair {n} of {total}',
  micro:
    'Real patients, photographed under the same lighting and angle, unretouched, shared with written consent. Individual results vary.',
  // Appended to the caption above, as one paragraph, exactly as the wireframe
  // sets it. Drops away once the pack is approved.
  hold: 'Do not publish until the consent and image pack is signed off.',
  // Wireframe note 6: this section stayed a placeholder until the consented,
  // unretouched image pack existed. Signed off and confirmed by the client on
  // 17 August 2026, so the hold sentence no longer renders.
  imagePackApproved: true,
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
  venue: 'Beaufort Park',
  address: '12 Boulevard Drive, London NW9 5QF',
  travel: 'Northern line to Colindale, then a short walk. Parking on site.',
  /**
   * The map is generated by scripts/build-map.mjs from raw OpenStreetMap data and
   * committed as a static SVG, so the page makes one cached request and no
   * third-party request at all. Run `npm run build-map` to regenerate.
   */
  map: {
    src: '/images/map/colindale-beaufort-park.svg',
    width: 1600,
    height: 900,
    /**
     * The basemap SVG carries no text, so this is the whole map as far as a
     * screen reader is concerned. It has to say what the picture says.
     */
    alt:
      'Map of Colindale. Colindale Underground station sits to the west, and the clinic is about 600 metres east on Boulevard Drive in Beaufort Park.',
    /**
     * Pin positions as percentages of the map box, printed by
     * npm run build-map. Do not hand-tune them: they come from the Web Mercator
     * projection of the bounding box lat 51.592774..51.598273,
     * lon -0.253200..-0.237466, and re-running the script reproduces them.
     */
    pins: [
      { id: 'station', label: 'Colindale', sub: 'Northern line', left: 21.0, top: 51.57 },
      { id: 'clinic', label: 'The clinic', sub: 'Beaufort Park', left: 79.0, top: 48.43 },
    ],
    /**
     * Required by the Open Database Licence, because the geometry in that SVG is
     * derived from OpenStreetMap. Not decoration - do not remove it.
     */
    attribution: 'Map data © OpenStreetMap contributors',
  },
} as const;

export const finalCta = {
  heading: 'Ready to see if the treatment suits your skin?',
  body:
    'Book a consultation and we will assess your skin honestly, with no obligation to go ahead.',
  primary: 'Book your consultation',
  secondary: 'Call the clinic',
} as const;

/**
 * The practitioner band, modelled on the same band on the client's home page.
 *
 * COMPLIANCE, READ BEFORE EDITING. This is the client's OWN published copy from
 * hannahlondon.com, with one sentence removed and nothing whatsoever added:
 *
 *   "Step into our award-winning London clinics in Harley Street and Colindale,
 *    and discover a world where state-of-the-art medicine meets unrivalled
 *    comfort and care."
 *
 * It names Harley Street, and section 03 of the brand reference is explicit that
 * this campaign page carries the Colindale clinic only. It also carries
 * "award-winning", which is a claim outside the CAP-reviewed set for this
 * campaign.
 *
 * Removing claims cannot introduce one, which is why this is defensible to build
 * against. It still needs sign-off before go-live.
 *
 * `registration` is deliberately null. The brand reference names Dr Kaywaan Khan
 * as lead clinician but gives no registration number, and that number is exactly
 * what the "Who carries out the treatment?" FAQ needs and cannot yet have.
 */
export const practitioner = {
  quote: [
    'Treating patients holistically is not just my passion, it\u2019s my commitment.',
    'Your story is unique, and we honour that individuality from your very first consultation through to our exceptional aftercare.',
    'I can\u2019t wait to welcome you into our Hannah London family.',
  ],
  name: 'Dr Kaywaan Khan',
  role: 'Lead clinician',
  registration: null,
  photo: {
    src: '/images/practitioner/dr-kaywaan-khan.webp',
    alt: 'Dr Kaywaan Khan, lead clinician at Hannah London',
    width: 800,
    height: 1240,
  },
} as const;

/**
 * Clinic opening hours.
 *
 * The brand reference flags its own value here: the hours were read off the
 * booking calendar, and the client's site does not publish opening times. Until
 * the clinic confirms them, `confirmed` stays false and the page renders the
 * placeholder rather than a time someone might turn up for.
 *
 * This matters more than a normal placeholder because form.intro promises a call
 * back "within five minutes during clinic hours", and that sentence only means
 * something if the hours are stated somewhere.
 */
export const hours = {
  label: 'Clinic hours',
  value: 'Monday to Friday, 8am to 5pm',
  confirmed: false,
  placeholder: `${TO_CONFIRM} Clinic opening hours.`,
} as const;

export const stickyBar = {
  primary: 'Book consultation',
  secondary: 'Call',
} as const;

/**
 * Wireframe section 07 item 5 is now closed: the clinic legal name, the company
 * and ICO registrations and the policy links all come from section 03 of the
 * brand reference, confirmed against the footer of the client's live site.
 *
 * `legal` is the reference's own footer wording verbatim. Note it reads
 * "Treatment IS carried out by a qualified practitioner" where the wireframe had
 * "Treatment carried out"; the reference's phrasing wins, because this is the
 * client's own legal line rather than campaign copy.
 */
export const footer = {
  legal:
    'Over 18s only. Results vary between individuals and are not guaranteed. Suitability is confirmed at consultation. Treatment is carried out by a qualified practitioner.',
  privacyLabel: 'Privacy Policy',
  termsLabel: 'Terms and Conditions',
} as const;

/** Anchor the booking CTAs point at. */
export const FORM_ANCHOR = 'request-a-call-back';
