/**
 * Traces the client's brand marks from bitmap to SVG.
 *
 * Run: npm run trace-brand
 *
 * Why trace rather than ship the PNGs. The header renders the mark at two sizes
 * across two states (transparent over the hero, solid once scrolled), the hero
 * renders it large, and the footer renders it small. The crest is built from
 * hairline spirals and the wordmark from a high-contrast didone with very thin
 * serifs - exactly the detail that fringes and breaks up when a bitmap is scaled
 * down. One path set at any size solves it.
 *
 * The second reason is colour. Every source is a single-colour mark, so tracing
 * lets the output carry `fill="currentColor"` and inherit from CSS: white over
 * the hero video, sage-ink in the footer, from one file. Shipping bitmaps would
 * mean a separate light and dark file for each mark, kept in step by hand.
 *
 * Two kinds of source:
 *
 *   bitmap  traced to a path with potrace (the supplied lockup artwork, and the
 *           crest icon the client serves as their own favicon)
 *   vector  already an SVG from the client's site - its paths are extracted and
 *           merged, NOT re-traced. Re-tracing a vector through a bitmap only
 *           ever loses fidelity.
 *
 * How each bitmap source is prepared:
 *
 *   - The two lockups are transparent PNGs, so the ALPHA channel already is the
 *     shape and the RGB is irrelevant (one of them is white artwork, the other
 *     black - tracing alpha makes that difference disappear). Alpha is extracted
 *     and inverted so the mark is black on white, which is what potrace wants.
 *   - The signature is a JPEG on an off-white ground, which is how the client's
 *     site serves it. Their site hides that ground with `mix-blend-mode: darken`;
 *     that trick only works on a white surface and the practitioner band is not
 *     white, so it is thresholded out here instead. It also carries a 1-2px
 *     compression frame around the edge, cropped off before the threshold or it
 *     traces as a rectangle around the mark.
 *
 * Tuning notes, so these numbers are not re-guessed later:
 *   - turdSize 2 on the lockups. Higher despeckles the fine spirals inside the
 *     crest; lower keeps JPEG/alpha noise.
 *   - The signature is upscaled 4x before tracing. The master is only 172x102 -
 *     the largest the client publishes - and tracing it at native size gives
 *     visibly polygonal curves on the long tail stroke.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import potrace from 'potrace';
import sharp from 'sharp';

const trace = promisify(potrace.trace);

const SRC_DIR = 'assets/source/brand';
const OUT_DIR = 'public/brand';
const TMP = path.join(OUT_DIR, '.trace-tmp.png');

/**
 * @typedef {object} Mark
 * @property {string}  key             Export name in lib/brand-marks.ts.
 * @property {string}  name
 * @property {string}  source
 * @property {string}  out
 * @property {'bitmap'|'vector'} kind
 * @property {string}  [fillRule]       Defaults to evenodd, which is what potrace needs.
 * @property {'alpha'|'luma'} [channel] Bitmap only. What carries the shape.
 * @property {number}  scale           Upscale factor before tracing.
 * @property {?number} trim            Pixels to crop off every edge first.
 * @property {number}  threshold
 * @property {number}  turdSize
 * @property {string}  title           Accessible title baked into the SVG.
 */

/** @type {Mark[]} */
const MARKS = [
  {
    key: 'lockup',
    name: 'oval cameo lockup',
    source: 'lockup-oval.png',
    out: 'lockup-oval.svg',
    kind: 'bitmap',
    channel: 'alpha',
    scale: 1,
    trim: null,
    threshold: 128,
    turdSize: 2,
    title: 'Hannah London',
  },
  {
    key: 'crest',
    name: 'crest lockup',
    source: 'lockup-crest.png',
    out: 'lockup-crest.svg',
    kind: 'bitmap',
    channel: 'alpha',
    scale: 1,
    trim: null,
    threshold: 128,
    turdSize: 2,
    title: 'Hannah London Medispa',
  },
  {
    key: 'signature',
    name: 'practitioner signature',
    source: 'signature.jpg',
    out: 'signature.svg',
    kind: 'bitmap',
    channel: 'luma',
    scale: 4,
    trim: 2,
    // The ground is around #f5f5f5 and the ink is near black, so anywhere in the
    // middle works. 160 keeps the thin tail strokes that 128 starts to drop.
    threshold: 160,
    turdSize: 2,
    title: 'Signature of Dr Kaywaan Khan',
  },
  {
    key: 'wordmark',
    name: 'HANNAH wordmark',
    source: 'han.svg',
    out: 'wordmark.svg',
    kind: 'vector',
    // The source draws six letters as six separate paths with no fill-rule, so
    // it renders under the default nonzero. Merged, that still gives the right
    // counters in the two A's, and the letters do not overlap. evenodd would
    // work here too, but there is no reason to change what the client ships.
    fillRule: 'nonzero',
    title: 'Hannah London',
  },
  {
    key: 'crestIcon',
    name: 'crest icon (favicon)',
    source: 'crest-icon.jpg',
    out: 'crest-icon.svg',
    kind: 'bitmap',
    channel: 'luma',
    scale: 4,
    trim: 1,
    threshold: 150,
    turdSize: 2,
    title: 'Hannah London',
  },
];

