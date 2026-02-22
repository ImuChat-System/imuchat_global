/**
 * Social Feed Service
 *
 * DEV-012: Feed social réel avec Supabase
 * - Posts (text + media)
 * - Likes
 * - Comments
 * - Infinite scroll pagination
 */

import { createLogger } from "./logger";
import { supabase } from "./supabase";

const logger = createLogger("SocialFeed");

// ============================================================================
// TYPES
// ============================================================================

export interface Author {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
}

export interface Post {
    id: string;
    authorId: string;
    content: string;
    mediaUrls: string[];
    type: "post" | "news" | "announcement";
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked: boolean;
    createdAt: string;
    updatedAt: string;
    author: Author;
}

export interface PostComment {
    id: string;
    postId: string;
    authorId: string;
    content: string;
    likesCount: number;
    isLiked: boolean;
    createdAt: string;
    author: Author;
}

export interface CreatePostParams {
    content: string;
    mediaUrls?: string[];
    type?: Post["type"];
}

export interface FeedPage {
    posts: Post[];
    nextCursor: string | null;
    hasMore: boolean;
}

const PAGE_SIZE = 20;

// ============================================================================
// POSTS CRUD
// ============================================================================

/**
 * Fetch feed with pagination (infinite scroll)
 */
export async function fetchFeed(
    cursor?: string,
    filter?: "all" | "following" | "news",
): Promise<FeedPage> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        let query = supabase
            .from("posts")
            .select(
                `
        id,
        author_id,
        content,
        media_urls,
        type,
        likes_count,
        comments_count,
        shares_count,
        created_at,
        updated_at,
        author:profiles!author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .order("created_at", { ascending: false })
            .limit(PAGE_SIZE + 1); // +1 to check if there's more

        // Apply cursor pagination
        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        // Apply filter
        if (filter === "news") {
            query = query.in("type", ["news", "announcement"]);
        } else if (filter === "following" && user) {
            // Get followed user IDs
            const { data: following } = await supabase
                .from("friendships")
                .select("friend_id")
                .eq("user_id", user.id)
                .eq("status", "accepted");

            const followingIds = (following || []).map(
                (f: { friend_id: string }) => f.friend_id,
            );
            if (followingIds.length > 0) {
                query = query.in("author_id", followingIds);
            } else {
                // No one followed, return empty
                return { posts: [], nextCursor: null, hasMore: false };
            }
        }

        const { data, error } = await query;

        if (error) {
            logger.error("Failed to fetch feed", error);
            return { posts: [], nextCursor: null, hasMore: false };
        }

        // Get likes status for current user
        let likedPostIds: Set<string> = new Set();
        if (user && data && data.length > 0) {
            const postIds = data.map((p: Record<string, unknown>) => p.id as string);
            const { data: likes } = await supabase
                .from("post_likes")
                .select("post_id")
                .eq("user_id", user.id)
                .in("post_id", postIds);

            likedPostIds = new Set(
                (likes || []).map((l: { post_id: string }) => l.post_id),
            );
        }

        const hasMore = data && data.length > PAGE_SIZE;
        const postsData = hasMore ? data.slice(0, PAGE_SIZE) : data || [];

        const posts: Post[] = postsData.map((row: Record<string, unknown>) => {
            const authorData = row.author as Record<string, unknown> | null;
            return {
                id: row.id as string,
                authorId: row.author_id as string,
                content: row.content as string,
                mediaUrls: (row.media_urls as string[]) || [],
                type: (row.type as Post["type"]) || "post",
                likesCount: (row.likes_count as number) || 0,
                commentsCount: (row.comments_count as number) || 0,
                sharesCount: (row.shares_count as number) || 0,
                isLiked: likedPostIds.has(row.id as string),
                createdAt: row.created_at as string,
                updatedAt: row.updated_at as string,
                author: {
                    id: (authorData?.id as string) || (row.author_id as string),
                    username: (authorData?.username as string) || null,
                    displayName: (authorData?.display_name as string) || null,
                    avatarUrl: (authorData?.avatar_url as string) || null,
                },
            };
        });

        const nextCursor =
            hasMore && posts.length > 0 ? posts[posts.length - 1].createdAt : null;

        return { posts, nextCursor, hasMore };
    } catch (error) {
        logger.error("Fetch feed error", error);
        return { posts: [], nextCursor: null, hasMore: false };
    }
}

/**
 * Create a new post
 */
export async function createPost(params: CreatePostParams): Promise<Post | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            logger.warn("Cannot create post: not authenticated");
            return null;
        }

        const { data, error } = await supabase
            .from("posts")
            .insert({
                author_id: user.id,
                content: params.content,
                media_urls: params.mediaUrls || [],
                type: params.type || "post",
                likes_count: 0,
                comments_count: 0,
                shares_count: 0,
            })
            .select(
                `
        id,
        author_id,
        content,
        media_urls,
        type,
        likes_count,
        comments_count,
        shares_count,
        created_at,
        updated_at,
        author:profiles!author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .single();

        if (error) {
            logger.error("Failed to create post", error);
            return null;
        }

        // Author can be an array with single element from Supabase join
        const authorRaw = data.author;
        const authorData = Array.isArray(authorRaw) ? authorRaw[0] : authorRaw;

        return {
            id: data.id,
            authorId: data.author_id,
            content: data.content,
            mediaUrls: data.media_urls || [],
            type: data.type || "post",
            likesCount: data.likes_count || 0,
            commentsCount: data.comments_count || 0,
            sharesCount: data.shares_count || 0,
            isLiked: false,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            author: {
                id: (authorData?.id as string) || data.author_id,
                username: (authorData?.username as string) || null,
                displayName: (authorData?.display_name as string) || null,
                avatarUrl: (authorData?.avatar_url as string) || null,
            },
        };
    } catch (error) {
        logger.error("Create post error", error);
        return null;
    }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", postId)
            .eq("author_id", user.id);

        if (error) {
            logger.error("Failed to delete post", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Delete post error", error);
        return false;
    }
}

