/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/frontend',
  server: {
    port: 4200,
    host: '0.0.0.0', // Expose to network
  },
  preview: {
    port: 4300,
    host: '0.0.0.0' // Expose to network
  },
  plugins: [react(), svgr()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}));
