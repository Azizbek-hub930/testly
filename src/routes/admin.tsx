import { Outlet, createFileRoute } from "@tanstack/react-router";

import { RequireAdmin } from "@/components/auth/guards";
import { HomeShell } from "@/components/home/theme";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Waitlist — Testly" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

/** The admin area is a single page (the waitlist), in the landing page's dark design. */
function AdminLayout() {
  return (
    <RequireAdmin>
      <HomeShell>
        <Outlet />
      </HomeShell>
    </RequireAdmin>
  );
}
