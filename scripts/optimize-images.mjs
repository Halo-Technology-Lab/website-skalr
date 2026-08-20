/**
 * Turns the consented before-and-after pack into the exact assets the page needs.
 *
 * This is not the usual "walk a directory and shrink everything" script. The
 * sources are square frames and the results grid wants 4:5 portrait framed on
 * the head and shoulders, so it is manifest driven: every crop is stated
 * explicitly and every offset is a deliberate number checked against the
 * rendered output.
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
 * Cropped, not resized: 800x1000 is lifted straight out of the source at 1:1, so
 * no resampling touches the skin detail. The grid cell is ~328px on desktop and
 * ~173px on mobile, so 800px covers 2x everywhere with room spare.
 *
 * Every frame in the pack is square, so the crop is centred horizontally and
 * only `top` needs deciding. 60 is the baseline: it leaves headroom above the
 * hair on the frames that sit lowest and still catches the shoulders. Five of
 * the six sources are 1254px; `patient-2-after` is 1107px, so clampTop() is
 * load-bearing rather than defensive - 60+1000 fits, but only just.
 */
const RESULTS_CROP = { width: 800, height: 1000, top: 60 };

/**
 * Per-frame vertical nudges for the results grid, in source pixels, applied on
 * top of RESULTS_CROP.top. Positive moves the crop window down, which moves the
 * subject UP in the output.
 *
 * These align the EYE LINE within each pair, not the top of the head. Hair is
 * the reason the heads sit at different heights (patient 3 is braided in the
 * before and loose in the after), and matching hair tops would pull the two
 * faces out of line - which is the one thing a side-by-side pair cannot afford.
 * Aligning eyes leaves a headroom difference that is honest: it is the hair.
 *
 * Measured against the rendered pair, pack of 20 August 2026:
 *   - patient 1: the after sits ~22px lower, so the after comes up.
 *   - patient 2: already in line, both left alone.
 *   - patient 3: ~100px apart. Split between the two, because neither frame can
 *     absorb it alone - the before clamps to top 0 at -60, and the after only
 *     has 88px above the crown.
 */
const NUDGE = {
  'patient-1-before': 0,
  'patient-1-after': 22,
  'patient-2-before': 0,
  'patient-2-after': 0,
  'patient-3-before': -60,
  'patient-3-after': 40,
};

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

async function emit(sourcePath, outPath, crop) {
  const image = sharp(sourcePath);
  const { width: sw, height: sh } = await image.metadata();

  const left = Math.round((sw - crop.width) / 2);
  const top = clampTop(crop.top, crop.height, sh);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await image
    .extract({ left, top, width: crop.width, height: crop.height })
    .webp({ quality: QUALITY })
    .toFile(outPath);

  report.push({
    outPath,
    before: (await fs.stat(sourcePath)).size,
    after: (await fs.stat(outPath)).size,
    width: crop.width,
    height: crop.height,
  });
}

for (const n of PATIENTS) {
  for (const phase of ['before', 'after']) {
    const stem = `patient-${n}-${phase}`;
    const source = await findSource(stem);
    await emit(source, path.join(OUT_ROOT, 'results', `${stem}.webp`), {
      ...RESULTS_CROP,
      top: RESULTS_CROP.top + (NUDGE[stem] ?? 0),
    });
  }
}

/**
 * The practitioner cut-out, for the Dr Kaywaan Khan band.
 *
 * Handled outside emit() because everything emit() does is wrong for it: there
 * is no crop (the subject is already cut out and centred), and it MUST keep its
 * alpha channel - the band bleeds the figure over a tinted card with no box
 * around it, exactly as the client's own site does, so a flattened rectangle
 * would be visible as a hard edge.
 *
 * 800px wide covers the ~380px desktop render at better than 2x. sharp's trim()
 * removes the transparent margin first so the output box is the figure itself,
 * which means the band can position it by its own edges rather than guessing at
 * the padding baked into the master.
 */
const PRACTITIONER = { source: 'brand/dr-kaywaan-khan.png', width: 800 };
{
  const source = path.join(SOURCE_DIR, PRACTITIONER.source);
  const outPath = path.join(OUT_ROOT, 'practitioner', 'dr-kaywaan-khan.webp');
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const meta = await sharp(source)
    .trim()
    .resize(PRACTITIONER.width, null, { withoutEnlargement: true })
    // alphaQuality 90 over the global 82: the cut-out edge runs along hair and a
    // shirt collar, and alpha artefacts there read as a halo against the tint.
    .webp({ quality: QUALITY, alphaQuality: 90 })
    .toFile(outPath);

  report.push({
    outPath,
    before: (await fs.stat(source)).size,
    after: (await fs.stat(outPath)).size,
    width: meta.width,
    height: meta.height,
  });
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
