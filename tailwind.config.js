/**
 * Design tokens taken directly from the Skalr mid-fidelity wireframe.
 *
 * The wireframe is explicit that its palette is "a neutral stand-in rather than
 * a brand palette". These tokens reproduce it exactly so the build matches the
 * approved structure; when the clinic brand palette arrives, change the hex
 * values here and nothing else needs touching.
 *
 * Two text colours are deliberately a shade darker than the wireframe:
 *   accent-ink  (#7A5C42 vs #8C6B4F) - the wireframe accent falls to 4.4:1 on
 *               the soft background, just under WCAG AA for small text
 *   muted       (#6E675F vs #8A8279) - the wireframe tone is 3.8:1 on white,
 *               and it is used for the legal and compliance micro-copy
 * The original tones remain available as `accent` and `muted-line` for borders
 * and decorative use, where contrast rules do not apply.
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
        ink: '#1A1A1A',
        // Named `copy` rather than `body` so `text-copy` (colour) never collides
        // with `text-body` (the 13px font-size token below).
        copy: '#4A4A4A',
        line: '#E3E0DC',
        soft: '#F6F4F1',
        accent: '#8C6B4F',
        'accent-ink': '#7A5C42',
        'accent-soft': '#F0E8E0',
        muted: '#6E675F',
        'muted-line': '#8A8279',
        field: '#D6D0C8',
        ghost: '#B9B2A9',
        danger: '#991B1B',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Mobile scale, exactly as drawn in the 390px wireframe frame.
        eyebrow: ['0.625rem', { lineHeight: '1.2', letterSpacing: '0.2em' }], // 10px
        micro: ['0.6875rem', { lineHeight: '1.45' }], // 11px
        caption: ['0.75rem', { lineHeight: '1.5' }], // 12px
        body: ['0.8125rem', { lineHeight: '1.55' }], // 13px
        'body-lg': ['0.875rem', { lineHeight: '1.55' }], // 14px
        lead: ['1rem', { lineHeight: '1.55' }], // 16px
        h3: ['1.0625rem', { lineHeight: '1.3' }], // 17px
        h2: ['1.1875rem', { lineHeight: '1.25' }], // 19px
        price: ['1.4375rem', { lineHeight: '1.1' }], // 23px
        h1: ['1.5625rem', { lineHeight: '1.15', letterSpacing: '-0.012em' }], // 25px
        // Desktop step-ups.
        'h1-lg': ['2.75rem', { lineHeight: '1.08', letterSpacing: '-0.02em' }], // 44px
        'h2-lg': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 28px
        'price-lg': ['2rem', { lineHeight: '1.1' }], // 32px
      },
      maxWidth: {
        page: '1120px',
        prose: '68ch',
      },
      backgroundImage: {
        // Diagonal hatch used for every media placeholder, straight from the
        // wireframe. Costs zero network requests, which is why it is CSS.
        placeholder:
          'repeating-linear-gradient(45deg,#EFEBE6,#EFEBE6 9px,#E7E2DB 9px,#E7E2DB 18px)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,26,26,.04)',
        bar: '0 -1px 12px rgba(26,26,26,.08)',
      },
    },
  },
  plugins: [],
};
