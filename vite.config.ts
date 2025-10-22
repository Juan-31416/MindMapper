
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './src/renderer',
  base: './',
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    port: 5173,
    strictPort: false, // Allow fallback to other ports if 5173 is busy
    watch: {
      // Use polling to prevent EMFILE errors on Linux systems
      usePolling: true,
      interval: 2000, // Increased interval to reduce file system pressure
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/build/**',
        '**/*.log',
        '**/coverage/**',
        '**/.nyc_output/**',
        '**/tmp/**',
        '**/temp/**',
        '**/.*',
        '**/package-lock.json',
        '**/yarn.lock',
        '**/pnpm-lock.yaml'
      ]
    }
  },
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
    },
  },
  // Optimize dependencies to reduce file watching
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'lucide-react', 'dagre'],
    force: false // Don't force re-optimization unless needed
  },
  // Reduce file watching overhead
  define: {
    __DEV__: true
  }
});
