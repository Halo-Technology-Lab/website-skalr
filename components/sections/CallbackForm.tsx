'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { captureAttribution } from '@/lib/attribution';
import { form as copy, FORM_ANCHOR } from '@/lib/content';
import {
  FIELD_ORDER,
  hasErrors,
  validateLead,
  type LeadErrors,
  type LeadField,
} from '@/lib/lead';
import { ToastViewport, useToasts } from '@/components/ui/Toast';
import { newEventId, readMetaCookies, trackLead } from '@/lib/tracking';
import { cn } from '@/lib/utils';

/**
 * The call back form (wireframe note 2 and section 03).
 *
 * The governing rule is that typing is the friction, not questions. Three typed
 * fields, everything else a single tap, and the tap question comes first
 * because answering something easy makes people markedly more likely to finish.
 *
 * Build requirements from section 03, all implemented here:
 *   - labels above every field, never placeholder-only
 *   - tel + inputmode numeric, type email, autocomplete on all three
 *   - validation on blur, not on submit
 *   - UK numbers accepted in any format and normalised server-side
 *   - the submit button stays enabled and explains what is missing
 *   - 44px minimum tap targets on chips and buttons
 *   - a confirmation that repeats the promise, and a Lead event on success
 */

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Values {
  concern: string;
  firstName: string;
  phone: string;
  email: string;
  timing: string;
  consent: boolean;
}

const EMPTY: Values = {
  concern: '',
  firstName: '',
  phone: '',
  email: '',
  timing: '',
  consent: false,
};