await fs.mkdir(OUT_DIR, { recursive: true });

/** @type {{key:string, viewBox:string, d:string, title:string}[]} */
const emitted = [];

for (const mark of MARKS) {
  const src = path.join(SRC_DIR, mark.source);
  try {
    await fs.access(src);
  } catch {
    console.error(`No source at ${src}. Masters are not committed - see assets/source/README.md.`);
    process.exitCode = 1;
    continue;
  }

  // Vector sources are already paths. Pull the geometry straight out rather
  // than rasterising and re-tracing, which would only lose fidelity.
  if (mark.kind === 'vector') {
    const raw = await fs.readFile(src, 'utf8');
    const box = /viewBox="([^"]+)"/.exec(raw)?.[1];
    const paths = [...raw.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
    if (!box || !paths.length) {
      console.error(`${src}: no viewBox or no <path> found.`);
      process.exitCode = 1;
      continue;
    }

    // Merge the subpaths into one `d`. The letters do not overlap, so this is
    // safe under either fill rule and it keeps the sprite to one <path> per mark.
    const d = paths.join(' ').replace(/\s+/g, ' ').trim();
    const out = path.join(OUT_DIR, mark.out);
    await fs.writeFile(
      out,
      dress(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">` +
          `<path d="${d}" fill="currentColor" fill-rule="${mark.fillRule ?? 'evenodd'}"/></svg>`,
        mark.title
      )
    );

    emitted.push({ key: mark.key, viewBox: box, d, title: mark.title, fillRule: mark.fillRule ?? 'evenodd' });
    const { size } = await fs.stat(out);
    console.log(
      `${mark.name.padEnd(24)} ${mark.source.padEnd(20)} -> ${mark.out.padEnd(18)} ` +
        `${String(Math.round(size / 1024) + 'KB').padStart(6)}  viewBox ${box}  (${paths.length} paths merged)`
    );
    continue;
  }

  const meta = await sharp(src).metadata();
  const crop = mark.trim
    ? {
        left: mark.trim,
        top: mark.trim,
        width: meta.width - mark.trim * 2,
        height: meta.height - mark.trim * 2,
      }
    : null;
  const width = crop ? crop.width : meta.width;
  const height = crop ? crop.height : meta.height;

  let img;
  if (mark.channel === 'alpha') {
    // The shape is the alpha channel and the RGB is irrelevant. Paint a black
    // canvas, give it the source's alpha, then flatten on white - that produces
    // a black mark on white whichever colour the source artwork happened to be.
    let a = sharp(src).ensureAlpha().extractChannel('alpha');
    if (crop) a = a.extract(crop);
    const alpha = await a.toColourspace('b-w').png().toBuffer();

    // Two passes on purpose. sharp runs its operations in a FIXED pipeline order,
    // not call order, and flatten sits before joinChannel in that order - chained
    // in one pass the flatten silently does nothing and the alpha survives.
    const black = await sharp({
      create: { width, height, channels: 3, background: '#000000' },
    })
      .joinChannel(alpha)
      .png()
      .toBuffer();

    img = sharp(black).flatten({ background: '#ffffff' });
  } else {
    img = sharp(src).greyscale();
    if (crop) img = img.extract(crop);
    img = img.flatten({ background: '#ffffff' });
  }

  if (mark.scale !== 1) {
    img = img.resize(Math.round(width * mark.scale), null, { kernel: 'lanczos3' });
  }

  // MUST be written as 3-channel sRGB. potrace loads through jimp, which reads a
  // 1-channel greyscale PNG as a solid block and traces the whole canvas as one
  // rectangle - it fails silently, with a plausible-looking 500-byte SVG.
  await img.removeAlpha().toColourspace('srgb').png().toFile(TMP);

  const svg = await trace(TMP, {
    threshold: mark.threshold,
    turdSize: mark.turdSize,
    optCurve: true,
    optTolerance: 0.2,
    alphaMax: 1,
    blackOnWhite: true,
    color: 'currentColor',
    background: 'transparent',
  });

  const out = path.join(OUT_DIR, mark.out);
  const dressed = dress(svg, mark.title);
  await fs.writeFile(out, dressed);

  const { size } = await fs.stat(out);
  const box = /viewBox="([^"]+)"/.exec(dressed)?.[1] ?? '';
  emitted.push({
    key: mark.key,
    viewBox: box,
    // potrace emits exactly one <path>; take its `d` so the marks can be
    // rendered inline as an SVG sprite rather than fetched as images.
    d: /<path[^>]*\sd="([^"]+)"/.exec(dressed)?.[1] ?? '',
    title: mark.title,
    fillRule: mark.fillRule ?? 'evenodd',
  });

  console.log(
    `${mark.name.padEnd(24)} ${mark.source.padEnd(20)} -> ${mark.out.padEnd(18)} ` +
      `${String(Math.round(size / 1024) + 'KB').padStart(6)}  viewBox ${box}`
  );
}

