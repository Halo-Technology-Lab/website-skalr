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

Frame `1` of each subject is the front-on view. Note that the angle numbering in
the delivered pack is **not** consistent between subjects, so do not assume frame
`2` means the same thing for two different people.

The current mapping, from the pack delivered 17 August 2026:

| Stem | Source in the pack |
|---|---|
| `patient-1-before` | `Chloe/Before/cb1.png` |
| `patient-1-after` | `Chloe/After/ca1.png` |
| `patient-2-before` | `Elena/before/eb1.png` |
| `patient-2-after` | `Elena/after/ea1.png` |
| `patient-3-before` | `debs/Before/db1.jpg` |
| `patient-3-after` | `debs/After/ad1.jpg` |

Subject names appear here only to make the pack traceable. They deliberately do
not appear in output filenames, alt text or page copy, because those are public.

`debs` also has a `v2` folder in the pack. Do not use it: its "after" reads worse
than its own "before".

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
