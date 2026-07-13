// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
    site: 'https://design-token-kit.github.io/',
    vite: {
        resolve: {
            alias: {
                '#': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    },
});
