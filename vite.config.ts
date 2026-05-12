import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Source maps in production for Sentry-style debugging. They are
    // served as separate files so the JS chunks stay lean.
    sourcemap: true,
    // The route chunks plus the React.lazy splits keep us well under 500kB.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /**
         * Manual chunking strategy: pull the heaviest, rarely-changing
         * third-party libs out into stable vendor chunks so route splits
         * stay tiny and the browser can long-cache them across deploys.
         *
         * Keep this list small — over-splitting hurts more than it helps
         * because of HTTP/2 request waterfalls and parse overhead.
         */
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query', 'zustand'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-markdown': [
            'react-markdown',
            'react-syntax-highlighter',
            'remark-gfm',
            'rehype-sanitize',
          ],
          'vendor-tables': ['@tanstack/react-table', '@tanstack/react-virtual'],
          'vendor-dnd': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
          ],
        },
      },
    },
  },
})
