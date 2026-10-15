import { getSupabaseClient } from "@/lib/supabase/client";
import type { Json, Profile, WaitlistEntry } from "@/lib/supabase/types";

/**
 * Admin data access.
 *
 * Nothing here grants access — the `waitlist_admin_*` policies and
 * `waitlist_stats()` decide that in the database. A non-admin running these
 * exact calls gets an empty result or a 42501, which is the point.
 */

export type WaitlistSort = "newest" | "oldest";

export interface WaitlistQuery {
  search: string;
  role: string;
  organization: string;
  sort: WaitlistSort;
  page: number;
  pageSize: number;
}

export interface WaitlistPage {
  rows: WaitlistEntry[];
  total: number;
}

/**
 * PostgREST's `or` filter is a small expression language, so a raw search term
 * could otherwise change the shape of the query. Strip its operators.
 */
function sanitizeSearch(term: string): string {
  return term
    .replace(/[,()*%\\"']/g, " ")
    .trim()
    .slice(0, 80);
}

export async function fetchWaitlistPage(query: WaitlistQuery): Promise<WaitlistPage> {
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let request = getSupabaseClient()
    .from("waitlist")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: query.sort === "oldest" })
    .range(from, to);

  const search = sanitizeSearch(query.search);
  if (search.length > 0) {
    request = request.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,organization.ilike.%${search}%`,
    );
  }
  if (query.role) request = request.eq("role", query.role);
  if (query.organization) request = request.eq("organization", query.organization);

  const { data, error, count } = await request;
  if (error) throw error;

  return { rows: data ?? [], total: count ?? 0 };
}

export async function updateWaitlistNotes(id: string, notes: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("waitlist")
    .update({ notes: notes.trim().length > 0 ? notes.trim() : null })
    .eq("id", id);

  if (error) throw error;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface DayCount {
  day: string;
  count: number;
}

export interface WaitlistStats {
  total: number;
  today: number;
  week: number;
  organizations: number;
  roles: RoleCount[];
  organizationList: string[];
  daily: DayCount[];
}

export async function fetchWaitlistStats(): Promise<WaitlistStats> {
  const { data, error } = await getSupabaseClient().rpc("waitlist_stats");
  if (error) throw error;
  return parseStats(data);
}

export async function fetchProfiles(search: string): Promise<Profile[]> {
  let request = getSupabaseClient()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const term = sanitizeSearch(search);
  if (term.length > 0) {
    request = request.or(
      `email.ilike.%${term}%,full_name.ilike.%${term}%,organization.ilike.%${term}%`,
    );
  }

  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------

function asRecord(value: Json): Record<string, Json> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

function asNumber(value: Json | undefined): number {
  return typeof value === "number" ? value : 0;
}

function parseStats(value: Json): WaitlistStats {
  const raw = asRecord(value);
  const rolesRaw = raw["roles"];
  const orgsRaw = raw["organization_list"];
  const dailyRaw = raw["daily"];

  const roles: RoleCount[] = Array.isArray(rolesRaw)
    ? rolesRaw.flatMap((entry) => {
        const row = asRecord(entry);
        const role = row["role"];
        return typeof role === "string" ? [{ role, count: asNumber(row["count"]) }] : [];
      })
    : [];

  const organizationList: string[] = Array.isArray(orgsRaw)
    ? orgsRaw.filter((entry): entry is string => typeof entry === "string")
    : [];

  const daily: DayCount[] = Array.isArray(dailyRaw)
    ? dailyRaw.flatMap((entry) => {
        const row = asRecord(entry);
        const day = row["day"];
        return typeof day === "string" ? [{ day, count: asNumber(row["count"]) }] : [];
      })
    : [];

  return {
    total: asNumber(raw["total"]),
    today: asNumber(raw["today"]),
    week: asNumber(raw["week"]),
    organizations: asNumber(raw["organizations"]),
    roles,
    organizationList,
    daily,
  };
}

/** Every waitlist entry, newest first (admins only — enforced by RLS). */
export async function fetchAllWaitlist(): Promise<WaitlistEntry[]> {
  const { data, error } = await getSupabaseClient()
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw error;
  return data ?? [];
}
