import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import { NodeStyle } from '../types/mindmap';
import { useMindMapStore } from '../store/mindMapStore';
import '../styles/IconPopover.css';



const COMMON_ICONS = [
    'Circle', 'Star', 'Heart', 'Lightbulb', 'Target', 'Zap',
    'CheckCircle', 'AlertCircle', 'XCircle', 'Info',
    'Folder', 'File', 'Book', 'Bookmark',
    'User', 'Users', 'MessageSquare', 'Mail',
    'Calendar', 'Clock', 'Flag', 'Award',
    'TrendingUp', 'Activity', 'BarChart', 'PieChart',
];
const POPOVER_W = 248;
const POPOVER_H = 320;
const GAP = 8;



interface IconPopoverProps {
    anchorRect: DOMRect | null;
    style: NodeStyle;
    onChange: (patch: Partial<NodeStyle>) => void;
    onClose: () => void;
}

const IconPopover: React.FC<IconPopoverProps> = ({ anchorRect, style, onChange, onClose }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [computedStyle, setComputeStyle] = useState<React.CSSProperties>({});
    const { updateAllNodesStyle } = useMindMapStore();
    
    useEffect(() => {
        if(!anchorRect) return;

        const VIEWPORT_H = window.innerHeight;
        const VIEWPORT_W = window.innerWidth;

        let top = anchorRect.bottom + GAP;
        let left = anchorRect.left;

        // Flip above if not enough space below
        if (top + POPOVER_H > VIEWPORT_H - 16) {
            const spaceAbove = anchorRect.top - GAP;
            top = spaceAbove > POPOVER_H
            ? anchorRect.top - POPOVER_H - GAP
            : VIEWPORT_H - POPOVER_H - 16;
        }

        if (left + POPOVER_W > VIEWPORT_W - 16) left = VIEWPORT_W - POPOVER_W -16;
        if (top < 16) top = 16;

        setComputeStyle({ top, left});
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
    
    if (!anchorRect) return null;

    return createPortal(
        <div
          className="icon-popover"
          ref={ref}
          style={computedStyle}
          role="dialog"
          aria-label="Selector de icono"
        >
          {/* Header */}
          <div className="icon-popover__header">
            <span>Icono</span>
            <button className="icon-popover__close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
    
          {/* Icon grid */}
          <div className="icon-popover__section">
            <div className="icon-popover__grid">
              {/* "None" option */}
              <button
                className={`icon-popover__option${!style.icon ? ' icon-popover__option--active' : ''}`}
                onClick={() => { onChange({ icon: undefined }); onClose(); }}
                title="Sin icono"
              >
                <LucideIcons.Ban size={18} />
              </button>
    
              {/* Lucide icon grid */}
              {COMMON_ICONS.map((name) => {
                const Icon = (LucideIcons as any)[name];
                if (!Icon) return null;
                return (
                  <button
                    key={name}
                    className={`icon-popover__option${style.icon === name ? ' icon-popover__option--active' : ''}`}
                    onClick={() => { onChange({ icon: name }); onClose(); }}
                    title={name}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>
    
          <div className="icon-popover__divider" />
    
          {/* Batch actions */}
          <div className="icon-popover__section">
            <button
              className="icon-popover__danger-btn"
              onClick={() => { updateAllNodesStyle({ icon: undefined }); onClose(); }}
            >
              <LucideIcons.Trash2 size={14} />
              Quitar de todos los nodos
            </button>
          </div>
        </div>,
        document.body
      );
};

export default IconPopover;