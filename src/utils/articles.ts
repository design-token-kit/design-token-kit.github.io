import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;

const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

export function getArticleSlug(article: ArticleEntry) {
    return article.id.replace(/\.md$/, '').replaceAll('\\', '/');
}

export function getArticleHref(slug: string) {
    return `${baseUrl}articles/${slug}/`;
}

export async function getArticles() {
    const articles = await getCollection('articles');

    return articles.sort((firstArticle, secondArticle) =>
        secondArticle.data.date.getTime() - firstArticle.data.date.getTime(),
    );
}

export async function getLatestArticles(limit = 2) {
    const articles = await getArticles();

    return articles.slice(0, limit);
}
