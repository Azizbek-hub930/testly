import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/site/reveal";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PanelCard,
  TableSkeleton,
  formatDate,
} from "@/components/workspace/ui";
import { fetchProfiles } from "@/lib/api/admin";
import { useAuth } from "@/lib/auth/context";
import { toFriendlyMessage } from "@/lib/errors";
import type { Profile } from "@/lib/supabase/types";
import { setUserRole } from "@/rpc/admin";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const { isAdmin, session, user } = useAuth();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setSearch(searchInput), 300);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const profiles = useQuery({
    queryKey: ["admin", "profiles", search],
    queryFn: () => fetchProfiles(search),
    enabled: isAdmin,
  });

  const changeRole = useMutation({
    mutationFn: async (input: { profile: Profile; role: "user" | "admin" }) => {
      if (!session) throw new Error("Your session expired. Please sign in again.");
      return setUserRole({
        data: {
          accessToken: session.access_token,
          userId: input.profile.id,
          role: input.role,
        },
      });
    },
    onMutate: (input) => setBusyId(input.profile.id),
    onSuccess: (outcome, input) => {
      if (!outcome.ok) {
        toast.error(outcome.message);
        return;
      }
      toast.success(
        input.role === "admin"
          ? `${input.profile.email} is now an administrator.`
          : `${input.profile.email} is now a regular user.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
    },
    onError: (error) => toast.error(toFriendlyMessage(error, "admin")),
    onSettled: () => setBusyId(null),
  });

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Testly Admin" title="Users." />

      <Reveal>
        <div className="paper-card p-4 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email or organization"
              aria-label="Search users"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-indigo/50 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--indigo)_14%,transparent)]"
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <PanelCard
          title={
            profiles.data
              ? `${profiles.data.length} account${profiles.data.length === 1 ? "" : "s"}`
              : "Accounts"
          }
        >
          {profiles.isPending ? (
            <TableSkeleton rows={5} columns={4} />
          ) : profiles.isError ? (
            <ErrorState
              message={toFriendlyMessage(profiles.error, "admin")}
              onRetry={() => void profiles.refetch()}
            />
          ) : profiles.data.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No accounts found"
              description="Accounts appear here as soon as someone signs up."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-hairline">
                    {["Name", "Email", "Organization", "Joined", "Role"].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profiles.data.map((profile) => {
                    const isSelf = profile.id === user?.id;
                    return (
                      <tr
                        key={profile.id}
                        className="border-b border-hairline last:border-0 hover:bg-accent/40"
                      >
                        <td className="max-w-[12rem] truncate px-5 py-3.5 text-sm font-medium">
                          {profile.full_name ?? "—"}
                          {isSelf ? (
                            <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                              you
                            </span>
                          ) : null}
                        </td>
                        <td className="max-w-[16rem] truncate px-5 py-3.5 text-sm text-muted-foreground">
                          {profile.email}
                        </td>
                        <td className="max-w-[12rem] truncate px-5 py-3.5 text-sm text-muted-foreground">
                          {profile.organization ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-muted-foreground">
                          {formatDate(profile.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {profile.role === "admin" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo/30 bg-indigo/8 px-2.5 py-1 text-[11px] font-medium text-indigo">
                                <ShieldCheck className="h-3 w-3" /> Admin
                              </span>
                            ) : (
                              <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                                User
                              </span>
                            )}
                            <button
                              type="button"
                              disabled={busyId === profile.id || isSelf}
                              onClick={() => {
                                const nextRole = profile.role === "admin" ? "user" : "admin";
                                const message =
                                  nextRole === "admin"
                                    ? `Give ${profile.email} full admin access, including every waitlist record?`
                                    : `Remove admin access from ${profile.email}?`;
                                if (window.confirm(message)) {
                                  changeRole.mutate({ profile, role: nextRole });
                                }
                              }}
                              className="whitespace-nowrap rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-indigo/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                            >
                              {profile.role === "admin" ? "Demote" : "Make admin"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </PanelCard>
      </Reveal>

      <p className="text-xs text-muted-foreground">
        Role changes run on the server and re-check your own admin status against the database
        first. The very first administrator is appointed by running{" "}
        <span className="font-mono">supabase/migrations/0004_admin_bootstrap.sql</span>.
      </p>
    </div>
  );
}
