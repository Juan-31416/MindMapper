import React, { useEffect, useState } from 'react';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import NodeEditor from './components/NodeEditor';
import { useMindMapStore } from './store/mindMapStore.js';
import { initializeTheme, toggleTheme as utilToggleTheme } from './utils/theme';
import { createBlankTemplate } from './templates/brainstorming';
import './styles/App.css';

const App: React.FC = () => {
  const {
    currentMap,
    selectedNodeId,
    isDirty,
    createNewMap,
    createNode,
    deleteNode,
    undo,
    redo,
    saveMap,
    saveMapAs,
    openMap,
    exportPDF,
    exportJSON,
    loadTemplate,
  } = useMindMapStore();
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme
  useEffect(() => {
    initializeTheme();
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'dark';
    setTheme(currentTheme);
  }, []);

  // Toggle theme handler
  const toggleTheme = () => {
    const newTheme = utilToggleTheme();
    setTheme(newTheme);
  };

  // Create new map handler
  const handleNewMap = async () => {
    if (isDirty && window.electronAPI?.dialog) {
      const result = await window.electronAPI.dialog.showMessage({
        type: 'question',
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Do you want to continue?',
        buttons: ['Cancel', 'Continue'],
        defaultId: 0,
        cancelId: 0,
      });
      
      if (result.response === 0) {
        return;
      }
    }
    
    const template = createBlankTemplate();
    loadTemplate(template);
  };

  // Handle window close
  const handleWindowClose = async () => {
    if (isDirty && window.electronAPI?.dialog) {
      const result = await window.electronAPI.dialog.showMessage({
        type: 'question',
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Do you want to save before closing?',
        buttons: ['Cancel', 'Close Without Saving', 'Save and Close'],
        defaultId: 2,
        cancelId: 0,
      });
      
      if (result.response === 0) {
        // Cancel - do nothing
        return;
      } else if (result.response === 1) {
        // Close without saving
        if (window.electronAPI?.window) {
          await window.electronAPI.window.allowClose();
        }
      } else if (result.response === 2) {
        // Save and close
        const saved = await saveMap();
        if (saved) {
          if (window.electronAPI?.window) {
            await window.electronAPI.window.allowClose();
          }
        }
      }
    } else {
      // No unsaved changes, just close
      if (window.electronAPI?.window) {
        await window.electronAPI.window.allowClose();
      }
    }
  };

  // Menu listeners
  useEffect(() => {
    if (window.electronAPI?.menu) {
      window.electronAPI.menu.onNew(() => handleNewMap());
      window.electronAPI.menu.onOpen(() => openMap());
      window.electronAPI.menu.onSave(() => saveMap());
      window.electronAPI.menu.onSaveAs(() => saveMapAs());
      window.electronAPI.menu.onExportPDF(() => exportPDF());
      window.electronAPI.menu.onExportJSON(() => exportJSON());
      window.electronAPI.menu.onUndo(() => undo());
      window.electronAPI.menu.onRedo(() => redo());
      window.electronAPI.menu.onToggleTheme(() => toggleTheme());
    }
    if (window.electronAPI?.window) {
      window.electronAPI.window.onBeforeClose(() => handleWindowClose());
    }
    
    // Cleanup is not needed as these are one-time registrations
  }, []);

  // Initialize with demo map
  useEffect(() => {
    if (!currentMap) {
      createNewMap('Welcome to MindMapper');
      
      // Add some initial nodes after a short delay
      setTimeout(() => {
        const { currentMap, selectedNodeId } = useMindMapStore.getState();
        if (currentMap && selectedNodeId) {
          // Create first child
          createNode(selectedNodeId, 'Getting Started', false);
          
          setTimeout(() => {
            const { currentMap } = useMindMapStore.getState();
            if (currentMap) {
              const rootNode = currentMap.nodes[currentMap.rootNodeId];
              if (rootNode.children.length > 0) {
                const firstChildId = rootNode.children[0];
                
                // Create grandchildren
                createNode(firstChildId, 'Create nodes with Tab', false);
                setTimeout(() => {
                  createNode(firstChildId, 'Edit text with double-click', false);
                }, 100);
                setTimeout(() => {
                  createNode(firstChildId, 'Drag to reorganize', false);
                }, 200);
              }
            }
          }, 100);
          
          // Create second child
          setTimeout(() => {
            createNode(selectedNodeId, 'Features', false);
          }, 300);
          
          // Create third child
          setTimeout(() => {
            createNode(selectedNodeId, 'Customize Styles', false);
          }, 400);
        }
      }, 100);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement) return;

      // File operations (Ctrl/Cmd + key)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          saveMap();
        } else if (e.key === 'o') {
          e.preventDefault();
          openMap();
        } else if (e.key === 'n') {
          e.preventDefault();
          handleNewMap();
        } else if (e.key === 'e') {
          e.preventDefault();
          exportPDF();
        } else if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
        return;
      }

      // Node operations
      if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedNodeId) {
          createNode(selectedNodeId, 'New Node', false);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedNodeId) {
          createNode(selectedNodeId, 'New Node', true);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && currentMap && selectedNodeId !== currentMap.rootNodeId) {
          e.preventDefault();
          deleteNode(selectedNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, currentMap, createNode, deleteNode, undo, redo, saveMap, openMap, exportPDF, handleNewMap]);

  if (!currentMap) {
    return (
      <div className="app loading">
        <div className="loading-message">
          <h2>Loading MindMapper...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Toolbar />
      
      <div className="app-content">
        <div className="canvas-area">
          <Canvas />
        </div>
        
        <div className="sidebar">
          <NodeEditor />
        </div>
      </div>
    </div>
  );
};

export default App;
