import {
    BrowserTokenToolkit,
    CheckScope,
    PlatformFormat,
    TokenFormat,
    type BrowserOutputFormat,
} from '@design-token-kit/core/browser';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { playgroundExamples } from '#/components/token-playground/examples';
import {
    baseName,
    escapeHtml,
    highlightInput,
    highlightOutput,
    initTokenPlayground,
    lineNumbers,
    plural,
} from '#/components/token-playground/playground';

const outputFormats: readonly BrowserOutputFormat[] = [
    PlatformFormat.CSS,
    PlatformFormat.SCSS,
    PlatformFormat.TAILWIND_V4,
    PlatformFormat.SWIFT_UI,
    PlatformFormat.ANDROID,
    PlatformFormat.FIGMA_SCRIPT,
    TokenFormat.DTCG,
    TokenFormat.HRDT,
    TokenFormat.DESIGN_MD,
    'showcase',
];

const validDtcg = playgroundExamples.find((example) => example.id === 'dtcg');
let triggerIntersection: ((isIntersecting: boolean) => void) | undefined;

if (validDtcg === undefined) {
    throw new Error('The DTCG playground example is missing.');
}

function createPlaygroundRoot(full = true): HTMLElement {
    const root = document.createElement('section');
    root.dataset.playgroundFull = full ? 'true' : 'false';
    root.innerHTML = `
        <button data-playground-upload></button>
        <input data-playground-file-input type="file">
        <select data-playground-example>
            <option value="">Load example</option>
            ${playgroundExamples.map((example) => `<option value="${example.id}">${example.label}</option>`).join('')}
        </select>
        <select data-playground-input-format>
            <option value="auto">Auto-detect</option>
            <option value="dtcg">DTCG JSON</option>
            <option value="hrdt">HRDT YAML</option>
            <option value="design-md">DESIGN.md</option>
        </select>
        <input data-playground-lint type="checkbox">
        <button data-playground-validate></button>
        <select data-playground-output-format>
            ${outputFormats
                .filter((format) => format !== 'showcase')
                .map((format) => `<option value="${format}"${format === 'css' ? ' selected' : ''}>${format}</option>`)
                .join('')}
        </select>
        <button data-playground-convert></button>
        <button data-playground-download disabled></button>
        <span data-playground-status></span>
        <span data-playground-source></span>
        <div data-playground-output-panel data-playground-drop-zone></div>
        <select data-playground-output-file hidden></select>
        <textarea data-playground-editor></textarea>
        <span data-playground-input-lines></span>
        <pre data-playground-input-highlight></pre>
        <span data-playground-output-lines></span>
        <code data-playground-code></code>
        <span data-playground-code-placeholder></span>
        <iframe data-playground-showcase hidden></iframe>
        <span data-playground-showcase-placeholder></span>
        <button data-playground-showcase-download disabled></button>
        <details data-playground-validation>
            <summary data-playground-summary></summary>
        </details>
        <ol data-playground-issues></ol>
        <template data-playground-issue-template>
            <li>
                <span data-issue-severity></span>
                <code data-issue-id></code>
                <p data-issue-message></p>
                <p data-issue-path></p>
            </li>
        </template>
    `;
    return root;
}

async function waitFor(condition: () => boolean): Promise<void> {
    const deadline = Date.now() + 5_000;
    while (!condition()) {
        if (Date.now() > deadline) throw new Error('Timed out waiting for the Playground state.');
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
}

function isValidationComplete(summary: HTMLElement): boolean {
    return summary.dataset.state === 'success' || summary.dataset.state === 'warning';
}

function dispatchChange(element: Element): void {
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

function dispatchInput(element: Element): void {
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
        constructor(callback: IntersectionObserverCallback) {
            triggerIntersection = (isIntersecting) => {
                callback(
                    [{ isIntersecting } as IntersectionObserverEntry],
                    this as unknown as IntersectionObserver,
                );
            };
        }

        disconnect(): void {}
        observe(): void {}
    });
});

