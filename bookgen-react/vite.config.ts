import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Runs the Vite dev server on http://localhost:5180
// Proxies /api to your ASP.NET backend (defaults to http://localhost:5000).
// To point elsewhere, create .env.local with: VITE_API_BASE=https://localhost:5001
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_BASE || 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      port: 5000,
      strictPort: true,
      open: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})