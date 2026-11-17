'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Option } from '@/lib/forms/options';

// Themed replacement for <select>, following the WAI-ARIA "select-only combobox"
// pattern. Closed, it uses the same classes as the old native select so it looks
// identical; open, it shows a themed list instead of the browser's.

export type SelectProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  /** Shown while nothing is selected (the old disabled first <option>). */
  placeholder?: string;
  /** Classes of the native select this replaces, e.g. "sbf-field-select" or "form-select sbf-select". */
  className: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  describedBy?: string;
  onBlur?: () => void;
};

const PAGE = 10;

export function Select({ id, name, value, onChange, options, placeholder, className, invalid, required, disabled, describedBy, onBlur }: SelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [listLabel, setListLabel] = useState<string | undefined>();
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });
  // Tab keeps an option only when it was reached with the keyboard, not merely hovered.
  const keyboardMoved = useRef(false);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const openList = useCallback(
    (index: number, movedByKeyboard = false) => {
      setActive(Math.max(0, Math.min(index, options.length - 1)));
      keyboardMoved.current = movedByKeyboard;
      setListLabel(document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent?.replace(/\*/g, '').trim() || undefined);
      setOpen(true);
    },
    [options.length, id],
  );

  const choose = (i: number) => {
    const option = options[i];
    if (option && option.value !== value) onChange(option.value);
    setOpen(false);
  };

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || active < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[id="${listId}-opt-${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, active, listId]);

  /** Index of the next option starting with what was typed in the last 600 ms, or -1. */
  const typeahead = (char: string) => {
    const now = Date.now();
    const t = typed.current;
    t.text = now - t.at > 600 ? char : t.text + char;
    t.at = now;
    const text = t.text.toLowerCase();
    const from = open ? active : selectedIndex;
    // typing the same single letter again moves on to the next match
    const base = from < 0 ? 0 : from + (text.length === 1 ? 1 : 0);
    for (let k = 0; k < options.length; k++) {
      const i = (base + k) % options.length;
      if (options[i].label.toLowerCase().startsWith(text)) return i;
    }
    return -1;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList(selectedIndex >= 0 ? selectedIndex : 0);
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        openList(e.key === 'Home' ? 0 : last, true);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const i = typeahead(e.key);
        if (i >= 0) openList(i, true);
      }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(e.key) || (e.key.length === 1 && e.key !== ' ')) {
      keyboardMoved.current = true;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (e.altKey) choose(active);
        else setActive((a) => Math.min(a + 1, last));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.altKey) choose(active);
        else setActive((a) => Math.max(a - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(last);
        break;
      case 'PageDown':
        e.preventDefault();
        setActive((a) => Math.min(a + PAGE, last));
        break;
      case 'PageUp':
        e.preventDefault();
        setActive((a) => Math.max(a - PAGE, 0));
        break;
      case 'Enter':
        e.preventDefault();
        choose(active);
        break;
      case ' ':
        e.preventDefault();
        if (Date.now() - typed.current.at < 600) {
          const i = typeahead(' ');
          if (i >= 0) setActive(i);
        } else choose(active);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        if (keyboardMoved.current) choose(active);
        else setOpen(false);
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const i = typeahead(e.key);
          if (i >= 0) setActive(i);
        }
    }
  };

  const triggerClass = [className, 'sbf-dd-trigger', !selected && 'is-placeholder', invalid && 'is-invalid'].filter(Boolean).join(' ');

  return (
    <div className={`sbf-dd${open ? ' is-open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        id={id}
        className={triggerClass}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList(selectedIndex >= 0 ? selectedIndex : 0))}
        onKeyDown={onKeyDown}
        // Firefox turns a Space keyup on a button into a click, which would close the list again
        onKeyUp={(e) => e.key === ' ' && e.preventDefault()}
        onBlur={(e) => {
          if (!wrapRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
            onBlur?.();
          }
        }}
      >
        <span className="sbf-dd-value">{selected ? selected.label : placeholder ?? ''}</span>
      </button>
      {name && <input type="hidden" name={name} value={value} />}
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={listLabel}
        className="sbf-dd-list"
        hidden={!open}
        tabIndex={-1}
        // keep focus on the button while picking with the mouse
        onPointerDown={(e) => e.preventDefault()}
      >
        {options.map((o, i) => (
          <li
            key={o.value}
            id={optionId(i)}
            role="option"
            aria-selected={o.value === value}
            className={`sbf-dd-option${i === active ? ' is-active' : ''}`}
            onPointerEnter={() => setActive(i)}
            onClick={() => choose(i)}
          >
            <span>{o.label}</span>
            {o.value === value && (
              <svg className="sbf-dd-check" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