await fs.rm(TMP, { force: true });

/**
 * The marks are also emitted as a TS module.
 *
 * The header, the hero and the practitioner band all draw from the same paths,
 * and they need `currentColor` to inherit - white over the hero video, sage-ink
 * once the header goes solid - which rules out <img>. Inlining the same path
 * three times would put it in the document three times, so components render a
 * <use> against a single hidden <symbol> and take the geometry from here.
 *
 * Generated. Do not edit by hand: run npm run trace-brand.
 */
const module_ = `/**
 * Brand mark geometry, GENERATED by scripts/trace-brand.mjs.
 *
 * Do not edit by hand - re-run \`npm run trace-brand\` instead. The masters live
 * in assets/source/brand/ and are not committed.
 */

export type BrandMark = {
  readonly viewBox: string;
  readonly d: string;
  readonly title: string;
  /** evenodd for traced paths; the client's own vectors keep their own rule. */
  readonly fillRule: 'evenodd' | 'nonzero';
};

export const brandMarks = {
${emitted
  .map(
    (m) =>
      `  '${m.key}': {\n` +
      `    viewBox: '${m.viewBox}',\n` +
      `    title: ${JSON.stringify(m.title)},\n` +
      `    fillRule: '${m.fillRule}',\n` +
      `    d: '${m.d}',\n` +
      `  },`
  )
  .join('\n')}
} as const satisfies Record<string, BrandMark>;

export type BrandMarkName = keyof typeof brandMarks;
`;

await fs.writeFile('lib/brand-marks.ts', module_);
console.log(`\nlib/brand-marks.ts written (${emitted.map((m) => m.key).join(', ')}).`);

/**
 * potrace emits a bare <svg> with fixed width/height attributes. Strip those so
 * CSS controls the size, and add a <title> so the mark is not a silent graphic
 * when it stands in for the clinic name.
 */
function dress(svg, title) {
  return (
    svg
      .replace(/\s(width|height)="[^"]*"/g, '')
      // potrace emits 3 decimal places. On a ~1200-unit viewBox drawn at 40px in
      // the header that is around 75x more precision than a device pixel can
      // resolve, and it roughly doubles the file. One decimal is still finer
      // than a pixel at every size these marks are used at.
      .replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10))
      // potrace already emits xmlns; adding a second one makes the file invalid
      // XML and every strict SVG parser rejects it outright.
      .replace('<svg ', '<svg role="img" aria-hidden="true" focusable="false" ')
      .replace(/>/, `><title>${title}</title>`)
      .replace(/\n\s*\n/g, '\n')
      .trim() + '\n'
  );
}
