'use client';

import { useRef, useState } from 'react';
import type { ZodType } from 'zod';
import { newIdempotencyKey, postJson, submitErrorMessage } from '@/lib/forms/client';
import { fieldErrors, type QuoteFormName } from '@/lib/forms/quote-schema';

type Status = 'idle' | 'sending' | 'sent';

/**
 * Validate → send to /api/quote → success panel. After the first submit attempt
 * the browser check re-runs on every change, so an error disappears as soon as
 * the field is fixed. Errors returned by the server stay until that field changes.
 */
export function useQuoteSubmit<T extends Record<string, unknown>>(
  form: QuoteFormName,
  schema: ZodType<T>,
  initial: T,
  /** element id per field, to move focus to the first problem */
  ids: Record<keyof T & string, string>,
) {
  const [values, setValues] = useState<T>(initial);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const key = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (v: T) => {
    const r = schema.safeParse(v);
    return r.success ? {} : fieldErrors(r.error);
  };

  const errors: Record<string, string> = { ...serverErrors, ...(submitted ? validate(values) : {}) };

  const set = <K extends keyof T & string>(name: K, value: T[K]) => {
    // Changed data is a new submission: if an earlier attempt did reach the owner but the
    // answer got lost, re-sending under the old key would silently drop these edits.
    key.current = null;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerErrors((prev) => {
      if (!(name in prev)) return prev;
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
  };

  const focusFirstError = (errs: Record<string, string>) => {
    requestAnimationFrame(() => {
      const first = Object.keys(errs)[0] as keyof T & string;
      if (ids[first]) document.getElementById(ids[first])?.focus();
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, honeypot = '') => {
    e.preventDefault();
    if (status === 'sending') return;
    setSubmitted(true);
    setFormError(null);
    const errs = validate(values);
    if (Object.keys(errs).length) return focusFirstError(errs);

    key.current ??= newIdempotencyKey();
    setStatus('sending');
    const result = await postJson('/api/quote', { form, idempotencyKey: key.current, honeypot, data: values });
    if (result.ok) {
      setStatus('sent');
      setValues(initial);
      setSubmitted(false);
      setServerErrors({});
      key.current = null;
      return;
    }
    setStatus('idle');
    // the server already holds different details under this key: the next press needs a new one
    if (result.error === 'conflict') key.current = null;
    if (result.error === 'validation' && 'fields' in result && result.fields) {
      setServerErrors(result.fields);
      focusFirstError(result.fields);
    }
    setFormError(submitErrorMessage(result));
  };

  return { values, set, errors, status, formError, onSubmit, formRef };
}
