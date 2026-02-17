import { supabase } from '@/services/supabase';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return {
        user,
        loading,
        signUp: async (email: string, password: string) => {
            const { data, error } = await supabase.auth.signUp({ email, password });
            return { data, error };
        },
        signIn: async (email: string, password: string) => {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { data, error };
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            return { error };
        },
    };
}