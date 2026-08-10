import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

// External CMS disabled for the Mujeeb Lawal build. Content is now served
// locally from src/config/content.js via the hooks in useSanityData.js.
// Leaving projectId as the placeholder makes `isSanityConfigured` false, so
// loadSanityData() short-circuits and no external requests are made.
// projectId must be a valid slug (a-z, 0-9, dashes) or createClient throws.
// 'disabled' keeps the client constructible; isSanityConfigured (see
// useSanityData.js) is hard-forced false so no request is ever made.
export const sanityClient = createClient({
    projectId: 'disabled',
    dataset: 'production',
    useCdn: true,
    apiVersion: '2024-03-01',
});

const builder = createImageUrlBuilder(sanityClient);

// Funkcja pomocnicza do generowania adresów URL obrazków z Sanity
export const urlFor = (source) => builder.image(source);

// Funkcja pomocnicza do zamiany domeny Sanity na proxy w Cloudflare
export const getProxyUrl = (imageBuilder) => {
    if (!imageBuilder) return null;
    const url = imageBuilder.url();
    if (url && typeof window !== 'undefined') {
        return url.replace('https://cdn.sanity.io', '/sanity-cdn');
    }
    return url;
};
