import React, { useState, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore';
import ColorPopover from './ColorPopover';
import BorderPopover from './BorderPopover';
import IconPopover from './IconPopover';
import { useTranslation } from 'react-i18next';
import '../styles/NodeEditor.css';

const NodeEditor: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentMap,
    selectedNodeId,
    createNode,
    deleteNode,
    updateNodeStyle,
  } = useMindMapStore();

  if (!selectedNodeId || !currentMap) {
    return (
      <div className="node-editor">
        <div className="editor-empty">
          <LucideIcons.Info size={48} />
          <p>{t('nodeEditor.empty')}</p>
        </div>
      </div>
    );
  }

  const selectedNode = currentMap.nodes[selectedNodeId];
  if (!selectedNode) return null;

  const isRootNode = selectedNodeId === currentMap.rootNodeId;

  const handleColorChange = (color: string) => {
    updateNodeStyle(selectedNodeId, { backgroundColor: color });
  };

  const handleIconChange = (icon: string) => {
    updateNodeStyle(selectedNodeId, { icon });
  };

  const handleStatusChange = (status: 'pending' | 'in-progress' | 'done') => {
    // If clicking the same status, clear it (set to undefined)
    if (selectedNode.style.status === status) {
      updateNodeStyle(selectedNodeId, { status: undefined });
    } else {
      updateNodeStyle(selectedNodeId, { status });
    }
  };

  const handleCreateChild = () => {
    createNode(selectedNodeId, t('canvas.newNode'), false);
  };

  const handleCreateSibling = () => {
    if (!isRootNode) {
      createNode(selectedNodeId, t('canvas.newNode'), true);
    }
  };

  const handleDelete = () => {
    if (!isRootNode) {
      deleteNode(selectedNodeId);
    }
  };

  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showBorderPopover, setShowBorderPopover] = useState(false);
  const colorAnchorRef = useRef<HTMLButtonElement | null>(null);
  const borderAnchorRef = useRef<HTMLButtonElement | null>(null);

  const [colorAnchorRect, setColorAnchorRect] = useState<DOMRect | null>(null);
  const [borderAnchorRect, setBorderAnchorRect] = useState<DOMRect | null>(null);

  const [showIconPopover, setShowIconPopover] = useState(false);
  const iconAnchorRef = useRef<HTMLButtonElement | null>(null);
  const [iconAnchorRect, setIconAnchorRect] = useState<DOMRect | null>(null);

  const patchStyle = (patch: Partial<any>) =>updateNodeStyle(selectedNodeId, patch);

  return (
    <div className="node-editor">
      <div className="editor-header">
        <h3>{t('nodeEditor.title')}</h3>
      </div>

      <div className="editor-content">
        {/* Node Info */}
        <div className="editor-section">
          <h4>{t('nodeEditor.sections.nodeInfo')}</h4>
          <div className="node-info">
            <div className="info-item">
              <span className="info-label">{t('nodeEditor.info.text')}</span>
              <span className="info-value">{selectedNode.text}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('nodeEditor.info.children')}</span>
              <span className="info-value">{selectedNode.children.length}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="editor-section">
          <h4>{t('nodeEditor.sections.actions')}</h4>
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={handleCreateChild}
              title={t('nodeEditor.actions.tooltips.addChild')}
            >
              <LucideIcons.Plus size={16} />
              {t('nodeEditor.actions.addChild')}
            </button>
            <button
              className="action-btn secondary"
              onClick={handleCreateSibling}
              disabled={isRootNode}
              title={t('nodeEditor.actions.tooltips.addSibling')}
            >
              <LucideIcons.Plus size={16} />
              {t('nodeEditor.actions.addSibling')}
            </button>
            <button
              className="action-btn danger"
              onClick={handleDelete}
              disabled={isRootNode}
              title={t('nodeEditor.actions.tooltips.delete')}
            >
              <LucideIcons.Trash2 size={16} />
              {t('nodeEditor.actions.delete')}
            </button>
          </div>
        </div>

        {/* Color Picker + Border Controls */}
        <div className="editor-section compact-controls">
          <h4>{t('nodeEditor.sections.appearance')}</h4>
          <div className="compact-row">
            <div className="compact-item">
              <label className="label-small">{t('nodeEditor.appearance.color')}</label>
              <button
                ref={colorAnchorRef}
                className="color-swatch-btn"
                style={{ backgroundColor: selectedNode.style.backgroundColor }}
                onClick={() => {
                  setColorAnchorRect(colorAnchorRef.current?.getBoundingClientRect() ?? null);
                  setShowColorPopover(v => !v);
                }}
                title={t('nodeEditor.appearance.openColorPalette')}
              />
              {showColorPopover && (
                <ColorPopover
                  anchorRect={colorAnchorRect}
                  style={selectedNode.style}
                  onChange={patchStyle}
                  onClose={()=> setShowColorPopover(false)}
                />
              )}
            </div>

            <div className="compact-item">
              <label className="label-small">{t('nodeEditor.appearance.border')}</label>
              <button
                ref={borderAnchorRef}
                className="border-btn"
                onClick={() => {
                  setBorderAnchorRect(borderAnchorRef.current?.getBoundingClientRect() ?? null);
                  setShowBorderPopover(v =>!v);
                }}
                title={t('nodeEditor.appearance.editBorder')}
              >
                {selectedNode.style.borderStyle === 'none' ? t('nodeEditor.appearance.borderNone') :
                selectedNode.style.borderStyle === 'bottom' ? t('nodeEditor.appearance.borderBottom') : t('nodeEditor.appearance.borderFull')}
              </button>

              {showBorderPopover && (
                <BorderPopover
                  anchorRect={borderAnchorRect}
                  style={selectedNode.style}
                  onChange={patchStyle}
                  onClose={() => setShowBorderPopover(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Icon Picker */}
        <div className="editor-section compact-controls">
          <h4>{t('nodeEditor.sections.icon')}</h4>
          <div className="compact-row">
            <div className="compact-item">
              <button
                ref={iconAnchorRef}
                className="icon-select-btn"
                onClick={() => {
                  setIconAnchorRect(iconAnchorRef.current?.getBoundingClientRect() ?? null);
                  setShowIconPopover(v => !v);
                }}
              >
                {selectedNode.style.icon ? (
                  (() => {
                    const Icon = (LucideIcons as any)[selectedNode.style.icon];

                    return <Icon size={20} />;
                  })()
                ):(
                  <LucideIcons.Ban size={20} className='icon-placeholder' />
                )}
                <LucideIcons.ChevronDown size={14} className='chevron' />
              </button>

              {showIconPopover && (
                <IconPopover 
                  anchorRect={iconAnchorRect}
                  style={selectedNode.style}
                  onChange={patchStyle}
                  onClose={() => setShowIconPopover(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Status Selector */}
        <div className="editor-section">
          <h4>{t('nodeEditor.sections.status')}</h4>
          <div className="status-selector">
            <button
              className={`status-option ${selectedNode.style.status === 'pending' ? 'selected' : ''}`}
              onClick={() => handleStatusChange('pending')}
            >
              <span className="status-dot pending"></span>
              {t('nodeEditor.status.pending')}
            </button>
            <button
              className={`status-option ${selectedNode.style.status === 'in-progress' ? 'selected' : ''}`}
              onClick={() => handleStatusChange('in-progress')}
            >
              <span className="status-dot in-progress"></span>
              {t('nodeEditor.status.inProgress')}
            </button>
            <button
              className={`status-option ${selectedNode.style.status === 'done' ? 'selected' : ''}`}
              onClick={() => handleStatusChange('done')}
            >
              <span className="status-dot done"></span>
              {t('nodeEditor.status.done')}
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="editor-section shortcuts">
          <h4>{t('nodeEditor.sections.shortcuts')}</h4>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <kbd>Tab</kbd>
              <span>{t('nodeEditor.shortcuts.createChild')}</span>
            </div>
            <div className="shortcut-item">
              <kbd>Enter</kbd>
              <span>{t('nodeEditor.shortcuts.createSibling')}</span>
            </div>
            <div className="shortcut-item">
              <kbd>Delete</kbd>
              <span>{t('nodeEditor.shortcuts.deleteNode')}</span>
            </div>
            <div className="shortcut-item">
              <kbd>Double Click</kbd>
              <span>{t('nodeEditor.shortcuts.editText')}</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl+Z</kbd>
              <span>{t('nodeEditor.shortcuts.undo')}</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl+Y</kbd>
              <span>{t('nodeEditor.shortcuts.redo')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
