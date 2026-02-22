/**
 * Advanced Groups Service
 *
 * DEV-014: Groupes avancés
 * - Rôles (owner, admin, moderator, member)
 * - Permissions (kick, ban, mute)
 * - Liens d'invitation
 * - Description, règles
 */

import { createLogger } from "./logger";
import { supabase } from "./supabase";

const logger = createLogger("Groups");

// ============================================================================
// TYPES
// ============================================================================

export type GroupRole = "owner" | "admin" | "moderator" | "member";
export type MemberAction = "kick" | "ban" | "mute" | "unmute" | "promote" | "demote";

export interface GroupMember {
    id: string;
    conversationId: string;
    userId: string;
    role: GroupRole;
    isBanned: boolean;
    isMuted: boolean;
    mutedUntil: string | null;
    joinedAt: string;
    user: {
        id: string;
        username: string | null;
        displayName: string | null;
        avatarUrl: string | null;
    };
}

export interface GroupSettings {
    id: string;
    name: string;
    description: string | null;
    rules: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    inviteCode: string | null;
    inviteExpiry: string | null;
    isPublic: boolean;
    maxMembers: number | null;
    memberCount: number;
    createdAt: string;
}

export interface GroupInvite {
    code: string;
    conversationId: string;
    groupName: string;
    memberCount: number;
    avatarUrl: string | null;
}

// ============================================================================
// SQL SCHEMA (extension pour groupes avancés)
// ============================================================================

export const GROUPS_SCHEMA_SQL = `
-- ================================================================
-- 🔄 Alter: conversations (add advanced group fields)
-- ================================================================
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS rules TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invite_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_members INTEGER;

-- ================================================================
-- 🔄 Alter: conversation_members (add moderation fields)
-- ================================================================
ALTER TABLE public.conversation_members
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS muted_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update role constraint to include moderator
ALTER TABLE public.conversation_members
DROP CONSTRAINT IF EXISTS conversation_members_role_check;

ALTER TABLE public.conversation_members
ADD CONSTRAINT conversation_members_role_check
CHECK (role IN ('owner', 'admin', 'moderator', 'member'));

-- Index for invite codes
CREATE INDEX IF NOT EXISTS idx_conversations_invite_code ON public.conversations(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversation_members_banned ON public.conversation_members(is_banned) WHERE is_banned = true;

-- ================================================================
-- 📊 Function: generate random invite code
-- ================================================================
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 📊 Function: check member permissions
-- ================================================================
CREATE OR REPLACE FUNCTION public.can_manage_member(
  p_conversation_id UUID,
  p_actor_id UUID,
  p_target_id UUID,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_actor_role TEXT;
  v_target_role TEXT;
  v_role_priority INTEGER;
BEGIN
  -- Get roles
  SELECT role INTO v_actor_role
  FROM public.conversation_members
  WHERE conversation_id = p_conversation_id AND user_id = p_actor_id AND is_banned = false;
  
  SELECT role INTO v_target_role
  FROM public.conversation_members
  WHERE conversation_id = p_conversation_id AND user_id = p_target_id;
  
  IF v_actor_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Owner can do everything
  IF v_actor_role = 'owner' THEN
    RETURN true;
  END IF;
  
  -- Admin permissions
  IF v_actor_role = 'admin' THEN
    IF v_target_role IN ('owner', 'admin') THEN
      RETURN false; -- Can't manage owner or other admins
    END IF;
    RETURN p_action IN ('kick', 'ban', 'mute', 'unmute');
  END IF;
  
  -- Moderator permissions
  IF v_actor_role = 'moderator' THEN
    IF v_target_role IN ('owner', 'admin', 'moderator') THEN
      RETURN false;
    END IF;
    RETURN p_action IN ('kick', 'mute', 'unmute');
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

const ROLE_PRIORITY: Record<GroupRole, number> = {
    owner: 4,
    admin: 3,
    moderator: 2,
    member: 1,
};

function canManageRole(actorRole: GroupRole, targetRole: GroupRole): boolean {
    return ROLE_PRIORITY[actorRole] > ROLE_PRIORITY[targetRole];
}

// ============================================================================
// GROUP SETTINGS
// ============================================================================

/**
 * Fetch group settings
 */
export async function fetchGroupSettings(conversationId: string): Promise<GroupSettings | null> {
    try {
        const { data, error } = await supabase
            .from("conversations")
            .select(
                `
        id,
        name,
        description,
        rules,
        avatar_url,
        banner_url,
        invite_code,
        invite_expiry,
        is_public,
        max_members,
        created_at,
        conversation_members (count)
      `,
            )
            .eq("id", conversationId)
            .eq("type", "group")
            .single();

        if (error || !data) {
            logger.error("Failed to fetch group settings", error);
            return null;
        }

        const memberCount =
            Array.isArray(data.conversation_members) && data.conversation_members[0]?.count
                ? data.conversation_members[0].count
                : 0;

        return {
            id: data.id,
            name: data.name || "Groupe",
            description: data.description || null,
            rules: data.rules || null,
            avatarUrl: data.avatar_url || null,
            bannerUrl: data.banner_url || null,
            inviteCode: data.invite_code || null,
            inviteExpiry: data.invite_expiry || null,
            isPublic: data.is_public || false,
            maxMembers: data.max_members || null,
            memberCount,
            createdAt: data.created_at,
        };
    } catch (error) {
        logger.error("Fetch group settings error", error);
        return null;
    }
}

/**
 * Update group settings
 */
export async function updateGroupSettings(
    conversationId: string,
    updates: Partial<{
        name: string;
        description: string;
        rules: string;
        avatarUrl: string;
        bannerUrl: string;
        isPublic: boolean;
        maxMembers: number;
    }>,
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Check permission (owner or admin)
        const { data: membership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
            logger.warn("No permission to update group settings");
            return false;
        }

        const updateData: Record<string, unknown> = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.rules !== undefined) updateData.rules = updates.rules;
        if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
        if (updates.bannerUrl !== undefined) updateData.banner_url = updates.bannerUrl;
        if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
        if (updates.maxMembers !== undefined) updateData.max_members = updates.maxMembers;
        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from("conversations")
            .update(updateData)
            .eq("id", conversationId);

        if (error) {
            logger.error("Failed to update group settings", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Update group settings error", error);
        return false;
    }
}

// ============================================================================
// MEMBERS MANAGEMENT
// ============================================================================

/**
 * Fetch group members
 */
export async function fetchGroupMembers(conversationId: string): Promise<GroupMember[]> {
    try {
        const { data, error } = await supabase
            .from("conversation_members")
            .select(
                `
        id,
        conversation_id,
        user_id,
        role,
        is_banned,
        is_muted,
        muted_until,
        joined_at,
        user:profiles!user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
            )
            .eq("conversation_id", conversationId)
            .eq("is_banned", false)
            .order("role", { ascending: true })
            .order("joined_at", { ascending: true });

        if (error) {
            logger.error("Failed to fetch group members", error);
            return [];
        }

        return (data || []).map((row: Record<string, unknown>) => {
            const userRaw = row.user;
            const userData = Array.isArray(userRaw) ? userRaw[0] : userRaw;

            return {
                id: row.id as string,
                conversationId: row.conversation_id as string,
                userId: row.user_id as string,
                role: row.role as GroupRole,
                isBanned: (row.is_banned as boolean) || false,
                isMuted: (row.is_muted as boolean) || false,
                mutedUntil: row.muted_until as string | null,
                joinedAt: row.joined_at as string,
                user: {
                    id: userData?.id || row.user_id,
                    username: userData?.username || null,
                    displayName: userData?.display_name || null,
                    avatarUrl: userData?.avatar_url || null,
                },
            };
        });
    } catch (error) {
        logger.error("Fetch group members error", error);
        return [];
    }
}

