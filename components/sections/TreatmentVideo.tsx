'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { hero } from '@/lib/content';
import { cn } from '@/lib/utils';

const { video } = hero.media;

/**
 * The practitioner treatment clip, with a custom play and pause control.
 *
 * It used to be the hero. The client's brand film took that slot in the rebrand,
 * so this now sits in the How it works band, which is arguably a better home for
 * it: a practitioner explaining the mechanism, beside the three steps describing
 * the same thing.
 *
 * A play/pause control has to know whether the video is playing, and there is no
 * way to read or change that from CSS, which is what earns this its exception to
 * the short client-component list. About 1kB.
 *
 * Two behaviours worth knowing about:
 *
 *  - Autoplay is muted. Every browser blocks autoplay with sound, and calling
 *    play() on an unmuted element returns a rejected promise. The clip carries
 *    burnt-in subtitles, so it still reads with no audio. There is deliberately
 *    no unmute control; add one and the audio track is already in the file.
 *  - It does not autoplay for anyone who has asked for reduced motion. A 45
 *    second clip starting by itself is exactly what that setting is for. They get
 *    the poster frame and a play button.
 */
export function TreatmentVideo() {
  const [playing, setPlaying] = useState(false);
  const [reveal, setReveal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read the motion preference in an effect, not during render: the server has
  // no matchMedia, and guessing would mean a hydration mismatch.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // play() rejects if the browser declines, which is not worth surfacing - the
    // poster frame and the play button are already the fallback.
    void el.play().catch(() => undefined);
  }, []);

  useEffect(
    () => () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    },
    []
  );

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => undefined);
    else el.pause();
  }, []);

  /**
   * Touch has no hover, so a tap has to be what reveals the control. Showing it
   * for a few seconds after any pointer contact covers both: a mouse gets hover,
   * a finger gets a timed reveal.
   */
  const flashControl = useCallback(() => {
    setReveal(true);
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => setReveal(false), 2500);
  }, []);

  return (
    <div
      className="treatment-video"
      onPointerEnter={() => setReveal(true)}
      onPointerLeave={() => setReveal(false)}
      onPointerDown={flashControl}
    >
      <video
        ref={videoRef}
        className="treatment-video-el"
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        aria-label={video.label}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* One button covering the whole clip, so a tap anywhere toggles playback
          and there is still a single, properly named control for the keyboard and
          for a screen reader. The badge is centred inside it. */}
      <button
        type="button"
        onClick={toggle}
        onFocus={() => setReveal(true)}
        onBlur={() => setReveal(false)}
        className={cn('treatment-video-toggle', (!playing || reveal) && 'is-visible')}
      >
        <span className="sr-only">{playing ? video.pause : video.play}</span>
        <span aria-hidden="true" className="treatment-video-badge">
          {playing ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 translate-x-[1px]">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" />
    </svg>
  );
}
