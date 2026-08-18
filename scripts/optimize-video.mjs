/**
 * Encodes the site's two video assets for the web, and pulls their poster frames.
 *
 * Requires ffmpeg on PATH (brew install ffmpeg).
 * Run: npm run optimize-video
 *
 * ---------------------------------------------------------------------------
 * 1. hero-treatment - the practitioner clip, 9:16
 * ---------------------------------------------------------------------------
 *
 * The delivered clip was 1080x1920, 50fps, 45s, 20MB. That is a social-media
 * master, not a web asset.
 *
 *   - 810x1440, not 1080x1920. It fills the width of its column, so it renders
 *     around 363px wide on a phone and ~578px on desktop. 810 covers desktop at
 *     better than 1.4x and a phone at better than 2x.
 *   - 25fps, not 50. Nothing in a talking-head clip needs 50.
 *   - CRF 31. Chosen by comparing candidates at the real 578px display width:
 *     810x1440 CRF 31 and 720x1280 CRF 31 came out within 3% of each other on
 *     size, so the higher resolution was free. Against a smaller 540x960 CRF 28
 *     encode it is visibly cleaner on the subtitle edges and on skin detail in
 *     the closing before and after, which is the whole point of that shot.
 *   - Mono AAC at 64k. The clip is a voiceover, and it autoplays MUTED because
 *     every browser blocks autoplay with sound. The track is kept rather than
 *     stripped so the audio is still there if an unmute control is ever added -
 *     dropping it would throw away the practitioner's explanation for good.
 *
 * NOT shipped: a VP9 WebM. It was tried and came out 2.25MB against H.264's
 * 2.43MB - a 5% saving is not worth a second encode of every asset and a second
 * <source> to keep in step.
 *
 * The clip is NOT cropped to a landscape box. It carries burnt-in subtitles at
 * roughly two thirds height and ends on a full-frame before and after; any wide
 * crop destroys both. Its height is capped in CSS instead.
 *
 * ---------------------------------------------------------------------------
 * 2. brand-hero - the client's brand film, 16:9, behind the hero
 * ---------------------------------------------------------------------------
 *
 * Master pulled from the client's live site, where it runs as the homepage hero:
 * hannahlondon.com/wp-content/uploads/2023/12/video-1.mp4, 1920x1080, 53.6s,
 * 15.5MB. The brand reference asks for the hero under two seconds on 4G, so the
 * master is disqualifying on its own.
 *
 *   - TRIMMED to 8s-24s. The film is a montage and the back half moves to body
 *     treatments - bare midriff and legs - which are off-message for a campaign
 *     about a facial lift. The 8-24s run is consultation, facial treatment and
 *     clinic interiors, and it passes the branded HANNAH LONDON wall twice.
 *     Trimming is also the cheapest byte saving available: length, not quality.
 *   - The loop seam is a hard cut between two montage shots, which is the film's
 *     own visual language. It does not read as a glitch. Do NOT add a fade -
 *     a background video fading to black looks like a bug.
 *   - 1600x900 at CRF 31. Measured against the alternatives at 16s:
 *         1280x720  CRF 30 -> 1.0MB      1600x900  CRF 31 -> 1.4MB
 *         1280x720  CRF 32 -> 874KB      1600x900  CRF 33 -> 1.1MB
 *                                        1920x1080 CRF 33 -> 1.6MB
 *     1600x900 is sharp enough for a full-bleed desktop hero and leaves real
 *     headroom under the budget. The scrim over it (see .hero-scrim in
 *     globals.css) suppresses fine detail anyway, which is why pushing to 1080p
 *     buys nothing visible.
 *   - NO AUDIO (-an). It is a decorative background that autoplays muted and has
 *     no unmute control, so the track is pure weight. This is the opposite call
 *     to hero-treatment above, and deliberately so.
 *
 * NOT shipped: a portrait encode. A 16:9 frame under object-cover in a 390x844
 * fold shows the middle ~26% of the frame. That was checked against every shot
 * in the trimmed range and the film is centre-framed throughout, so the crop
 * lands on the subject every time. A second encode would be a second asset and a
 * second <source> to keep in step for no gain.
 *
 * +faststart on both puts the moov atom first, so playback can begin while the
 * rest is still arriving instead of after the whole file lands.
 */

import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import sharp from 'sharp';

const run = promisify(execFile);

const OUT_DIR = 'public/video';

/**
 * @typedef {object} Target
 * @property {string}  name     Label for the console report.
 * @property {string}  source   Master path. Not committed - see assets/source/README.md.
 * @property {string}  slug     Output basename, shared by the mp4 and the poster.
 * @property {number}  width
 * @property {number}  height
 * @property {number}  fps
 * @property {number}  crf
 * @property {number}  posterAt Seconds into the ENCODED clip to grab the poster.
 * @property {number}  budget   Bytes. Exceeding it fails the run.
 * @property {?number} start    Seconds into the master to start. null = from the top.
 * @property {?number} duration Seconds to keep. null = to the end.
 * @property {boolean} audio    Keep the audio track?
 */

