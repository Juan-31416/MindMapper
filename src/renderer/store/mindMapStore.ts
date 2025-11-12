import { create } from 'zustand';
import { MindMap, MindMapNode, NodeStyle, ViewportState, LayoutType, DEFAULT_NODE_STYLE } from '../types/mindmap';
import { serializeToJSON, preparePDFExport, getExportBaseName } from '../utils/exporters';
import { importFromContent } from '../utils/importers';
import { calculateLayout } from '../utils/layout';

interface MindMapStore {
  // Current mind map
  currentMap: MindMap | null;
  
  // Selected node
  selectedNodeId: string | null;
  
  // Editing state
  editingNodeId: string | null;
  
  // Viewport state
  viewport: ViewportState;

  // UI preferences
  layout: LayoutType;
  theme: 'light' | 'dark';
  
  // History for undo/redo
  history: MindMap[];
  historyIndex: number;
  
  // File path
  currentFilePath: string | null;
  isDirty: boolean;
  
  // Actions
  createNewMap: (name: string) => void;
  loadMap: (map: MindMap, filePath?: string) => void;
  
  // Node operations
  createNode: (parentId: string | null, text: string, asSibling?: boolean) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeText: (nodeId: string, text: string) => void;
  updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => void;
  moveNode: (nodeId: string, newParentId: string | null, order: number) => void;
  toggleCollapse: (nodeId: string) => void;
  
  // Selection and editing
  selectNode: (nodeId: string | null) => void;
  setEditingNode: (nodeId: string | null) => void;
  
  // Viewport
  setViewport: (viewport: Partial<ViewportState>) => void;
  resetViewport: () => void;
  focusOnNode: (nodeId: string) => void;

  // UI preferences
  setLayout: (layout: LayoutType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Utility
  setCurrentFilePath: (path: string | null) => void;
  setIsDirty: (isDirty: boolean) => void;
  
  // File operations
  saveMap: () => Promise<boolean>;
  saveMapAs: () => Promise<boolean>;
  openMap: () => Promise<boolean>;
  exportPDF: () => Promise<boolean>;
  exportJSON: () => Promise<boolean>;
  loadTemplate: (template: MindMap) => void;
}

const STORAGE_KEY = 'mindmapper-preferences';

const loadPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading preferences: ', error);
  }
  return {};
};

