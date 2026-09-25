// Installs @design-token-kit/core from a local checkout of the core
// repository, so the site can use unreleased core changes during development.
//
// The package is built, packed, and installed with --no-save: package.json
// keeps the published version, and a later `npm install` restores it.
//
// Usage: npm run core:local
// The core checkout defaults to ../design-token-kit; set DTK_CORE_DIR to
// use another path.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreRepo = path.resolve(siteRoot, process.env.DTK_CORE_DIR ?? '../design-token-kit');
const corePackage = path.join(coreRepo, 'core');

if (!existsSync(path.join(corePackage, 'package.json'))) {
    console.error(`Core package not found in ${corePackage}. Set DTK_CORE_DIR to the core repository.`);
    process.exit(1);
}

const packDir = mkdtempSync(path.join(os.tmpdir(), 'dtk-core-'));
try {
    console.log(`Building core in ${coreRepo}...`);
    npm(['run', 'build', '--workspace', '@design-token-kit/core'], coreRepo, 'inherit');

    const [packed] = JSON.parse(npm(['pack', '--json', '--pack-destination', packDir], corePackage, 'pipe'));
    const tarball = path.join(packDir, packed.filename);

    console.log(`Installing ${packed.name}@${packed.version} from the local build...`);
    npm(['install', '--no-save', tarball], siteRoot, 'inherit');

    // Vite keeps pre-bundled dependencies; drop them so the dev server
    // picks up the new build.
    rmSync(path.join(siteRoot, 'node_modules', '.vite'), { recursive: true, force: true });

    console.log('Local core installed. Restart the dev server to use it.');
} finally {
    rmSync(packDir, { recursive: true, force: true });
}

/**
 * Runs npm through the same npm that started this script, which also works
 * on Windows where npm is a .cmd shim.
 */
function npm(args, cwd, stdio) {
    const npmCli = process.env.npm_execpath;
    const output = npmCli
        ? execFileSync(process.execPath, [npmCli, ...args], { cwd, stdio: ['ignore', stdio, 'inherit'] })
        : execFileSync('npm', args, { cwd, stdio: ['ignore', stdio, 'inherit'], shell: process.platform === 'win32' });
    return output?.toString() ?? '';
}