afterEach(() => {
    document.body.replaceChildren();
    triggerIntersection = undefined;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('playground examples and helpers', () => {
    test('provides valid examples for every supported input format', () => {
        const toolkit = new BrowserTokenToolkit();

        expect(playgroundExamples).toHaveLength(4);
        expect(new Set(playgroundExamples.map((example) => example.id)).size).toBe(playgroundExamples.length);

        for (const example of playgroundExamples) {
            const issues = toolkit.check({
                base: {
                    content: example.content,
                    source: example.fileName,
                    format: example.inputFormat,
                },
            }, { scope: CheckScope.VALIDATE });

            expect(issues.filter((issue) => issue.severity === 'error'), example.id).toHaveLength(0);
        }
    });

    test('converts the DTCG example to every Playground output', () => {
        const toolkit = new BrowserTokenToolkit();
        const input = {
            base: {
                content: validDtcg.content,
                source: validDtcg.fileName,
                format: validDtcg.inputFormat,
            },
        };

        for (const format of outputFormats) {
            const outputs = toolkit.convert(input, format);

            expect(outputs.length, format).toBeGreaterThan(0);
            expect(outputs.every((output) => output.fileName.length > 0), format).toBe(true);
            expect(outputs.every((output) => output.content.length > 0), format).toBe(true);
        }
    });

    test('escapes highlighted content and renders line numbers', () => {
        expect(lineNumbers('')).toBe('1');
        expect(lineNumbers('one\ntwo\nthree')).toBe('1\n2\n3');
        expect(escapeHtml('<script>&"')).toBe('&lt;script&gt;&amp;"');

        const input = highlightInput('{"name": "red", "size": 2}');
        expect(input).toContain('data-token="key">"name"');
        expect(input).toContain('data-token="string">"red"');
        expect(input).toContain('data-token="number">2');

        const output = highlightOutput('<style>body { color: red; }</style><!-- note -->');
        expect(output).toContain('data-token="tag">&lt;style&gt;');
        expect(output).toContain('data-token="comment">&lt;!-- note --&gt;');
    });

    test('formats plural labels and downloadable file names', () => {
        expect(plural(0, 'error')).toBe('');
        expect(plural(1, 'error')).toBe('1 error');
        expect(plural(2, 'error')).toBe('2 errors');
        expect(baseName('values-night/colors.xml')).toBe('values-night_colors.xml');
    });
});

describe('full Playground workflow', () => {
    test('loads, validates, converts, previews, and downloads a token file', async () => {
        const root = createPlaygroundRoot();
        initTokenPlayground(root);
        triggerIntersection?.(false);
        triggerIntersection?.(true);

        const exampleSelect = root.querySelector<HTMLSelectElement>('[data-playground-example]')!;
        const editor = root.querySelector<HTMLTextAreaElement>('[data-playground-editor]')!;
        const validateButton = root.querySelector<HTMLButtonElement>('[data-playground-validate]')!;
        const convertButton = root.querySelector<HTMLButtonElement>('[data-playground-convert]')!;
        const downloadButton = root.querySelector<HTMLButtonElement>('[data-playground-download]')!;
        const summary = root.querySelector<HTMLElement>('[data-playground-summary]')!;
        const code = root.querySelector<HTMLElement>('[data-playground-code]')!;
        const showcase = root.querySelector<HTMLIFrameElement>('[data-playground-showcase]')!;
        const showcaseDownloadButton = root.querySelector<HTMLButtonElement>('[data-playground-showcase-download]')!;

        expect(convertButton.disabled).toBe(true);
        expect(downloadButton.disabled).toBe(true);

        exampleSelect.value = 'dtcg';
        dispatchChange(exampleSelect);
        await waitFor(() => summary.dataset.state === 'success');

        expect(editor.value).toContain('primitive');
        expect(root.querySelector('[data-playground-source]')?.textContent).toBe('tokens.json');
        expect(convertButton.disabled).toBe(false);

        convertButton.click();
        await waitFor(() => showcase.hidden === false && downloadButton.disabled === false);

        expect(code.textContent).toContain(':root');
        expect(showcase.srcdoc).toContain('Design Tokens - showcase');
        expect(showcaseDownloadButton.disabled).toBe(false);

        const createObjectUrl = vi.fn(() => 'blob:playground');
        const revokeObjectUrl = vi.fn();
        Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
        Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });
        const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

        downloadButton.click();
        expect(createObjectUrl).toHaveBeenCalledOnce();
        const firstAnchor = anchorClick.mock.instances[0] as HTMLAnchorElement | undefined;
        expect(firstAnchor?.download).toBe('tokens.css');
        expect(revokeObjectUrl).toHaveBeenCalledWith('blob:playground');

        showcaseDownloadButton.click();
        expect(createObjectUrl).toHaveBeenCalledTimes(2);
        const showcaseAnchor = anchorClick.mock.instances[1] as HTMLAnchorElement | undefined;
        expect(showcaseAnchor?.download).toBe('token-showcase.html');

        const outputFormatSelect = root.querySelector<HTMLSelectElement>('[data-playground-output-format]')!;
        outputFormatSelect.value = 'scss';
        dispatchChange(outputFormatSelect);
        await waitFor(() => code.textContent?.includes('$primitive') === true);
    });

    test('shows multiple theme files and switches the selected output', async () => {
        const root = createPlaygroundRoot();
        initTokenPlayground(root);

        const exampleSelect = root.querySelector<HTMLSelectElement>('[data-playground-example]')!;
        const convertButton = root.querySelector<HTMLButtonElement>('[data-playground-convert]')!;
        const outputFormatSelect = root.querySelector<HTMLSelectElement>('[data-playground-output-format]')!;
        const outputFileSelect = root.querySelector<HTMLSelectElement>('[data-playground-output-file]')!;
        const code = root.querySelector<HTMLElement>('[data-playground-code]')!;
        const summary = root.querySelector<HTMLElement>('[data-playground-summary]')!;

        exampleSelect.value = 'hrdt';
        dispatchChange(exampleSelect);
        await waitFor(() => isValidationComplete(summary));
        outputFormatSelect.value = 'android';
        convertButton.click();
        await waitFor(() => outputFileSelect.options.length > 1);

        const firstOutput = code.textContent;
        outputFileSelect.value = '1';
        dispatchChange(outputFileSelect);

        expect(outputFileSelect.hidden).toBe(false);
        expect(code.textContent).not.toBe(firstOutput);
    });

    test('blocks conversion and clears stale output after invalid input', async () => {
        const root = createPlaygroundRoot();
        initTokenPlayground(root);

        const exampleSelect = root.querySelector<HTMLSelectElement>('[data-playground-example]')!;
        const editor = root.querySelector<HTMLTextAreaElement>('[data-playground-editor]')!;
        const validateButton = root.querySelector<HTMLButtonElement>('[data-playground-validate]')!;
        const convertButton = root.querySelector<HTMLButtonElement>('[data-playground-convert]')!;
        const summary = root.querySelector<HTMLElement>('[data-playground-summary]')!;
        const code = root.querySelector<HTMLElement>('[data-playground-code]')!;
        const showcase = root.querySelector<HTMLIFrameElement>('[data-playground-showcase]')!;

        validateButton.click();
        await waitFor(() => summary.textContent?.includes('Paste tokens') === true);
        expect(convertButton.disabled).toBe(true);

        exampleSelect.value = 'dtcg';
        dispatchChange(exampleSelect);
        await waitFor(() => isValidationComplete(summary));
        convertButton.click();
        await waitFor(() => showcase.hidden === false);

        editor.value = '{ invalid json';
        editor.selectionStart = 0;
        editor.selectionEnd = editor.value.length;
        editor.dispatchEvent(new Event('paste', { bubbles: true }));
        expect(root.querySelector('[data-playground-source]')?.textContent).toBe('Pasted text');
        dispatchInput(editor);
        expect(code.textContent).toBe('');
        expect(showcase.hidden).toBe(true);

        validateButton.click();
        await waitFor(() => summary.dataset.state === 'error');

        expect(convertButton.disabled).toBe(true);
        expect(root.querySelectorAll('[data-playground-issues] > li').length).toBeGreaterThan(0);
    });

    test('loads an uploaded file and keeps the source name', async () => {
        const root = createPlaygroundRoot();
        initTokenPlayground(root);

        const fileInput = root.querySelector<HTMLInputElement>('[data-playground-file-input]')!;
        const dropZone = root.querySelector<HTMLElement>('[data-playground-drop-zone]')!;
        const editor = root.querySelector<HTMLTextAreaElement>('[data-playground-editor]')!;
        const source = root.querySelector<HTMLElement>('[data-playground-source]')!;
        const summary = root.querySelector<HTMLElement>('[data-playground-summary]')!;
        const file = new File([validDtcg.content], 'uploaded-tokens.json', { type: 'application/json' });

        Object.defineProperty(fileInput, 'files', { configurable: true, value: [file] });
        dispatchChange(fileInput);
        await waitFor(() => source.textContent === 'uploaded-tokens.json');

        expect(editor.value).toBe(validDtcg.content);
        await waitFor(() => isValidationComplete(summary));

        const droppedFile = new File([validDtcg.content], 'dropped-tokens.json', { type: 'application/json' });
        const dragData = { types: ['Files'], files: [droppedFile] };
        const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
        Object.defineProperty(dragOverEvent, 'dataTransfer', { value: dragData });
        dropZone.dispatchEvent(dragOverEvent);
        expect(dropZone.dataset.dragging).toBe('true');
        dropZone.dispatchEvent(new Event('dragleave', { bubbles: true }));
        expect(dropZone.dataset.dragging).toBeUndefined();

        const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
        Object.defineProperty(dropEvent, 'dataTransfer', { value: dragData });
        dropZone.dispatchEvent(dropEvent);
        await waitFor(() => source.textContent === 'dropped-tokens.json');
        expect(editor.value).toBe(validDtcg.content);
    });
});

describe('embedded Playground workflow', () => {
    test('works without full-playground upload and showcase controls', async () => {
        const root = createPlaygroundRoot(false);
        root.querySelector('[data-playground-upload]')?.remove();
        root.querySelector('[data-playground-file-input]')?.remove();
        root.querySelector('[data-playground-showcase]')?.remove();
        root.querySelector('[data-playground-showcase-placeholder]')?.remove();
        root.querySelector('[data-playground-showcase-download]')?.remove();
        initTokenPlayground(root);

        const exampleSelect = root.querySelector<HTMLSelectElement>('[data-playground-example]')!;
        const convertButton = root.querySelector<HTMLButtonElement>('[data-playground-convert]')!;
        const summary = root.querySelector<HTMLElement>('[data-playground-summary]')!;
        const code = root.querySelector<HTMLElement>('[data-playground-code]')!;

        exampleSelect.value = 'dtcg';
        dispatchChange(exampleSelect);
        await waitFor(() => isValidationComplete(summary));
        convertButton.click();
        await waitFor(() => code.textContent?.includes(':root') === true);

        expect(code.textContent).toContain(':root');
    });
});
