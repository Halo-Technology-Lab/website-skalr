'use client';

import { useEffect } from 'react';

/**
 * Flips the header between its over-the-hero and scrolled states.
 *
 * The header starts transparent with a white mark, sitting on the hero film, and
 * turns into a solid white bar with a sage-ink mark once the hero has been
 * scrolled past - which is how the client's own site behaves.
 *
 * Implemented with an IntersectionObserver against a zero-height sentinel rather
 * than a scroll listener. A scroll listener fires on every frame of every scroll
 * and has to read layout to decide anything, which is a reliable way to make a
 * page feel heavy on a mid-range phone. The observer fires twice: once crossing
 * out, once crossing back.
 *
 * The state lands as a `data-scrolled` attribute on <html>, so all the actual
 * styling stays in CSS beside the rest of the header's classes, and this
 * component renders nothing.
 *
 * This is the page's fifth client component, against the project note to keep
 * that list short. It is here because the transparent-over-video header is a
 * large part of what makes the page read as the client's, and the alternative -
 * a solid white bar from the top - puts an opaque strip across the hero film.
 */
export function HeaderScrollState({ sentinelId }: { sentinelId: string }) {
  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    const root = document.documentElement;
    if (!sentinel) return;

    // No IntersectionObserver: leave the attribute set, so the header stays in
    // its solid, legible state rather than transparent over nothing.
    if (typeof IntersectionObserver === 'undefined') {
      root.dataset.scrolled = 'true';
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // A visible sentinel means the top of the hero is still on screen.
        root.dataset.scrolled = entry.isIntersecting ? 'false' : 'true';
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    // Disconnect only. The attribute describes where the page is scrolled to,
    // which is still true after this component unmounts - and deleting it drops
    // the header back to its solid state. In development that is visible:
    // StrictMode runs effects mount/cleanup/mount, so the delete lands between
    // the two and the header sticks solid over the hero until the next scroll.
    return () => observer.disconnect();
  }, [sentinelId]);

  return null;
}
