import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ data }) => {
    const article = await import(`../docs/faq.md`);

    return {
        content: article.default,
        meta: article.metadata,
        form: data && typeof data === 'object' && 'form' in data ? (data as { form: unknown }).form : undefined
    }

};