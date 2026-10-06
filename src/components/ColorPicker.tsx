import { useCallback, useRef } from 'react';
import './ColorPicker.css';

interface Props {
  color: string;
  onChange: (hex: string) => void;
}

/* ---------- colour space helpers ---------- */

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return [136, 92, 246];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return [h, max === 0 ? 0 : d / max, max];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/* ---------- draggable pointer helper ---------- */

/** Tracks a drag inside an element, reporting 0-1 coordinates. */
function useDragArea(onMove: (nx: number, ny: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const report = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      const ny = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
      onMove(nx, ny);
    },
    [onMove],
  );

  return {
    ref,
    onPointerDown: (e: React.PointerEvent) => {
      dragging.current = true;
      // Report first: pointer capture can throw for a pointer the browser
      // does not consider active, and it must not swallow the interaction.
      report(e.clientX, e.clientY);
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } catch {
        /* capture is an optimisation, not a requirement */
      }
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!dragging.current) return;
      report(e.clientX, e.clientY);
    },
    onPointerUp: (e: React.PointerEvent) => {
      dragging.current = false;
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {
        /* capture may not have been granted */
      }
    },
  };
}

/* ---------- picker ---------- */

/**
 * Saturation/brightness square plus a hue bar, with a row of presets.
 * Keeps the hue of the incoming colour so switching to the custom picker
 * does not jump to an unrelated colour.
 */
export function ColorPicker({ color, onChange }: Props) {
  const [h, s, v] = (() => {
    const [r, g, b] = hexToRgb(color);
    return rgbToHsv(r, g, b);
  })();

  const pureHue = hsvToRgb(h, 1, 1);
  const pureHueHex = rgbToHex(...pureHue);

  const square = useDragArea((nx, ny) => {
    onChange(rgbToHex(...hsvToRgb(h, nx, 1 - ny)));
  });

  const bar = useDragArea((nx) => {
    onChange(rgbToHex(...hsvToRgb(nx * 360, s, v)));
  });

  return (
    <div className="color-picker">
      <div className="color-picker-row">
        <div
          className="color-sv"
          ref={square.ref}
          onPointerDown={square.onPointerDown}
          onPointerMove={square.onPointerMove}
          onPointerUp={square.onPointerUp}
          style={{ background: `linear-gradient(to top, #000, transparent), ${pureHueHex}` }}
          role="application"
          aria-label="Saturation and brightness"
        >
          <span
            className="color-dot"
            style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%` }}
          />
        </div>

        <div
          className="color-hue"
          ref={bar.ref}
          onPointerDown={bar.onPointerDown}
          onPointerMove={bar.onPointerMove}
          onPointerUp={bar.onPointerUp}
          role="application"
          aria-label="Hue"
        >
          <span className="color-hue-dot" style={{ top: `${(h / 360) * 100}%` }} />
        </div>
      </div>

      <div className="color-readout">
        <span className="color-readout-chip" style={{ background: color }} />
        <span className="color-readout-hex">{color.toUpperCase()}</span>
      </div>
    </div>
  );
}
