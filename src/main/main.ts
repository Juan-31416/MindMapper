import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;

// Determine if running in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // Security: Enable context isolation
      contextIsolation: true,
      // Security: Enable sandbox
      sandbox: true,
      // Security: Disable node integration
      nodeIntegration: false,
      // Preload script for secure IPC
      preload: path.join(__dirname, '../preload/preload.js'),
    },
    show: false, // Don't show until ready
    backgroundColor: '#1a1a1a',
  });

  // Load the appropriate URL
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window close (check for unsaved changes)
  mainWindow.on('close', async (e) => {
    // Ask renderer if there are unsaved changes
    e.preventDefault();
    mainWindow?.webContents.send('window:beforeClose');
  });
}

// =============================================================================
// Application Menu
// =============================================================================

function createApplicationMenu() {
  const template: any[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu:new');
          }
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu:open');
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu:save');
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu:saveAs');
          }
        },
        { type: 'separator' },
        {
          label: 'Export',
          submenu: [
            {
              label: 'Export to PDF...',
              accelerator: 'CmdOrCtrl+E',
              click: () => {
                mainWindow?.webContents.send('menu:exportPDF');
              }
            },
            {
              label: 'Export to JSON...',
              click: () => {
                mainWindow?.webContents.send('menu:exportJSON');
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            mainWindow?.webContents.send('menu:undo');
          }
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => {
            mainWindow?.webContents.send('menu:redo');
          }
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainWindow?.webContents.send('menu:zoomIn');
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow?.webContents.send('menu:zoomOut');
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow?.webContents.send('menu:resetZoom');
          }
        },
        {
          label: 'Fit to Screen',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow?.webContents.send('menu:fitToScreen');
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Theme',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow?.webContents.send('menu:toggleTheme');
          }
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'reload' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/yourusername/mindmapper');
          }
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: () => {
            mainWindow?.webContents.send('menu:showShortcuts');
          }
        },
        { type: 'separator' },
        {
          label: 'About MindMapper',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About MindMapper',
              message: 'MindMapper',
              detail: 'Version 1.0.0\n\nA powerful mind mapping application built with Electron, React, and TypeScript.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle: Create window when ready
app.whenReady().then(() => {
  createWindow();
  createApplicationMenu();

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// App lifecycle: Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// =============================================================================
// IPC Handlers - Secure file operations for mind maps
// =============================================================================

// Handler to show save dialog and save file
ipcMain.handle('file:saveDialog', async (event, content: string, defaultPath?: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Save Mind Map',
      defaultPath: defaultPath || 'mindmap.mindmap.json',
      filters: [
        { name: 'MindMapper Files', extensions: ['mindmap.json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    await fs.writeFile(result.filePath, content, 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Handler to show open dialog and load file
ipcMain.handle('file:openDialog', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Open Mind Map',
      filters: [
        { name: 'MindMapper Files', extensions: ['mindmap.json'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'Markdown Files', extensions: ['md', 'markdown'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, filePath, content };
  } catch (error) {
    console.error('Error opening file:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Handler to save file directly (when path is already known)
ipcMain.handle('file:save', async (event, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true, filePath };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Handler to load mind map from file
ipcMain.handle('file:load', async (event, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error('Error loading file:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Handler to export to PDF
ipcMain.handle('file:exportPDF', async (event, defaultPath?: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Export to PDF',
      defaultPath: defaultPath || 'mindmap.pdf',
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    // Generate PDF from the current page
    const pdfData = await mainWindow!.webContents.printToPDF({
      printBackground: true,
      landscape: true,
      pageSize: 'A4',
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    });

    await fs.writeFile(result.filePath, pdfData);
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Handler to export to JSON
ipcMain.handle('file:exportJSON', async (event, content: string, defaultPath?: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Export to JSON',
      defaultPath: defaultPath || 'mindmap-export.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    await fs.writeFile(result.filePath, content, 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('Error exporting JSON:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Handler to show message box
ipcMain.handle('dialog:showMessage', async (event, options: any) => {
  try {
    const result = await dialog.showMessageBox(mainWindow!, options);
    return { success: true, response: result.response };
  } catch (error) {
    console.error('Error showing message:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Handler to check if file exists
ipcMain.handle('file:exists', async (event, filePath: string) => {
  try {
    await fs.access(filePath);
    return { success: true, exists: true };
  } catch (error) {
    return { success: true, exists: false };
  }
});

// Handler to get app paths
ipcMain.handle('app:getPath', async (event, name: string) => {
  try {
    const validPaths = ['home', 'documents', 'downloads', 'userData'];
    if (!validPaths.includes(name)) {
      throw new Error(`Invalid path name: ${name}`);
    }
    const appPath = app.getPath(name as any);
    return { success: true, path: appPath };
  } catch (error) {
    console.error('Error getting app path:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Handler to allow window close
ipcMain.handle('window:allowClose', async () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
  return { success: true };
});

// =============================================================================
// Error handling
// =============================================================================

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
