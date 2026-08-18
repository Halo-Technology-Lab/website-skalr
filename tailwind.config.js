/**
 * Design tokens for the Hannah London brand.
 *
 * Source of truth: "Hannah London - Brand Reference for Developer" (Skalr,
 * developer handoff), cross-checked against the live site's own CSS at
 * hannahlondon.com. The wireframe's neutral stand-in palette that used to live
 * here has been retired - the wireframe now governs STRUCTURE and COPY only.
 *
 * ---------------------------------------------------------------------------
 * Deliberate departures from the reference, and why
 * ---------------------------------------------------------------------------
 *
 * The reference itself sets the precedent for this: it tells us NOT to copy the
 * live site's primary button, which is #f1f1f1 with a white label and lands at
 * 1.13:1. The same test applied to the rest of the palette turns up three more.
 *
 *   1. `copy-mute` #8e8e8e is 3.28:1 on white. The live site uses it for ALL
 *      body copy and for headings. It is kept, but restricted to 24px+ (where
 *      3:1 is the AA bar) and to decoration. Body copy uses `copy` #6d6e70 at
 *      5.10:1, which the reference names as "Body text" anyway.
 *
 *   2. `copy` #6d6e70 is 4.37:1 on the `surface-sage` tint - a hair under AA.
 *      Copy sitting directly on a tint steps to `sage-ink` #5f6a64 (4.82:1).
 *      Both are reference colours; nothing here is invented.
 *
 *   3. `field` is #8e8e8e, not the reference's `line-soft` #c7c8c8. Input and
 *      chip borders are non-text UI and need 3:1 under WCAG 1.4.11; #c7c8c8 is
 *      about 1.9:1 on white. `line-soft` is retained for hairlines, where no
 *      contrast rule applies.
 *
 *   4. `sage-deeper` #415451 is derived, roughly a 12% darkening of sage-deep.
 *      The reference names sage-deep as the HOVER for a button fill we are
 *      rejecting on contrast, so promoting sage-deep to the fill left the hover
 *      state with nothing to point at.
 *
 * Measured contrast on white: sage-deep 6.05, sage-ink 5.63, copy 5.10,
 * copy-mute 3.28, sage 2.62. White on sage-deep is also 6.05.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        'sage-deep': '#506766', // primary button fill, links, eyebrows
        'sage-deeper': '#415451', // derived, hover only - see note 4
        sage: '#96a39a',
        'sage-light': '#9ba89f',
        'sage-mid': '#8aa290',
        'sage-ink': '#5f6a64', // headings, and body copy on tints

        // Text and lines. Named `copy` rather than `body` so `text-copy`
        // (colour) never collides with `text-body` (the font-size token).
        copy: '#6d6e70',
        'copy-mute': '#8e8e8e', // 24px+ or decoration ONLY - see note 1
        line: '#ebebeb',
        'line-soft': '#c7c8c8', // hairlines only, never a control border
        field: '#8e8e8e', // see note 3

        // Surfaces
        'surface-grey': '#f1f1f1',
        'surface-grey-50': '#edefef',
        'surface-sage': '#e9efe8',
        'surface-sage-2': '#ecf2ee',
        'surface-mist': '#e8edee',
        'surface-mist-2': '#e0ebea',

        // Status. `warning` is 1.9:1 on white and is an accent rule or icon
        // only - never text. The other three all clear AA on white.
        success: '#13612e',
        info: '#1159af',
        error: '#b82105',
        warning: '#f5a524',
      },
      fontFamily: {
        // Both self-hosted through next/font in app/layout.tsx. The reference
        // supplies a <link> to fonts.googleapis.com instead - do NOT use it, the
        // CSP in next.config.js sets font-src 'self' and the page would fall
        // back to Georgia and Verdana.
        serif: ['var(--font-gelasio)', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['var(--font-nunito)', 'Verdana', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // The reference's own clamp values, verbatim. Its "typical use" column
        // describes the marketing site; the mapping below is this campaign
        // page's, which runs nine bands rather than three.
        //
        // `display` (fs-xxxl) and `xl` (fs-xl) are defined and available but
        // unused: at a 36px floor, headings like "The same category of
        // technology, without the usual price tag" run to four lines on a 390px
        // viewport.
        display: ['clamp(2.75rem, 0.489rem + 7.065vw, 6rem)', { lineHeight: '1.1' }],
        xl: ['clamp(2.25rem, 1.728rem + 1.63vw, 3rem)', { lineHeight: '1.15' }],

        h1: ['clamp(2.5rem, 1.456rem + 3.26vw, 4rem)', { lineHeight: '1.1' }], // 40 -> 64
        h2: ['clamp(1.75rem, 1.576rem + 0.543vw, 2rem)', { lineHeight: '1.2' }], // 28 -> 32
        price: ['clamp(1.75rem, 1.576rem + 0.543vw, 2rem)', { lineHeight: '1.1' }],
        h3: ['clamp(1.1rem, 0.995rem + 0.326vw, 1.25rem)', { lineHeight: '1.35' }], // 17.6 -> 20
        lead: ['clamp(1.1rem, 0.995rem + 0.326vw, 1.25rem)', { lineHeight: '1.55' }],

        // Reference note 2: 16px is the floor on mobile, and 400 is the weight
        // floor. This token is a fixed 1rem, not a clamp, so it can never go
        // under that on any viewport.
        body: ['1rem', { lineHeight: '1.6' }],

        // Captions, micro-copy and the legal block.
        micro: ['clamp(0.8rem, 0.73rem + 0.217vw, 0.9rem)', { lineHeight: '1.5' }],
        eyebrow: [
          'clamp(0.8rem, 0.73rem + 0.217vw, 0.9rem)',
          { lineHeight: '1.5', letterSpacing: '0.2em' },
        ],
      },
      maxWidth: {
        // The live site's own --content-width and --content-narrow-width.
        page: '1290px',
        prose: '842px',
      },
      borderRadius: {
        /*
         * Three tiers, measured off the client's live site rather than picked.
         * Their CSS declares 15px and 10px about equally often and 5px for
         * controls, and the computed values on the rendered page line up:
         *
         *   15px  the call-back card, the practitioner band, the treatment
         *         cards, and any photo given a frame of its own
         *   10px  secondary boxes - the appointments modal, blog thumbnails,
         *         video embeds, search inputs
         *    5px  the call-back form's submit button
         *
         * Two details worth copying: a button sitting flush to a card edge gets
         * NO radius there (it inherits the card's corner instead), and pill
         * controls go fully round rather than taking a tier.
         */
        card: '15px',
        tile: '10px',
        control: '5px',
      },
      boxShadow: {
        // Matches the live site's .request-call-back-col, retinted from black
        // to sage so it reads warm against the palette rather than grey.
        card: '5px 5px 5px rgba(80,103,102,.10)',
        bar: '0 -1px 12px rgba(80,103,102,.12)',
        toast: '0 6px 24px rgba(80,103,102,.18)',
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        // The global prefers-reduced-motion rule in globals.css collapses this.
        'toast-in': 'toast-in 180ms cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
};
