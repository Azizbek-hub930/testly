import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthStatus, type AuthValue } from "@/lib/auth/context";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

interface ProfileState {
  /** Which user this profile was loaded for — `null` means "nothing loaded yet". */
  userId: string | null;
  profile: Profile | null;
}

/**
 * Holds the Supabase session for the whole app.
 *
 * The session lives in the browser only: this component renders `loading`
 * during SSR and the first paint, then resolves once the stored session has
 * been read. Guards must respect `loading` rather than treating it as
 * signed-out, otherwise a refresh would bounce a signed-in user to /signin.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? "loading" : "unauthenticated",
  );
  const [session, setSession] = useState<Session | null>(null);
  const [profileState, setProfileState] = useState<ProfileState>({
    userId: null,
    profile: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabaseClient();
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setStatus(data.session ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setStatus("unauthenticated");
      });

    // Fires on sign-in, sign-out, token refresh and password recovery.
    // Deliberately does nothing but store state — calling back into Supabase
    // from inside this callback can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  const refreshProfile = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setProfileState({ userId: null, profile: null });
      return;
    }

    try {
      const { data, error } = await getSupabaseClient()
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setProfileState({ userId, profile: data });
    } catch (error) {
      // A missing or unreadable profile is not fatal: the app falls back to the
      // auth user's own details and treats them as a non-admin.
      console.error("[testly:profile]", error);
      setProfileState({ userId, profile: null });
    }
  }, [userId]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      await getSupabaseClient().auth.signOut();
    } finally {
      setProfileState({ userId: null, profile: null });
      setSession(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthValue>(() => {
    const resolved = profileState.userId === userId;
    const profile = resolved ? profileState.profile : null;

    return {
      status,
      configured: isSupabaseConfigured,
      session,
      user: session?.user ?? null,
      profile,
      profileLoading: userId !== null && !resolved,
      isAdmin: profile?.role === "admin",
      refreshProfile,
      signOut,
    };
  }, [status, session, userId, profileState, refreshProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
