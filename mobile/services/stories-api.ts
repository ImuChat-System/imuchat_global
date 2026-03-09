/**
 * Stories API Service
 * 
 * Handles all story-related operations:
 * - CRUD stories
 * - Story views tracking
 * - Story replies
 * - Media upload for stories
 * 
 * DEV-011: Stories Réelles
 */

import { createLogger } from './logger';
import { uploadMediaToSupabase } from './media-upload';
import { getCurrentUser, supabase } from './supabase';

const logger = createLogger('StoriesAPI');

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type StoryType = 'image' | 'video' | 'text';
export type StoryVisibility = 'public' | 'friends' | 'private';
export type StoryFontStyle = 'default' | 'serif' | 'mono' | 'handwritten';
export type StoryReaction = '❤️' | '😂' | '😮' | '😢' | '🔥' | '👏';

export interface Story {
    id: string;
    user_id: string;
    type: StoryType;
    media_url: string | null;
    thumbnail_url: string | null;
    text_content: string | null;
    background_color: string;
    text_color: string;
    font_style: StoryFontStyle;
    visibility: StoryVisibility;
    allow_replies: boolean;
    duration_seconds: number;
    created_at: string;
    expires_at: string;
    is_archived: boolean;
    archived_at: string | null;
}

export interface StoryWithAuthor extends Story {
    username: string;
    display_name: string | null;
    author_avatar: string | null;
    view_count: number;
    is_viewed: boolean;
}

export interface StoryView {
    id: string;
    story_id: string;
    viewer_id: string;
    viewed_at: string;
    reaction: StoryReaction | null;
}

export interface StoryViewWithViewer extends StoryView {
    viewer_username: string;
    viewer_display_name: string | null;
    viewer_avatar: string | null;
}

export interface StoryReply {
    id: string;
    story_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
}

export interface CreateStoryInput {
    type: StoryType;
    media_uri?: string; // Local URI for upload
    text_content?: string;
    background_color?: string;
    text_color?: string;
    font_style?: StoryFontStyle;
    visibility?: StoryVisibility;
    allow_replies?: boolean;
    duration_seconds?: number;
}

