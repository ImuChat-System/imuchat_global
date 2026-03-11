import { MetadataRoute } from 'next';

const baseUrl = 'https://imuchat.app';
const locales = ['fr', 'en', 'de', 'es', 'ja'];
const pages = ['', 'product', 'features', 'ai', 'developers', 'about', 'contact', 'partners', 'news', 'privacy', 'terms', 'legal'];

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Generate entries for each locale and page combination
    locales.forEach((locale) => {
        pages.forEach((page) => {
            const url = `${baseUrl}/${locale}${page ? `/${page}` : ''}`;
            sitemapEntries.push({
                url,
                lastModified: new Date(),
                changeFrequency: page === '' ? 'daily' : 'weekly',
                priority: page === '' ? 1.0 : 0.8,
                alternates: {
                    languages: Object.fromEntries(
                        locales.map((loc) => [
                            loc,
                            `${baseUrl}/${loc}${page ? `/${page}` : ''}`
                        ])
                    )
                }
            });
        });
    });

    return sitemapEntries;
}
