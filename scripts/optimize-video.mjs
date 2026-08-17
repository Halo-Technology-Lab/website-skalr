/**
 * Encodes the hero treatment clip for the web, and pulls its poster frame.
 *
 * The delivered clip was 1080x1920, 50fps, 45s, 20MB. That is a social-media
 * master, not a web asset: on a paid-social landing page it would be by far the
 * heaviest thing on the page, and load time here is a conversion input.
 *
 * What this does and why:
 *
 *   - 810x1440, not 1080x1920. The clip fills the width of its column, so it
 *     renders around 363px wide on a phone and ~578px on desktop. 810 covers
 *     desktop at better than 1.4x and a phone at better than 2x.
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
 *   - +faststart puts the moov atom first, so playback can begin while the rest
 *     is still arriving instead of after the whole file lands.
 *
 * NOT shipped: a VP9 WebM. It was tried and came out 2.25MB against H.264's
 * 2.43MB - a 5% saving is not worth a second encode of every asset and a second
 * <source> to keep in step.
 *
 * The clip is NOT cropped to a landscape box. It carries burnt-in subtitles at
 * roughly two thirds height and ends on a full-frame before and after; any wide
 * crop destroys both. Its height is capped in CSS instead.
 *
 * Requires ffmpeg on PATH (brew install ffmpeg).
 * Run: npm run optimize-video
 */

import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import sharp from 'sharp';

const run = promisify(execFile);

const SOURCE = process.env.VIDEO_SOURCE ?? 'assets/source/hero-treatment.mp4';
const OUT_DIR = 'public/video';
const OUT_MP4 = path.join(OUT_DIR, 'hero-treatment.mp4');
const OUT_POSTER = path.join(OUT_DIR, 'hero-treatment-poster.webp');

const WIDTH = 810;
const HEIGHT = 1440;
const FPS = 25;
const CRF = 31;
/** Seconds in. Far enough past the first frame to miss any fade up. */
const POSTER_AT = 0.4;

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

try {
  await fs.access(SOURCE);
} catch {
  console.error(
    `No source at ${SOURCE}. The master is not committed - see assets/source/README.md.`
  );
  process.exit(1);
}

await fs.mkdir(OUT_DIR, { recursive: true });

const before = (await fs.stat(SOURCE)).size;

console.log(`Encoding ${SOURCE} -> ${OUT_MP4} (${WIDTH}x${HEIGHT}, ${FPS}fps, CRF ${CRF})...`);
await run('ffmpeg', [
  '-v', 'error',
  '-i', SOURCE,
  '-vf', `scale=${WIDTH}:${HEIGHT}:flags=lanczos,fps=${FPS}`,
  '-c:v', 'libx264',
  '-profile:v', 'main',
  '-level', '4.0',
  '-crf', String(CRF),
  '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '64k',
  '-ac', '1',
  '-movflags', '+faststart',
  '-y', OUT_MP4,
]);

console.log(`Extracting poster at ${POSTER_AT}s -> ${OUT_POSTER}...`);
const rawPoster = path.join(OUT_DIR, '.poster-raw.png');
await run('ffmpeg', [
  '-v', 'error',
  '-ss', String(POSTER_AT),
  '-i', SOURCE,
  '-frames:v', '1',
  '-vf', `scale=${WIDTH}:${HEIGHT}:flags=lanczos`,
  '-y', rawPoster,
]);
await sharp(rawPoster).webp({ quality: 82 }).toFile(OUT_POSTER);
await fs.unlink(rawPoster);

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
const mp4 = (await fs.stat(OUT_MP4)).size;
const poster = (await fs.stat(OUT_POSTER)).size;

console.log(`\nsource        ${kb(before).padStart(8)}`);
console.log(`mp4           ${kb(mp4).padStart(8)}`);
console.log(`poster        ${kb(poster).padStart(8)}`);
console.log(
  `\n${(((before - mp4) / before) * 100).toFixed(1)}% smaller than the master.`
);

/**
 * 3.5MB. Higher than you would want for an image, and fine for this: it streams
 * progressively behind +faststart, so playback starts on the first few hundred
 * kB rather than waiting for the file, and it is cached immutable. 45 seconds at
 * this size is about 0.55Mbps.
 *
 * If it ever goes over, the first thing to reach for is the clip's length, not
 * the quality - 45 seconds is long for a hero.
 */
const BUDGET = 3.5 * 1024 * 1024;
if (mp4 > BUDGET) {
  console.error(`\nmp4 is over the 3.5MB budget. Trim the clip, or raise CRF.`);
  process.exitCode = 1;
}
