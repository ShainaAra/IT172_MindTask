/**
 * Vite Configuration File
 * Description: Configuration for Vite build tool and development server.
 * Sets up React plugin and API proxy to avoid CORS issues during development.
 * 
 * Proxy functionality:
 * - Any request starting with /api is forwarded to backend server
 * - Example: fetch('/api/users') → http://localhost:5000/api/users
 * - This prevents CORS errors during development
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // React plugin for JSX support and Fast Refresh
  plugins: [react()],
  
  // Development server configuration
  server: {
    proxy: {
      // Proxy all /api requests to backend server on port 5000
      "/api": "http://localhost:5000",
    },
  },
})