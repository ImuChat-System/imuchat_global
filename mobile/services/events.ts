/**
 * Events Service
 *
 * DEV-013: Événements (invites, inscriptions, rappels)
 * - CRUD événements
 * - Gestion des participants
 * - Statuts RSVP (going, interested, declined)
 */

import { createLogger } from "./logger";
import { supabase } from "./supabase";

const logger = createLogger("Events");

// ============================================================================
// TYPES
// ============================================================================

export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type ParticipantStatus = "invited" | "going" | "interested" | "declined";

export interface EventOrganizer {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
}

export interface Event {
    id: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    location: string | null;
    locationUrl: string | null;
    startsAt: string;
    endsAt: string | null;
    maxParticipants: number | null;
    status: EventStatus;
    isPublic: boolean;
    creatorId: string;
    groupId: string | null;
    goingCount: number;
    interestedCount: number;
    myStatus: ParticipantStatus | null;
    createdAt: string;
    organizer: EventOrganizer;
}

export interface EventParticipant {
    id: string;
    userId: string;
    status: ParticipantStatus;
    respondedAt: string;
    user: EventOrganizer;
}

export interface CreateEventParams {
    title: string;
    description?: string;
    coverImageUrl?: string;
    location?: string;
    locationUrl?: string;
    startsAt: string;
    endsAt?: string;
    maxParticipants?: number;
    isPublic?: boolean;
    groupId?: string;
}

export interface EventsPage {
    events: Event[];
    nextCursor: string | null;
    hasMore: boolean;
}

const PAGE_SIZE = 20;

// ============================================================================
// SQL SCHEMA (à exécuter dans Supabase)
// ============================================================================

export const EVENTS_SCHEMA_SQL = `
-- ================================================================
-- 📅 Table: events
-- ================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  location TEXT,
  location_url TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  is_public BOOLEAN DEFAULT true,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  group_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  going_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies events
CREATE POLICY "Anyone can view public events"
  ON public.events FOR SELECT
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their events"
  ON public.events FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their events"
  ON public.events FOR DELETE
  USING (auth.uid() = creator_id);

-- ================================================================
-- 👥 Table: event_participants
-- ================================================================
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'going', 'interested', 'declined')),
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Policies event_participants
CREATE POLICY "Users can view event participants"
  ON public.event_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND (e.is_public = true OR e.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can respond to events"
  ON public.event_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their response"
  ON public.event_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their response"
  ON public.event_participants FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- 📊 Functions: increment/decrement counts
-- ================================================================
CREATE OR REPLACE FUNCTION public.increment_event_going(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events SET going_count = going_count + 1 WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_event_going(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events SET going_count = GREATEST(0, going_count - 1) WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_event_interested(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events SET interested_count = interested_count + 1 WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_event_interested(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events SET interested_count = GREATEST(0, interested_count - 1) WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
`;

// ============================================================================
// EVENTS CRUD
// ============================================================================

/**
 * Fetch upcoming events with pagination
 */
