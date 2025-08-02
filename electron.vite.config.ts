// electron.vite.config.ts
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'src/main/index.ts'
      },
      rollupOptions: {
        external: ['@prisma/client', '.prisma/client/default', 'electron']
      }
    }
  },
  preload: {
    build: {
      lib: {
        entry: 'src/preload/index.ts'
      }
    }
  },
  renderer: {
    plugins: [react()]
    // Sin outDir personalizado - usa el default
  }
})