export function CallbackForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const { toasts, show, dismiss } = useToasts();

  const mountedAt = useRef<number>(0);
  const fieldRefs = useRef<Partial<Record<LeadField, HTMLElement | null>>>({});
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
    captureAttribution();
  }, []);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const fieldId = (field: LeadField) => `${uid}-${field}`;
  const errorId = (field: LeadField) => `${uid}-${field}-error`;

  function setValue<K extends keyof Values>(field: K, value: Values[K]) {
    setValues((current) => {
      const next = { ...current, [field]: value };
      // Once a field has been flagged, re-check it as the visitor fixes it so
      // the error disappears the moment it is resolved.
      if (errors[field as LeadField]) {
        const fresh = validateLead(next);
        setErrors((previous) => {
          const updated = { ...previous };
          if (fresh[field as LeadField]) {
            updated[field as LeadField] = fresh[field as LeadField];
          } else {
            delete updated[field as LeadField];
          }
          return updated;
        });
      }
      return next;
    });
  }

  /** Validation on leaving a field - never a wall of errors after submit. */
  function validateField(field: LeadField) {
    const fresh = validateLead(values);
    setErrors((previous) => {
      const updated = { ...previous };
      if (fresh[field]) {
        updated[field] = fresh[field];
      } else {
        delete updated[field];
      }
      return updated;
    });
  }

  /**
   * Raises the warning toast and puts the cursor on the first problem. With one
   * field wrong the toast carries that field's own message; with several it
   * carries the count, and the inline errors say which.
   */
  function reportInvalid(found: LeadErrors) {
    const missing = FIELD_ORDER.filter((field) => found[field]);
    show({
      id: 'form-validation',
      tone: 'warning',
      title: copy.toasts.warning.title,
      message:
        missing.length === 1
          ? found[missing[0]]
          : copy.toasts.warning.message.replace('{n}', String(missing.length)),
    });
    fieldRefs.current[missing[0]]?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    const found = validateLead(values);
    setErrors(found);

    if (hasErrors(found)) {
      reportInvalid(found);
      return;
    }

    dismiss('form-validation');
    setStatus('submitting');

    const eventId = newEventId();
    const { fbp, fbc } = readMetaCookies();

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          eventId,
          fbp,
          fbc,
          attribution: captureAttribution(),
          elapsedMs: Date.now() - mountedAt.current,
          website: '', // honeypot, always empty for people
        }),
      });

      if (!response.ok) {
        // A 422 means the server disagreed with the browser about validity.
        if (response.status === 422) {
          const payload = (await response.json().catch(() => null)) as {
            errors?: LeadErrors;
          } | null;
          if (payload?.errors) {
            setErrors(payload.errors);
            setStatus('idle');
            reportInvalid(payload.errors);
            return;
          }
        }
        throw new Error(`Lead endpoint responded ${response.status}`);
      }

      // Section 06: Lead fires on form submission, sharing its event ID with
      // the server-side Conversions API event so the pair deduplicates.
      trackLead(eventId, {
        lead_type: 'form',
        concern: values.concern,
        preferred_time: values.timing,
      });

      show({
        id: 'form-result',
        tone: 'success',
        title: copy.toasts.success.title,
        message: copy.toasts.success.message,
      });
      setStatus('success');
    } catch (error) {
      console.error('[callback-form] submission failed', error);
      show({
        id: 'form-result',
        tone: 'error',
        title: copy.toasts.error.title,
        message: copy.toasts.error.message,
      });
      setStatus('error');
    }
  }

  const panel =
    status === 'success' ? (
      <FormShell>
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          // Focusing the panel announces it and scrolls it into view; the
          // scroll margin keeps the sticky header off the heading.
          className="scroll-mt-20 outline-none lg:scroll-mt-28"
        >
          <h2 className="section-heading">{copy.success.heading}</h2>
          <p className="mt-2 md:text-lead">{copy.success.body}</p>
          <p className="micro">{copy.success.micro}</p>
        </div>
      </FormShell>
    ) : (
      <FormShell>
        <h2 id={`${uid}-heading`} className="section-heading">
          {copy.heading}
        </h2>
        <p className="mt-2 text-caption md:text-lead">{copy.intro}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-3.5">
          {/* Honeypot. Hidden from people and from assistive tech, visible to bots. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
          >
            <label htmlFor={`${uid}-website`}>Website</label>
            <input
              id={`${uid}-website`}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <ChipGroup
            legend={copy.concernLabel}
            name={`${uid}-concern`}
            options={copy.concerns}
            value={values.concern}
            error={errors.concern}
            errorId={errorId('concern')}
            onChange={(value) => setValue('concern', value)}
            firstRef={(el) => {
              fieldRefs.current.concern = el;
            }}
          />

          <TextField
            id={fieldId('firstName')}
            label={copy.firstNameLabel}
            placeholder={copy.firstNamePlaceholder}
            value={values.firstName}
            error={errors.firstName}
            errorId={errorId('firstName')}
            autoComplete="given-name"
            onChange={(value) => setValue('firstName', value)}
            onBlur={() => validateField('firstName')}
            inputRef={(el) => {
              fieldRefs.current.firstName = el;
            }}
          />

          <TextField
            id={fieldId('phone')}
            label={copy.phoneLabel}
            placeholder={copy.phonePlaceholder}
            hint={copy.phoneHint}
            hintId={`${uid}-phone-hint`}
            value={values.phone}
            error={errors.phone}
            errorId={errorId('phone')}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            onChange={(value) => setValue('phone', value)}
            onBlur={() => validateField('phone')}
            inputRef={(el) => {
              fieldRefs.current.phone = el;
            }}
          />

          <TextField
            id={fieldId('email')}
            label={copy.emailLabel}
            placeholder={copy.emailPlaceholder}
            value={values.email}
            error={errors.email}
            errorId={errorId('email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            onChange={(value) => setValue('email', value)}
            onBlur={() => validateField('email')}
            inputRef={(el) => {
              fieldRefs.current.email = el;
            }}
          />

          <ChipGroup
            legend={copy.timingLabel}
            name={`${uid}-timing`}
            options={copy.timings}
            value={values.timing}
            error={errors.timing}
            errorId={errorId('timing')}
            onChange={(value) => setValue('timing', value)}
            firstRef={(el) => {
              fieldRefs.current.timing = el;
            }}
          />

          <div className="mt-[11px]">
            <div className="flex items-start gap-2">
              <input
                id={fieldId('consent')}
                type="checkbox"
                checked={values.consent}
                onChange={(event) => setValue('consent', event.target.checked)}
                onBlur={() => validateField('consent')}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={
                  errors.consent ? errorId('consent') : undefined
                }
                ref={(el) => {
                  fieldRefs.current.consent = el;
                }}
                className="mt-px h-6 w-6 flex-none cursor-pointer rounded-none border border-ghost accent-ink"
              />
              <label
                htmlFor={fieldId('consent')}
                className="cursor-pointer text-micro text-muted md:text-caption"
              >
                {copy.consent}
              </label>
            </div>
            {errors.consent && (
              <p id={errorId('consent')} className="field-error">
                {errors.consent}
              </p>
            )}
          </div>

          {/* A failed send is the one message that must survive the toast timing
            out, because the visitor may need to act on it minutes later. */}
          {status === 'error' && (
            <div
              role="alert"
              className="mt-3 border border-danger/30 bg-danger/[.04] px-3 py-2 text-micro text-danger md:text-caption"
            >
              <strong className="block font-bold">
                {copy.failure.heading}
              </strong>
              {copy.failure.body}
            </div>
          )}

          {/* The submit button never greys out. Pressing it with something
            missing raises a warning toast and flags the fields inline. */}
          <button
            type="submit"
            className="btn mt-3"
            aria-busy={status === 'submitting'}
          >
            {status === 'submitting' ? 'Sending…' : copy.submit}
          </button>
        </form>

        <p className="micro">{copy.micro}</p>
      </FormShell>
    );

  return (
    <>
      {panel}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

/**
 * Mobile: a soft band matching every other section. Desktop: a bordered card
 * pinned beside the hero, so the form is visible without scrolling.
 */
function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      id={FORM_ANCHOR}
      className={cn(
        'scroll-mt-14 border-b border-line bg-soft px-[18px] py-5 md:px-6 md:py-12',
        'lg:sticky lg:top-24 lg:scroll-mt-24 lg:rounded-lg lg:border lg:border-line lg:bg-white lg:px-7 lg:py-7 lg:shadow-card',
      )}
    >
      <div className="mx-auto w-full md:max-w-2xl lg:max-w-none">
        {children}
      </div>
    </div>
  );
}

