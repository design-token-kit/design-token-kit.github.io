import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(repoRoot, 'src');
const sourceExtensions = ['.astro', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.scss', '.css'];
const importPattern =
    /(?:import\s+(?:[^'"]+?\s+from\s+)?|export\s+(?:[^'"]+?\s+from\s+)?|import\s*\()\s*['"]([^'"]+)['"]/g;

function run(command, args) {
    return execFileSync(command, args, {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}

function toPosixPath(filePath) {
    return filePath.split(path.sep).join('/');
}

function buildTrackedPathMaps() {
    const trackedFiles = run('git', ['ls-files', 'src'])
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const exactPaths = new Set(trackedFiles);
    const caseFoldedPaths = new Map();

    for (const trackedFile of trackedFiles) {
        caseFoldedPaths.set(trackedFile.toLowerCase(), trackedFile);
    }

    return { trackedFiles, exactPaths, caseFoldedPaths };
}

function listSourceFiles(trackedFiles) {
    return trackedFiles.filter((file) => sourceExtensions.includes(path.extname(file)));
}

function extractImports(filePath) {
    const absolutePath = path.join(repoRoot, filePath);
    const content = readFileSync(absolutePath, 'utf8');
    const imports = [];

    for (const match of content.matchAll(importPattern)) {
        imports.push(match[1]);
    }

    return imports;
}

function resolveSpecifier(importerPath, specifier) {
    if (specifier.startsWith('#/')) {
        return [`src/${specifier.slice(2)}`];
    }

    if (specifier.startsWith('./') || specifier.startsWith('../')) {
        const importerDir = path.posix.dirname(toPosixPath(importerPath));
        return [path.posix.normalize(path.posix.join(importerDir, specifier))];
    }

    return [];
}

function expandCandidates(resolvedPath) {
    const extension = path.posix.extname(resolvedPath);

    if (extension) {
        return [resolvedPath];
    }

    const direct = sourceExtensions.map((ext) => `${resolvedPath}${ext}`);
    const indexed = sourceExtensions.map((ext) => `${resolvedPath}/index${ext}`);
    return [...direct, ...indexed];
}

const { trackedFiles, exactPaths, caseFoldedPaths } = buildTrackedPathMaps();
const sourceFiles = listSourceFiles(trackedFiles);
const issues = [];

for (const sourceFile of sourceFiles) {
    const specifiers = extractImports(sourceFile);

    for (const specifier of specifiers) {
        const resolvedBases = resolveSpecifier(sourceFile, specifier);

        if (resolvedBases.length === 0) {
            continue;
        }

        const candidates = resolvedBases.flatMap(expandCandidates);
        const exactMatch = candidates.find((candidate) => exactPaths.has(candidate));

        if (exactMatch) {
            continue;
        }

        const caseInsensitiveMatch = candidates
            .map((candidate) => ({
                candidate,
                tracked: caseFoldedPaths.get(candidate.toLowerCase()),
            }))
            .find((entry) => entry.tracked);

        if (caseInsensitiveMatch) {
            issues.push(
                `${sourceFile}: import "${specifier}" differs by path case from "${caseInsensitiveMatch.tracked}"`,
            );
            continue;
        }

        issues.push(`${sourceFile}: import "${specifier}" does not resolve to a tracked file`);
    }
}

if (issues.length > 0) {
    console.error('Import path case check failed:\n');
    for (const issue of issues) {
        console.error(`- ${issue}`);
    }
    process.exit(1);
}
