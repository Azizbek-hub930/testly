import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { FileText, LayoutGrid, Settings, Sparkles } from "lucide-react";

import { RequireAuth } from "@/components/auth/guards";
import { WorkspaceShell, type NavItem } from "@/components/workspace/shell";

const TITLE = "Testly workspace";
const DESC = "Upload source material and generate SAT and IELTS assessments.";

export const Route = createFileRoute("/dashboard")({
  // The product workspace is parked for now; only the waitlist is in use.
  beforeLoad: () => {
    throw redirect({ to: "/admin/waitlist" });
  },
  head: () => ({
    meta: [
      { title: `${TITLE} — AI assessment engine` },
      { name: "description", content: DESC },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

const NAV: NavItem[] = [
  { label: "Overview", to: "/dashboard", icon: LayoutGrid, exact: true },
  { label: "Sources", to: "/dashboard/sources", icon: FileText },
  { label: "Assessments", to: "/dashboard/assessments", icon: Sparkles },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
];

function DashboardLayout() {
  return (
    <RequireAuth>
      <WorkspaceShell nav={NAV} label="Workspace">
        <Outlet />
      </WorkspaceShell>
    </RequireAuth>
  );
}