export async function fetchEvents(
    cursor?: string,
    filter?: "all" | "going" | "interested" | "past",
): Promise<EventsPage> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const now = new Date().toISOString();

        let query = supabase
            .from("events")
            .select(
                `
        id,
        title,
        description,
        cover_image_url,
        location,
        location_url,
        starts_at,
        ends_at,
        max_participants,
        status,
        is_public,
        creator_id,
        group_id,
        going_count,
        interested_count,
        created_at,
        organizer:profiles!creator_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .eq("status", "published")
            .limit(PAGE_SIZE + 1);

        // Apply filter
        if (filter === "past") {
            query = query.lt("starts_at", now).order("starts_at", { ascending: false });
        } else {
            query = query.gte("starts_at", now).order("starts_at", { ascending: true });
        }

        // Cursor pagination
        if (cursor) {
            if (filter === "past") {
                query = query.lt("starts_at", cursor);
            } else {
                query = query.gt("starts_at", cursor);
            }
        }

        const { data, error } = await query;

        if (error) {
            logger.error("Failed to fetch events", error);
            return { events: [], nextCursor: null, hasMore: false };
        }

        // Get my participation status
        let myStatuses: Map<string, ParticipantStatus> = new Map();
        if (user && data && data.length > 0) {
            const eventIds = data.map((e: Record<string, unknown>) => e.id as string);
            const { data: participations } = await supabase
                .from("event_participants")
                .select("event_id, status")
                .eq("user_id", user.id)
                .in("event_id", eventIds);

            if (participations) {
                participations.forEach((p: { event_id: string; status: ParticipantStatus }) => {
                    myStatuses.set(p.event_id, p.status);
                });
            }
        }

        // Filter by participation if needed
        let filteredData = data || [];
        if (filter === "going" || filter === "interested") {
            const targetStatus = filter;
            filteredData = filteredData.filter((e: Record<string, unknown>) =>
                myStatuses.get(e.id as string) === targetStatus
            );
        }

        const hasMore = filteredData.length > PAGE_SIZE;
        const eventsData = hasMore ? filteredData.slice(0, PAGE_SIZE) : filteredData;

        const events: Event[] = eventsData.map((row: Record<string, unknown>) => {
            const organizerRaw = row.organizer;
            const organizer = Array.isArray(organizerRaw) ? organizerRaw[0] : organizerRaw;

            return {
                id: row.id as string,
                title: row.title as string,
                description: row.description as string | null,
                coverImageUrl: row.cover_image_url as string | null,
                location: row.location as string | null,
                locationUrl: row.location_url as string | null,
                startsAt: row.starts_at as string,
                endsAt: row.ends_at as string | null,
                maxParticipants: row.max_participants as number | null,
                status: row.status as EventStatus,
                isPublic: row.is_public as boolean,
                creatorId: row.creator_id as string,
                groupId: row.group_id as string | null,
                goingCount: (row.going_count as number) || 0,
                interestedCount: (row.interested_count as number) || 0,
                myStatus: myStatuses.get(row.id as string) || null,
                createdAt: row.created_at as string,
                organizer: {
                    id: organizer?.id || row.creator_id,
                    username: organizer?.username || null,
                    displayName: organizer?.display_name || null,
                    avatarUrl: organizer?.avatar_url || null,
                },
            };
        });

        const nextCursor =
            hasMore && events.length > 0 ? events[events.length - 1].startsAt : null;

        return { events, nextCursor, hasMore };
    } catch (error) {
        logger.error("Fetch events error", error);
        return { events: [], nextCursor: null, hasMore: false };
    }
}

/**
 * Fetch a single event by ID
 */
export async function fetchEvent(eventId: string): Promise<Event | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("events")
            .select(
                `
        id,
        title,
        description,
        cover_image_url,
        location,
        location_url,
        starts_at,
        ends_at,
        max_participants,
        status,
        is_public,
        creator_id,
        group_id,
        going_count,
        interested_count,
        created_at,
        organizer:profiles!creator_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .eq("id", eventId)
            .single();

        if (error || !data) {
            logger.error("Failed to fetch event", error);
            return null;
        }

        // Get my status
        let myStatus: ParticipantStatus | null = null;
        if (user) {
            const { data: participation } = await supabase
                .from("event_participants")
                .select("status")
                .eq("event_id", eventId)
                .eq("user_id", user.id)
                .single();

            if (participation) {
                myStatus = participation.status as ParticipantStatus;
            }
        }

        const organizerRaw = data.organizer;
        const organizer = Array.isArray(organizerRaw) ? organizerRaw[0] : organizerRaw;

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            coverImageUrl: data.cover_image_url,
            location: data.location,
            locationUrl: data.location_url,
            startsAt: data.starts_at,
            endsAt: data.ends_at,
            maxParticipants: data.max_participants,
            status: data.status as EventStatus,
            isPublic: data.is_public,
            creatorId: data.creator_id,
            groupId: data.group_id,
            goingCount: data.going_count || 0,
            interestedCount: data.interested_count || 0,
            myStatus,
            createdAt: data.created_at,
            organizer: {
                id: organizer?.id || data.creator_id,
                username: organizer?.username || null,
                displayName: organizer?.display_name || null,
                avatarUrl: organizer?.avatar_url || null,
            },
        };
    } catch (error) {
        logger.error("Fetch event error", error);
        return null;
    }
}

/**
 * Create a new event
 */
