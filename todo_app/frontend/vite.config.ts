import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    // Example: use an env var to set the dev server port conditionally.
    server: {
      port: env.PORT ? Number(env.PORT) : 5173,
      proxy: {
        "/api": {
          target: `http://localhost:${env.TARGETPORT ? Number(env.TARGETPORT) : 3000}` ,
          changeOrigin: true,
        },
      },
    }
  }
})
