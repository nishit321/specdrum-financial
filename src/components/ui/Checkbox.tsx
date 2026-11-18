'use client';

// Themed checkbox. The real <input type="checkbox"> stays in place (keyboard,
// screen readers, the label click) but is invisible; the box drawn next to it
// looks the same in every browser.

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  invalid?: boolean;
};

export function Checkbox({ checked, onChange, invalid, className, ...rest }: CheckboxProps) {
  return (
    <span className="sbf-cbx">
      <input
        {...rest}
        type="checkbox"
        className={['sbf-cbx-input', invalid && 'is-invalid', className].filter(Boolean).join(' ')}
        checked={checked}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="sbf-cbx-box" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}
