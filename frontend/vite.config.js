import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base =
  process.env.VITE_BASE_PATH ||
  (process.env.GITHUB_ACTIONS === 'true' && repositoryName ? `/${repositoryName}/` : '/')

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'congress-fanning-hardwired.ngrok-free.dev',
      'unreal-cheek-prominent.ngrok-free.dev',
      '.ngrok-free.dev',
    ],
  },
})