export interface StoryUserGroup {
    user: any;
    user_id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    stories: StoryWithAuthor[];
    has_unread: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// STORY TEXT BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════

export const STORY_BACKGROUNDS = [
    { id: 'indigo', color: '#6366f1', textColor: '#ffffff' },
    { id: 'pink', color: '#ec4899', textColor: '#ffffff' },
    { id: 'emerald', color: '#10b981', textColor: '#ffffff' },
    { id: 'amber', color: '#f59e0b', textColor: '#1f2937' },
    { id: 'cyan', color: '#06b6d4', textColor: '#ffffff' },
    { id: 'rose', color: '#f43f5e', textColor: '#ffffff' },
    { id: 'violet', color: '#8b5cf6', textColor: '#ffffff' },
    { id: 'slate', color: '#475569', textColor: '#ffffff' },
    { id: 'gradient-sunset', color: 'linear-gradient(135deg, #f97316, #ec4899)', textColor: '#ffffff' },
    { id: 'gradient-ocean', color: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', textColor: '#ffffff' },
    { id: 'gradient-forest', color: 'linear-gradient(135deg, #10b981, #14b8a6)', textColor: '#ffffff' },
    { id: 'gradient-night', color: 'linear-gradient(135deg, #1e293b, #6366f1)', textColor: '#ffffff' },
];

// ═══════════════════════════════════════════════════════════════════
// FETCH STORIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Get stories feed for the current user
 * Groups stories by user, with unread status
 */
export async function getStoriesFeed(): Promise<StoryUserGroup[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    logger.debug('Fetching stories feed');

    const { data, error } = await supabase
        .rpc('get_stories_feed', { user_uuid: user.id });

    if (error) {
        logger.error('Failed to fetch stories feed', error);
        throw error;
    }

    // Group stories by user
    const groupedMap = new Map<string, StoryUserGroup>();

    for (const story of (data as StoryWithAuthor[]) || []) {
        const existing = groupedMap.get(story.user_id);
        if (existing) {
            existing.stories.push(story);
            if (!story.is_viewed) {
                existing.has_unread = true;
            }
        } else {
            groupedMap.set(story.user_id, {
                user_id: story.user_id,
                username: story.username,
                display_name: story.display_name,
                avatar_url: story.author_avatar,
                stories: [story],
                has_unread: !story.is_viewed,
            });
        }
    }

    // Convert to array, current user first, then by most recent story
    const groups = Array.from(groupedMap.values());
    groups.sort((a, b) => {
        // Current user always first
        if (a.user_id === user.id) return -1;
        if (b.user_id === user.id) return 1;
        // Then by has_unread
        if (a.has_unread && !b.has_unread) return -1;
        if (!a.has_unread && b.has_unread) return 1;
        // Then by most recent story
        const aLatest = new Date(a.stories[0].created_at).getTime();
        const bLatest = new Date(b.stories[0].created_at).getTime();
        return bLatest - aLatest;
    });

    logger.info(`Fetched ${groups.length} story groups`);
    return groups;
}

/**
 * Get my own stories
 */
export async function getMyStories(): Promise<Story[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

    if (error) {
        logger.error('Failed to fetch my stories', error);
        throw error;
    }

    return data || [];
}

/**
 * Get archived stories
 */
export async function getArchivedStories(): Promise<Story[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', true)
        .order('archived_at', { ascending: false })
        .limit(100);

    if (error) {
        logger.error('Failed to fetch archived stories', error);
        throw error;
    }

    return data || [];
}

// ═══════════════════════════════════════════════════════════════════
// CREATE STORY
// ═══════════════════════════════════════════════════════════════════

/**
 * Create a new story
 */
export async function createStory(input: CreateStoryInput): Promise<Story> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    logger.info('Creating story', { type: input.type });

    let media_url: string | null = null;
    let thumbnail_url: string | null = null;

    // Upload media if provided
    if (input.media_uri && (input.type === 'image' || input.type === 'video')) {
        media_url = await uploadStoryMedia(input.media_uri, input.type);
        // TODO: Generate thumbnail for videos
        if (input.type === 'image') {
            thumbnail_url = media_url;
        }
    }

    // Validate text story has content
    if (input.type === 'text' && !input.text_content?.trim()) {
        throw new Error('Text stories require content');
    }

    const storyData = {
        user_id: user.id,
        type: input.type,
        media_url,
        thumbnail_url,
        text_content: input.text_content || null,
        background_color: input.background_color || '#6366f1',
        text_color: input.text_color || '#ffffff',
        font_style: input.font_style || 'default',
        visibility: input.visibility || 'friends',
        allow_replies: input.allow_replies ?? true,
        duration_seconds: input.duration_seconds || 5,
    };

    const { data, error } = await supabase
        .from('stories')
        .insert(storyData)
        .select()
        .single();

    if (error) {
        logger.error('Failed to create story', error);
        throw error;
    }

    logger.info('Story created', { id: data.id });
    return data;
}

/**
 * Upload media for story to Supabase Storage
 * @param uri - Local file URI
 * @param _type - Media type (unused, kept for API compatibility)
 * @returns URL of uploaded media
 */
async function uploadStoryMedia(
    uri: string,
    _type: 'image' | 'video'
): Promise<string> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Use existing upload function with stories bucket
    const url = await uploadMediaToSupabase(uri, 'stories');

    return url;
}

// ═══════════════════════════════════════════════════════════════════
// UPDATE / DELETE STORY
// ═══════════════════════════════════════════════════════════════════

/**
 * Delete a story
 */
export async function deleteStory(storyId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    logger.info('Deleting story', { storyId });

    const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

    if (error) {
        logger.error('Failed to delete story', error);
        throw error;
    }
}

/**
 * Archive a story (save to highlights)
 */
