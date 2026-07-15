// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const base = '/design-token-kit/';

// https://astro.build/config
export default defineConfig({
    site: 'https://design-token-kit.github.io/design-token-kit/',
    base,
    vite: {
        resolve: {
            alias: {
                '#': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    },
});
