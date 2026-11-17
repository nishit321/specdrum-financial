'use client';

import { useEffect, useId, useRef, useState } from 'react';

// Themed replacement for <input list> + <datalist>: free text with a themed
// suggestion list (WAI-ARIA combobox with list autocomplete).

export type ComboboxProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly string[];
  className: string;
  placeholder?: string;
  maxLength?: number;
  invalid?: boolean;
  describedBy?: string;
};

export function Combobox({ id, name, value, onChange, suggestions, className, placeholder, maxLength, invalid, describedBy }: ComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase();
  // like a datalist: everything when empty, otherwise the suggestions containing the text
  const matches = suggestions.filter((s) => !query || (s.toLowerCase().includes(query) && s.toLowerCase() !== query));
  const showList = open && matches.length > 0;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const pick = (s: string) => {
    onChange(s);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && showList && active >= 0) {
      e.preventDefault();
      pick(matches[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="sbf-dd" ref={wrapRef}>
      <input
        type="text"
        id={id}
        name={name}
        className={`${className}${invalid ? ' is-invalid' : ''}`}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={(e) => {
          if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        onKeyDown={onKeyDown}
      />
      <ul id={listId} role="listbox" className="sbf-dd-list" hidden={!showList} tabIndex={-1} onPointerDown={(e) => e.preventDefault()}>
        {matches.map((s, i) => (
          <li
            key={s}
            id={`${listId}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            className={`sbf-dd-option${i === active ? ' is-active' : ''}`}
            onPointerEnter={() => setActive(i)}
            onClick={() => pick(s)}
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
