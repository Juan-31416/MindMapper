import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '../styles/ColorPopover.css';
import { HexColorPicker } from 'react-colorful';
import { useMindMapStore } from '../store/mindMapStore';
import { NodeStyle } from '../types/mindmap';
import { 
  isValidHex,
  isValidRgbComponents,
  normalizeHex,
  hexToRgb,
  rgbToHex,
} from '../utils/colorUtils';
import { STANDARD_PALETTE,
  ALL_STANDARD_COLORS,
  DEFAULT_COLORS,
} from '../types/mindmap';


// ── Palette ──
const PALETTE_COLORS: readonly string[] = typeof ALL_STANDARD_COLORS !== 'undefined' ? ALL_STANDARD_COLORS : DEFAULT_COLORS;



// ── Types ──
interface Props {
  anchorRect?: DOMRect | null;
  style: NodeStyle;
  onChange: (patch: Partial<NodeStyle>) => void;
  onClose: () => void;
};



// ── Helpers ──
const toPickerHex = (color: string): string => {
  const normalized = normalizeHex(color);

  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : '#60a5fa';
};

const rgbToString = (hex: string): string => {
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '';
};



// ── Component ──
const ColorPopover: React.FC<Props> = ({ anchorRect, style, onChange, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Store actions
  const favoriteColors = useMindMapStore((s) => s.favoriteColors);
  const addFavoriteColor = useMindMapStore((s) => s.addFavoriteColor);
  const removeFavoriteColor= useMindMapStore((s) => s.removeFavoriteColor);

  // Local state for imputs
  const [pickerColor,setPickerColor] = useState<string>(toPickerHex(style.backgroundColor));
  const [hexInput, setHexInput] = useState<string>(toPickerHex(style.backgroundColor));
  const [rgbInput, setRgbInput] = useState<string>(rgbToString(style.backgroundColor));
  const [hexError, setHexError] = useState(false);
  const [rgbError, setRgbError] = useState(false);

  // Syncronization
  useEffect(() => {
    const normalized =toPickerHex(style.backgroundColor);
    setPickerColor(normalized);
    setHexInput(normalized);
    setRgbInput(rgbToString(normalized));
    setHexError(false);
    setRgbError(false);
  }, [style.backgroundColor]);

  // Close by outside click / Esc
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  // Poitioning of popover
  const [computedStyle, setComputedStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!anchorRect) return;

    const GAP = 8;
    const POPOVER_W = 260;
    const POPOVER_H = 650;
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

    if (left + POPOVER_W > VIEWPORT_W - 16) {
      left = VIEWPORT_W - POPOVER_W - 16;
    }

    if (top < 16) top = 16;

    setComputedStyle({
      top,
      left,
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
    });
  }, [anchorRect]);

  // Apply color
  const applyColor = useCallback((hex: string) => {
    const normalized = normalizeHex(hex);
    setPickerColor(normalized);
    setHexInput(normalized);
    setRgbInput(rgbToString(normalized));
    setHexError(false);
    setRgbError(false);
    onChange({backgroundColor: normalized, backgroundType: 'solid' });
  }, [onChange]);

  // Picker
  const handlePickerChange = (hex: string) => {
    setPickerColor(hex);
    setHexInput(hex);
    setRgbInput(rgbToString(hex));
    onChange({ backgroundColor:hex, backgroundType: 'solid' });
  };


  // Inputs
  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    const withHash = raw.startsWith('#') ? raw : `#${raw}`;
    if (isValidHex(withHash)) {
      setHexError(false);
      applyColor(withHash);
    } else {
      setHexError(true);
    }
  };

  const handleRgbChange = (raw: string) => {
    setRgbInput(raw);
    const parts = raw.split(/[\s,]+/).map(Number);
    if (parts.length === 3 && isValidRgbComponents(parts[0], parts[1], parts[2])) {
      setRgbError(false);
      const hex = rgbToHex(parts[0], parts[1], parts[2]);
      applyColor(hex);
    } else {
      setRgbError(true);
    }
  };


  // Favorites
  const isAlreadyFavorite = favoriteColors.some(
    (f) => f.color === normalizeHex(pickerColor)
  );

  const handleAddFavorite = () => {
    if (!isAlreadyFavorite) addFavoriteColor(pickerColor);
  };


  return createPortal(
    <div className="color-popover" ref={ref} style={computedStyle} role='dialog' aria-label='Selector de color'>
      {/** Header */}
      <div className='color-popover__header'>
        <span>🎨 Color de fondo</span>
        <button
          className="color-popover__close-btn"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/** Standard Palete */}
      <div className="color-popover__section">
        <span className="color-popover__section-label">Paleta</span>
        <div className="color-popover__palette">
          {PALETTE_COLORS.map((c) => (
            <button
              key={c}
              className={`color-popover__swatch${
                style.backgroundColor === c ? ' color-popover__swatch--active' : ''
              }`}
              style={{ backgroundColor: c }}
              onClick={() => applyColor(c)}
              aria-label={`Color ${c}`}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="color-popover__divider" />

      {/** Picker */}
      <div className="color-popover__section">
        <span className="color-popover__section-label">Picker</span>
        <div className="color-popover__picker">
          <HexColorPicker color={pickerColor} onChange={handlePickerChange} />
        </div>
      </div>

      {/** Inputs HEX / RGB */}
      <div className="color-popover__inputs">
        <div className="color-popover__input-group">
          <label htmlFor="cp-hex">HEX</label>
          <input
            id="cp-hex"
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
          <label htmlFor="cp-rgb">RGB</label>
          <input
            id="cp-rgb"
            type="text"
            value={rgbInput}
            onChange={(e) => handleRgbChange(e.target.value)}
            placeholder="96, 165, 250"
            className={rgbError ? 'error' : ''}
            spellCheck={false}
          />
        </div>
        <div
          className="color-popover__preview"
          style={{ backgroundColor: pickerColor }}
          title={pickerColor}
        />
      </div>

      <div className="color-popover__divider" />

      {/** Favoritos */}
      <div className="color-popover__section">
        <div className="color-popover__favorites-header">
          <span className="color-popover__section-label">★ Favoritos</span>
          <button
            className="color-popover__add-fav-btn"
            onClick={handleAddFavorite}
            disabled={isAlreadyFavorite}
            title={isAlreadyFavorite ? 'Ya está en favoritos' : 'Añadir color actual'}
          >
            {isAlreadyFavorite ? '✓ Guardado' : '+ Añadir'}
          </button>
        </div>
        <div className="color-popover__favorites-grid">
          {favoriteColors.length === 0 ? (
            <span className="color-popover__favorites-empty">
              Sin favoritos aún
            </span>
          ) : (
            favoriteColors.map((fav) => (
              <div
                key={fav.color}
                className={`color-popover__fav-swatch${
                  style.backgroundColor === fav.color
                    ? ' color-popover__fav-swatch--active'
                    : ''
                }`}
                style={{ backgroundColor: fav.color }}
                onClick={() => applyColor(fav.color)}
                title={fav.color}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && applyColor(fav.color)}
              >
                <button
                  className="color-popover__fav-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavoriteColor(fav.color);
                  }}
                  aria-label={`Eliminar ${fav.color} de favoritos`}
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="color-popover__divider" />

      {/** Opacity + no background */}
      <div className="color-popover__section">
        <label className="color-popover__no-bg-row">
          <input
            type="checkbox"
            checked={style.backgroundType === 'none'}
            onChange={(e) =>
              onChange({ backgroundType: e.target.checked ? 'none' : 'solid' })
            }
          />
          Sin fondo
        </label>

        {style.backgroundType !== 'none' && (
          <div className="color-popover__opacity-row">
            <div className="color-popover__opacity-label">
              <span>Opacidad</span>
              <span>{style.backgroundOpacity ?? 100}%</span>
            </div>
            <input
              type="range"
              className="color-popover__slider"
              min={0}
              max={100}
              value={style.backgroundOpacity ?? 100}
              onChange={(e) =>
                onChange({ backgroundOpacity: parseInt(e.target.value, 10) })
              }
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ColorPopover;