/** @type {Target[]} */
const TARGETS = [
  {
    name: 'hero treatment clip',
    source: process.env.VIDEO_SOURCE ?? 'assets/source/hero-treatment.mp4',
    slug: 'hero-treatment',
    width: 810,
    height: 1440,
    fps: 25,
    crf: 31,
    // Far enough past the first frame to miss any fade up.
    posterAt: 0.4,
    // 45 seconds at this size is about 0.55Mbps. If it ever goes over, reach for
    // the clip's length before the quality.
    budget: 3.5 * 1024 * 1024,
    start: null,
    duration: null,
    audio: true,
  },
  {
    name: 'brand hero film',
    source: process.env.BRAND_VIDEO_SOURCE ?? 'assets/source/brand-hero-master.mp4',
    slug: 'brand-hero',
    width: 1600,
    height: 900,
    fps: 25,
    crf: 31,
    // The trim already starts on a clean cut, so frame one is a real frame.
    posterAt: 0.1,
    budget: 2 * 1024 * 1024,
    start: 8,
    duration: 16,
    audio: false,
  },
];

async function ffmpegAvailable() {
  try {
    await run('ffmpeg', ['-version']);
    return true;
  } catch {
    return false;
  }
}

if (!(await ffmpegAvailable())) {
  console.error('ffmpeg is not on PATH. brew install ffmpeg');
  process.exit(1);
}

await fs.mkdir(OUT_DIR, { recursive: true });

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
const report = [];
let overBudget = false;

for (const t of TARGETS) {
  try {
    await fs.access(t.source);
  } catch {
    console.error(
      `\nNo source at ${t.source} for the ${t.name}. ` +
        'Masters are not committed - see assets/source/README.md.'
    );
    process.exitCode = 1;
    continue;
  }

  const outMp4 = path.join(OUT_DIR, `${t.slug}.mp4`);
  const outPoster = path.join(OUT_DIR, `${t.slug}-poster.webp`);
  const before = (await fs.stat(t.source)).size;

  // -ss before -i seeks on the input, which is fast and frame-accurate enough
  // here because the trim point is a hard cut, not a mid-motion frame.
  const trim = [
    ...(t.start === null ? [] : ['-ss', String(t.start)]),
    ...(t.duration === null ? [] : ['-t', String(t.duration)]),
  ];

  const trimNote =
    t.start === null ? '' : `, ${t.start}s-${t.start + t.duration}s of the master`;
  console.log(
    `Encoding the ${t.name}: ${t.source} -> ${outMp4} ` +
      `(${t.width}x${t.height}, ${t.fps}fps, CRF ${t.crf}${trimNote})...`
  );

  await run('ffmpeg', [
    '-v', 'error',
    ...trim,
    '-i', t.source,
    '-vf', `scale=${t.width}:${t.height}:flags=lanczos,fps=${t.fps}`,
    '-c:v', 'libx264',
    '-profile:v', 'main',
    '-level', '4.0',
    '-crf', String(t.crf),
    '-preset', 'slow',
    '-pix_fmt', 'yuv420p',
    ...(t.audio ? ['-c:a', 'aac', '-b:a', '64k', '-ac', '1'] : ['-an']),
    '-movflags', '+faststart',
    '-y', outMp4,
  ]);

  // Pulled from the ENCODED file, not the master, so the poster is the exact
  // first frame the visitor sees. A poster that does not match frame one shows
  // as a visible jump the moment playback starts.
  console.log(`Extracting poster at ${t.posterAt}s -> ${outPoster}...`);
  const rawPoster = path.join(OUT_DIR, `.${t.slug}-poster-raw.png`);
  await run('ffmpeg', [
    '-v', 'error',
    '-ss', String(t.posterAt),
    '-i', outMp4,
    '-frames:v', '1',
    '-y', rawPoster,
  ]);
  await sharp(rawPoster).webp({ quality: 82 }).toFile(outPoster);
  await fs.unlink(rawPoster);

  const mp4 = (await fs.stat(outMp4)).size;
  const poster = (await fs.stat(outPoster)).size;
  report.push({ name: t.name, before, mp4, poster, budget: t.budget });

  if (mp4 > t.budget) {
    overBudget = true;
    console.error(
      `\n${outMp4} is ${kb(mp4)}, over its ${kb(t.budget)} budget. ` +
        'Trim the clip before raising CRF.'
    );
  }
}

console.log('');
for (const r of report) {
  console.log(r.name);
  console.log(`  source      ${kb(r.before).padStart(9)}`);
  console.log(`  mp4         ${kb(r.mp4).padStart(9)}   budget ${kb(r.budget)}`);
  console.log(`  poster      ${kb(r.poster).padStart(9)}`);
  console.log(
    `  ${(((r.before - r.mp4) / r.before) * 100).toFixed(1)}% smaller than the master.`
  );
}

if (overBudget) process.exitCode = 1;
