import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  envPrefix: ['VITE_', 'FIREBASE_'],
  server: {
    host: '127.0.0.1',
  },
})
