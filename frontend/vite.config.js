import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['evora.com', 'localhost'],
    watch: {
      usePolling: true
    },
    proxy: {
      '/users/': 'http://user-service:8000',
      '/events/': 'http://event-service:8000',
      '/register/': 'http://event-registration-service:8000',
      '/notifications/': 'http://notification-service:8000'
    }
  }
})
