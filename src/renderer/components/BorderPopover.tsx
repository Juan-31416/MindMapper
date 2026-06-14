// src/renderer/components/BorderPopover.tsx
import React, { useRef, useEffect } from 'react';
import { DEFAULT_COLORS } from '../types/mindmap';
import '../styles/NodeEditor.css';

type Props = {
  style: any;
  onChange: (patch: Partial<any>) => void;
  onClose: () => void;
};

const BorderPopover: React.FC<Props> = ({ style, onChange, onClose }) => {
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

  return (
    <div className="popover" ref={ref}>
      <div className="popover-section">
        <div className="btn-group">
          <button
            className={`seg ${style.borderStyle === 'none' ? 'active' : ''}`}
            onClick={() => onChange({ borderStyle: 'none' })}
          >Ninguno</button>
          <button
            className={`seg ${style.borderStyle === 'bottom' ? 'active' : ''}`}
            onClick={() => onChange({ borderStyle: 'bottom' })}
          >Inferior</button>
          <button
            className={`seg ${style.borderStyle === 'full' ? 'active' : ''}`}
            onClick={() => onChange({ borderStyle: 'full' })}
          >Completo</button>
        </div>
      </div>

      <div className="popover-section">
        <label className="popover-row">
          <span>Grosor {style.borderWidth ?? 2}px</span>
          <input
            type="range"
            min={0}
            max={8}
            value={style.borderWidth ?? 2}
            onChange={(e) => onChange({ borderWidth: parseInt(e.target.value, 10) })}
          />
        </label>
      </div>

      <div className="popover-section">
        <div className="popover-grid">
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${ (style.borderColor || style.backgroundColor) === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onChange({ borderColor: c })}
            />
          ))}
        </div>

        <div className="popover-row">
          <label>Color exacto</label>
          <input
            type="color"
            value={style.borderColor || style.backgroundColor}
            onChange={(e) => onChange({ borderColor: e.target.value })}
          />
        </div>
      </div>

      <div className="popover-footer">
        <button className="btn secondary" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default BorderPopover;