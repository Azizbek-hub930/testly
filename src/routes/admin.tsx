import { Outlet, createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, ListChecks, Settings, Users } from "lucide-react";

import { RequireAdmin } from "@/components/auth/guards";
import { WorkspaceShell, type NavItem } from "@/components/workspace/shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Testly Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

const NAV: NavItem[] = [
  { label: "Overview", to: "/admin", icon: LayoutGrid, exact: true },
  { label: "Waitlist", to: "/admin/waitlist", icon: ListChecks },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function AdminLayout() {
  return (
    <RequireAdmin>
      <WorkspaceShell nav={NAV} label="Testly Admin">
        <Outlet />
      </WorkspaceShell>
    </RequireAdmin>
  );
}