// ============================================================================
// LIKES
// ============================================================================

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Insert like
        const { error: likeError } = await supabase.from("post_likes").insert({
            post_id: postId,
            user_id: user.id,
        });

        if (likeError) {
            // Already liked (unique constraint)
            if (likeError.code === "23505") {
                return true;
            }
            logger.error("Failed to like post", likeError);
            return false;
        }

        // Increment count
        await supabase.rpc("increment_post_likes", { post_id: postId });

        return true;
    } catch (error) {
        logger.error("Like post error", error);
        return false;
    }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);

        if (error) {
            logger.error("Failed to unlike post", error);
            return false;
        }

        // Decrement count
        await supabase.rpc("decrement_post_likes", { post_id: postId });

        return true;
    } catch (error) {
        logger.error("Unlike post error", error);
        return false;
    }
}

/**
 * Toggle like on a post
 */
export async function toggleLike(
    postId: string,
    currentlyLiked: boolean,
): Promise<boolean> {
    if (currentlyLiked) {
        return unlikePost(postId);
    } else {
        return likePost(postId);
    }
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Fetch comments for a post
 */
export async function fetchComments(
    postId: string,
    cursor?: string,
): Promise<{ comments: PostComment[]; nextCursor: string | null; hasMore: boolean }> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        let query = supabase
            .from("post_comments")
            .select(
                `
        id,
        post_id,
        author_id,
        content,
        likes_count,
        created_at,
        author:profiles!author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .eq("post_id", postId)
            .order("created_at", { ascending: true })
            .limit(PAGE_SIZE + 1);

        if (cursor) {
            query = query.gt("created_at", cursor);
        }

        const { data, error } = await query;

        if (error) {
            logger.error("Failed to fetch comments", error);
            return { comments: [], nextCursor: null, hasMore: false };
        }

        // Get likes status
        let likedCommentIds: Set<string> = new Set();
        if (user && data && data.length > 0) {
            const commentIds = data.map((c: Record<string, unknown>) => c.id as string);
            const { data: likes } = await supabase
                .from("comment_likes")
                .select("comment_id")
                .eq("user_id", user.id)
                .in("comment_id", commentIds);

            likedCommentIds = new Set(
                (likes || []).map((l: { comment_id: string }) => l.comment_id),
            );
        }

        const hasMore = data && data.length > PAGE_SIZE;
        const commentsData = hasMore ? data.slice(0, PAGE_SIZE) : data || [];

        const comments: PostComment[] = commentsData.map(
            (row: Record<string, unknown>) => {
                const authorData = row.author as Record<string, unknown> | null;
                return {
                    id: row.id as string,
                    postId: row.post_id as string,
                    authorId: row.author_id as string,
                    content: row.content as string,
                    likesCount: (row.likes_count as number) || 0,
                    isLiked: likedCommentIds.has(row.id as string),
                    createdAt: row.created_at as string,
                    author: {
                        id: (authorData?.id as string) || (row.author_id as string),
                        username: (authorData?.username as string) || null,
                        displayName: (authorData?.display_name as string) || null,
                        avatarUrl: (authorData?.avatar_url as string) || null,
                    },
                };
            },
        );

        const nextCursor =
            hasMore && comments.length > 0
                ? comments[comments.length - 1].createdAt
                : null;

        return { comments, nextCursor, hasMore };
    } catch (error) {
        logger.error("Fetch comments error", error);
        return { comments: [], nextCursor: null, hasMore: false };
    }
}

/**
 * Add a comment to a post
 */
export async function addComment(
    postId: string,
    content: string,
): Promise<PostComment | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from("post_comments")
            .insert({
                post_id: postId,
                author_id: user.id,
                content,
                likes_count: 0,
            })
            .select(
                `
        id,
        post_id,
        author_id,
        content,
        likes_count,
        created_at,
        author:profiles!author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .single();

        if (error) {
            logger.error("Failed to add comment", error);
            return null;
        }

        // Increment comments count
        await supabase.rpc("increment_post_comments", { post_id: postId });

        // Author can be an array with single element from Supabase join
        const authorRaw = data.author;
        const authorData = Array.isArray(authorRaw) ? authorRaw[0] : authorRaw;

        return {
            id: data.id,
            postId: data.post_id,
            authorId: data.author_id,
            content: data.content,
            likesCount: data.likes_count || 0,
            isLiked: false,
            createdAt: data.created_at,
            author: {
                id: authorData?.id || data.author_id,
                username: authorData?.username || null,
                displayName: authorData?.display_name || null,
                avatarUrl: authorData?.avatar_url || null,
            },
        };
    } catch (error) {
        logger.error("Add comment error", error);
        return null;
    }
}

