// === Data from misc.ts ===
/**
 * Seed data : Divers (Professionals, Beauty, Tutorials, Rideshares)
 */

import type { BeautyProduct, Professional, Rideshare, Tutorial } from './types';

export const MOCK_PROFESSIONALS: Professional[] = [
    { id: 'pro-1', name: 'Jean Dupont', trade: 'Plombier', rating: 4.9, reviewCount: 152, isVerified: true, isInsured: true, distance: '2.1km', rate: '50€/hr', avatar: 'https://placehold.co/128x128.png' },
    { id: 'pro-2', name: 'Sophie Leroy', trade: 'Électricienne', rating: 4.7, reviewCount: 89, isVerified: true, isInsured: false, distance: '5.4km', rate: '65€/hr', avatar: 'https://placehold.co/128x128.png' },
    { id: 'pro-3', name: 'Marc Petit', trade: 'Serrurier', rating: 4.8, reviewCount: 210, isVerified: true, isInsured: true, distance: '1.2km', rate: 'Intervention à 80€', avatar: 'https://placehold.co/128x128.png' },
];

export const MOCK_RIDESHARES: Rideshare[] = [
    {
        id: 'ride-1',
        driver: { name: 'Takeshi', avatar: 'https://placehold.co/40x40.png' },
        driverAvatar: 'https://placehold.co/40x40.png',
        origin: 'Shibuya Station',
        destination: 'Haneda Airport',
        departureTime: '14:30',
        availableSeats: 2,
        price: 1200,
        vehicleType: 'Toyota Prius',
        rating: 4.8,
        estimatedDuration: '45min'
    },
    {
        id: 'ride-2',
        driver: { name: 'Mayumi', avatar: 'https://placehold.co/40x40.png' },
        driverAvatar: 'https://placehold.co/40x40.png',
        origin: 'Shinjuku',
        destination: 'Yokohama',
        departureTime: '16:00',
        availableSeats: 3,
        price: 800,
        vehicleType: 'Honda Fit',
        rating: 4.9,
        estimatedDuration: '35min'
    }
];

export const MOCK_BEAUTY_PRODUCTS: BeautyProduct[] = [
    {
        id: 'beauty-1',
        name: 'Sakura Glow Serum',
        brand: 'Tokyo Beauty',
        category: 'Skincare',
        price: 3500,
        rating: 4.8,
        reviewCount: 1247,
        image: 'https://placehold.co/300x300.png',
        description: 'Sérum éclat aux extraits de fleurs de cerisier japonaises',
        ingredients: ['Extrait de sakura', 'Acide hyaluronique', 'Vitamine C'],
        skinType: ['Normal', 'Dry', 'Combination'],
        isFavorite: true
    },
    {
        id: 'beauty-2',
        name: 'Matcha Face Mask',
        brand: 'Kyoto Cosmetics',
        category: 'Skincare',
        price: 2800,
        rating: 4.6,
        reviewCount: 892,
        image: 'https://placehold.co/300x300.png',
        description: 'Masque purifiant au thé vert matcha bio',
        ingredients: ['Matcha bio', 'Argile bentonite', 'Huile de jojoba'],
        skinType: ['Oily', 'Combination', 'Acne-prone']
    },
    {
        id: 'beauty-3',
        name: 'Kawaii Pink Lipstick',
        brand: 'Harajuku Style',
        category: 'Makeup',
        price: 1200,
        rating: 4.9,
        reviewCount: 2156,
        image: 'https://placehold.co/300x300.png',
        description: 'Rouge à lèvres rose kawaii longue tenue',
        ingredients: ['Cires naturelles', 'Pigments naturels', 'Vitamine E'],
        skinType: ['All']
    }
];

export const MOCK_TUTORIALS: Tutorial[] = [
    { id: 'tut-1', title: 'Maquillage Kawaii Débutant', thumbnailUrl: 'https://placehold.co/300x200.png', progress: 60, level: 'Débutant', rating: 4.7, duration: '15 min', toolsRequired: 5, category: 'makeup' },
    { id: 'tut-2', title: 'Soin de Peau Matcha', thumbnailUrl: 'https://placehold.co/300x200.png', progress: 30, level: 'Intermédiaire', rating: 4.5, duration: '20 min', toolsRequired: 3, category: 'skincare' },
    { id: 'tut-3', title: 'Coiffure Harajuku', thumbnailUrl: 'https://placehold.co/300x200.png', progress: 0, level: 'Avancé', rating: 4.9, duration: '25 min', toolsRequired: 8, category: 'hair' },
];


