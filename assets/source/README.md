# Source photography

**Nothing in this directory is committed.** `.gitignore` excludes it.

These are the full resolution, consented before-and-after frames. The repo only
needs the derived web crops under `public/images/`, so the originals stay out of
version control - data minimisation, and there is no reason for patient
photography at full resolution to sit in a git history forever.

## What belongs here

`scripts/optimize-images.mjs` expects these six stems, with a `.png`, `.jpg` or
`.jpeg` extension:

```
patient-1-before   patient-1-after
patient-2-before   patient-2-after
patient-3-before   patient-3-after
```

The current mapping, from the pack delivered 20 August 2026 as
`Skalr/before after/`:

| Stem | Source in the pack | Size |
|---|---|---|
| `patient-1-before` | `before-1.jpeg` | 1254x1254 |
| `patient-1-after` | `after-1.jpeg` | 1254x1254 |
| `patient-2-before` | `before-2.jpeg` | 1254x1254 |
| `patient-2-after` | `after-2.jpeg` | 1107x1107 |
| `patient-3-before` | `before-3.jpeg` | 1254x1254 |
| `patient-3-after` | `after-3.jpeg` | 1254x1254 |

This pack is pre-paired and pre-numbered, so the mapping is one to one and there
are no subject names to strip. It supersedes the pack of 17 August 2026, which
was delivered as per-subject folders of numbered angles.

Two things about it that matter downstream:

- The frames are **angled, not front-on**. Patients one and two are
  three-quarter views, patient three is a side view. The alt text in
  `lib/content.ts` describes them as such.
- `after-2.jpeg` is 1107px where everything else is 1254px, so the 1000px-tall
  results crop only just fits inside it.

## The hero clip

`hero-treatment.mp4` is the 1080x1920 50fps master of the treatment clip (20MB as
delivered, itself already compressed from an 87MB original). `npm run
optimize-video` encodes it to `public/video/` and pulls the poster frame.

It is a talking-head explainer with **burnt-in subtitles** and a **voiceover**,
and it ends on a full-frame before and after. That matters for two reasons:

- It cannot be cropped to a landscape box without destroying the subtitles and
  the closing shot, so it stays 9:16 and its height is capped in CSS instead.
- Do not strip the audio to save bytes. It is the practitioner's explanation.

## Regenerating

```bash
npm run optimize-images
npm run optimize-video   # needs ffmpeg on PATH
```

Then look at the output files. The crop offsets in the script were set by eye
against the rendered result, and a new pack will almost certainly need them
adjusted - see `NUDGE` in the script.