const savePreferences = (preferences: { layout?: LayoutType; theme?: 'light' | 'dark'}) => {
  try {
    const current = loadPreferences();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...current, ...preferences })
    );
  } catch (error) {
    console.error('Error saving preferences: ', error);
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const createRootNode = (): MindMapNode => ({
  id: generateId(),
  text: 'Main Idea',
  parentId: null,
  children: [],
  style: { ...DEFAULT_NODE_STYLE },
  collapsed: false,
  order: 0,
});

const createEmptyMap = (name: string): MindMap => {
  const rootNode = createRootNode();
  return {
    id: generateId(),
    name,
    rootNodeId: rootNode.id,
    nodes: { [rootNode.id]: rootNode },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const useMindMapStore = create<MindMapStore>((set, get) => {
  const preferences = loadPreferences();
  return {
    currentMap: null,
    selectedNodeId: null,
    editingNodeId: null,
    viewport: { zoom: 1, panX: 0, panY: 0 },
    layout: preferences.layout || 'hierarchical',
    theme: preferences.theme || 'light',
    history: [],
    historyIndex: -1,
    currentFilePath: null,
    isDirty: false,
    
    createNewMap: (name: string) => {
      const newMap = createEmptyMap(name);
      set({
        currentMap: newMap,
        selectedNodeId: newMap.rootNodeId,
        history: [JSON.parse(JSON.stringify(newMap))],
        historyIndex: 0,
        isDirty: false,
      });
    },
    
    loadMap: (map: MindMap, filePath?: string) => {
      set({
        currentMap: map,
        selectedNodeId: map.rootNodeId,
        history: [JSON.parse(JSON.stringify(map))],
        historyIndex: 0,
        currentFilePath: filePath || null,
        isDirty: false,
      });
    },
  
    createNode: (parentId: string | null, text: string, asSibling = false) => {
      const { currentMap } = get();
      if (!currentMap) return;
      
      const newNode: MindMapNode = {
        id: generateId(),
        text: text || 'New Node',
        parentId: null,
        children: [],
        style: { ...DEFAULT_NODE_STYLE },
        collapsed: false,
        order: 0,
      };
    
      const newMap = JSON.parse(JSON.stringify(currentMap)) as MindMap;
      
      if (asSibling && parentId) {
        const currentNode = newMap.nodes[parentId];
        if (currentNode && currentNode.parentId) {
          const parentNode = newMap.nodes[currentNode.parentId];
          newNode.parentId = currentNode.parentId;
          newNode.order = currentNode.order + 1;
          parentNode.children.push(newNode.id);
          
          // Update order of subsequent siblings
          parentNode.children.forEach(childId => {
            const child = newMap.nodes[childId];
            if (child && child.order > currentNode.order) {
              child.order++;
            }
          });
        }
      } else if (parentId) {
        const parentNode = newMap.nodes[parentId];
        newNode.parentId = parentId;
        newNode.order = parentNode.children.length;
        parentNode.children.push(newNode.id);
      } else {
        // Create as sibling to root
        newNode.parentId = null;
        newNode.order = Object.keys(newMap.nodes).filter(id => newMap.nodes[id].parentId === null).length;
      }
      
      newMap.nodes[newNode.id] = newNode;
      newMap.updatedAt = Date.now();
      
      // Add to history
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newMap)));
      
      set({
        currentMap: newMap,
        selectedNodeId: newNode.id,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      });
      
      // Focus on the new node after a brief delay to ensure layout is updated
      setTimeout(() => {
        get().focusOnNode(newNode.id);
      }, 50);
    },
    
    deleteNode: (nodeId: string) => {
      const { currentMap } = get();
      if (!currentMap || nodeId === currentMap.rootNodeId) return;
      
      const newMap = JSON.parse(JSON.stringify(currentMap)) as MindMap;
      const node = newMap.nodes[nodeId];
      
      if (!node) return;
      
      // Recursively delete children
      const deleteRecursive = (id: string) => {
        const n = newMap.nodes[id];
        if (!n) return;
        
        n.children.forEach(childId => deleteRecursive(childId));
        delete newMap.nodes[id];
      };
      
      // Remove from parent's children
      if (node.parentId) {
        const parent = newMap.nodes[node.parentId];
        parent.children = parent.children.filter(id => id !== nodeId);
      }
      
      deleteRecursive(nodeId);
      newMap.updatedAt = Date.now();
      
      // Add to history
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newMap)));
      
      set({
        currentMap: newMap,
        selectedNodeId: node.parentId || currentMap.rootNodeId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      });
    },
    
    updateNodeText: (nodeId: string, text: string) => {
      const { currentMap } = get();
      if (!currentMap) return;
      
      const newMap = JSON.parse(JSON.stringify(currentMap)) as MindMap;
      if (newMap.nodes[nodeId]) {
        newMap.nodes[nodeId].text = text;
        newMap.updatedAt = Date.now();
        
        // Add to history
        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newMap)));
        
        set({
          currentMap: newMap,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isDirty: true,
        });
      }
    },
  
    updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => {
      const { currentMap } = get();
      if (!currentMap) return;
      
      const newMap = JSON.parse(JSON.stringify(currentMap)) as MindMap;
      if (newMap.nodes[nodeId]) {
        newMap.nodes[nodeId].style = { ...newMap.nodes[nodeId].style, ...style };
        newMap.updatedAt = Date.now();
        
        // Add to history
        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newMap)));
        
        set({
          currentMap: newMap,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isDirty: true,
        });
      }
    },
    
    moveNode: (nodeId: string, newParentId: string | null, order: number) => {
      const { currentMap } = get();
      if (!currentMap || nodeId === currentMap.rootNodeId) return;
      
      const newMap = JSON.parse(JSON.stringify(currentMap)) as MindMap;
      const node = newMap.nodes[nodeId];
      
      if (!node) return;
      
      // Remove from old parent
      if (node.parentId) {
        const oldParent = newMap.nodes[node.parentId];
        oldParent.children = oldParent.children.filter(id => id !== nodeId);
      }
      
      // Add to new parent
      node.parentId = newParentId;
      node.order = order;
      
      if (newParentId) {
        const newParent = newMap.nodes[newParentId];
        if (!newParent.children.includes(nodeId)) {
          newParent.children.push(nodeId);
        }
      }
      
      newMap.updatedAt = Date.now();
      
      // Add to history
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newMap)));
      
      set({
        currentMap: newMap,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      });
    },
    
    toggleCollapse: (nodeId: string) => {
      const { currentMap } = get();
      if (!currentMap) return;
      
      const newMap = JSON.parse(JSON.stringify(currentMap)) as MindMap;
      if (newMap.nodes[nodeId]) {
        // Ensure collapsed property exists and is boolean
        if (typeof newMap.nodes[nodeId].collapsed !== 'boolean') {
          newMap.nodes[nodeId].collapsed = false;
        }
        
        newMap.nodes[nodeId].collapsed = !newMap.nodes[nodeId].collapsed;
        newMap.updatedAt = Date.now();
        
        set({
          currentMap: newMap,
          isDirty: true,
        });
      }
    },
    
    selectNode: (nodeId: string | null) => {
      set({ selectedNodeId: nodeId });
    },
    
    setEditingNode: (nodeId: string | null) => {
      set({ editingNodeId: nodeId });
    },
    
    setViewport: (viewport: Partial<ViewportState>) => {
      set(state => ({
        viewport: { ...state.viewport, ...viewport }
      }));
    },
    
    resetViewport: () => {
      set({ viewport: { zoom: 1, panX: 0, panY: 0 } });
    },
    
    focusOnNode: (nodeId: string) => {
      const { currentMap, viewport } = get();
      if (!currentMap) return;
      
      // Calculate layout to get node position
      const layout = calculateLayout(currentMap.nodes, currentMap.rootNodeId) as any;
      const nodePosition = layout.nodePositions[nodeId];
      
      if (!nodePosition) return;
      
      // Calculate the viewport adjustment to center the node
      // We'll use a reasonable zoom level and center the node
      const targetZoom = Math.min(viewport.zoom, 1.2); // Don't zoom in too much
      const centerX = 400; // Approximate center of typical screen
      const centerY = 300;
      
      const newPanX = centerX - nodePosition.x * targetZoom;
      const newPanY = centerY - nodePosition.y * targetZoom;
      
      set({
        viewport: {
          zoom: targetZoom,
          panX: newPanX,
          panY: newPanY,
        }
      });
    },
    
    setLayout: (layout: LayoutType) => {
      set({ layout });
      savePreferences({ layout });
    },

    setTheme: (theme: 'light' | 'dark') => {
      set({ theme });
      savePreferences({ theme });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        set({
          currentMap: JSON.parse(JSON.stringify(history[newIndex])),
          historyIndex: newIndex,
          isDirty: true,
        });
      }
    },
    
    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        set({
          currentMap: JSON.parse(JSON.stringify(history[newIndex])),
          historyIndex: newIndex,
          isDirty: true,
        });
      }
    },
    
    canUndo: () => {
      const { historyIndex } = get();
      return historyIndex > 0;
    },
    
    canRedo: () => {
      const { history, historyIndex } = get();
      return historyIndex < history.length - 1;
    },
    
    setCurrentFilePath: (path) => set({ currentFilePath: path }),
    setIsDirty: (isDirty) => set({ isDirty }),
    
    // File operations
    saveMap: async () => {
      const { currentMap, currentFilePath } = get();
      if (!currentMap) return false;
      
      try {
        const content = serializeToJSON(currentMap);
        
        if (currentFilePath) {
          // Save to existing file
          const result = await window.electronAPI.file.save(currentFilePath, content);
          if (result.success) {
            set({ isDirty: false });
            return true;
          }
          return false;
        } else {
          // Show save dialog
          const baseName = getExportBaseName(currentMap, currentFilePath);
          const result = await window.electronAPI.file.saveDialog(
            content,
            `${baseName}.mindmap.json`
          );
          
          if (result.success && result.filePath) {
            set({ currentFilePath: result.filePath, isDirty: false });
            return true;
          }
          return false;
        }
      } catch (error) {
        console.error('Error saving map:', error);
        await window.electronAPI.dialog.showMessage({
          type: 'error',
          title: 'Save Error',
          message: 'Failed to save mind map',
          detail: (error as Error).message,
        });
        return false;
      }
    },
    
    saveMapAs: async () => {
      const { currentMap } = get();
      if (!currentMap) return false;
      
      try {
        const content = serializeToJSON(currentMap);
        const baseName = getExportBaseName(currentMap, get().currentFilePath);
        const result = await window.electronAPI.file.saveDialog(
          content,
          `${baseName}.mindmap.json`
        );
        
        if (result.success && result.filePath) {
          set({ currentFilePath: result.filePath, isDirty: false });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error saving map:', error);
        await window.electronAPI.dialog.showMessage({
          type: 'error',
          title: 'Save Error',
          message: 'Failed to save mind map',
          detail: (error as Error).message,
        });
        return false;
      }
    },
    
    openMap: async () => {
      try {
        // Check for unsaved changes
        const { isDirty } = get();
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
            return false;
          }
        }
        
        // Show open dialog
        const result = await window.electronAPI.file.openDialog();
        
        if (result.success && result.content && result.filePath) {
          // Try to import the content
          const fileName = result.filePath.split('/').pop() || undefined;
          const map = importFromContent(result.content, fileName);
          
          // Load the map
          get().loadMap(map, result.filePath);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error opening map:', error);
        await window.electronAPI.dialog.showMessage({
          type: 'error',
          title: 'Open Error',
          message: 'Failed to open mind map',
          detail: (error as Error).message,
        });
        return false;
      }
    },
    
    exportPDF: async () => {
      const { currentMap, currentFilePath } = get();
      if (!currentMap) return false;
      
      try {
        // Prepare the canvas for export
        const { restore } = preparePDFExport();
        
        // Wait a bit for the canvas to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const baseName = getExportBaseName(currentMap, currentFilePath);
        const result = await window.electronAPI.file.exportPDF(`${baseName}.pdf`);
        
        // Restore the original viewport
        restore();
        
        if (result.success) {
          await window.electronAPI.dialog.showMessage({
            type: 'info',
            title: 'Export Successful',
            message: 'Mind map exported to PDF successfully!',
            buttons: ['OK'],
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error exporting PDF:', error);
        await window.electronAPI.dialog.showMessage({
          type: 'error',
          title: 'Export Error',
          message: 'Failed to export to PDF',
          detail: (error as Error).message,
        });
        return false;
      }
    },
    
    exportJSON: async () => {
      const { currentMap, currentFilePath } = get();
      if (!currentMap) return false;
      
      try {
        const content = serializeToJSON(currentMap);
        const baseName = getExportBaseName(currentMap, currentFilePath);
        const result = await window.electronAPI.file.exportJSON(
          content,
          `${baseName}-export.json`
        );
        
        if (result.success) {
          await window.electronAPI.dialog.showMessage({
            type: 'info',
            title: 'Export Successful',
            message: 'Mind map exported to JSON successfully!',
            buttons: ['OK'],
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error exporting JSON:', error);
        await window.electronAPI.dialog.showMessage({
          type: 'error',
          title: 'Export Error',
          message: 'Failed to export to JSON',
          detail: (error as Error).message,
        });
        return false;
      }
    },
    
    loadTemplate: (template: MindMap) => {
      set({
        currentMap: template,
        selectedNodeId: template.rootNodeId,
        history: [JSON.parse(JSON.stringify(template))],
        historyIndex: 0,
        currentFilePath: null,
        isDirty: false,
      });
    },
  };
});
