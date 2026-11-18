'use client';

import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';

// Draw-your-signature canvas. Pointer events cover mouse, touch and pen. The
// drawing survives going back to an earlier step and window resizes (the old
// page cleared it), and the exported PNG is cropped to the ink.

export type SignaturePadHandle = {
  isEmpty: () => boolean;
  /** Cropped PNG data URL, or null when nothing was drawn. */
  toDataUrl: () => string | null;
  clear: () => void;
  /** Clears the pad when it holds a typed (not drawn) signature, e.g. after the printed name changed. */
  clearIfTyped: () => void;
};

const SCALE = 2; // backing store resolution, same as the static page
const MIN_INK_PX = 25; // total stroke length; a stray tap is not a signature
const MAX_EXPORT_WIDTH = 1200;

type Props = {
  ref?: React.Ref<SignaturePadHandle>;
  /** true while step 3 is on screen, so the canvas can measure itself */
  active: boolean;
  invalid?: boolean;
  onChange: (hasSignature: boolean) => void;
  describedBy?: string;
  /** the printed name; "Sign with my printed name" writes it on the pad for people who can't draw */
  typedName: string;
};

export function SignaturePad({ ref, active, invalid, onChange, describedBy, typedName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const inkLength = useRef(0);
  const typed = useRef(false);

  const ctx =() => canvasRef.current?.getContext('2d') ?? null;

  const style = (c: CanvasRenderingContext2D) => {
    c.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    c.strokeStyle = '#0f172a';
    c.fillStyle = '#0f172a';
    c.lineWidth = 2.5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
  };

  /** Matches the backing store to the on-screen size, keeping what is already drawn. */
  const fit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const w = Math.round(rect.width * SCALE);
    const h = Math.round(rect.height * SCALE);
    if (canvas.width === w && canvas.height === h) return;
    let snapshot: HTMLCanvasElement | null = null;
    if (inkLength.current > 0 && canvas.width > 0) {
      snapshot = document.createElement('canvas');
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext('2d')?.drawImage(canvas, 0, 0);
    }
    canvas.width = w;
    canvas.height = h;
    const c = ctx();
    if (!c) return;
    style(c);
    if (snapshot) {
      // keep the proportions; only shrink when the pad got smaller (e.g. a phone was rotated)
      const oldW = snapshot.width / SCALE;
      const oldH = snapshot.height / SCALE;
      const scale = Math.min(1, rect.width / oldW, rect.height / oldH);
      c.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, oldW * scale, oldH * scale);
    }
  }, []);

  useEffect(() => {
    if (active) fit();
  }, [active, fit]);

  useEffect(() => {
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [fit]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const c = ctx();
    if (!canvas || !c) return;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    style(c);
    inkLength.current = 0;
    typed.current = false;
    onChange(false);
  }, [onChange]);

  /** Keyboard / screen-reader alternative: the printed name in a handwriting-like face. */
  const signWithName = () => {
    const name = typedName.trim();
    const canvas = canvasRef.current;
    const c = ctx();
    if (!name || !canvas || !c) return;
    fit();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    style(c);
    const w = canvas.width / SCALE;
    const h = canvas.height / SCALE;
    let size = Math.min(44, h * 0.42);
    const font = (px: number) => `italic 600 ${px}px "Playfair Display", Georgia, "Times New Roman", serif`;
    c.font = font(size);
    while (size > 14 && c.measureText(name).width > w - 40) c.font = font((size -= 2));
    c.textBaseline = 'middle';
    c.fillText(name, 20, h / 2);
    inkLength.current = Math.max(MIN_INK_PX, c.measureText(name).width);
    typed.current = true;
    onChange(true);
  };

  useImperativeHandle(
    ref,
    () => ({
      isEmpty: () => inkLength.current < MIN_INK_PX,
      clear,
      clearIfTyped: () => {
        if (typed.current) clear();
      },
      toDataUrl: () => {
        const canvas = canvasRef.current;
        if (!canvas || inkLength.current < MIN_INK_PX) return null;
        const { width, height } = canvas;
        const data = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
        let minX = width, minY = height, maxX = -1, maxY = -1;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 0) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (maxX < 0) return null;
        const pad = 12;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(width - 1, maxX + pad);
        maxY = Math.min(height - 1, maxY + pad);
        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;
        const ratio = Math.min(1, MAX_EXPORT_WIDTH / cropW);
        const out = document.createElement('canvas');
        out.width = Math.max(1, Math.round(cropW * ratio));
        out.height = Math.max(1, Math.round(cropH * ratio));
        out.getContext('2d')!.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, out.width, out.height);
        return out.toDataURL('image/png');
      },
    }),
    [clear],
  );

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    fit();
    const c = ctx();
    if (!c) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    typed.current = false; // drawn by hand from here on
    const p = point(e);
    last.current = p;
    c.beginPath();
    c.arc(p.x, p.y, c.lineWidth / 2, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(p.x, p.y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = ctx();
    if (!c || !last.current) return;
    const p = point(e);
    c.lineTo(p.x, p.y);
    c.stroke();
    inkLength.current += Math.hypot(p.x - last.current.x, p.y - last.current.y);
    last.current = p;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    onChange(inkLength.current >= MIN_INK_PX);
  };

  return (
    <div className={`sbf-sign-pad-wrap${invalid ? ' is-invalid' : ''}`}>
      <canvas
        ref={canvasRef}
        id="sbfSignCanvas"
        className="sbf-sign-canvas"
        width={800}
        height={160}
        style={{ touchAction: 'none' }}
        role="img"
        aria-label="Signature area. Draw your signature with a mouse, finger or stylus."
        aria-describedby={describedBy}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
      />
      <div className="sbf-sign-tools">
        <span>Sign above using your finger or mouse</span>
        <span className="d-inline-flex gap-3">
          <button
            type="button"
            id="btnTypedSign"
            className="btn btn-sm btn-link text-decoration-none p-0 fw-bold"
            onClick={signWithName}
            disabled={!typedName.trim()}
          >
            Sign with my printed name
          </button>
          <button type="button" id="btnClearSign" className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-bold" onClick={clear}>
            Clear Signature
          </button>
        </span>
      </div>
    </div>
  );
}
