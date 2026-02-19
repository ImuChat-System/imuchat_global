/**
 * Tests — mobile/services/media-api.ts
 *
 * Teste le service media-api mobile qui connecte les composants
 * React Native aux endpoints media de platform-core.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    confirmUpload,
    deleteMedia,
    getMediaMetadata,
    getThumbnailUrl,
    getUploadUrl,
    MediaApiError,
    uploadFromUri,
    uploadVoiceNote,
} from '../services/media-api';

// === MOCKS ===

// Mock Supabase
const mockGetSession = jest.fn();
const mockGetCurrentUser = jest.fn();

jest.mock('../services/supabase', () => ({
    supabase: {
        auth: {
            getSession: (...args: any[]) => mockGetSession(...args),
        },
    },
    getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
}));

// Mock expo-file-system
const mockGetInfoAsync = jest.fn();
const mockUploadAsync = jest.fn();

jest.mock('expo-file-system/legacy', () => ({
    getInfoAsync: (...args: any[]) => mockGetInfoAsync(...args),
    uploadAsync: (...args: any[]) => mockUploadAsync(...args),
    FileSystemUploadType: {
        BINARY_CONTENT: 0,
    },
}));

// Store original fetch
const originalFetch = global.fetch;

afterAll(() => {
    global.fetch = originalFetch;
});

// === HELPERS ===

function mockAuthSession(token = 'test-access-token') {
    mockGetSession.mockResolvedValue({
        data: {
            session: { access_token: token },
        },
    });
}

function mockUser(id = 'user-123') {
    mockGetCurrentUser.mockResolvedValue({
        id,
        email: 'test@imuchat.dev',
    });
}

function mockFetch(status: number, body: any) {
    global.fetch = jest.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
    });
}

function mockFetchSequence(responses: Array<{ status: number; body: any }>) {
    const fetchMock = jest.fn();
    responses.forEach(({ status, body }) => {
        fetchMock.mockResolvedValueOnce({
            ok: status >= 200 && status < 300,
            status,
            json: () => Promise.resolve(body),
        });
    });
    global.fetch = fetchMock;
    return fetchMock;
}

// === TESTS ===

beforeEach(() => {
    jest.clearAllMocks();
    mockAuthSession();
    mockUser();
    mockGetInfoAsync.mockResolvedValue({ exists: true, size: 5000 });
    mockUploadAsync.mockResolvedValue({ status: 200 });
});

describe('mobile media-api service', () => {
    // ─── Authentication ───────────────────────────────────────────

    describe('authentication', () => {
        it('lance une MediaApiError si non authentifié', async () => {
            mockGetSession.mockResolvedValue({
                data: { session: null },
            });

            await expect(
                getUploadUrl('test.jpg', 'image/jpeg', 1024),
            ).rejects.toThrow(MediaApiError);

            await expect(
                getUploadUrl('test.jpg', 'image/jpeg', 1024),
            ).rejects.toMatchObject({ statusCode: 401 });
        });

        it('envoie le token Bearer dans les headers', async () => {
            mockAuthSession('mobile-token-abc');
            mockFetch(200, { uploadUrl: '', publicUrl: '', mediaId: 'x', token: 't' });

            await getUploadUrl('file.png', 'image/png', 500);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer mobile-token-abc',
                    }),
                }),
            );
        });
    });

    // ─── getUploadUrl ─────────────────────────────────────────────

    describe('getUploadUrl', () => {
        it('appelle POST /api/v1/media/upload-url', async () => {
            const mockResponse = {
                uploadUrl: 'https://storage.example.com/upload',
                publicUrl: 'https://storage.example.com/public/file.jpg',
                mediaId: 'media-mob-1',
                token: 'upload-token',
            };
            mockFetch(200, mockResponse);

            const result = await getUploadUrl('photo.jpg', 'image/jpeg', 2048);

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/v1/media/upload-url',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        fileName: 'photo.jpg',
                        fileType: 'image/jpeg',
                        fileSize: 2048,
                    }),
                }),
            );

            expect(result).toEqual(mockResponse);
        });

        it('gère les erreurs 400', async () => {
            mockFetch(400, { error: 'File type not allowed' });

            await expect(
                getUploadUrl('file.exe', 'application/exe', 100),
            ).rejects.toMatchObject({ statusCode: 400 });
        });
    });

    // ─── confirmUpload ────────────────────────────────────────────

    describe('confirmUpload', () => {
        it('appelle POST /api/v1/media/confirm-upload', async () => {
            mockFetch(200, {
                success: true,
                mediaUrl: 'https://example.com/media.jpg',
                messageId: 'msg-mob-1',
            });

            const result = await confirmUpload('media-mob-1', 'conv-mob-1');

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('msg-mob-1');
        });
    });

    // ─── getMediaMetadata ─────────────────────────────────────────

    describe('getMediaMetadata', () => {
        it('retourne les métadonnées', async () => {
            mockFetch(200, {
                id: 'media-mob-1',
                fileName: 'photo.jpg',
                fileType: 'image/jpeg',
                fileSize: 2048,
                status: 'confirmed',
            });

            const result = await getMediaMetadata('media-mob-1');
            expect(result.id).toBe('media-mob-1');
        });
    });

    // ─── deleteMedia ──────────────────────────────────────────────

    describe('deleteMedia', () => {
        it('appelle DELETE /api/v1/media/:id', async () => {
            mockFetch(200, { success: true, mediaId: 'media-mob-1' });

            await expect(deleteMedia('media-mob-1')).resolves.toBeUndefined();

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/v1/media/media-mob-1',
                expect.objectContaining({ method: 'DELETE' }),
            );
        });
    });

    // ─── getThumbnailUrl ──────────────────────────────────────────

    describe('getThumbnailUrl', () => {
        it('retourne l\'URL du thumbnail', async () => {
            mockFetch(200, { thumbnailUrl: 'https://example.com/thumb.jpg' });

            const result = await getThumbnailUrl('media-mob-1');
            expect(result).toBe('https://example.com/thumb.jpg');
        });

        it('retourne null si 404', async () => {
            mockFetch(404, { error: 'Not found' });

            const result = await getThumbnailUrl('media-mob-1');
            expect(result).toBeNull();
        });
    });

    // ─── uploadFromUri (flux complet) ─────────────────────────────

    describe('uploadFromUri', () => {
        it('exécute le flux complet : getFileInfo → getUploadUrl → upload → confirm', async () => {
            const fetchMock = mockFetchSequence([
                // getUploadUrl
                {
                    status: 200,
                    body: {
                        uploadUrl: 'https://storage.example.com/upload',
                        publicUrl: 'https://storage.example.com/public/photo.jpg',
                        mediaId: 'media-mob-2',
                        token: 'tok-mob',
                    },
                },
                // confirmUpload
                {
                    status: 200,
                    body: {
                        success: true,
                        mediaUrl: 'https://final.com/photo.jpg',
                        messageId: 'msg-mob-2',
                    },
                },
                // getThumbnailUrl
                {
                    status: 200,
                    body: {
                        thumbnailUrl: 'https://thumb.example.com/photo_200.jpg',
                    },
                },
            ]);

            mockGetInfoAsync.mockResolvedValue({ exists: true, size: 4096 });
            mockUploadAsync.mockResolvedValue({ status: 200 });

            const onProgress = jest.fn();
            const result = await uploadFromUri(
                'file:///tmp/photo.jpg',
                'image/jpeg',
                onProgress,
                { conversationId: 'conv-mob-2' },
            );

            expect(result.mediaId).toBe('media-mob-2');
            expect(result.url).toBe('https://final.com/photo.jpg');
            expect(result.thumbnailUrl).toBe('https://thumb.example.com/photo_200.jpg');
            expect(result.size).toBe(4096);
            expect(result.mimeType).toBe('image/jpeg');

            // Vérifie que FileSystem.uploadAsync a été appelé
            expect(mockUploadAsync).toHaveBeenCalledWith(
                'https://storage.example.com/upload',
                'file:///tmp/photo.jpg',
                expect.objectContaining({
                    httpMethod: 'PUT',
                    headers: expect.objectContaining({
                        'Content-Type': 'image/jpeg',
                    }),
                }),
            );

            // Vérifie la progression
            expect(onProgress).toHaveBeenCalled();
        });

        it('gère les fichiers inexistants', async () => {
            mockGetInfoAsync.mockResolvedValue({ exists: false });

            await expect(
                uploadFromUri('file:///nope.jpg', 'image/jpeg'),
            ).rejects.toMatchObject({
                statusCode: 404,
                code: 'FILE_NOT_FOUND',
            });
        });

        it('gère les erreurs d\'upload storage', async () => {
            mockFetch(200, {
                uploadUrl: 'https://storage.example.com/upload',
                publicUrl: 'https://storage.example.com/public/f.jpg',
                mediaId: 'media-err',
                token: 't',
            });

            mockUploadAsync.mockResolvedValue({ status: 500 });

            await expect(
                uploadFromUri('file:///tmp/f.jpg', 'image/jpeg'),
            ).rejects.toMatchObject({
                statusCode: 500,
                code: 'STORAGE_UPLOAD_FAILED',
            });
        });

        it('fonctionne sans conversationId (pas de confirm)', async () => {
            mockFetch(200, {
                uploadUrl: 'https://storage.example.com/upload',
                publicUrl: 'https://storage.example.com/public/doc.pdf',
                mediaId: 'media-noconf',
                token: 't',
            });

            mockUploadAsync.mockResolvedValue({ status: 200 });

            const result = await uploadFromUri(
                'file:///tmp/doc.pdf',
                'application/pdf',
            );

            // Pas de confirmUpload appelé (un seul appel fetch pour getUploadUrl)
            // et pas de getThumbnailUrl car non-image
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(result.url).toBe('https://storage.example.com/public/doc.pdf');
        });
    });

    // ─── uploadVoiceNote ──────────────────────────────────────────

    describe('uploadVoiceNote', () => {
        it('uploade une note vocale via uploadFromUri', async () => {
            mockFetchSequence([
                {
                    status: 200,
                    body: {
                        uploadUrl: 'https://storage.example.com/upload-voice',
                        publicUrl: 'https://storage.example.com/public/voice.m4a',
                        mediaId: 'voice-mob-1',
                        token: 'tok-v',
                    },
                },
                {
                    status: 200,
                    body: {
                        success: true,
                        mediaUrl: 'https://final.com/voice.m4a',
                        messageId: 'msg-v-1',
                    },
                },
            ]);

            mockUploadAsync.mockResolvedValue({ status: 200 });

            const result = await uploadVoiceNote(
                'file:///tmp/recording.m4a',
                'audio/m4a',
                12000,
                'conv-voice-1',
            );

            expect(result.mediaId).toBe('voice-mob-1');
            expect(result.mimeType).toBe('audio/m4a');
        });
    });

    // ─── Erreurs réseau ───────────────────────────────────────────

    describe('erreurs réseau', () => {
        it('gère les erreurs de fetch', async () => {
            global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

            await expect(
                getUploadUrl('f.jpg', 'image/jpeg', 100),
            ).rejects.toThrow('Network request failed');
        });

        it('gère les réponses serveur sans JSON', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 502,
                json: () => Promise.reject(new Error('not json')),
            });

            await expect(
                getUploadUrl('f.jpg', 'image/jpeg', 100),
            ).rejects.toMatchObject({ statusCode: 502 });
        });
    });
});
