import type {
    BrowserInputFormat,
    BrowserOutputFormat,
    BrowserTokenOutput,
    BrowserTokenSet,
    CheckIssue,
} from '@design-token-kit/core/browser';
import { playgroundExamples } from '#/components/token-playground/examples';

type BrowserModule = typeof import('@design-token-kit/core/browser');
const AUTO_VALIDATE_DELAY_MS = 600;

let browserModule: Promise<BrowserModule> | undefined;

/**
 * Loads the core browser bundle on first use, so the home page does not pay
 * for it until the playground is needed.
 */
function loadBrowserModule(): Promise<BrowserModule> {
    browserModule ??= import('@design-token-kit/core/browser');
    return browserModule;
}

export function initTokenPlayground(root: HTMLElement): void {
    const isFullPlayground = root.dataset.playgroundFull === 'true';
    const element = <T extends Element>(name: string): T => {
        const found = root.querySelector<T>(`[data-playground-${name}]`);
        if (found === null) {
            throw new Error(`Token playground element "${name}" is missing.`);
        }
        return found;
    };

    const editor = element<HTMLTextAreaElement>('editor');
    const dropZone = root.querySelector<HTMLElement>('[data-playground-drop-zone]');
    const fileInput = root.querySelector<HTMLInputElement>('[data-playground-file-input]');
    const uploadButton = root.querySelector<HTMLButtonElement>('[data-playground-upload]');
    const exampleSelect = element<HTMLSelectElement>('example');
    const inputFormatSelect = root.querySelector<HTMLSelectElement>('[data-playground-input-format]');
    const lintCheckbox = element<HTMLInputElement>('lint');
    const validateButton = element<HTMLButtonElement>('validate');
    const outputFormatSelect = element<HTMLSelectElement>('output-format');
    const convertButton = element<HTMLButtonElement>('convert');
    const downloadButton = root.querySelector<HTMLButtonElement>('[data-playground-download]');
    const status = element<HTMLElement>('status');
    const sourceLabel = element<HTMLElement>('source');
    const outputPanel = element<HTMLElement>('output-panel');
    const outputFileSelect = element<HTMLSelectElement>('output-file');
    const code = element<HTMLElement>('code');
    const codePlaceholder = element<HTMLElement>('code-placeholder');
    const inputLines = root.querySelector<HTMLElement>('[data-playground-input-lines]');
    const inputHighlight = root.querySelector<HTMLElement>('[data-playground-input-highlight]');
    const outputLines = root.querySelector<HTMLElement>('[data-playground-output-lines]');
    const showcase = root.querySelector<HTMLIFrameElement>('[data-playground-showcase]');
    const showcasePlaceholder = root.querySelector<HTMLElement>('[data-playground-showcase-placeholder]');
    const showcaseDownloadButton = root.querySelector<HTMLButtonElement>('[data-playground-showcase-download]');
    const validationPanel = root.querySelector<HTMLElement>('[data-playground-validation]');
    const validationSummary = validationPanel?.querySelector<HTMLElement>('summary');
    const summary = element<HTMLElement>('summary');
    const issueList = element<HTMLOListElement>('issues');
    const issueTemplate = element<HTMLTemplateElement>('issue-template');

    convertButton.disabled = true;

    let sourceName: string | undefined = root.dataset.playgroundInitialSource;
    let outputs: BrowserTokenOutput[] = [];
    let selectedOutput = 0;
    let showcaseContent: string | undefined;
    let autoValidateTimer: number | undefined;

    const tokenSet = (): BrowserTokenSet => {
        const inputFormat = inputFormatSelect?.value ?? 'auto';
        const format = inputFormat === 'auto'
            ? undefined
            : inputFormat as BrowserInputFormat;
        return { base: { content: editor.value, source: sourceName, format } };
    };

    const setStatus = (message: string): void => {
        status.textContent = message;
    };

    const setSource = (name: string | undefined): void => {
        sourceName = name;
        sourceLabel.textContent = name ?? 'Pasted text';
    };

    const hasContent = (): boolean => editor.value.trim() !== '';

    const updateCodePlaceholder = (): void => {
        codePlaceholder.textContent = hasContent()
            ? 'Choose an output format and press Convert.'
            : 'Paste tokens or load an example to start.';
    };

    const renderIssues = (issues: readonly CheckIssue[]): void => {
        const errors = issues.filter((issue) => issue.severity === 'error').length;
        const warnings = issues.length - errors;
        convertButton.disabled = errors > 0;

        if (validationPanel !== null) {
            validationPanel.dataset.state = errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'success';
            validationPanel.dataset.expandable = issues.length > 0 ? 'true' : 'false';
            if ('open' in validationPanel) {
                (validationPanel as HTMLDetailsElement).open = issues.length > 0;
            }
        }
        summary.dataset.state = errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'success';
        summary.textContent = isFullPlayground
            ? issues.length === 0
                ? 'No issues found.'
                : [plural(errors, 'error'), plural(warnings, 'warning')].filter(Boolean).join(' · ')
            : issues.length === 0
                ? 'Validation passed · 0 issues found'
                : `Validation needs attention · ${[plural(errors, 'error'), plural(warnings, 'warning')].filter(Boolean).join(' · ')}`;
        if (!isFullPlayground) {
            status.textContent = issues.length === 0
                ? 'Your tokens are valid and ready to convert.'
                : 'Review the validation details before converting.';
        }

        issueList.replaceChildren(...issues.map((issue) => {
            const item = issueTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
            item.dataset.severity = issue.severity;
            fill(item, 'severity', issue.severity);
            fill(item, 'id', issue.id);
            fill(item, 'message', issue.message);
            fill(item, 'path', issue.tokenPath === undefined ? '' : String(issue.tokenPath));
            return item;
        }));
    };

    const clearIssues = (message: string): void => {
        convertButton.disabled = true;
        if (validationPanel !== null) {
            validationPanel.dataset.state = 'idle';
            validationPanel.dataset.expandable = 'false';
            if ('open' in validationPanel) {
                (validationPanel as HTMLDetailsElement).open = false;
            }
        }
        summary.dataset.state = 'idle';
        summary.textContent = message;
        issueList.replaceChildren();
    };

    const failure = (error: unknown): CheckIssue[] => {
        if (typeof error === 'object' && error !== null && 'issues' in error && Array.isArray(error.issues)) {
            return error.issues as CheckIssue[];
        }
        return [{
            id: 'playground',
            severity: 'error',
            message: error instanceof Error ? error.message : 'Unexpected error.',
        }];
    };

    const check = async (): Promise<CheckIssue[]> => {
        const { BrowserTokenToolkit, CheckScope } = await loadBrowserModule();
        const scope = lintCheckbox.checked ? CheckScope.LINT : CheckScope.VALIDATE;
        return new BrowserTokenToolkit().check(tokenSet(), { scope });
    };

    const validate = async (): Promise<CheckIssue[] | undefined> => {
        window.clearTimeout(autoValidateTimer);
        if (!hasContent()) {
            clearIssues('Paste tokens or load an example to check them.');
            return undefined;
        }
        // The first check also downloads the toolkit, which can take a moment.
        summary.dataset.state = 'idle';
        summary.textContent = 'Checking…';
        convertButton.disabled = true;
        try {
            const issues = await check();
            renderIssues(issues);
            return issues;
        } catch (error) {
            renderIssues(failure(error));
            return undefined;
        }
    };

    const renderOutput = (): void => {
        const hasOutputs = outputs.length > 0;
        outputFileSelect.hidden = outputs.length < 2;
        outputFileSelect.parentElement?.toggleAttribute('hidden', outputs.length < 2);
        outputFileSelect.replaceChildren(...outputs.map((output, index) => new Option(output.fileName, String(index))));
        outputFileSelect.value = String(selectedOutput);

        const outputContent = outputs[selectedOutput]?.content ?? '';
        if (isFullPlayground) code.textContent = outputContent;
        else code.innerHTML = highlightOutput(outputContent);
        if (outputLines !== null) outputLines.textContent = lineNumbers(outputs[selectedOutput]?.content ?? '');
        updateCodePlaceholder();
        codePlaceholder.hidden = hasOutputs;
        if (downloadButton !== null) downloadButton.disabled = !hasOutputs;
    };

    const clearShowcase = (message: string): void => {
        showcaseContent = undefined;
        if (showcaseDownloadButton !== null) showcaseDownloadButton.disabled = true;
        if (showcase === null || showcasePlaceholder === null) return;
        showcase.srcdoc = '';
        showcase.hidden = true;
        showcasePlaceholder.hidden = false;
        showcasePlaceholder.textContent = message;
    };

    const renderShowcase = (content: string): void => {
        showcaseContent = content;
        if (showcaseDownloadButton !== null) showcaseDownloadButton.disabled = false;
        if (showcase === null || showcasePlaceholder === null) return;
        showcase.srcdoc = content;
        showcase.hidden = false;
        showcasePlaceholder.hidden = true;
    };

    const convert = async (): Promise<void> => {
        const issues = await validate();
        if (issues === undefined || issues.some((issue) => issue.severity === 'error')) {
            clearShowcase('Fix the errors to render the showcase.');
            setStatus(isFullPlayground
                ? 'Fix the errors in the Issues panel, then convert again.'
                : 'Review the validation details, then convert again.');
            return;
        }

        const format = outputFormatSelect.value as BrowserOutputFormat;
        const label = outputFormatSelect.selectedOptions[0]?.textContent ?? format;
        try {
            const { BrowserTokenToolkit } = await loadBrowserModule();
            const toolkit = new BrowserTokenToolkit();
            outputs = toolkit.convert(tokenSet(), format);
            selectedOutput = 0;
            if (showcase !== null) {
                const [showcaseOutput] = toolkit.convert(tokenSet(), 'showcase');
                if (showcaseOutput !== undefined) renderShowcase(showcaseOutput.content);
            }
            outputPanel.dataset.stale = 'false';
            setStatus(isFullPlayground
                ? `Converted to ${label}: ${plural(outputs.length, 'file')}. Showcase updated.`
                : `Converted to ${label}: ${plural(outputs.length, 'file')}.`);
        } catch (error) {
            outputs = [];
            selectedOutput = 0;
            clearShowcase('Fix the errors to render the showcase.');
            renderIssues(failure(error));
            setStatus(`Conversion to ${label} failed.`);
        }
        renderOutput();
    };

    const loadContent = (
        content: string,
        name: string | undefined,
        format: BrowserInputFormat | 'auto' = 'auto',
    ): void => {
        editor.value = content;
        setSource(name);
        if (inputFormatSelect !== null) inputFormatSelect.value = format;
        if (inputLines !== null) inputLines.textContent = lineNumbers(content);
        if (inputHighlight !== null) inputHighlight.innerHTML = highlightInput(content);
        inputChanged();
        void validate();
    };

    const loadFile = async (file: File): Promise<void> => {
        loadContent(await file.text(), file.name);
        if (isFullPlayground) setStatus(`Loaded ${file.name}.`);
    };

    // Earlier output no longer matches the input; keep it visible but dimmed.
    const inputChanged = (): void => {
        updateCodePlaceholder();
        if (showcase !== null && !showcase.hidden) {
            clearShowcase('Input changed. Convert again to refresh the showcase.');
        }
        if (outputs.length > 0) {
            outputs = [];
            selectedOutput = 0;
            outputPanel.dataset.stale = 'false';
            renderOutput();
            setStatus('Input changed. Validate and convert again to update the output.');
        }
    };

    const download = (): void => {
        const file = outputs[selectedOutput];
        if (file === undefined) return;

        const url = URL.createObjectURL(new Blob([file.content], { type: 'text/plain;charset=utf-8' }));
        const link = Object.assign(document.createElement('a'), { href: url, download: baseName(file.fileName) });
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadShowcase = (): void => {
        if (showcaseContent === undefined) return;

        const url = URL.createObjectURL(new Blob([showcaseContent], { type: 'text/html;charset=utf-8' }));
        const link = Object.assign(document.createElement('a'), {
            href: url,
            download: 'token-showcase.html',
        });
        link.click();
        URL.revokeObjectURL(url);
    };

    editor.addEventListener('paste', () => {
        // Pasting over the whole document replaces it, so the uploaded file
        // name no longer describes the content.
        if (editor.selectionStart === 0 && editor.selectionEnd === editor.value.length) {
            setSource(undefined);
        }
    });

    editor.addEventListener('input', () => {
        if (inputLines !== null) inputLines.textContent = lineNumbers(editor.value);
        if (inputHighlight !== null) inputHighlight.innerHTML = highlightInput(editor.value);
        inputChanged();
        window.clearTimeout(autoValidateTimer);
        autoValidateTimer = window.setTimeout(() => void validate(), AUTO_VALIDATE_DELAY_MS);
    });
    editor.addEventListener('scroll', () => {
        if (inputLines !== null) inputLines.scrollTop = editor.scrollTop;
        if (inputHighlight !== null) {
            inputHighlight.scrollTop = editor.scrollTop;
            inputHighlight.scrollLeft = editor.scrollLeft;
        }
    });

    exampleSelect.addEventListener('change', () => {
        const example = playgroundExamples.find((candidate) => candidate.id === exampleSelect.value);
        if (example === undefined) return;
        loadContent(example.content, example.fileName, example.inputFormat);
        if (isFullPlayground) setStatus(`Loaded the ${example.label} example.`);
    });

    inputFormatSelect?.addEventListener('change', () => {
        inputChanged();
        void validate();
    });
    lintCheckbox.addEventListener('change', () => void validate());
    validateButton.addEventListener('click', () => void validate());
    convertButton.addEventListener('click', () => void convert());
    // Once something is converted, switching the format shows it right away.
    outputFormatSelect.addEventListener('change', () => {
        if (outputs.length > 0) void convert();
    });
    downloadButton?.addEventListener('click', download);
    showcaseDownloadButton?.addEventListener('click', downloadShowcase);
    outputFileSelect.addEventListener('change', () => {
        selectedOutput = Number(outputFileSelect.value);
        const outputContent = outputs[selectedOutput]?.content ?? '';
        if (isFullPlayground) code.textContent = outputContent;
        else code.innerHTML = highlightOutput(outputContent);
    });
    validationSummary?.addEventListener('click', (event) => {
        if (validationPanel?.dataset.expandable === 'true') return;
        event.preventDefault();
    });

    renderOutput();

    if (uploadButton !== null && fileInput !== null && dropZone !== null) {
        uploadButton.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            const [file] = fileInput.files ?? [];
            if (file !== undefined) void loadFile(file);
            fileInput.value = '';
        });

        dropZone.addEventListener('dragover', (event) => {
            if (!event.dataTransfer?.types.includes('Files')) return;
            event.preventDefault();
            dropZone.dataset.dragging = 'true';
        });
        dropZone.addEventListener('dragleave', () => {
            delete dropZone.dataset.dragging;
        });
        dropZone.addEventListener('drop', (event) => {
            const [file] = event.dataTransfer?.files ?? [];
            delete dropZone.dataset.dragging;
            if (file === undefined) return;
            event.preventDefault();
            void loadFile(file);
        });
    }

    // Check the prefilled example once the playground scrolls into view.
    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void validate();
    }, { rootMargin: '200px' });
    observer.observe(root);
}