export async function createEvent(params: CreateEventParams): Promise<Event | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            logger.warn("Cannot create event: not authenticated");
            return null;
        }

        const { data, error } = await supabase
            .from("events")
            .insert({
                title: params.title,
                description: params.description || null,
                cover_image_url: params.coverImageUrl || null,
                location: params.location || null,
                location_url: params.locationUrl || null,
                starts_at: params.startsAt,
                ends_at: params.endsAt || null,
                max_participants: params.maxParticipants || null,
                is_public: params.isPublic ?? true,
                group_id: params.groupId || null,
                creator_id: user.id,
                status: "published",
                going_count: 1, // Creator is automatically going
                interested_count: 0,
            })
            .select(
                `
        id,
        title,
        description,
        cover_image_url,
        location,
        location_url,
        starts_at,
        ends_at,
        max_participants,
        status,
        is_public,
        creator_id,
        group_id,
        going_count,
        interested_count,
        created_at,
        organizer:profiles!creator_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .single();

        if (error) {
            logger.error("Failed to create event", error);
            return null;
        }

        // Auto-add creator as "going"
        await supabase.from("event_participants").insert({
            event_id: data.id,
            user_id: user.id,
            status: "going",
        });

        const organizerRaw = data.organizer;
        const organizer = Array.isArray(organizerRaw) ? organizerRaw[0] : organizerRaw;

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            coverImageUrl: data.cover_image_url,
            location: data.location,
            locationUrl: data.location_url,
            startsAt: data.starts_at,
            endsAt: data.ends_at,
            maxParticipants: data.max_participants,
            status: data.status as EventStatus,
            isPublic: data.is_public,
            creatorId: data.creator_id,
            groupId: data.group_id,
            goingCount: data.going_count || 1,
            interestedCount: data.interested_count || 0,
            myStatus: "going",
            createdAt: data.created_at,
            organizer: {
                id: organizer?.id || data.creator_id,
                username: organizer?.username || null,
                displayName: organizer?.display_name || null,
                avatarUrl: organizer?.avatar_url || null,
            },
        };
    } catch (error) {
        logger.error("Create event error", error);
        return null;
    }
}

/**
 * Update an event
 */
export async function updateEvent(
    eventId: string,
    updates: Partial<CreateEventParams>,
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const updateData: Record<string, unknown> = {};
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.coverImageUrl !== undefined) updateData.cover_image_url = updates.coverImageUrl;
        if (updates.location !== undefined) updateData.location = updates.location;
        if (updates.locationUrl !== undefined) updateData.location_url = updates.locationUrl;
        if (updates.startsAt !== undefined) updateData.starts_at = updates.startsAt;
        if (updates.endsAt !== undefined) updateData.ends_at = updates.endsAt;
        if (updates.maxParticipants !== undefined) updateData.max_participants = updates.maxParticipants;
        if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from("events")
            .update(updateData)
            .eq("id", eventId)
            .eq("creator_id", user.id);

        if (error) {
            logger.error("Failed to update event", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Update event error", error);
        return false;
    }
}

/**
 * Cancel an event
 */
export async function cancelEvent(eventId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from("events")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("id", eventId)
            .eq("creator_id", user.id);

        if (error) {
            logger.error("Failed to cancel event", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Cancel event error", error);
        return false;
    }
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", eventId)
            .eq("creator_id", user.id);

        if (error) {
            logger.error("Failed to delete event", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Delete event error", error);
        return false;
    }
}

// ============================================================================
// PARTICIPATION
// ============================================================================

/**
 * Respond to an event (going, interested, declined)
 */
export async function respondToEvent(
    eventId: string,
    status: ParticipantStatus,
): Promise<{ success: boolean; newStatus: ParticipantStatus | null }> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { success: false, newStatus: null };

        // Check current status
        const { data: existing } = await supabase
            .from("event_participants")
            .select("status")
            .eq("event_id", eventId)
            .eq("user_id", user.id)
            .single();

        const oldStatus = existing?.status as ParticipantStatus | null;

        if (oldStatus === status) {
            // Same status, remove participation
            await supabase
                .from("event_participants")
                .delete()
                .eq("event_id", eventId)
                .eq("user_id", user.id);

            // Update counts
            if (oldStatus === "going") {
                await supabase.rpc("decrement_event_going", { p_event_id: eventId });
            } else if (oldStatus === "interested") {
                await supabase.rpc("decrement_event_interested", { p_event_id: eventId });
            }

            return { success: true, newStatus: null };
        }

        // Update or insert
        const { error } = await supabase.from("event_participants").upsert(
            {
                event_id: eventId,
                user_id: user.id,
                status,
                responded_at: new Date().toISOString(),
            },
            { onConflict: "event_id,user_id" },
        );

        if (error) {
            logger.error("Failed to respond to event", error);
            return { success: false, newStatus: oldStatus };
        }

        // Update counts
        if (oldStatus === "going") {
            await supabase.rpc("decrement_event_going", { p_event_id: eventId });
        } else if (oldStatus === "interested") {
            await supabase.rpc("decrement_event_interested", { p_event_id: eventId });
        }

        if (status === "going") {
            await supabase.rpc("increment_event_going", { p_event_id: eventId });
        } else if (status === "interested") {
            await supabase.rpc("increment_event_interested", { p_event_id: eventId });
        }

        return { success: true, newStatus: status };
    } catch (error) {
        logger.error("Respond to event error", error);
        return { success: false, newStatus: null };
    }
}

/**
 * Fetch event participants
 */
export async function fetchEventParticipants(
    eventId: string,
    status?: ParticipantStatus,
): Promise<EventParticipant[]> {
    try {
        let query = supabase
            .from("event_participants")
            .select(
                `
        id,
        user_id,
        status,
        responded_at,
        user:profiles!user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .eq("event_id", eventId)
            .order("responded_at", { ascending: false });

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (error) {
            logger.error("Failed to fetch participants", error);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => {
            const userRaw = row.user;
            const userData = Array.isArray(userRaw) ? userRaw[0] : userRaw;

            return {
                id: row.id as string,
                userId: row.user_id as string,
                status: row.status as ParticipantStatus,
                respondedAt: row.responded_at as string,
                user: {
                    id: userData?.id || row.user_id,
                    username: userData?.username || null,
                    displayName: userData?.display_name || null,
                    avatarUrl: userData?.avatar_url || null,
                },
            };
        });
    } catch (error) {
        logger.error("Fetch participants error", error);
        return [];
    }
}
