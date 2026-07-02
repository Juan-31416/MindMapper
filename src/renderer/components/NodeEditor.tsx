import React, { useState, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore';
import ColorPopover from './ColorPopover';
import BorderPopover from './BorderPopover';
import IconPopover from './IconPopover';
import '../styles/NodeEditor.css';

const NodeEditor: React.FC = () => {
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
          <p>Select a node to edit</p>
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
    createNode(selectedNodeId, 'New Node', false);
  };

  const handleCreateSibling = () => {
    if (!isRootNode) {
      createNode(selectedNodeId, 'New Node', true);
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
        <h3>Node Properties</h3>
      </div>

      <div className="editor-content">
        {/* Node Info */}
        <div className="editor-section">
          <h4>Node Info</h4>
          <div className="node-info">
            <div className="info-item">
              <span className="info-label">Text:</span>
              <span className="info-value">{selectedNode.text}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Children:</span>
              <span className="info-value">{selectedNode.children.length}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="editor-section">
          <h4>Actions</h4>
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={handleCreateChild}
              title="Create Child Node (Tab)"
            >
              <LucideIcons.Plus size={16} />
              Add Child
            </button>
            <button
              className="action-btn secondary"
              onClick={handleCreateSibling}
              disabled={isRootNode}
              title="Create Sibling Node (Enter)"
            >
              <LucideIcons.Plus size={16} />
              Add Sibling
            </button>
            <button
              className="action-btn danger"
              onClick={handleDelete}
              disabled={isRootNode}
              title="Delete Node (Delete)"
            >
              <LucideIcons.Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* Color Picker + Border Controls */}
        <div className="editor-section compact-controls">
          <h4>Apariencia</h4>
          <div className="compact-row">
            <div className="compact-item">
              <label className="label-small">Color</label>
              <button
                ref={colorAnchorRef}
                className="color-swatch-btn"
                style={{ backgroundColor: selectedNode.style.backgroundColor }}
                onClick={() => {
                  setColorAnchorRect(colorAnchorRef.current?.getBoundingClientRect() ?? null);
                  setShowColorPopover(v => !v);
                }}
                title="Abrir paleta de color"
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
              <label className="label-small">Borde</label>
              <button
                ref={borderAnchorRef}
                className="border-btn"
                onClick={() => {
                  setBorderAnchorRect(borderAnchorRef.current?.getBoundingClientRect() ?? null);
                  setShowBorderPopover(v =>!v);
                }}
                title="Editar borde"
              >
                {selectedNode.style.borderStyle === 'none' ? 'Ninguno' :
                selectedNode.style.borderStyle === 'bottom' ? 'Inferior' : 'Completo'}
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
          <h4>Icon</h4>
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
          <h4>Status</h4>
          <div className="status-selector">
            <button
              className={`status-option ${selectedNode.style.status === 'pending' ? 'selected' : ''}`}
              onClick={() => handleStatusChange('pending')}
            >
              <span className="status-dot pending"></span>
              Pending
            </button>
            <button
              className={`status-option ${selectedNode.style.status === 'in-progress' ? 'selected' : ''}`}
              onClick={() => handleStatusChange('in-progress')}
            >
              <span className="status-dot in-progress"></span>
              In Progress
            </button>
            <button
              className={`status-option ${selectedNode.style.status === 'done' ? 'selected' : ''}`}
              onClick={() => handleStatusChange('done')}
            >
              <span className="status-dot done"></span>
              Done
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="editor-section shortcuts">
          <h4>Keyboard Shortcuts</h4>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <kbd>Tab</kbd>
              <span>Create child node</span>
            </div>
            <div className="shortcut-item">
              <kbd>Enter</kbd>
              <span>Create sibling node</span>
            </div>
            <div className="shortcut-item">
              <kbd>Delete</kbd>
              <span>Delete node</span>
            </div>
            <div className="shortcut-item">
              <kbd>Double Click</kbd>
              <span>Edit node text</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl+Z</kbd>
              <span>Undo</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl+Y</kbd>
              <span>Redo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;
