import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (!existsSync(path.join(repoRoot, '.git'))) {
    process.exit(0);
}

try {
    execFileSync('git', ['config', 'core.hooksPath', '.githooks'], {
        cwd: repoRoot,
        stdio: 'ignore',
    });
} catch {
    process.exit(0);
}
