import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), // Confirm this matches the file location
      output: {
        entryFileNames: 'react-bundle.js',
        assetFileNames: 'style.css'
      }
    }
  }
});