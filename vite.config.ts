import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'firebase/app': path.resolve(__dirname, 'node_modules/firebase/app/dist/index.esm.js'),
      'firebase/auth': path.resolve(__dirname, 'node_modules/firebase/auth/dist/index.esm.js'),
      'firebase/firestore': path.resolve(__dirname, 'node_modules/firebase/firestore/dist/index.esm.js'),
      'firebase/storage': path.resolve(__dirname, 'node_modules/firebase/storage/dist/index.esm.js'),
      'firebase/analytics': path.resolve(__dirname, 'node_modules/firebase/analytics/dist/index.esm.js'),
      'firebase/functions': path.resolve(__dirname, 'node_modules/firebase/functions/dist/index.esm.js'),
    }
  },
  server: {
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'firebase', 'framer-motion']
        }
      }
    },
    commonjsOptions: {
      strictRequires: false,
    },
  }
})
