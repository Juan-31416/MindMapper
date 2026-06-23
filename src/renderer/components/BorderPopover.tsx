// src/renderer/components/BorderPopover.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import { DEFAULT_COLORS, ALL_STANDARD_COLORS, NodeStyle } from '../types/mindmap';
import { 
  isValidHex,
  isValidRgbComponents,
  normalizeHex,
  hexToRgb,
  rgbToHex,
} from '../utils/colorUtils';
import '../styles/ColorPopover.css';


const PALETTE_COLORS: readonly string[] =
typeof ALL_STANDARD_COLORS !== 'undefined' ? ALL_STANDARD_COLORS : DEFAULT_COLORS;

type Props = {
  anchorRect?: DOMRect | null;
  style: NodeStyle;
  onChange: (patch: Partial<any>) => void;
  onClose: () => void;
};

const toPickerHex = (color: string): string => {
  const normalized = normalizeHex(color);
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : '#60a5fa';
};

const rgbToString = (hex: string): string => {
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '';
};



// ── FloatPicker ──
interface FloatPickerProps {
  color: string;
  anchorRect: DOMRect;
  onChange: (hex: string) => void;
  onClose: () => void;
}

const FloatPicker: React.FC<FloatPickerProps> = ({ color, anchorRect, onChange, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  const style = useCallback((): React.CSSProperties => {
    const W = 240; 
    const H = 210; 
    const GAP = 6;
    let top = anchorRect.top;
    let left = anchorRect.right + GAP;

    if (left + W > window.innerWidth - 8) left = anchorRect.left - W - GAP;
    if (top + H > window.innerHeight - 8) top = window.innerHeight - H - 8;
    if (top < 8) top = 8;
    return { top, left };
  }, [anchorRect]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onEsc);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return createPortal(
    <div className="color-picker-float" ref={ref} style={style()}>
      <HexColorPicker color={color} onChange={onChange} />
    </div>,
    document.body
  );
};



// ── Main Component ──
const BorderPopover: React.FC<Props> = ({ anchorRect, style, onChange, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [computedStyle, setComputedStyle] = useState<React.CSSProperties>({});
  const [showPicker, setShowPicker] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null);

  const currentColor = style.borderColor || style.backgroundColor;
  const [pickerColor, setPickerColor] = useState<string>(toPickerHex(currentColor));
  const [hexInput, setHexInput] = useState<string>(toPickerHex(currentColor));
  const [rgbInput, setRgbInput] = useState<string>(rgbToString(currentColor));
  const [hexError, setHexError] = useState(false);
  const [rgbError, setRgbError] = useState(false);

  useEffect(() => {
    const normalized = toPickerHex(style.borderColor || style.backgroundColor);
    setPickerColor(normalized);
    setHexInput(normalized);
    setRgbInput(rgbToString(normalized));
  }, [style.borderColor, style.backgroundColor]);

  // Positioning
  useEffect(() => {
    if (!anchorRect) return;
    const GAP = 8;
    const POPOVER_W = 260;
    const POPOVER_H = 420;
    const VIEWPORT_H = window.innerHeight;
    const VIEWPORT_W = window.innerWidth;

    let top = anchorRect.bottom + GAP;
    let left = anchorRect.left;

    if (top + POPOVER_H > VIEWPORT_H - 16) {
      const spaceAbove = anchorRect.top - GAP;
      top = spaceAbove > POPOVER_H
        ? anchorRect.top - POPOVER_H - GAP
        : VIEWPORT_H - POPOVER_H - 16;
    }
    if (left + POPOVER_W > VIEWPORT_W - 16) left = VIEWPORT_W - POPOVER_W - 16;
    if (top < 16) top = 16;

    setComputedStyle({ top, left, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' });
  }, [anchorRect]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const applyColor = useCallback((hex: string) => {
    const normalized = normalizeHex(hex);
    setPickerColor(normalized);
    setHexInput(normalized);
    setRgbInput(rgbToString(normalized));
    setHexError(false);
    setRgbError(false);
    onChange({ borderColor: normalized });
  }, [onChange]);

  const handlePickerChange = (hex: string) => {
    setPickerColor(hex);
    setHexInput(hex);
    setRgbInput(rgbToString(hex));
    onChange({ borderColor: hex });
  };

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    const withHash = raw.startsWith('#') ? raw : `#${raw}`;
    if (isValidHex(withHash)) { setHexError(false); applyColor(withHash); }
    else setHexError(true);
  };

  const handleRgbChange = (raw: string) => {
    setRgbInput(raw);
    const parts = raw.split(/[\s,]+/).map(Number);
    if (parts.length === 3 && isValidRgbComponents(parts[0], parts[1], parts[2])) {
      setRgbError(false);
      applyColor(rgbToHex(parts[0], parts[1], parts[2]));
    } else setRgbError(true);
  };

  const handleTogglePicker = () => {
    if (!showPicker) {
      setPickerAnchor(pickerTriggerRef.current?.getBoundingClientRect() ?? null);
    }
    setShowPicker(v => !v);
  };

  return createPortal(
    <>
      <div className="color-popover" ref={ref} style={computedStyle} role="dialog" aria-label="Editor de borde">
        {/* Header */}
        <div className="color-popover__header">
          <span>🖊 Borde</span>
          <button className="color-popover__close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* 1. Border style */}
        <div className="color-popover__section">
          <span className="color-popover__section-label">Estilo</span>
          <div className="btn-group">
            <button className={`seg ${style.borderStyle === 'none' ? 'active' : ''}`} onClick={() => onChange({ borderStyle: 'none' })}>Ninguno</button>
            <button className={`seg ${style.borderStyle === 'bottom' ? 'active' : ''}`} onClick={() => onChange({ borderStyle: 'bottom' })}>Inferior</button>
            <button className={`seg ${style.borderStyle === 'full' ? 'active' : ''}`} onClick={() => onChange({ borderStyle: 'full' })}>Completo</button>
          </div>
        </div>

        {/* 2. Thikness */}
        <div className="color-popover__section">
          <div className="color-popover__opacity-label">
            <span className="color-popover__section-label">Grosor</span>
            <span style={{ fontWeight: 600, color: '#2563eb' }}>{style.borderWidth ?? 2}px</span>
          </div>
          <input
            type="range"
            className="color-popover__slider"
            min={0}
            max={8}
            value={style.borderWidth ?? 2}
            onChange={(e) => onChange({ borderWidth: parseInt(e.target.value, 10) })}
          />
        </div>

        <div className="color-popover__divider" />

        {/* 3. Standard Palette */}
        <div className="color-popover__section">
          <span className="color-popover__section-label">Paleta</span>
          <div className="color-popover__palette">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c}
                className={`color-popover__swatch${currentColor === c ? ' color-popover__swatch--active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => applyColor(c)}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="color-popover__divider" />

        {/* 4. Picker trigger + inputs */}
        <div className="color-popover__section">
          <button
            ref={pickerTriggerRef}
            className="color-popover__picker-trigger"
            onClick={handleTogglePicker}
          >
            <span className="color-popover__picker-trigger-swatch" style={{ backgroundColor: pickerColor }} />
            <span>Color personalizado {showPicker ? '▲' : '▼'}</span>
          </button>

          <div className="color-popover__inputs">
            <div className="color-popover__input-group">
              <label htmlFor="bp-hex">HEX</label>
              <input
                id="bp-hex"
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#60a5fa"
                maxLength={7}
                className={hexError ? 'error' : ''}
                spellCheck={false}
              />
            </div>
            <div className="color-popover__input-group">
              <label htmlFor="bp-rgb">RGB</label>
              <input
                id="bp-rgb"
                type="text"
                value={rgbInput}
                onChange={(e) => handleRgbChange(e.target.value)}
                placeholder="96, 165, 250"
                className={rgbError ? 'error' : ''}
                spellCheck={false}
              />
            </div>
            <div className="color-popover__preview" style={{ backgroundColor: pickerColor }} title={pickerColor} />
          </div>
        </div>
      </div>

      {showPicker && pickerAnchor && (
        <FloatPicker
          color={pickerColor}
          anchorRect={pickerAnchor}
          onChange={handlePickerChange}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>,
    document.body
  );
};

export default BorderPopover;