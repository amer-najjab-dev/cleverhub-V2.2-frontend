import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://cleverhub-v2-backend-production.up.railway.app',
                changeOrigin: true,
                secure: true,
            },
            '/auth': {
                target: 'https://cleverhub-v2-backend-production.up.railway.app',
                changeOrigin: true,
                secure: true,
            },
            '/modules': {
                target: 'https://cleverhub-v2-backend-production.up.railway.app',
                changeOrigin: true,
                secure: true,
            },
            '/admin': {
                target: 'https://cleverhub-v2-backend-production.up.railway.app',
                changeOrigin: true,
                secure: true,
            },
            '/hr': {
                target: 'https://cleverhub-v2-backend-production.up.railway.app',
                changeOrigin: true,
                secure: true,
            },
        },
    },
});
