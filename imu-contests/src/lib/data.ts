// === Data from community.ts ===
/**
 * Seed data : Communauté (Worlds, Contests, Formations, Quiz)
 */

import type { CommunityPod, Contest, Course, Quiz, Submission, World } from './types';

export const MOCK_CONTESTS: Contest[] = [
    {
        id: 'contest-1',
        title: 'Summer Memories Art Contest',
        description: 'Draw your favorite summer memories with an anime twist! The winning artwork will be featured as a new chat theme.',
        thumbnailUrl: 'https://placehold.co/600x400.png',
        type: 'art',
        status: 'active',
        startDate: '2024-07-15T12:00:00Z',
        scheduledTime: '2024-07-15T12:00:00Z',
        endDate: '2024-08-15T12:00:00Z',
        prize: '10,000 Credits & Exclusive Badge',
        participants: 128
    },
    {
        id: 'contest-2',
        title: 'Mecha-Building Code Challenge',
        description: 'Design and code a simple mech in a sandboxed environment. Most creative and functional design wins.',
        thumbnailUrl: 'https://placehold.co/600x400.png',
        type: 'code',
        status: 'upcoming',
        startDate: '2024-08-20T12:00:00Z',
        scheduledTime: '2024-08-20T12:00:00Z',
        endDate: '2024-09-20T12:00:00Z',
        prize: 'Razer Keyboard & ImuChat Merch',
        participants: 0
    },
    { id: 'contest-3', title: 'Shonen Anime Knowledge Quiz', description: 'Think you know everything about shonen anime? Prove it in this ultimate trivia challenge!', thumbnailUrl: 'https://placehold.co/600x400.png', type: 'quiz', status: 'closed', startDate: '2024-06-01T12:00:00Z', endDate: '2024-06-15T12:00:00Z', prize: 'Lifetime Imu+ Premium Subscription', participants: 542 },
];

export const MOCK_SUBMISSIONS: Submission[] = [
    { id: 'sub-1', contestId: 'contest-1', title: 'Beach Day with Nakama', authorName: 'Yuki', authorAvatar: 'https://placehold.co/40x40.png', imageUrl: 'https://placehold.co/400x400.png', votes: 152 },
    { id: 'sub-2', contestId: 'contest-1', title: 'Fireflies at Dusk', authorName: 'Kaito', authorAvatar: 'https://placehold.co/40x40.png', imageUrl: 'https://placehold.co/400x400.png', votes: 128 },
    { id: 'sub-3', contestId: 'contest-3', title: 'Winner of Shonen Quiz', authorName: 'Ren', authorAvatar: 'https://placehold.co/40x40.png', imageUrl: 'https://placehold.co/400x400.png', votes: 999 },
];

export const MOCK_WORLDS: World[] = [
    { id: 'world-1', title: 'Neo-Kyoto Cyber City', description: 'A bustling metropolis of neon lights, advanced technology, and hidden traditions. Explore towering skyscrapers and ancient temples.', category: 'Cyber City', previewSrc: 'https://placehold.co/600x400.png', isLive: true, isFeatured: true },
    { id: 'world-2', title: 'Whispering Woods of Aethel', description: 'An ancient, enchanted forest where spirits roam and forgotten magic lies dormant. Tread carefully.', category: 'Mystic Forest', previewSrc: 'https://placehold.co/600x400.png', isLive: false },
    { id: 'world-3', title: 'The Starship Wanderer', description: 'Journey through the cosmos aboard a massive colony ship. Discover new planets, encounter alien species, and survive the void.', category: 'Space Odyssey', previewSrc: 'https://placehold.co/600x400.png', isLive: true },
    { id: 'world-4', title: 'Clockwork Town of Cogsworth', description: 'A charming village powered by steam and intricate clockwork mechanisms. Full of inventors and artisans.', category: 'Steampunk Village', previewSrc: 'https://placehold.co/600x400.png', isLive: false },
];

export const MOCK_QUIZZES: Quiz[] = [
    {
        id: 'quiz-1',
        title: 'Shonen Anime Basics',
        questions: [
            {
                id: 'q1', text: 'Which anime features the "Survey Corps"?',
                choices: [
                    { id: 'q1c1', label: 'Naruto', isCorrect: false },
                    { id: 'q1c2', label: 'Attack on Titan', isCorrect: true },
                    { id: 'q1c3', label: 'Bleach', isCorrect: false },
                ]
            },
            {
                id: 'q2', text: 'What is the name of the pirate crew led by Monkey D. Luffy?',
                choices: [
                    { id: 'q2c1', label: 'Straw Hat Pirates', isCorrect: true },
                    { id: 'q2c2', label: 'Heart Pirates', isCorrect: false },
                    { id: 'q2c3', label: 'Blackbeard Pirates', isCorrect: false },
                ]
            }
        ]
    }
];

export const MOCK_COURSES: Course[] = [
    { id: 'course-1', title: 'Introduction to Character Design', instructor: 'Aya', instructorAvatar: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/600x400.png', category: 'Design', level: 'Beginner', duration: '6h 30m', rating: 4.9, reviewCount: 1250, price: 49.99, isFeatured: true },
    { id: 'course-2', title: 'Advanced React Patterns', instructor: 'Kaito', instructorAvatar: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/600x400.png', category: 'Code', level: 'Advanced', duration: '12h', rating: 4.8, reviewCount: 800, price: 99.99, isFeatured: true },
    { id: 'course-3', title: 'Japanese for Anime Fans', instructor: 'Yuki', instructorAvatar: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/600x400.png', category: 'Culture', level: 'Beginner', duration: '20h', rating: 4.7, reviewCount: 2500, price: 0 },
];

export const MOCK_COMMUNITY_PODS: CommunityPod[] = [
    {
        id: 'pod-1',
        name: 'Tokyo Riders',
        description: 'Groupe de covoiturage pour la région de Tokyo',
        memberCount: 1432,
        category: 'Transport',
        image: 'https://placehold.co/200x200.png',
        isActive: true,
        createdBy: 'Hiroshi',
        tags: ['tokyo', 'covoiturage', 'écolo']
    },
    {
        id: 'pod-2',
        name: 'Osaka Express',
        description: 'Trajets rapides et économiques vers Osaka',
        memberCount: 867,
        category: 'Transport',
        image: 'https://placehold.co/200x200.png',
        isActive: true,
        createdBy: 'Akiko',
        tags: ['osaka', 'express', 'économique']
    }
];


