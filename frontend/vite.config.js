import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: './',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin.html'),
            },
        },
    },
    server: {
        port: 3000,
        open: true
    },
    plugins: [
        {
            name: 'admin-redirect',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/admin' || req.url === '/admin/') {
                        req.url = '/admin.html';
                    }
                    next();
                });
            }
        }
    ]
});