/**
 * Delete a comment
 */
export async function deleteComment(
    commentId: string,
    postId: string,
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from("post_comments")
            .delete()
            .eq("id", commentId)
            .eq("author_id", user.id);

        if (error) {
            logger.error("Failed to delete comment", error);
            return false;
        }

        // Decrement comments count
        await supabase.rpc("decrement_post_comments", { post_id: postId });

        return true;
    } catch (error) {
        logger.error("Delete comment error", error);
        return false;
    }
}

// ============================================================================
// SHARE
// ============================================================================

/**
 * Share a post (increment share count)
 */
export async function sharePost(postId: string): Promise<boolean> {
    try {
        const { error } = await supabase.rpc("increment_post_shares", {
            post_id: postId,
        });

        if (error) {
            logger.error("Failed to share post", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Share post error", error);
        return false;
    }
}

// ============================================================================
// SUPABASE SCHEMA (for reference - run in Supabase SQL editor)
// ============================================================================

export const FEED_SCHEMA_SQL = `
-- ================================================================
-- 📰 Social Feed Tables
-- ================================================================

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  type TEXT DEFAULT 'post' CHECK (type IN ('post', 'news', 'announcement')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Post likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Post comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments(post_id);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Comment likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS Policies
-- ================================================================

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- Post likes policies
CREATE POLICY "Post likes are viewable by everyone" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can comment" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Comment likes policies
CREATE POLICY "Comment likes are viewable by everyone" ON public.comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like comments" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- Helper Functions (RPC)
-- ================================================================

CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
  UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = post_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS void AS $$
  UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_post_shares(post_id UUID)
RETURNS void AS $$
  UPDATE posts SET shares_count = shares_count + 1 WHERE id = post_id;
$$ LANGUAGE SQL SECURITY DEFINER;
`;
