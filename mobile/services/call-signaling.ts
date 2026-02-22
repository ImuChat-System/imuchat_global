import { getCurrentUser, supabase } from "./supabase";

export type CallType = "audio" | "video";
export type CallStatus = "ringing" | "accepted" | "rejected" | "ended" | "missed";

export interface CallEvent {
    id: string;
    caller_id: string;
    callee_id: string;
    call_type: CallType;
    status: CallStatus;
    stream_call_id: string | null;
    created_at: string;
    answered_at: string | null;
    ended_at: string | null;
    caller?: {
        id: string;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
    };
    callee?: {
        id: string;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
    };
}

/**
 * Initiate a call to another user
 */
export async function initiateCall(
    calleeId: string,
    callType: CallType,
    streamCallId: string
): Promise<CallEvent> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const { data, error } = await supabase
        .from("call_events")
        .insert({
            caller_id: user.id,
            callee_id: calleeId,
            call_type: callType,
            stream_call_id: streamCallId,
            status: "ringing",
        })
        .select(
            `
      *,
      caller:profiles!caller_id(id, username, display_name, avatar_url),
      callee:profiles!callee_id(id, username, display_name, avatar_url)
    `
        )
        .single();

    if (error) throw error;
    return data;
}

/**
 * Accept an incoming call
 */
export async function acceptCall(callId: string): Promise<void> {
    const { error } = await supabase
        .from("call_events")
        .update({ status: "accepted" })
        .eq("id", callId);

    if (error) throw error;
}

/**
 * Reject an incoming call
 */
export async function rejectCall(callId: string): Promise<void> {
    const { error } = await supabase
        .from("call_events")
        .update({ status: "rejected" })
        .eq("id", callId);

    if (error) throw error;
}

/**
 * End an active call
 */
export async function endCall(callId: string): Promise<void> {
    const { error } = await supabase
        .from("call_events")
        .update({ status: "ended" })
        .eq("id", callId);

    if (error) throw error;
}

/**
 * Mark a call as missed
 */
export async function markCallAsMissed(callId: string): Promise<void> {
    const { error } = await supabase
        .from("call_events")
        .update({ status: "missed" })
        .eq("id", callId);

    if (error) throw error;
}

/**
 * Subscribe to incoming calls for the current user
 */
export async function subscribeToIncomingCalls(
    onCall: (call: CallEvent) => void
): Promise<() => void> {
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
        console.warn('[subscribeToIncomingCalls] No authenticated user');
        return () => { };
    }

    const channel = supabase
        .channel("incoming_calls")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "call_events",
                filter: `callee_id=eq.${userId}`,
            },
            async (payload) => {
                // Fetch full call details with profiles
                const { data } = await supabase
                    .from("call_events")
                    .select(
                        `
            *,
            caller:profiles!caller_id(id, username, display_name, avatar_url),
            callee:profiles!callee_id(id, username, display_name, avatar_url)
          `
                    )
                    .eq("id", payload.new.id)
                    .single();

                if (data) {
                    onCall(data as CallEvent);
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Subscribe to call status updates
 */
export function subscribeToCallUpdates(
    callId: string,
    onUpdate: (call: CallEvent) => void
): () => void {
    const channel = supabase
        .channel(`call_${callId}`)
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "call_events",
                filter: `id=eq.${callId}`,
            },
            async (payload) => {
                // Fetch full call details
                const { data } = await supabase
                    .from("call_events")
                    .select(
                        `
            *,
            caller:profiles!caller_id(id, username, display_name, avatar_url),
            callee:profiles!callee_id(id, username, display_name, avatar_url)
          `
                    )
                    .eq("id", callId)
                    .single();

                if (data) {
                    onUpdate(data as CallEvent);
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Get call history for the current user
 */
export async function getCallHistory(limit = 50): Promise<CallEvent[]> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("No authenticated user");
    }

    const { data, error } = await supabase
        .from("call_events")
        .select(
            `
      *,
      caller:profiles!caller_id(id, username, display_name, avatar_url),
      callee:profiles!callee_id(id, username, display_name, avatar_url)
    `
        )
        .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}
