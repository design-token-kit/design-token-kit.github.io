// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://design-token-kit.github.io/',
    integrations: [sitemap()],
    server: {
        // Listen on every network interface, so the dev server is reachable
        // from other devices on the network, not only from localhost.
        host: true,
    },
    vite: {
        resolve: {
            alias: {
                '#': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    },
});
