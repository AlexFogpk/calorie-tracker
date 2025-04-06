import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      supported: {
        'top-level-await': true
      },
    },
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
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
          'vendor': ['react', 'react-dom', 'framer-motion']
        }
      }
    },
    commonjsOptions: {
      strictRequires: false,
      transformMixedEsModules: true,
      include: [/firebase/, /node_modules/],
    },
  }
})