export async function archiveStory(storyId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    logger.info('Archiving story', { storyId });

    const { error } = await supabase
        .from('stories')
        .update({
            is_archived: true,
            archived_at: new Date().toISOString()
        })
        .eq('id', storyId)
        .eq('user_id', user.id);

    if (error) {
        logger.error('Failed to archive story', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════
// STORY VIEWS
// ═══════════════════════════════════════════════════════════════════

/**
 * Mark a story as viewed
 */
export async function markStoryViewed(storyId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('story_views')
        .upsert({
            story_id: storyId,
            viewer_id: user.id,
            viewed_at: new Date().toISOString(),
        }, {
            onConflict: 'story_id,viewer_id',
        });

    if (error) {
        logger.error('Failed to mark story viewed', error);
        // Don't throw - view tracking should not block UI
    }
}

/**
 * Add reaction to a story
 */
export async function reactToStory(
    storyId: string,
    reaction: StoryReaction
): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('story_views')
        .upsert({
            story_id: storyId,
            viewer_id: user.id,
            viewed_at: new Date().toISOString(),
            reaction,
        }, {
            onConflict: 'story_id,viewer_id',
        });

    if (error) {
        logger.error('Failed to react to story', error);
        throw error;
    }
}

/**
 * Get viewers of a story (for story owner)
 */
export async function getStoryViewers(storyId: string): Promise<StoryViewWithViewer[]> {
    const { data, error } = await supabase
        .from('story_views')
        .select(`
      *,
      profiles:viewer_id (
        username,
        full_name,
        avatar_url
      )
    `)
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false });

    if (error) {
        logger.error('Failed to fetch story viewers', error);
        throw error;
    }

    // Transform the data with proper typing
    return (data || []).map((view) => {
        const profiles = view.profiles as { username?: string; full_name?: string; avatar_url?: string } | null;
        return {
            id: view.id as string,
            story_id: view.story_id as string,
            viewer_id: view.viewer_id as string,
            viewed_at: view.viewed_at as string,
            reaction: view.reaction as StoryReaction | null,
            viewer_username: profiles?.username || 'Unknown',
            viewer_display_name: profiles?.full_name || null,
            viewer_avatar: profiles?.avatar_url || null,
        };
    }) as StoryViewWithViewer[];
}

// ═══════════════════════════════════════════════════════════════════
// STORY REPLIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Send a reply to a story
 */
export async function sendStoryReply(
    storyId: string,
    content: string
): Promise<StoryReply> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    if (!content.trim()) {
        throw new Error('Reply cannot be empty');
    }

    logger.info('Sending story reply', { storyId });

    const { data, error } = await supabase
        .from('story_replies')
        .insert({
            story_id: storyId,
            sender_id: user.id,
            content: content.trim(),
        })
        .select()
        .single();

    if (error) {
        logger.error('Failed to send story reply', error);
        throw error;
    }

    return data;
}

/**
 * Get replies to my stories
 */
export async function getStoryReplies(storyId?: string): Promise<StoryReply[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
        .from('story_replies')
        .select(`
      *,
      story:story_id (user_id)
    `)
        .order('created_at', { ascending: false });

    // Either filter by specific story or get all replies to my stories
    if (storyId) {
        query = query.eq('story_id', storyId);
    }

    const { data, error } = await query;

    if (error) {
        logger.error('Failed to fetch story replies', error);
        throw error;
    }

    // Filter to only replies on our stories (RLS should handle this, but double-check)
    return (data || []).filter((reply: Record<string, unknown>) => {
        const story = reply.story as Record<string, unknown>;
        return story?.user_id === user.id || reply.sender_id === user.id;
    });
}

/**
 * Mark reply as read
 */
export async function markReplyRead(replyId: string): Promise<void> {
    const { error } = await supabase
        .from('story_replies')
        .update({ read_at: new Date().toISOString() })
        .eq('id', replyId);

    if (error) {
        logger.error('Failed to mark reply read', error);
    }
}