function ChipGroup({
  legend,
  name,
  options,
  value,
  error,
  errorId,
  onChange,
  firstRef,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  value: string;
  error?: string;
  errorId: string;
  onChange: (value: string) => void;
  firstRef: (el: HTMLInputElement | null) => void;
}) {
  return (
    <fieldset className="mt-[11px] first:mt-0">
      <legend className="field-label">{legend}</legend>
      <div className="mb-1 flex flex-wrap gap-1.5">
        {options.map((option, index) => {
          const id = `${name}-${index}`;
          return (
            <div key={option}>
              <input
                ref={index === 0 ? firstRef : undefined}
                id={id}
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                // aria-invalid is not a supported attribute on role=radio, so
                // the error is announced through the description instead.
                aria-describedby={error ? errorId : undefined}
                className="chip-input sr-only"
              />
              <label htmlFor={id} className="chip">
                {option}
              </label>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function TextField({
  id,
  label,
  placeholder,
  hint,
  hintId,
  value,
  error,
  errorId,
  type = 'text',
  inputMode,
  autoComplete,
  onChange,
  onBlur,
  inputRef,
}: {
  id: string;
  label: string;
  placeholder: string;
  hint?: string;
  hintId?: string;
  value: string;
  error?: string;
  errorId: string;
  type?: 'text' | 'tel' | 'email';
  inputMode?: 'numeric' | 'email';
  autoComplete: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="mt-[11px]">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="field-input"
      />
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
