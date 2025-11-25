import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      '.share.zrok.io',
      'localhost',
      '127.0.0.1'
    ]
  }
})