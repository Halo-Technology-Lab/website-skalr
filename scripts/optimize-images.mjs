/**
 * Turns the consented before-and-after pack into the exact assets the page needs.
 *
 * This is not the usual "walk a directory and shrink everything" script, because
 * the sources are 1254x1254 squares and the page asks for two different shapes
 * from the same frames:
 *
 *   - the results grid wants 4:5 portrait, framed on the head and shoulders
 *   - the hero wants a 16:9 band, wide enough to keep the whole head in frame
 *
 * So it is manifest driven. Every crop is stated explicitly and every offset is
 * a deliberate number that was checked against the rendered output, not a
 * mechanical centre crop - a centre crop of these frames clips chins.
 *
 * Sources live in assets/source/ and are deliberately NOT committed. They are
 * full resolution patient photography, and the repo only needs the derived,
 * web-sized crops. See assets/source/README.md.
 *
 * Run: npm run optimize-images
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = process.env.SOURCE_DIR ?? 'assets/source';
const OUT_ROOT = 'public/images';

/** WebP quality. 82 holds skin texture, which is the whole point of these images. */
const QUALITY = 82;

/**
 * The results grid, 4:5.
 *
 * Cropped, not resized: 800x1000 is lifted straight out of the 1254px source at
 * 1:1, so no resampling touches the skin detail. The grid cell is ~328px on
 * desktop and ~173px on mobile, so 800px covers 2x everywhere with room spare.
 *
 * `top` frames the head: these frames put the top of the hair around y=140 and
 * the chin around y=690, so starting at 60 leaves headroom and still catches the
 * shoulders.
 */
const RESULTS_CROP = { width: 800, height: 1000, top: 60 };

/**
 * Per-frame vertical nudges for the results grid, in source pixels, applied on
 * top of RESULTS_CROP.top. Positive moves the crop window down.
 */
const NUDGE = {
  'patient-1-before': 0,
  'patient-1-after': 0,
  'patient-2-before': 0,
  'patient-2-after': 0,
  'patient-3-before': 0,
  'patient-3-after': 0,
};

/** Output size of every hero frame. 16:9, comfortably over the ~580px the box renders at. */
const HERO_OUT = { width: 1000, height: 563 };

/**
 * The hero cycles the three "after" frames, so they have to agree with each
 * other: a crossfade between two portraits at different head sizes reads as a
 * jump-cut, not a dissolve.
 *
 * The subjects were not shot at identical distances, so each frame gets its own
 * crop width, chosen so the head lands at roughly the same fraction of the
 * output (~30%). A 16:9 crop takes its height from its width, so `cropWidth`
 * sets the whole window; `eyeY` is where the eye line sits in the SOURCE, and
 * the crop is positioned to put it at EYE_LINE of the frame height.
 *
 * These are eyeballed against the rendered output and re-checked whenever the
 * pack changes. There is no reliable way to measure them automatically: the
 * backdrop tone and clothing contrast differ enough between subjects that a
 * simple silhouette threshold picks up the backdrop gradient instead of hair.
 *
 * 1254 is the source width, so it is also the ceiling on cropWidth.
 */
const EYE_LINE = 0.4;
const HERO_FRAMES = [
  { stem: 'patient-1-after', cropWidth: 1120, eyeY: 430 },
  { stem: 'patient-2-after', cropWidth: 1250, eyeY: 410 },
  { stem: 'patient-3-after', cropWidth: 1254, eyeY: 440 },
];

const PATIENTS = [1, 2, 3];

async function findSource(stem) {
  for (const ext of ['.png', '.jpg', '.jpeg']) {
    const candidate = path.join(SOURCE_DIR, stem + ext);
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      /* try the next extension */
    }
  }
  throw new Error(
    `No source for "${stem}" in ${SOURCE_DIR}/ (looked for .png, .jpg, .jpeg).\n` +
      `The pack is not committed - see assets/source/README.md.`
  );
}

function clampTop(top, cropHeight, sourceHeight) {
  return Math.max(0, Math.min(top, sourceHeight - cropHeight));
}

const report = [];

async function emit(sourcePath, outPath, crop, resize) {
  const image = sharp(sourcePath);
  const { width: sw, height: sh } = await image.metadata();

  const left = Math.round((sw - crop.width) / 2);
  const top = clampTop(crop.top, crop.height, sh);

  let pipeline = image.extract({ left, top, width: crop.width, height: crop.height });
  if (resize) pipeline = pipeline.resize(resize.width, resize.height);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await pipeline.webp({ quality: QUALITY }).toFile(outPath);

  const before = (await fs.stat(sourcePath)).size;
  const after = (await fs.stat(outPath)).size;
  const out = resize ?? { width: crop.width, height: crop.height };

  report.push({ outPath, before, after, ...out });
}

for (const n of PATIENTS) {
  for (const phase of ['before', 'after']) {
    const stem = `patient-${n}-${phase}`;
    const source = await findSource(stem);
    await emit(
      source,
      path.join(OUT_ROOT, 'results', `${stem}.webp`),
      { ...RESULTS_CROP, top: RESULTS_CROP.top + (NUDGE[stem] ?? 0) },
      null
    );
  }
}

for (const [i, frame] of HERO_FRAMES.entries()) {
  const source = await findSource(frame.stem);
  const width = Math.min(frame.cropWidth, 1254);
  const height = Math.round((width * 9) / 16);
  await emit(
    source,
    path.join(OUT_ROOT, 'hero', `after-${i + 1}.webp`),
    { width, height, top: Math.round(frame.eyeY - EYE_LINE * height) },
    HERO_OUT
  );
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;
const BUDGET = 150 * 1024;
let over = 0;

console.log('');
for (const r of report) {
  const flag = r.after > BUDGET ? '  ** OVER 150KB BUDGET **' : '';
  if (r.after > BUDGET) over += 1;
  console.log(
    `${r.outPath.padEnd(44)} ${String(r.width).padStart(4)}x${String(r.height).padEnd(4)}  ` +
      `${kb(r.before).padStart(7)} -> ${kb(r.after).padStart(6)}${flag}`
  );
}

const totalAfter = report.reduce((sum, r) => sum + r.after, 0);
console.log(`\n${report.length} files, ${kb(totalAfter)} total on the wire.`);

if (over > 0) {
  console.error(`\n${over} file(s) over the 150KB budget. Lower QUALITY or the crop size.`);
  process.exitCode = 1;
}
