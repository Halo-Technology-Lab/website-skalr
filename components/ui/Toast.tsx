'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * A small toast system with no dependency and no global provider.
 *
 * `useToasts` holds the queue and `ToastViewport` renders it, so a single
 * component can own both without any context plumbing. Toasts are keyed by id,
 * and showing the same id again replaces the existing toast rather than
 * stacking a duplicate - pressing submit twice should not build a pile.
 *
 * Announcement is polite, never assertive. On a validation failure the form
 * also moves focus to the first invalid field, and that announcement is the one
 * that matters; an assertive toast would talk over it.
 */

export type ToastTone = 'success' | 'warning' | 'error';

export interface Toast {
  /** Stable per kind of message, so a repeat replaces rather than stacks. */
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
}

const DURATIONS: Record<ToastTone, number> = {
  success: 7000,
  warning: 9000,
  error: 10000,
};

const MAX_VISIBLE = 3;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (toast: Toast) => {
      const existing = timers.current.get(toast.id);
      if (existing) clearTimeout(existing);

      setToasts((current) =>
        [...current.filter((item) => item.id !== toast.id), toast].slice(
          -MAX_VISIBLE,
        ),
      );

      timers.current.set(
        toast.id,
        setTimeout(() => dismiss(toast.id), DURATIONS[toast.tone]),
      );
    },
    [dismiss],
  );

  // Clear every pending timer if the form unmounts mid-countdown.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return { toasts, show, dismiss };
}

const TONE_STYLES: Record<ToastTone, { border: string; text: string }> = {
  success: { border: 'border-l-success', text: 'text-success' },
  warning: { border: 'border-l-warning', text: 'text-warning' },
  error: { border: 'border-l-danger', text: 'text-danger' },
};

/**
 * Bottom-anchored, because that is where the thumb and the submit button are.
 * On mobile it clears the sticky book and call bar; on desktop it sits in the
 * bottom right, where it cannot cover the pinned form card.
 */
export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-[18px] lg:bottom-6 lg:left-auto lg:right-6 lg:items-end lg:px-0"
    >
      {toasts.map((toast) => {
        const tone = TONE_STYLES[toast.tone];
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-2.5 rounded-md border border-line border-l-[3px] bg-white p-3 shadow-toast',
              tone.border,
            )}
          >
            <ToastIcon
              tone={toast.tone}
              className={cn('mt-px h-5 w-5 flex-none', tone.text)}
            />

            <div className="min-w-0 flex-1">
              <p className={cn('text-caption font-bold', tone.text)}>
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-0.5 text-micro text-copy md:text-caption">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss"
              className="-m-1 flex h-9 w-9 flex-none items-center justify-center rounded text-muted transition-colors hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ToastIcon({
  tone,
  className,
}: {
  tone: ToastTone;
  className?: string;
}) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: 'false' as const,
    className,
  };

  if (tone === 'success') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M10.3 4.3 2.6 17.6A2 2 0 0 0 4.3 20.6h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
