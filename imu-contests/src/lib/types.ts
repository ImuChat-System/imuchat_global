// === community types ===
/**
 * Types pour les modules Communauté : Worlds, Contests, Formations, Quiz
 */

export type World = {
    id: string;
    title: string;
    description: string;
    category: 'Cyber City' | 'Mystic Forest' | 'Space Odyssey' | 'Steampunk Village';
    previewSrc: string;
    isLive: boolean;
    isFeatured?: boolean;
};

export type Contest = {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    type: 'art' | 'code' | 'quiz' | 'video' | 'writing';
    status: 'active' | 'upcoming' | 'closed';
    startDate: string;
    scheduledTime?: string;
    category?: string;
    endDate: string;
    prize: string;
    participants: number;
};

export type Submission = {
    id: string;
    contestId: string;
    title: string;
    authorName: string;
    authorAvatar: string;
    imageUrl: string;
    votes: number;
};

export type Course = {
    id: string;
    title: string;
    instructor: string;
    instructorAvatar: string;
    thumbnailUrl: string;
    scheduledTime?: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    rating: number;
    reviewCount: number;
    price: number;
    isFeatured?: boolean;
    startDate?: string;
};

export type Quiz = {
    id: string;
    title: string;
    questions: QuizQuestion[];
};

export type QuizQuestion = {
    id: string;
    text: string;
    choices: {
        id: string;
        label: string;
        isCorrect: boolean;
    }[];
};

export type CommunityPod = {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    category: string;
    image: string;
    isActive: boolean;
    createdBy: string;
    tags: string[];
    isReliable?: boolean;
    route?: string;
    members?: Array<{ name: string; avatar: string }>;
};