function fill(item: HTMLElement, name: string, text: string): void {
    const target = item.querySelector<HTMLElement>(`[data-issue-${name}]`);
    if (target === null) return;
    target.textContent = text;
    target.hidden = text === '';
}

function lineNumbers(content: string): string {
    const count = Math.max(1, content.split('\n').length);
    return Array.from({ length: count }, (_, index) => String(index + 1)).join('\n');
}

function highlightInput(content: string): string {
    const tokenPattern = /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?/g;
    let highlighted = '';
    let cursor = 0;

    for (const match of content.matchAll(tokenPattern)) {
        const token = match[0];
        const index = match.index ?? cursor;
        const isKey = /^\s*:/.test(content.slice(index + token.length));
        const type = isKey ? 'key' : token.startsWith('"') ? 'string' : 'number';
        highlighted += escapeHtml(content.slice(cursor, index));
        highlighted += `<span data-token="${type}">${escapeHtml(token)}</span>`;
        cursor = index + token.length;
    }

    return highlighted + escapeHtml(content.slice(cursor));
}

function highlightOutput(content: string): string {
    const escaped = escapeHtml(content);
    return escaped.replace(
        /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[\w:.-]+[\s\S]*?&gt;)/g,
        (match, comment) => `<span data-token="${comment === undefined ? 'tag' : 'comment'}">${match}</span>`,
    );
}

function escapeHtml(content: string): string {
    return content.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function plural(count: number, noun: string): string {
    if (count === 0) return '';
    return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/** Android outputs use resource paths such as values-night/colors.xml. */
function baseName(fileName: string): string {
    return fileName.replaceAll('/', '_');
}
