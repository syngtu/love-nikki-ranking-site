import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` must match the GitHub Pages path. For a project page served at
// https://<user>.github.io/love-nikki-ranking-site/ this is the repo name.
// Override with VITE_BASE (e.g. "/" for a user/org page or custom domain).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/love-nikki-ranking-site/',
  plugins: [react()],
})
