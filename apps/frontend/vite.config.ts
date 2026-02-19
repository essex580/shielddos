import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
            clientPort: 8080
        },
        // Allow the dashboard host when accessed via proxy
        allowedHosts: ['dashboard', 'localhost', '127.0.0.1']
    }
})
