import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          vendor: ['@tanstack/react-query', 'axios', 'lucide-react', 'zod']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/uploads': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/socket.io': { target: 'http://127.0.0.1:5000', changeOrigin: true, ws: true }
    }
  }
});
