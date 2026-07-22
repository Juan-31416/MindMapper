// Type definitions for Electron IPC API
// This file declares the global window.electronAPI interface

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

export interface MenuLabels {
  file: string;
  newMap: string;
  open: string;
  save: string;
  saveAs: string;
  export: string;
  exportPDF: string;
  exportJSON: string;
  exit: string;
  edit: string;
  undo: string;
  redo: string;
  view: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  fitToScreen: string;
  toggleTheme: string;
  help: string;
  documentation: string;
  shortcuts: string;
  about: string;
  aboutDetail: string;
}

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
    getLocale: () => Promise<string>;
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
    setLabels: (labels: MenuLabels) => Promise<void>;
  };
  window: {
    onBeforeClose: (callback: () => void) => void;
    allowClose: () => Promise<FileOperationResult>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
