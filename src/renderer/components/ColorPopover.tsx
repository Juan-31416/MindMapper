import React, { useRef, useEffect } from 'react';
import { DEFAULT_COLORS } from '../types/mindmap';
import '../styles/NodeEditor.css';

type Props = {
  anchorRect?: DOMRect | null;
  style: any;
  onChange: (patch: Partial<any>) => void;
  onClose: () => void;
};

const ColorPopover: React.FC<Props> = ({ style, onChange, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null);

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

  const setColor = (color: string) => onChange({ backgroundColor: color, backgroundType: 'solid' });

  return (
    <div className="popover" ref={ref}>
      <div className="popover-section">
        <div className="popover-grid">
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${style.backgroundColor === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Set background ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="popover-section">
        <label className="popover-row">
          <input
            type="checkbox"
            checked={style.backgroundType === 'none'}
            onChange={(e) => onChange({ backgroundType: e.target.checked ? 'none' : 'solid' })}
          />
          <span>Sin fondo</span>
        </label>

        {style.backgroundType !== 'none' && (
          <label className="popover-row">
            <span>Opacidad {style.backgroundOpacity ?? 100}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={style.backgroundOpacity ?? 100}
              onChange={(e) => onChange({ backgroundOpacity: parseInt(e.target.value, 10) })}
            />
          </label>
        )}
      </div>

      <div className="popover-footer">
        <button className="btn secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ColorPopover;