/**
 * Get current user's role in a group
 */
export async function getMyRole(conversationId: string): Promise<GroupRole | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        const { data } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .eq("is_banned", false)
            .single();

        return (data?.role as GroupRole) || null;
    } catch (error) {
        logger.error("Get my role error", error);
        return null;
    }
}

/**
 * Update member role
 */
export async function updateMemberRole(
    conversationId: string,
    targetUserId: string,
    newRole: GroupRole,
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Get actor role
        const { data: actorMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        const actorRole = actorMembership?.role as GroupRole;
        if (!actorRole || !["owner", "admin"].includes(actorRole)) {
            logger.warn("No permission to update member role");
            return false;
        }

        // Get target role
        const { data: targetMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId)
            .single();

        const targetRole = targetMembership?.role as GroupRole;
        if (!targetRole) return false;

        // Check can manage
        if (!canManageRole(actorRole, targetRole)) {
            logger.warn("Cannot manage member with higher or equal role");
            return false;
        }

        // Cannot promote to owner (transfer ownership is separate)
        if (newRole === "owner") {
            logger.warn("Cannot promote to owner directly");
            return false;
        }

        // Cannot set role higher than own
        if (ROLE_PRIORITY[newRole] >= ROLE_PRIORITY[actorRole]) {
            logger.warn("Cannot set role higher than own");
            return false;
        }

        const { error } = await supabase
            .from("conversation_members")
            .update({ role: newRole })
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId);

        if (error) {
            logger.error("Failed to update member role", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Update member role error", error);
        return false;
    }
}

/**
 * Transfer group ownership
 */
export async function transferOwnership(
    conversationId: string,
    newOwnerId: string,
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Verify current user is owner
        const { data: actorMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (actorMembership?.role !== "owner") {
            logger.warn("Only owner can transfer ownership");
            return false;
        }

        // Verify new owner is a member
        const { data: newOwnerMembership } = await supabase
            .from("conversation_members")
            .select("id")
            .eq("conversation_id", conversationId)
            .eq("user_id", newOwnerId)
            .eq("is_banned", false)
            .single();

        if (!newOwnerMembership) {
            logger.warn("Target user is not a member");
            return false;
        }

        // Update roles atomically using transaction-like behavior
        // First demote current owner to admin
        await supabase
            .from("conversation_members")
            .update({ role: "admin" })
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id);

        // Then promote new owner
        const { error } = await supabase
            .from("conversation_members")
            .update({ role: "owner" })
            .eq("conversation_id", conversationId)
            .eq("user_id", newOwnerId);

        if (error) {
            // Rollback
            await supabase
                .from("conversation_members")
                .update({ role: "owner" })
                .eq("conversation_id", conversationId)
                .eq("user_id", user.id);
            logger.error("Failed to transfer ownership", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Transfer ownership error", error);
        return false;
    }
}

/**
 * Kick a member from the group
 */
export async function kickMember(conversationId: string, targetUserId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Get roles
        const { data: actorMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        const { data: targetMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId)
            .single();

        const actorRole = actorMembership?.role as GroupRole;
        const targetRole = targetMembership?.role as GroupRole;

        if (!actorRole || !targetRole) return false;
        if (!canManageRole(actorRole, targetRole)) {
            logger.warn("Cannot kick member with higher or equal role");
            return false;
        }

        const { error } = await supabase
            .from("conversation_members")
            .delete()
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId);

        if (error) {
            logger.error("Failed to kick member", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Kick member error", error);
        return false;
    }
}

/**
 * Ban a member from the group
 */
export async function banMember(conversationId: string, targetUserId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Get roles
        const { data: actorMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        const { data: targetMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId)
            .single();

        const actorRole = actorMembership?.role as GroupRole;
        const targetRole = targetMembership?.role as GroupRole;

        if (!actorRole || !targetRole) return false;
        if (!["owner", "admin"].includes(actorRole)) {
            logger.warn("Only owner/admin can ban members");
            return false;
        }
        if (!canManageRole(actorRole, targetRole)) return false;

        const { error } = await supabase
            .from("conversation_members")
            .update({
                is_banned: true,
                banned_at: new Date().toISOString(),
                banned_by: user.id,
            })
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId);

        if (error) {
            logger.error("Failed to ban member", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Ban member error", error);
        return false;
    }
}

/**
 * Unban a member
 */
export async function unbanMember(conversationId: string, targetUserId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Check permission
        const { data: actorMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!["owner", "admin"].includes(actorMembership?.role as string)) {
            return false;
        }

        const { error } = await supabase
            .from("conversation_members")
            .update({
                is_banned: false,
                banned_at: null,
                banned_by: null,
            })
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId);

        if (error) {
            logger.error("Failed to unban member", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Unban member error", error);
        return false;
    }
}

/**
 * Mute a member
 */
export async function muteMember(
    conversationId: string,
    targetUserId: string,
    durationMinutes?: number,
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Get roles
        const { data: actorMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        const { data: targetMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId)
            .single();

        const actorRole = actorMembership?.role as GroupRole;
        const targetRole = targetMembership?.role as GroupRole;

        if (!actorRole || !targetRole) return false;
        if (!["owner", "admin", "moderator"].includes(actorRole)) return false;
        if (!canManageRole(actorRole, targetRole)) return false;

        const mutedUntil = durationMinutes
            ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
            : null;

        const { error } = await supabase
            .from("conversation_members")
            .update({
                is_muted: true,
                muted_until: mutedUntil,
            })
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId);

        if (error) {
            logger.error("Failed to mute member", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Mute member error", error);
        return false;
    }
}

/**
 * Unmute a member
 */
export async function unmuteMember(
    conversationId: string,
    targetUserId: string,
): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Check permission
        const { data: actorMembership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!["owner", "admin", "moderator"].includes(actorMembership?.role as string)) {
            return false;
        }

        const { error } = await supabase
            .from("conversation_members")
            .update({
                is_muted: false,
                muted_until: null,
            })
            .eq("conversation_id", conversationId)
            .eq("user_id", targetUserId);

        if (error) {
            logger.error("Failed to unmute member", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Unmute member error", error);
        return false;
    }
}

// ============================================================================
// INVITE LINKS
// ============================================================================

/**
 * Generate or refresh invite link for a group
 */
export async function generateInviteLink(
    conversationId: string,
    expiryDays: number = 7,
): Promise<string | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        // Check permission
        const { data: membership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!["owner", "admin"].includes(membership?.role as string)) {
            logger.warn("No permission to generate invite link");
            return null;
        }

        // Generate code
        const { data: codeData } = await supabase.rpc("generate_invite_code");
        const inviteCode = codeData || generateLocalCode();

        const expiry = new Date();
        expiry.setDate(expiry.getDate() + expiryDays);

        const { error } = await supabase
            .from("conversations")
            .update({
                invite_code: inviteCode,
                invite_expiry: expiry.toISOString(),
            })
            .eq("id", conversationId);

        if (error) {
            logger.error("Failed to generate invite link", error);
            return null;
        }

        return inviteCode;
    } catch (error) {
        logger.error("Generate invite link error", error);
        return null;
    }
}

/**
 * Revoke invite link
 */
export async function revokeInviteLink(conversationId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Check permission
        const { data: membership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!["owner", "admin"].includes(membership?.role as string)) {
            return false;
        }

        const { error } = await supabase
            .from("conversations")
            .update({
                invite_code: null,
                invite_expiry: null,
            })
            .eq("id", conversationId);

        if (error) {
            logger.error("Failed to revoke invite link", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Revoke invite link error", error);
        return false;
    }
}

/**
 * Get invite info by code
 */
export async function getInviteInfo(inviteCode: string): Promise<GroupInvite | null> {
    try {
        const { data, error } = await supabase
            .from("conversations")
            .select(
                `
        id,
        name,
        avatar_url,
        invite_code,
        invite_expiry,
        conversation_members (count)
      `,
            )
            .eq("invite_code", inviteCode.toUpperCase())
            .eq("type", "group")
            .single();

        if (error || !data) {
            logger.error("Invite not found", error);
            return null;
        }

        // Check expiry
        if (data.invite_expiry && new Date(data.invite_expiry) < new Date()) {
            logger.warn("Invite link expired");
            return null;
        }

        const memberCount =
            Array.isArray(data.conversation_members) && data.conversation_members[0]?.count
                ? data.conversation_members[0].count
                : 0;

        return {
            code: data.invite_code!,
            conversationId: data.id,
            groupName: data.name || "Groupe",
            memberCount,
            avatarUrl: data.avatar_url,
        };
    } catch (error) {
        logger.error("Get invite info error", error);
        return null;
    }
}

/**
 * Join a group via invite code
 */
export async function joinByInviteCode(inviteCode: string): Promise<string | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;

        // Get group info and validate invite
        const inviteInfo = await getInviteInfo(inviteCode);
        if (!inviteInfo) {
            return null;
        }

        // Check if already a member
        const { data: existingMembership } = await supabase
            .from("conversation_members")
            .select("id, is_banned")
            .eq("conversation_id", inviteInfo.conversationId)
            .eq("user_id", user.id)
            .single();

        if (existingMembership) {
            if (existingMembership.is_banned) {
                logger.warn("User is banned from this group");
                return null;
            }
            // Already a member
            return inviteInfo.conversationId;
        }

        // Check max members
        const { data: groupData } = await supabase
            .from("conversations")
            .select("max_members")
            .eq("id", inviteInfo.conversationId)
            .single();

        if (groupData?.max_members && inviteInfo.memberCount >= groupData.max_members) {
            logger.warn("Group is full");
            return null;
        }

        // Join the group
        const { error } = await supabase.from("conversation_members").insert({
            conversation_id: inviteInfo.conversationId,
            user_id: user.id,
            role: "member",
        });

        if (error) {
            logger.error("Failed to join group", error);
            return null;
        }

        return inviteInfo.conversationId;
    } catch (error) {
        logger.error("Join by invite code error", error);
        return null;
    }
}

/**
 * Leave a group
 */
export async function leaveGroup(conversationId: string): Promise<boolean> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;

        // Check if owner - must transfer first
        const { data: membership } = await supabase
            .from("conversation_members")
            .select("role")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (membership?.role === "owner") {
            // Count other members
            const { count } = await supabase
                .from("conversation_members")
                .select("*", { count: "exact", head: true })
                .eq("conversation_id", conversationId)
                .neq("user_id", user.id)
                .eq("is_banned", false);

            if (count && count > 0) {
                logger.warn("Owner must transfer ownership before leaving");
                return false;
            }
            // Owner is last member, delete the group
            await supabase.from("conversations").delete().eq("id", conversationId);
            return true;
        }

        const { error } = await supabase
            .from("conversation_members")
            .delete()
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id);

        if (error) {
            logger.error("Failed to leave group", error);
            return false;
        }

        return true;
    } catch (error) {
        logger.error("Leave group error", error);
        return false;
    }
}

// ============================================================================
// HELPERS
// ============================================================================

function generateLocalCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
