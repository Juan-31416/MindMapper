import { create } from 'zustand';
import { 
  MindMap, 
  MindMapNode, 
  NodeStyle, 
  ViewportState, 
  LayoutType, 
  DEFAULT_NODE_STYLE,
  FavoriteColor,
  MAX_FAVORITE_COLORS,
} from '../types/mindmap';
import { serializeToJSON, preparePDFExport, getExportBaseName } from '../utils/exporters';
import { importFromContent } from '../utils/importers';
import { buildTreeFromNodes, calculateLayout, createLayout, NODE_WIDTH, NODE_HEIGHT } from '../utils/layout';
import type { SearchState } from '../types/search';
import { createSearchIndex, runSearch as runFuzzySearch, DEFAULT_SEARCH_CONFIG } from '../utils/searcher';
import type Fuse from 'fuse.js';
import type { MindMapNode as SearchableNode } from '../types/mindmap';
import { normalizeHex } from '../utils/colorUtils';
import { EdgeStyle } from '../utils/edges';



interface MindMapStore {
  currentMap: MindMap | null;
  selectedNodeId: string | null;
  editingNodeId: string | null;
  viewport: ViewportState;
  layout: LayoutType;
  theme: 'light' | 'dark';
  history: MindMap[];
  historyIndex: number;
  currentFilePath: string | null;
  isDirty: boolean;
  search: SearchState;
  _searchIndex?: Fuse<SearchableNode> | null;
  favoriteColors: FavoriteColor[];
  edgeStyle: EdgeStyle;

  // Actions
  createNewMap: (name: string) => void;
  loadMap: (map: MindMap, filePath?: string) => void;
  createNode: (parentId: string | null, text: string, asSibling?: boolean) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeText: (nodeId: string, text: string) => void;
  updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => void;
  moveNode: (nodeId: string, newParentId: string | null, order: number) => void;
  toggleCollapse: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setEditingNode: (nodeId: string | null) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  resetViewport: () => void;
  focusOnNode: (nodeId: string) => void;
  setLayout: (layout: LayoutType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setCurrentFilePath: (path: string | null) => void;
  setIsDirty: (isDirty: boolean) => void;
  saveMap: () => Promise<boolean>;
  saveMapAs: () => Promise<boolean>;
  openMap: () => Promise<boolean>;
  exportPDF: () => Promise<boolean>;
  exportJSON: () => Promise<boolean>;
  loadTemplate: (template: MindMap) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  runSearchNow: () => void;
  addFavoriteColor: (color:string, userId?: string) => void;
  removeFavoriteColor: (color: string, userId?: string) => void;
  setEdgeStyle: (style: EdgeStyle) => void;
}



/***********************************
 *           UTILITIES
 *********************************** */

const STORAGE_KEY = 'mindmapper-preferences';

interface StoredPreferences {
  layout?: LayoutType;
  theme?: 'light' | 'dark';
  favoriteColors?: FavoriteColor[];
  edgeStyle?: EdgeStyle;
}

const loadPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as StoredPreferences) : {};
  } catch (error) {
    console.error('Error loading preferences: ', error);
    return {};
  }
};

const savePreferences = (patch: Partial<StoredPreferences>): void => {
  try {
    const current = loadPreferences();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...current, ...patch })
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

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

const safeNumber = (value: number | undefined, fallback: number): number => {
  const candidate = value ?? fallback;
  return isFinite(candidate) ? candidate : fallback;
};



/*************************************
 *                STORE
 ************************************* */

