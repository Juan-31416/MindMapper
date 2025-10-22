
import { contextBridge, ipcRenderer } from 'electron';

// =============================================================================
// Types for IPC API
// =============================================================================

export interface FileOperationResult {
  success: boolean;
  error?: string;
  canceled?: boolean;
  filePath?: string;
}

export interface FileLoadResult extends FileOperationResult {
  content?: string;
}

export interface FileExistsResult extends FileOperationResult {
  exists?: boolean;
}

export interface AppPathResult extends FileOperationResult {
  path?: string;
}

export interface DialogResult extends FileOperationResult {
  response?: number;
}

export interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  buttons?: string[];
  defaultId?: number;
  title?: string;
  message: string;
  detail?: string;
  cancelId?: number;
}

// =============================================================================
// Exposed API
// =============================================================================

export interface ElectronAPI {
  file: {
    save: (filePath: string, content: string) => Promise<FileOperationResult>;
    saveDialog: (content: string, defaultPath?: string) => Promise<FileOperationResult>;
    load: (filePath: string) => Promise<FileLoadResult>;
    openDialog: () => Promise<FileLoadResult>;
    exists: (filePath: string) => Promise<FileExistsResult>;
    exportPDF: (defaultPath?: string) => Promise<FileOperationResult>;
    exportJSON: (content: string, defaultPath?: string) => Promise<FileOperationResult>;
  };
  dialog: {
    showMessage: (options: MessageBoxOptions) => Promise<DialogResult>;
  };
  app: {
    getPath: (name: 'home' | 'documents' | 'downloads' | 'userData') => Promise<AppPathResult>;
  };
  menu: {
    onNew: (callback: () => void) => void;
    onOpen: (callback: () => void) => void;
    onSave: (callback: () => void) => void;
    onSaveAs: (callback: () => void) => void;
    onExportPDF: (callback: () => void) => void;
    onExportJSON: (callback: () => void) => void;
    onUndo: (callback: () => void) => void;
    onRedo: (callback: () => void) => void;
    onZoomIn: (callback: () => void) => void;
    onZoomOut: (callback: () => void) => void;
    onResetZoom: (callback: () => void) => void;
    onFitToScreen: (callback: () => void) => void;
    onToggleTheme: (callback: () => void) => void;
    onShowShortcuts: (callback: () => void) => void;
  };
  window: {
    onBeforeClose: (callback: () => void) => void;
    allowClose: () => Promise<FileOperationResult>;
  };
}

// =============================================================================
// Context Bridge - Secure API exposure
// =============================================================================

const api: ElectronAPI = {
  file: {
    save: (filePath: string, content: string) => 
      ipcRenderer.invoke('file:save', filePath, content),
    saveDialog: (content: string, defaultPath?: string) => 
      ipcRenderer.invoke('file:saveDialog', content, defaultPath),
    load: (filePath: string) => 
      ipcRenderer.invoke('file:load', filePath),
    openDialog: () => 
      ipcRenderer.invoke('file:openDialog'),
    exists: (filePath: string) => 
      ipcRenderer.invoke('file:exists', filePath),
    exportPDF: (defaultPath?: string) => 
      ipcRenderer.invoke('file:exportPDF', defaultPath),
    exportJSON: (content: string, defaultPath?: string) => 
      ipcRenderer.invoke('file:exportJSON', content, defaultPath),
  },
  dialog: {
    showMessage: (options: MessageBoxOptions) => 
      ipcRenderer.invoke('dialog:showMessage', options),
  },
  app: {
    getPath: (name: 'home' | 'documents' | 'downloads' | 'userData') => 
      ipcRenderer.invoke('app:getPath', name),
  },
  menu: {
    onNew: (callback) => ipcRenderer.on('menu:new', callback),
    onOpen: (callback) => ipcRenderer.on('menu:open', callback),
    onSave: (callback) => ipcRenderer.on('menu:save', callback),
    onSaveAs: (callback) => ipcRenderer.on('menu:saveAs', callback),
    onExportPDF: (callback) => ipcRenderer.on('menu:exportPDF', callback),
    onExportJSON: (callback) => ipcRenderer.on('menu:exportJSON', callback),
    onUndo: (callback) => ipcRenderer.on('menu:undo', callback),
    onRedo: (callback) => ipcRenderer.on('menu:redo', callback),
    onZoomIn: (callback) => ipcRenderer.on('menu:zoomIn', callback),
    onZoomOut: (callback) => ipcRenderer.on('menu:zoomOut', callback),
    onResetZoom: (callback) => ipcRenderer.on('menu:resetZoom', callback),
    onFitToScreen: (callback) => ipcRenderer.on('menu:fitToScreen', callback),
    onToggleTheme: (callback) => ipcRenderer.on('menu:toggleTheme', callback),
    onShowShortcuts: (callback) => ipcRenderer.on('menu:showShortcuts', callback),
  },
  window: {
    onBeforeClose: (callback) => ipcRenderer.on('window:beforeClose', callback),
    allowClose: () => ipcRenderer.invoke('window:allowClose'),
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', api);
