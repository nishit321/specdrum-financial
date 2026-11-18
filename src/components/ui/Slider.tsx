'use client';

import { useRef } from 'react';

// Themed replacement for <input type="range"> (WAI-ARIA slider). Same gold track
// and navy thumb as the old .sbf-range styles, in every browser.

export type SliderProps = {
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  labelledBy: string;
  valueText: (value: number) => string;
};

export function Slider({ id, value, min, max, step, onChange, labelledBy, valueText }: SliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min));
  const set = (v: number) => {
    const next = clamp(v);
    if (next !== value) onChange(next);
  };

  const fromPointer = (clientX: number) => {
    const rect = ref.current!.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    set(min + Math.min(1, Math.max(0, ratio)) * (max - min));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const big = Math.max(step, (max - min) / 10);
    const moves: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + big,
      PageDown: value - big,
      Home: min,
      End: max,
    };
    if (e.key in moves) {
      e.preventDefault();
      set(moves[e.key]);
    }
  };

  return (
    <div
      ref={ref}
      id={id}
      className="sbf-slider"
      role="slider"
      tabIndex={0}
      aria-labelledby={labelledBy}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText(value)}
      aria-orientation="horizontal"
      style={{ '--sbf-fill': `${pct}%` } as React.CSSProperties}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        e.preventDefault();
        ref.current?.focus();
        ref.current?.setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => {
        if (ref.current?.hasPointerCapture(e.pointerId)) fromPointer(e.clientX);
      }}
    >
      <span className="sbf-slider-track" aria-hidden="true" />
      <span className="sbf-slider-thumb" aria-hidden="true" />
    </div>
  );
}
