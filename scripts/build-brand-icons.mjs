/**
 * Generates the favicons and the Open Graph card from the traced brand mark.
 *
 * Run: npm run build-icons  (after npm run trace-brand)
 *
 * The favicon is the client's OWN icon - the standalone crest they serve at
 * hannahlondon.com - traced from their 150x150 JPEG so it stays crisp at the
 * 180px apple-touch size, where upscaling that bitmap would go soft. It is the
 * crest alone for the same reason they use it: at 32px the oval cameo's ring
 * closes into a filled blob and the wordmark under it is unreadable.
 *
 * The OG card is a flat sage panel with the full oval lockup reversed out of it.
 * It is deliberately typographic rather than a photograph: a still from the
 * treatment footage would be a claim surface, and OG cards are cropped
 * unpredictably by every platform that renders them.
 */

import { promises as fs } from 'node:fs';

import sharp from 'sharp';

import { brandMarks } from '../lib/brand-marks.ts';

const SAGE = '#506766';
const OUT_ICONS = 'public/favicons';
const OUT_OG = 'public/og-image.png';

const svg = (viewBox, d, fill) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">` +
      `<path d="${d}" fill="${fill}" fill-rule="evenodd"/></svg>`
  );

await fs.mkdir(OUT_ICONS, { recursive: true });

const { viewBox: ICON_BOX, d: ICON_D } = brandMarks.crestIcon;
const crest = svg(ICON_BOX, ICON_D, SAGE);
const crestWhite = svg(ICON_BOX, ICON_D, '#ffffff');

// Square canvas, mark centred with breathing room, transparent ground.
async function icon(size, out, source = crest) {
  const inner = Math.round(size * 0.78);
  const mark = await sharp(source).resize(inner, inner, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).png().toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toFile(out);
}

// Maskable icons need an opaque ground: Android crops them to a circle and a
// transparent PNG shows the launcher's own background through the corners.
async function maskable(size, out) {
  const inner = Math.round(size * 0.6);
  const mark = await sharp(crestWhite).resize(inner, inner, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).png().toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background: SAGE } })
    .composite([{ input: mark, gravity: 'centre' }])
    .png()
    .toFile(out);
}

// PNGs, not an SVG favicon. The traced crest is one 46KB path, and cropping the
// viewBox to the crest hides the wordmark geometry without removing it from the
// file - so an SVG favicon would ship 46KB to draw 32 pixels. Rasterised, the
// same icon is about 1KB.
await icon(32, `${OUT_ICONS}/favicon-32x32.png`);
await icon(16, `${OUT_ICONS}/favicon-16x16.png`);
await icon(180, `${OUT_ICONS}/apple-touch-icon.png`);
await maskable(192, `${OUT_ICONS}/web-app-manifest-192x192.png`);
await maskable(512, `${OUT_ICONS}/web-app-manifest-512x512.png`);

// Open Graph card, 1200x630.
const ogMark = await sharp(svg(brandMarks.lockup.viewBox, brandMarks.lockup.d, '#ffffff'))
  .resize(520, null, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({ create: { width: 1200, height: 630, channels: 4, background: SAGE } })
  .composite([{ input: ogMark, gravity: 'centre' }])
  .png()
  .toFile(OUT_OG);

const files = [
  `${OUT_ICONS}/favicon-16x16.png`,
  `${OUT_ICONS}/favicon-32x32.png`,
  `${OUT_ICONS}/apple-touch-icon.png`,
  `${OUT_ICONS}/web-app-manifest-192x192.png`,
  `${OUT_ICONS}/web-app-manifest-512x512.png`,
  OUT_OG,
];
for (const f of files) {
  const { size } = await fs.stat(f);
  console.log(`${f.padEnd(46)} ${(size / 1024).toFixed(1)}KB`);
}
