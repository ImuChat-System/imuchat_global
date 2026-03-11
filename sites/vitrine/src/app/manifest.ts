import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ImuChat - Super-App Européenne',
        short_name: 'ImuChat',
        description: 'Communication, services utiles, mini-apps et intelligence artificielle dans une seule plateforme respectueuse de vos données.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#8B5CF6',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        categories: ['social', 'communication', 'productivity'],
        lang: 'fr',
        dir: 'ltr',
        orientation: 'portrait-primary',
    };
}
