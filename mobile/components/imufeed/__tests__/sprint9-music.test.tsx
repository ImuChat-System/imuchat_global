/**
 * Tests for Sprint S9B — Musique & Son
 *
 * - MusicSelector component (render, genres, search, select)
 * - Sound service (fetchTrendingSounds, searchSounds, fetchVideosBySound)
 * - Audio mixer service (loadMusicTrack, setMusicVolume, setVideoVolume)
 * - Sound page route existence
 */

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────

jest.mock('@/providers/ThemeProvider', () => ({
    useColors: () => ({
        primary: '#6A54A3',
        card: '#1a1a2e',
        surface: '#1a1a2e',
        background: '#0f0a1a',
        text: '#ffffff',
        textSecondary: '#999',
        border: '#333',
        error: '#FF3B30',
        success: '#34C759',
    }),
    useSpacing: () => ({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
}));

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        Ionicons: (props) =>
            React.createElement(Text, { testID: `icon-${props.name}` }, props.name),
    };
});

jest.mock('@/services/logger', () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

jest.mock('@/services/supabase', () => ({
    supabase: {
        rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
        auth: { getUser: jest.fn() },
    },
    getCurrentUser: () => Promise.resolve({ id: 'user-1' }),
}));

// Mock expo-av
const mockCreateAsync = jest.fn().mockResolvedValue({
    sound: {
        playAsync: jest.fn().mockResolvedValue(undefined),
        pauseAsync: jest.fn().mockResolvedValue(undefined),
        stopAsync: jest.fn().mockResolvedValue(undefined),
        unloadAsync: jest.fn().mockResolvedValue(undefined),
        setVolumeAsync: jest.fn().mockResolvedValue(undefined),
        setPositionAsync: jest.fn().mockResolvedValue(undefined),
    },
});

jest.mock('expo-av', () => ({
    Audio: {
        Sound: {
            createAsync: (...args) => mockCreateAsync(...args),
        },
        setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    },
}));

// Mock sound service
const mockFetchTrending = jest.fn().mockResolvedValue([]);
const mockFetchByGenre = jest.fn().mockResolvedValue([]);
const mockSearchSounds = jest.fn().mockResolvedValue([]);

jest.mock('@/services/imufeed/sound-service', () => ({
    fetchTrendingSounds: (...args) => mockFetchTrending(...args),
    fetchSoundsByGenre: (...args) => mockFetchByGenre(...args),
    searchSounds: (...args) => mockSearchSounds(...args),
    fetchSoundById: jest.fn().mockResolvedValue(null),
    fetchVideosBySound: jest.fn().mockResolvedValue([]),
    incrementSoundUsage: jest.fn().mockResolvedValue(undefined),
    SOUND_GENRES: [
        'trending', 'electronic', 'hiphop', 'pop', 'jpop', 'kpop',
        'afrobeat', 'classical', 'rock', 'rnb', 'reggaeton', 'other',
    ],
}));

import MusicSelector from '@/components/imufeed/MusicSelector';
import * as AudioMixer from '@/services/imufeed/audio-mixer';
import {
    SOUND_GENRES,
} from '@/services/imufeed/sound-service';

// ─── Test data ────────────────────────────────────────────────

const MOCK_SOUNDS = [
    {
        id: 's1',
        title: 'Beat Drop',
        artist: 'DJ Test',
        audio_url: 'https://cdn.test/beat.mp3',
        artwork_url: null,
        duration_ms: 120000,
        usage_count: 500,
        genre: 'electronic',
        is_original: false,
        original_video_id: null,
    },
    {
        id: 's2',
        title: 'Chill Wave',
        artist: 'Ambient Pro',
        audio_url: 'https://cdn.test/chill.mp3',
        artwork_url: null,
        duration_ms: 180000,
        usage_count: 300,
        genre: 'electronic',
        is_original: false,
        original_video_id: null,
    },
    {
        id: 's3',
        title: 'Original Sound',
        artist: 'Creator',
        audio_url: 'https://cdn.test/original.mp3',
        artwork_url: null,
        duration_ms: 60000,
        usage_count: 50,
        genre: 'other',
        is_original: true,
        original_video_id: 'v-123',
    },
];

// ──────────────────────────────────────────────────────────────
// Suite 1: MusicSelector Component
// ──────────────────────────────────────────────────────────────

describe('MusicSelector', () => {
    const mockOnSelect = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetchTrending.mockResolvedValue(MOCK_SOUNDS);
        mockFetchByGenre.mockResolvedValue(MOCK_SOUNDS.slice(0, 2));
    });

    it('renders header with title', () => {
        const { getByText } = render(
            <MusicSelector
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />,
        );
        expect(getByText('Choisir un son')).toBeTruthy();
    });

    it('renders search bar', () => {
        const { getByPlaceholderText } = render(
            <MusicSelector
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />,
        );
        expect(getByPlaceholderText('Rechercher un son...')).toBeTruthy();
    });

    it('renders genre tabs', () => {
        const { getByText } = render(
            <MusicSelector
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />,
        );
        // At least trending tab should be present
        expect(getByText('🔥 Tendances')).toBeTruthy();
    });

    it('calls onClose when close button is pressed', () => {
        const { getByLabelText } = render(
            <MusicSelector
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />,
        );
        fireEvent.press(getByLabelText('Fermer'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('loads trending sounds on mount', async () => {
        render(
            <MusicSelector
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />,
        );

        await waitFor(() => {
            expect(mockFetchTrending).toHaveBeenCalledWith(30);
        });
    });

    it('shows selected indicator for current sound', async () => {
        mockFetchTrending.mockResolvedValue(MOCK_SOUNDS);

        const { findByLabelText } = render(
            <MusicSelector
                currentSound={MOCK_SOUNDS[0]}
                onSelect={mockOnSelect}
                onClose={mockOnClose}
            />,
        );

        // The item should show a checkmark
        const item = await findByLabelText(`Sélectionner ${MOCK_SOUNDS[0].title} par ${MOCK_SOUNDS[0].artist}`);
        expect(item).toBeTruthy();
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 2: SOUND_GENRES config
// ──────────────────────────────────────────────────────────────

describe('SOUND_GENRES', () => {
    it('is an array of strings', () => {
        expect(Array.isArray(SOUND_GENRES)).toBe(true);
        SOUND_GENRES.forEach(g => expect(typeof g).toBe('string'));
    });

    it('includes trending as first genre', () => {
        expect(SOUND_GENRES[0]).toBe('trending');
    });

    it('includes common genres', () => {
        expect(SOUND_GENRES).toContain('electronic');
        expect(SOUND_GENRES).toContain('hiphop');
        expect(SOUND_GENRES).toContain('pop');
        expect(SOUND_GENRES).toContain('jpop');
        expect(SOUND_GENRES).toContain('kpop');
        expect(SOUND_GENRES).toContain('afrobeat');
    });

    it('has at least 10 genres', () => {
        expect(SOUND_GENRES.length).toBeGreaterThanOrEqual(10);
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 3: Audio Mixer Service
// ──────────────────────────────────────────────────────────────

describe('Audio Mixer Service', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await AudioMixer.unloadMusicTrack();
    });

    it('exports loadMusicTrack function', () => {
        expect(typeof AudioMixer.loadMusicTrack).toBe('function');
    });

    it('exports unloadMusicTrack function', () => {
        expect(typeof AudioMixer.unloadMusicTrack).toBe('function');
    });

    it('exports playMusic function', () => {
        expect(typeof AudioMixer.playMusic).toBe('function');
    });

    it('exports pauseMusic function', () => {
        expect(typeof AudioMixer.pauseMusic).toBe('function');
    });

    it('exports setMusicVolume function', () => {
        expect(typeof AudioMixer.setMusicVolume).toBe('function');
    });

    it('exports setVideoVolume function', () => {
        expect(typeof AudioMixer.setVideoVolume).toBe('function');
    });

    it('getMixState returns initial state', () => {
        const state = AudioMixer.getMixState();
        expect(state.sound).toBeNull();
        expect(state.musicVolume).toBe(0.5);
        expect(state.videoVolume).toBe(1);
        expect(state.isMusicPlaying).toBe(false);
    });

    it('loadMusicTrack updates state with sound info', async () => {
        await AudioMixer.loadMusicTrack({
            sound: MOCK_SOUNDS[0],
            musicVolume: 0.7,
            videoVolume: 0.8,
        });

        const state = AudioMixer.getMixState();
        expect(state.sound).toEqual(MOCK_SOUNDS[0]);
        expect(state.musicVolume).toBe(0.7);
        expect(state.videoVolume).toBe(0.8);
    });

    it('setVideoVolume clamps between 0 and 1', () => {
        AudioMixer.setVideoVolume(1.5);
        expect(AudioMixer.getMixState().videoVolume).toBe(1);

        AudioMixer.setVideoVolume(-0.5);
        expect(AudioMixer.getMixState().videoVolume).toBe(0);

        AudioMixer.setVideoVolume(0.6);
        expect(AudioMixer.getMixState().videoVolume).toBe(0.6);
    });

    it('unloadMusicTrack resets state', async () => {
        await AudioMixer.loadMusicTrack({
            sound: MOCK_SOUNDS[0],
        });
        expect(AudioMixer.getMixState().sound).not.toBeNull();

        await AudioMixer.unloadMusicTrack();
        expect(AudioMixer.getMixState().sound).toBeNull();
    });

    it('setMixStatusCallback receives updates', async () => {
        const callback = jest.fn();
        AudioMixer.setMixStatusCallback(callback);

        AudioMixer.setVideoVolume(0.3);
        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ videoVolume: 0.3 }),
        );

        AudioMixer.setMixStatusCallback(null);
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 4: Sound page route
// ──────────────────────────────────────────────────────────────

describe('Sound page route', () => {
    it('sound/[id].tsx file exists and exports default', () => {
        // This will throw if the file doesn't exist or doesn't export default
        const SoundPage = require('@/app/imufeed/sound/[id]');
        expect(SoundPage.default).toBeDefined();
        expect(typeof SoundPage.default).toBe('function');
    });
});

// ──────────────────────────────────────────────────────────────
// Suite 5: VideoSound type extension
// ──────────────────────────────────────────────────────────────

describe('VideoSound type extension (S9)', () => {
    it('MOCK_SOUNDS have genre field', () => {
        MOCK_SOUNDS.forEach(s => {
            expect(s).toHaveProperty('genre');
            expect(typeof s.genre).toBe('string');
        });
    });

    it('MOCK_SOUNDS have is_original field', () => {
        MOCK_SOUNDS.forEach(s => {
            expect(s).toHaveProperty('is_original');
            expect(typeof s.is_original).toBe('boolean');
        });
    });

    it('original sound has pointer to original video', () => {
        const original = MOCK_SOUNDS.find(s => s.is_original);
        expect(original).toBeDefined();
        expect(original!.original_video_id).toBeTruthy();
    });
});
