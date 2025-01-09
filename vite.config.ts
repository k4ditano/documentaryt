import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
    jsx: 'automatic'
  }
}); 