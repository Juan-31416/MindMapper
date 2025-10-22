import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore';
import { toggleTheme, getCurrentTheme } from '../utils/theme';
import { getAvailableTemplates } from '../templates/brainstorming';
import '../styles/Toolbar.css';

const Toolbar: React.FC = () => {
  const {
    currentMap,
    isDirty,
    saveMap,
    openMap,
    loadTemplate,
    undo,
    redo,
    canUndo,
    canRedo,
    setViewport,
    resetViewport,
    viewport,
  } = useMindMapStore();
  
  const [theme, setTheme] = useState(getCurrentTheme());
  const [showTemplates, setShowTemplates] = useState(false);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  const handleTemplateSelect = (templateId: string) => {
    const templates = getAvailableTemplates();
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const map = template.create();
      loadTemplate(map);
    }
    setShowTemplates(false);
  };

  const handleZoomIn = () => {
    setViewport({ zoom: Math.min(viewport.zoom + 0.2, 3) });
  };

  const handleZoomOut = () => {
    setViewport({ zoom: Math.max(viewport.zoom - 0.2, 0.1) });
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="toolbar-section" style={{ position: 'relative' }}>
          <button
            className="toolbar-btn primary"
            onClick={() => setShowTemplates(!showTemplates)}
            title="New from Template"
          >
            <LucideIcons.FilePlus size={20} />
            <span>New</span>
          </button>
          {showTemplates && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              marginTop: '4px',
              minWidth: '200px',
              boxShadow: '0 4px 12px var(--shadow)',
              zIndex: 1000,
            }}>
              {getAvailableTemplates().map(template => (
                <button
                  key={template.id}
                  className="toolbar-btn"
                  onClick={() => handleTemplateSelect(template.id)}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    borderRadius: 0,
                  }}
                  title={template.description}
                >
                  <span>{template.name}</span>
                </button>
              ))}
            </div>
          )}
          <button
            className="toolbar-btn"
            onClick={openMap}
            title="Open (Ctrl+O)"
          >
            <LucideIcons.FolderOpen size={20} />
          </button>
          <button
            className="toolbar-btn"
            onClick={saveMap}
            title="Save (Ctrl+S)"
          >
            <LucideIcons.Save size={20} />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <LucideIcons.Undo size={20} />
          </button>
          <button
            className="toolbar-btn"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Y)"
          >
            <LucideIcons.Redo size={20} />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <button
            className="toolbar-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <LucideIcons.ZoomOut size={20} />
          </button>
          <span className="zoom-level">{Math.round(viewport.zoom * 100)}%</span>
          <button
            className="toolbar-btn"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <LucideIcons.ZoomIn size={20} />
          </button>
          <button
            className="toolbar-btn"
            onClick={resetViewport}
            title="Reset View"
          >
            <LucideIcons.Maximize2 size={20} />
          </button>
        </div>
      </div>

      <div className="toolbar-center">
        {currentMap && (
          <div className="map-name">
            <LucideIcons.Brain size={20} />
            <span>{currentMap.name}</span>
            {isDirty && (
              <div className="dirty-indicator" title="Unsaved changes"></div>
            )}
          </div>
        )}
      </div>

      <div className="toolbar-right">
        <div className="toolbar-section">
          <button
            className="toolbar-btn theme-toggle-btn"
            onClick={handleToggleTheme}
            title="Toggle Theme (Ctrl+T)"
          >
            {theme === 'dark' ? <LucideIcons.Sun size={20} /> : <LucideIcons.Moon size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
