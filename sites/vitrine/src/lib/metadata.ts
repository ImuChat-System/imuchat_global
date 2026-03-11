import { Metadata } from 'next';

interface PageMetadata {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
}

const baseUrl = 'https://imuchat.app'; // URL de base de production

export const metadataConfig: Record<string, Record<string, PageMetadata>> = {
    fr: {
        home: {
            title: "ImuChat - La Super-App Européenne Respectueuse de vos Données",
            description: "Communication sécurisée, services utiles, mini-apps et IA dans une plateforme unique. Messagerie chiffrée, appels vidéo, modules personnalisables. 100% RGPD.",
            keywords: ["super-app", "messagerie", "chiffrement", "RGPD", "application européenne", "communication sécurisée", "WeChat européen"],
            ogImage: "/og-image-home.png"
        },
        product: {
            title: "Produit - Vision de la Super-App ImuChat",
            description: "Découvrez ImuChat : une plateforme unifiée inspirée des super-apps asiatiques, adaptée aux standards européens de confidentialité. Messagerie, services et IA.",
            keywords: ["super-app", "plateforme unifiée", "WeChat", "LINE", "application tout-en-un"],
            ogImage: "/og-image-product.png"
        },
        features: {
            title: "50+ Fonctionnalités - ImuChat App",
            description: "Messagerie avancée, appels vidéo, traduction instantanée, mini-apps, IA, personnalisation... Découvrez toutes les fonctionnalités d'ImuChat.",
            keywords: ["fonctionnalités", "messagerie", "appels vidéo", "mini-apps", "IA", "personnalisation"],
            ogImage: "/og-image-features.png"
        },
        ai: {
            title: "Intelligence Artificielle - ImuChat",
            description: "Assistants IA privacy-first pour résumé de conversations, traduction, génération d'images, recherche. Traitement local, données chiffrées.",
            keywords: ["intelligence artificielle", "IA", "assistant IA", "privacy-first", "traduction IA", "génération d'images"],
            ogImage: "/og-image-ai.png"
        },
        developers: {
            title: "Développeurs - Plateforme Mini-Apps ImuChat",
            description: "Créez des mini-apps pour ImuChat. API RESTful, SDK TypeScript/Python, marketplace, documentation complète. Plateforme ouverte aux développeurs.",
            keywords: ["API", "SDK", "développeurs", "mini-apps", "marketplace", "plateforme ouverte"],
            ogImage: "/og-image-developers.png"
        },
        about: {
            title: "À Propos - ImuChat, Projet PEPITE",
            description: "L'histoire d'ImuChat : de projet étudiant à super-app européenne. Incubé PEPITE, conçu en Europe, pensé pour le monde.",
            keywords: ["à propos", "histoire", "PEPITE", "startup", "projet étudiant", "Europe"],
            ogImage: "/og-image-about.png"
        },
        contact: {
            title: "Contact - Parlons de votre Projet",
            description: "Contactez l'équipe ImuChat pour partenariats, demandes presse, beta test ou questions développeurs. Réponse sous 48h ouvrées.",
            keywords: ["contact", "partenariat", "presse", "beta test", "support"],
            ogImage: "/og-image-contact.png"
        },
        privacy: {
            title: "Politique de Confidentialité - ImuChat",
            description: "Politique de confidentialité ImuChat : vos données vous appartiennent. Chiffrement de bout en bout, conformité RGPD, transparence totale.",
            keywords: ["confidentialité", "RGPD", "vie privée", "protection des données", "chiffrement"],
            ogImage: "/og-image-default.png"
        },
        terms: {
            title: "Conditions Générales d'Utilisation - ImuChat",
            description: "CGU ImuChat : conditions d'utilisation, droits et responsabilités des utilisateurs. Transparence et respect de vos droits.",
            keywords: ["CGU", "conditions d'utilisation", "termes", "règles", "légal"],
            ogImage: "/og-image-default.png"
        },
        legal: {
            title: "Mentions Légales - ImuChat",
            description: "Mentions légales ImuChat : informations d'édition, hébergement et contact. Conformité légale française et européenne.",
            keywords: ["mentions légales", "éditeur", "hébergeur", "légal", "RGPD"],
            ogImage: "/og-image-default.png"
        },
        partners: {
            title: "Partenaires - Rejoignez l'Écosystème ImuChat",
            description: "Devenez partenaire ImuChat : universités, institutions PEPITE, associations. Collaborez avec la super-app européenne de communication.",
            keywords: ["partenaires", "PEPITE", "universités", "institutions", "associations", "collaboration"],
            ogImage: "/og-image-partners.png"
        },
        news: {
            title: "Actualités - Suivi du Projet ImuChat",
            description: "Suivez l'évolution d'ImuChat : jalons majeurs, annonces, roadmap 2024-2025. De l'incubation PEPITE à l'expansion internationale.",
            keywords: ["actualités", "news", "roadmap", "timeline", "PEPITE", "évolution"],
            ogImage: "/og-image-news.png"
        }
    },
    en: {
        home: {
            title: "ImuChat - The European Privacy-Focused Super-App",
            description: "Secure communication, useful services, mini-apps and AI in one platform. End-to-end encrypted messaging, video calls, customizable modules. 100% GDPR compliant.",
            keywords: ["super-app", "messaging", "encryption", "GDPR", "European app", "secure communication", "European WeChat"],
            ogImage: "/og-image-home.png"
        },
        product: {
            title: "Product - ImuChat Super-App Vision",
            description: "Discover ImuChat: a unified platform inspired by Asian super-apps, adapted to European privacy standards. Messaging, services and AI.",
            keywords: ["super-app", "unified platform", "WeChat", "LINE", "all-in-one app"],
            ogImage: "/og-image-product.png"
        },
        features: {
            title: "50+ Features - ImuChat App",
            description: "Advanced messaging, video calls, instant translation, mini-apps, AI, customization... Discover all ImuChat features.",
            keywords: ["features", "messaging", "video calls", "mini-apps", "AI", "customization"],
            ogImage: "/og-image-features.png"
        },
        ai: {
            title: "Artificial Intelligence - ImuChat",
            description: "Privacy-first AI assistants for conversation summary, translation, image generation, search. Local processing, encrypted data.",
            keywords: ["artificial intelligence", "AI", "AI assistant", "privacy-first", "AI translation", "image generation"],
            ogImage: "/og-image-ai.png"
        },
        developers: {
            title: "Developers - ImuChat Mini-Apps Platform",
            description: "Create mini-apps for ImuChat. RESTful API, TypeScript/Python SDK, marketplace, complete documentation. Open platform for developers.",
            keywords: ["API", "SDK", "developers", "mini-apps", "marketplace", "open platform"],
            ogImage: "/og-image-developers.png"
        },
        about: {
            title: "About - ImuChat, PEPITE Project",
            description: "The ImuChat story: from student project to European super-app. PEPITE incubated, designed in Europe, built for the world.",
            keywords: ["about", "story", "PEPITE", "startup", "student project", "Europe"],
            ogImage: "/og-image-about.png"
        },
        contact: {
            title: "Contact - Let's Talk About Your Project",
            description: "Contact ImuChat team for partnerships, press inquiries, beta testing or developer questions. Response within 48 business hours.",
            keywords: ["contact", "partnership", "press", "beta test", "support"],
            ogImage: "/og-image-contact.png"
        },
        privacy: {
            title: "Privacy Policy - ImuChat",
            description: "ImuChat privacy policy: your data belongs to you. End-to-end encryption, GDPR compliance, total transparency.",
            keywords: ["privacy", "GDPR", "data protection", "encryption"],
            ogImage: "/og-image-default.png"
        },
        terms: {
            title: "Terms of Service - ImuChat",
            description: "ImuChat terms of service: usage conditions, user rights and responsibilities. Transparency and respect for your rights.",
            keywords: ["terms of service", "TOS", "usage conditions", "rules", "legal"],
            ogImage: "/og-image-default.png"
        },
        legal: {
            title: "Legal Notice - ImuChat",
            description: "ImuChat legal notice: publishing, hosting and contact information. French and European legal compliance.",
            keywords: ["legal notice", "publisher", "hosting", "legal", "GDPR"],
            ogImage: "/og-image-default.png"
        },
        partners: {
            title: "Partners - Join the ImuChat Ecosystem",
            description: "Become an ImuChat partner: universities, PEPITE institutions, associations. Collaborate with the European communication super-app.",
            keywords: ["partners", "PEPITE", "universities", "institutions", "associations", "collaboration"],
            ogImage: "/og-image-partners.png"
        },
        news: {
            title: "News - ImuChat Project Updates",
            description: "Follow ImuChat's evolution: major milestones, announcements, 2024-2025 roadmap. From PEPITE incubation to international expansion.",
            keywords: ["news", "updates", "roadmap", "timeline", "PEPITE", "evolution"],
            ogImage: "/og-image-news.png"
        }
    }
};

