import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ForbiddenError, UnauthorizedError, requireAdmin } from "@/server/auth.server";
import { getServiceClient, ServiceRoleUnavailableError } from "@/server/supabase.server";

/**
 * Role management.
 *
 * `profiles.role` is deliberately unreachable from the browser: it isn't in the
 * column grants for `authenticated`, and a trigger rejects self-promotion. This
 * server function is the only in-app path, and it re-checks the caller's own
 * role against the database before touching anything.
 */

const inputSchema = z.object({
  accessToken: z.string().min(10),
  userId: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

export type RoleChangeOutcome = { ok: true } | { ok: false; message: string };

export const setUserRole = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<RoleChangeOutcome> => {
    try {
      const caller = await requireAdmin(data.accessToken);
      const supabase = getServiceClient();

      if (data.userId === caller.id && data.role === "user") {
        return { ok: false, message: "You can't remove your own admin access." };
      }

      if (data.role === "user") {
        const { count, error: countError } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");

        if (countError) throw countError;
        if ((count ?? 0) <= 1) {
          return { ok: false, message: "Testly needs at least one administrator." };
        }
      }

      // `role` is writable only through the service-role client, and only after
      // requireAdmin has confirmed the caller against the database.
      const { error } = await supabase
        .from("profiles")
        .update({ role: data.role })
        .eq("id", data.userId);

      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error("[testly:admin]", error);

      if (error instanceof UnauthorizedError) return { ok: false, message: error.message };
      if (error instanceof ForbiddenError) return { ok: false, message: error.message };
      if (error instanceof ServiceRoleUnavailableError) {
        return {
          ok: false,
          message: "Role management isn't configured on the server (missing service-role key).",
        };
      }

      return { ok: false, message: "We couldn't update that role. Please try again." };
    }
  });
