import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    root: '.',
    base: process.env.NODE_ENV === 'production' ? '/miniapps/imu-admin/' : '/',
    build: {
        outDir: 'dist',
        target: 'es2022',
        minify: true,
        sourcemap: true,
        rollupOptions: {
            input: 'index.html',
            external: ['@imuchat/miniapp-sdk'],
        },
    },
    server: {
        port: 3217,
        open: false,
    },
});
