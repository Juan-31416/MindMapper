import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore';
import { toggleTheme, getCurrentTheme } from '../utils/theme';
import { getAvailableTemplates } from '../templates/brainstorming';
import { LayoutToggle } from './Toolbar/LayoutToggle';
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
    viewport,
  } = useMindMapStore();

  // Layout state
  const layout = useMindMapStore((state) => state.ui?.layout || state.layout);
  const setLayout = useMindMapStore((state) => state.ui?.setLayout || state.setLayout);
  
  const [theme, setTheme] = useState(getCurrentTheme());
  const [showTemplates, setShowTemplates] = useState(false);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  const handleTemplateSelect = async (templateId: string) => {
    // Check for unsaved changes
    if (isDirty) {
      const result = await window.electronAPI.dialog.showMessage({
        type: 'question',
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Do you want to continue?',
        buttons: ['Cancel', 'Continue'],
        defaultId: 0,
        cancelId: 0,
      });
      
      if (result.response === 0) {
        setShowTemplates(false);
        return;
      }
    }
    
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
        {/* File Operations */}
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
            <div className="toolbar-dropdown">
              {getAvailableTemplates().map(template => (
                <button
                  key={template.id}
                  className="toolbar-dropdown-item"
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

        {/* Undo/Redo */}
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

        {/** Layout Toogle - Integrated */}
        <div className="toolbar-section layout-toogle">
          <button
            className={`toolbar-btn layout-btn ${layout === 'hierarchical' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('hierarchical')}
            title="Vista Jerárquica"
            aria-label="Vista Jerárquica"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="7" y="2" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="2" y="9" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="12" y="9" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 5V9M5 9V7.5M15 9V7.5M10 7.5H5M10 7.5H15" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Jerárquica</span>
          </button>

          <button
            className={`toolbar-btn layout-btn ${layout === 'radial' ? 'active' : ''}`}
            onClick={() => handleLayoutChange('radial')}
            title="Vista Radial"
            aria-label="Vista Radial"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="17" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="3" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 5V8M12 10H15.5M10 12V15.5M8 10H4.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Radial</span>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/** Zoom Controls */}
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
        </div>
      </div>

      {/** Center - Map Name */}
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

      {/** Right - Theme Toogle */}
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
