import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

import type { Profile } from "@/lib/supabase/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthValue {
  /** `loading` until the stored session has been read — never assume signed-out during it. */
  status: AuthStatus;
  /** False when the app has no Supabase credentials configured. */
  configured: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  profileLoading: boolean;
  /**
   * Mirrors `profiles.role`, which only the database can set. The UI uses this
   * to decide what to *show*; Row Level Security decides what can be *read*.
   */
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
