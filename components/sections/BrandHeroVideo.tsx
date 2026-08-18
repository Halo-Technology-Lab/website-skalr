'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { hero } from '@/lib/content';

const { brandVideo } = hero.media;

/**
 * The background film for the hero.
 *
 * Decorative: it carries nothing the copy does not, so it is aria-hidden and the
 * pause control is the only part of it exposed to assistive tech.
 *
 * That control exists because WCAG 2.2.2 requires a way to stop any motion that
 * starts automatically and runs for more than five seconds, and this loops
 * indefinitely. It is a small fixed button in the corner rather than the
 * full-bleed toggle the treatment clip uses - a tap-anywhere target across the
 * whole hero would swallow taps meant for the CTA and the form.
 *
 * Autoplay is muted because every browser blocks autoplay with sound, and the
 * encode has no audio track at all (see scripts/optimize-video.mjs). It does not
 * autoplay under prefers-reduced-motion, which leaves the poster frame showing -
 * the hero then reads as a still photograph, which is a perfectly good hero.
 */
export function BrandHeroVideo() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Read the motion preference in an effect, not during render: the server has
  // no matchMedia, and guessing would mean a hydration mismatch.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // play() rejects if the browser declines, which is not worth surfacing - the
    // poster frame is already the fallback.
    void el.play().catch(() => undefined);
  }, []);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => undefined);
    else el.pause();
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        className="hero-brand-video"
        src={brandVideo.src}
        poster={brandVideo.poster}
        width={brandVideo.width}
        height={brandVideo.height}
        aria-hidden="true"
        tabIndex={-1}
        muted
        loop
        playsInline
        // The poster is the LCP element and is preloaded in the document head;
        // metadata is all the video itself needs before it can start.
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <span aria-hidden="true" className="hero-scrim" />

      <button type="button" onClick={toggle} className="hero-brand-toggle">
        <span className="sr-only">{playing ? brandVideo.pause : brandVideo.play}</span>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
    </>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-4 w-4 translate-x-[1px]"
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" />
    </svg>
  );
}