export function generatePageMetadata(
    page: string,
    locale: string = 'fr'
): Metadata {
    const pageData = metadataConfig[locale]?.[page] || metadataConfig['fr'][page];

    if (!pageData) {
        return {
            title: "ImuChat",
            description: "La super-app européenne respectueuse de vos données"
        };
    }

    return {
        title: pageData.title,
        description: pageData.description,
        keywords: pageData.keywords,
        openGraph: {
            title: pageData.title,
            description: pageData.description,
            url: `${baseUrl}/${locale}/${page === 'home' ? '' : page}`,
            siteName: 'ImuChat',
            images: [
                {
                    url: pageData.ogImage || '/og-image-default.png',
                    width: 1200,
                    height: 630,
                    alt: pageData.title,
                }
            ],
            locale: locale === 'fr' ? 'fr_FR' : locale === 'en' ? 'en_US' : locale,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageData.title,
            description: pageData.description,
            images: [pageData.ogImage || '/og-image-default.png'],
            creator: '@imuchat',
            site: '@imuchat',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: `${baseUrl}/${locale}/${page === 'home' ? '' : page}`,
            languages: {
                'fr': `${baseUrl}/fr/${page === 'home' ? '' : page}`,
                'en': `${baseUrl}/en/${page === 'home' ? '' : page}`,
                'de': `${baseUrl}/de/${page === 'home' ? '' : page}`,
                'es': `${baseUrl}/es/${page === 'home' ? '' : page}`,
                'ja': `${baseUrl}/ja/${page === 'home' ? '' : page}`,
            },
        },
    };
}