export const useMindMapStore = create<MindMapStore>((set, get) => {
  const preferences = loadPreferences();

  // Helper to add current map to history
  const addToHistory = (newMap: MindMap) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(deepClone(newMap));

    set({
      currentMap: newMap,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });

    // Update search index when maps changes
    const searchIndex = createSearchIndex(newMap.nodes as Record<string, SearchableNode>);
    set({ _searchIndex: searchIndex });
  };

  
  return {
    // State
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
    favoriteColors:preferences.favoriteColors ?? [],
    edgeStyle: preferences.edgeStyle || 'curved',

    // Initial search
    search: {
      query: '',
      results: [],
      isSearching: false,
      isActive: false,
      lastUpdatedAt: null,
    },
    _searchIndex: null,
    
    // Map operations
    createNewMap: (name: string) => {
      const newMap = createEmptyMap(name);
      const searchIndex = createSearchIndex(newMap.nodes as Record<string, SearchableNode>);
      set({
        currentMap: newMap,
        selectedNodeId: newMap.rootNodeId,
        history: [deepClone(newMap)],
        historyIndex: 0,
        isDirty: false,
        _searchIndex: searchIndex,
        search: {
          query: '',
          results: [],
          isSearching: false,
          isActive: false,
          lastUpdatedAt: null,
        },
      });
    },
    
    loadMap: (map: MindMap, filePath?: string) => {
      const searchIndex = createSearchIndex(map.nodes as Record<string, SearchableNode>);
      set({
        currentMap: map,
        selectedNodeId: map.rootNodeId,
        history: [deepClone(map)],
        historyIndex: 0,
        currentFilePath: filePath || null,
        isDirty: false,
        _searchIndex: searchIndex,
        search: {
          query: '',
          results: [],
          isSearching: false,
          isActive: false,
          lastUpdatedAt: null,
        },
      });
    },

    loadTemplate: (template: MindMap) => {
      const searchIndex = createSearchIndex(template.nodes as Record<string, SearchableNode>);
      set({
        currentMap: template,
        selectedNodeId: template.rootNodeId,
        history: [deepClone(template)],
        historyIndex: 0,
        currentFilePath: null,
        isDirty: false,
        _searchIndex: searchIndex,
        search: {
          query: '',
          results: [],
          isSearching: false,
          isActive: false,
          lastUpdatedAt: null,
        },
      });
    },
  
    // Node operations
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
    
      const newMap = deepClone(currentMap);
      
      if (asSibling && parentId) {
        const currentNode = newMap.nodes[parentId];
        if ( currentNode?.parentId) {
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
      addToHistory(newMap);
      set({ selectedNodeId: newNode.id });
      
      // Focus on the new node after a brief delay to ensure layout is updated
      setTimeout(() => {
        get().focusOnNode(newNode.id);
      }, 50);
    },
    
    deleteNode: (nodeId: string) => {
      const { currentMap } = get();
      if (!currentMap || nodeId === currentMap.rootNodeId) return;
      
      const newMap = deepClone(currentMap);
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
      addToHistory(newMap);
      set({ selectedNodeId: node.parentId || currentMap.rootNodeId });
    },
    
    updateNodeText: (nodeId: string, text: string) => {
      const { currentMap } = get();
      if (!currentMap || !currentMap.nodes[nodeId]) return;
      
      const newMap = deepClone(currentMap);
      
      newMap.nodes[nodeId].text = text;
      newMap.updatedAt = Date.now();
        
      // Add to history
      addToHistory(newMap);
    },
  
    updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => {
      const { currentMap } = get();
      if (!currentMap || !currentMap.nodes[nodeId]) return;
      
      const newMap = deepClone(currentMap);
      
      newMap.nodes[nodeId].style = { ...newMap.nodes[nodeId].style, ...style };
      newMap.updatedAt = Date.now();
        
      // Add to history
      addToHistory(newMap);
    },
    
    moveNode: (nodeId: string, newParentId: string | null, order: number) => {
      const { currentMap } = get();
      if (!currentMap || nodeId === currentMap.rootNodeId) return;
      
      const newMap = deepClone(currentMap);
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
      addToHistory(newMap);
    },
    
    toggleCollapse: (nodeId: string) => {
      const { currentMap } = get();
      if (!currentMap || !currentMap.nodes[nodeId]) return;
      
      const newMap = deepClone(currentMap);
      const node = newMap.nodes[nodeId];
      node.collapsed = !node.collapsed;
      newMap.updatedAt = Date.now();

      // Añadir a historial para poder deshacer
      addToHistory(newMap);
        
      set({
          currentMap: newMap,
          isDirty: true,
        });
    },


    /****************************************
     *         SELECTION & EDITING
     **************************************** */
    
    selectNode: (nodeId: string | null) => set({ selectedNodeId: nodeId }),
    
    setEditingNode: (nodeId: string | null) => set({ editingNodeId: nodeId }),
    

    /***************************************
     *             VIEWPORT
    **************************************** */

    setViewport: (viewport: Partial<ViewportState>) => {
      set(state => ({
        viewport: {
          zoom: safeNumber(viewport.zoom, state.viewport.zoom),
          panX: safeNumber(viewport.panX, state.viewport.panX),
          panY: safeNumber(viewport.panY, state.viewport.panY),
        }
      }));
    },
    
    resetViewport: () => set({ viewport: { zoom: 1, panX: 0, panY: 0 } }),
    
    focusOnNode: (nodeId: string) => {
      const { currentMap, viewport, layout } = get();
      if (!currentMap || !currentMap.rootNodeId) return;
      
      try {
        const tree = buildTreeFromNodes(currentMap.nodes, currentMap.rootNodeId);
        const result = createLayout(tree, {
          type: layout || 'hierarchical',
          nodeWidth: NODE_WIDTH,
          nodeHeight: NODE_HEIGHT,
          
          // Radial config
          r0: 100,
          levelGap: 150,
          angleStart: -Math.PI / 2,
          
          // Hierarchical config
          rankSep: 100,
          nodeSep: 50,
        }) as any;

        const positions = 'nodePositions' in result? result.nodePositions: result.nodes;

        const nodePosition = positions?.[nodeId];

        if (!nodePosition || !isFinite(nodePosition.x) || !isFinite(nodePosition.y)) {
          console.warn(`focusOnNode: invalid position for node ${nodeId}`, nodePosition);
          return;
        }

        // Calculate the viewport adjustment to center the node
        const targetZoom = Math.min(viewport.zoom, 1.2); // Don't zoom in too much
        const centerX = window.innerWidth / 2; // Approximate center of typical screen
        const centerY = window.innerHeight / 2;
        
        const newPanX = centerX - nodePosition.x * targetZoom;
        const newPanY = centerY - nodePosition.y * targetZoom;

        if (!isFinite(newPanX) || !isFinite(newPanY)) {
          console.error("focusOnNode: calculated NaN viewport", { newPanX, newPanY, nodePosition, targetZoom });
          return;
        }
        
        set({
          viewport: {
            zoom: targetZoom,
            panX: newPanX,
            panY: newPanY,
          }
        });
      } catch (error) {
        console.error('Error in focusOnNode:', error);
      }
    },

    
    /*******************************************
     *           UI PREFERENCES
     ******************************************* */

    setLayout: (layout: LayoutType) => {
      set({ layout });
      savePreferences({ layout });
    },

    setTheme: (theme: 'light' | 'dark') => {
      set({ theme });
      savePreferences({ theme });
    },


    /**********************************************
     *                    HISTORY
     ********************************************** */

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        const map = deepClone(history[newIndex]);
        const searchIndex = createSearchIndex(map.nodes as Record<string, SearchableNode>);
        set({
          currentMap: map,
          historyIndex: newIndex,
          isDirty: true,
          _searchIndex: searchIndex,
        });
      }
    },
    
    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        const map = deepClone(history[newIndex]);
        const searchIndex = createSearchIndex(map.nodes as Record<string, SearchableNode>);
        set({
          currentMap: map,
          historyIndex: newIndex,
          isDirty: true,
          _searchIndex: searchIndex,
        });
      }
    },
    
    canUndo: () => get().historyIndex > 0,
    
    canRedo: () => {
      const { history, historyIndex } = get();
      return historyIndex < history.length - 1;
    },


    /*******************************************
     *               UTILITY
     ******************************************* */
    
    setCurrentFilePath: (path) => set({ currentFilePath: path }),
    setIsDirty: (isDirty) => set({ isDirty }),



    setEdgeStyle: (edgeStyle: EdgeStyle) => {
      set({ edgeStyle });
      savePreferences({ edgeStyle });
    },
    

    /********************************************
     *            FAVORITE COLORS 
     ******************************************** */ 

    addFavoriteColor: (color: string, userId?: string) => {
      const normalized = normalizeHex(color);
      const { favoriteColors } = get();

      // Ignore duplicates
      const isDuplicate = favoriteColors.some((f) => f.color === normalized && f.userId === userId);
      if (isDuplicate) return;

      const newEntry: FavoriteColor = {
        color: normalized,
        addedAt: Date.now(),
        ...(userId !== undefined && { userId }),
      };

      const trimmed = favoriteColors.length >= MAX_FAVORITE_COLORS ? favoriteColors.slice(1) : favoriteColors;

      const updated = [...trimmed, newEntry];
      set({ favoriteColors:updated });
      savePreferences({ favoriteColors: updated });
    },

    removeFavoriteColor: (color: string, userId?: string) => {
      const normalized = normalizeHex(color);
      const { favoriteColors } = get();

      const updated = favoriteColors.filter(
        (f) => !(f.color === normalized && f.userId === userId)
      );

      set({ favoriteColors: updated });
      savePreferences({ favoriteColors: updated });
    },


    /********************************************
     *             FILE OPETATIONS 
     ******************************************** */

    saveMap: async () => {
      const { currentMap, currentFilePath } = get();
      if (!currentMap) return false;
      
      if (!window.electronAPI?.file) {
        console.warn('Electron API not available');
        return false;
      }

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
      if (!window.electronAPI?.file) {
        console.warn('Electron API not available');
        return false;
      }

      try {
        // Check for unsaved changes
        const { isDirty } = get();
        if (isDirty) {
          if (window.electronAPI?.dialog) {
            const result = await window.electronAPI.dialog.showMessage({
              type: 'question',
              title: 'Unsaved Changes',
              message: 'You have unsaved changes. Do you want to continue?',
              buttons: ['Cancel', 'Continue'],
              defaultId: 0,
              cancelId: 0,
            });
            
            if (result.response === 0) return false;
          } else {
            const confirmed = window.confirm('You have unsaved changes. Do you want to continue?');
            if (!confirmed) return false;
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
        const { restore } = preparePDFExport();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const baseName = getExportBaseName(currentMap, currentFilePath);
        const result = await window.electronAPI.file.exportPDF(`${baseName}.pdf`);
        
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

    /*********************************************
     *               SEARCH ACTIONS
     ********************************************* */
    setSearchQuery: (query: string) => {
      const trimmed = query.trimStart();
      const now = Date.now();
      set((state) => ({
        search: {
          ...state.search,
          query: trimmed,
          isActive: trimmed.length >= DEFAULT_SEARCH_CONFIG.MinQueryLength,
          lastUpdatedAt: now,
        },
      }));
    },

    clearSearch: () => {
      set({
        search: {
          query: '',
          results: [],
          isSearching: false,
          isActive: false,
          lastUpdatedAt: null,
        },
      });
    },

    runSearchNow: () => {
      const { search, _searchIndex } = get();
      const query = search.query.trim();
      if (query.length < DEFAULT_SEARCH_CONFIG.MinQueryLength || !_searchIndex) {
        set((state) => ({
          search: {
            ...state.search,
            results: [],
            isSearching: false,
          },
        }));
        return;
      }

      set((state) => ({
        search: {
          ...state.search,
          isSearching: true,
        },
      }));

      const results = runFuzzySearch(_searchIndex, query);

      set((state) => ({
        search: {
          ...state.search,
          results,
          isSearching: false,
        },
      }));
    },
  };
});
