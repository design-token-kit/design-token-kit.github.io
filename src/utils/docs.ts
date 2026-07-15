import type { MarkdownInstance } from 'astro';

export interface DocFrontmatter {
    title: string;
    description: string;
    section: string;
    order: number;
}

export interface DocEntry {
    slug: string;
    href: string;
    frontmatter: DocFrontmatter;
    Content: MarkdownInstance<DocFrontmatter>['Content'];
}

const docModules = import.meta.glob<MarkdownInstance<DocFrontmatter>>('../content/docs/**/*.md');

const sectionOrder = ['Introduction', 'CLI', 'Core API', 'Formats'];

const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

function getSlugFromPath(path: string) {
    return path
        .replace('../content/docs/', '')
        .replace(/\.md$/, '')
        .replaceAll('\\', '/');
}

function getDocHref(slug: string) {
    return `${baseUrl}docs/${slug}/`;
}

export async function getDocs() {
    const docs = await Promise.all(
        Object.entries(docModules).map(async ([path, loadDoc]) => {
            const doc = await loadDoc();
            const slug = getSlugFromPath(path);

            return {
                slug,
                href: getDocHref(slug),
                frontmatter: doc.frontmatter,
                Content: doc.Content,
            };
        }),
    );

    return docs.sort((firstDoc, secondDoc) => {
        const firstSection = sectionOrder.indexOf(firstDoc.frontmatter.section);
        const secondSection = sectionOrder.indexOf(secondDoc.frontmatter.section);
        const sectionComparison = firstSection - secondSection;

        if (sectionComparison !== 0) {
            return sectionComparison;
        }

        return firstDoc.frontmatter.order - secondDoc.frontmatter.order;
    });
}

export async function getDocBySlug(slug: string) {
    const docs = await getDocs();

    return docs.find((doc) => doc.slug === slug);
}
