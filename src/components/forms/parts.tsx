'use client';

export function FormAlert({ message }: { message: string }) {
  return (
    <div className="sbf-form-alert" role="alert">
      <span>{message}</span>
    </div>
  );
}

/**
 * Shown only when JavaScript is off: the forms are sent by script, and without it nothing
 * would happen (the form posts, so no details ever end up in the address bar).
 */
export function NoScriptNotice() {
  return (
    <noscript>
      <div className="sbf-form-alert">
        <span>
          This form needs JavaScript to send. Please turn it on, or call us at <a href="tel:18002147498">1-800-214-7498</a>.
        </span>
      </div>
      {/* the notice above already says it; don't show the "still loading" hint as well */}
      <style>{'.sbf-late-hint{display:none}'}</style>
    </noscript>
  );
}

/**
 * For the page that never finished loading (a blocked or failed script): the button stays
 * disabled, so after a few seconds this says why. CSS keeps it invisible until then, and it
 * is gone as soon as the form is ready, so a normal visit never sees it.
 */
export function LateScriptHint({ ready }: { ready: boolean }) {
  if (ready) return null;
  return (
    <p className="sbf-late-hint">
      Still loading? If the button stays grey, please refresh the page, or call us at <a href="tel:18002147498">1-800-214-7498</a>.
    </p>
  );
}

export function SubmitLabel({ sending, label, sendingLabel }: { sending: boolean; label: string; sendingLabel: string }) {
  return sending ? (
    <>
      <span className="sbf-btn-spinner" aria-hidden="true" />
      {sendingLabel}
    </>
  ) : (
    <>
      {label} <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
    </>
  );
}
