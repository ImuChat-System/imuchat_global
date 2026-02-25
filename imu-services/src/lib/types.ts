// === misc types ===
/**
 * Types divers : User, Professional, Beauty, Tutorial, Rideshare
 */

export type User = {
    id: string;
    name: string;
    avatar: string;
    email?: string;
    status?: 'online' | 'offline' | 'busy' | 'away';
    bio?: string;
    role?: string;
};

export type Professional = {
    id: string;
    name: string;
    trade: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    isInsured: boolean;
    distance: string;
    rate: string;
    avatar: string;
};

export type BeautyProduct = {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    rating: number;
    reviewCount: number;
    image: string;
    description: string;
    ingredients: string[];
    isFavorite?: boolean;
    skinType: string[];
    imageUrl?: string;
    isNew?: boolean;
    tags?: string[];
};

export type Tutorial = {
    id: string;
    title: string;
    thumbnailUrl: string;
    progress: number;
    level: string;
    rating: number;
    duration: string;
    toolsRequired: number;
    category: string;
    description?: string;
};

export type Rideshare = {
    id: string;
    driver: { name: string; avatar: string };
    driverAvatar: string;
    origin: string;
    destination: string;
    departureTime: string;
    availableSeats: number;
    price: number;
    vehicleType: string;
    rating: number;
    estimatedDuration: string;
    from?: string;
    to?: string;
    seatsAvailable?: number;
    vibe?: string;
};

export type RideShare = Rideshare;


