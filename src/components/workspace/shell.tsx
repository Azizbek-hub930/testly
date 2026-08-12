import { Link, useRouter } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

import { TestlyLogo } from "@/components/brand/testly-mark";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useAuth } from "@/lib/auth/context";
import { goTo } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match only this exact path — for section index routes. */
  exact?: boolean;
}

/**
 * Sidebar shell shared by the dashboard and the admin panel.
 *
 * Denser and more functional than the marketing pages, but built from the same
 * materials: the Testly mark, paper surfaces, hairline rules, indigo for state.
 */
export function WorkspaceShell({
  nav,
  label,
  children,
}: {
  nav: NavItem[];
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link to="/" aria-label="Testly home">
          <TestlyLogo compact />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-[57px] z-30 overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <p className="eyebrow px-3 pb-2 text-muted-foreground">{label}</p>
              {nav.map((item) => (
                <NavLink key={item.to} item={item} onNavigate={() => setOpen(false)} />
              ))}
              <div className="pt-2">
                <AccountCard />
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>

      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <aside className="sticky top-10 hidden h-[calc(100vh-5rem)] w-56 shrink-0 flex-col lg:flex">
          <Link to="/" aria-label="Testly home">
            <TestlyLogo compact />
          </Link>
          <p className="eyebrow mt-8 px-3 text-muted-foreground">{label}</p>
          <nav className="mt-3 space-y-1">
            {nav.map((item) => (
              <NavLink key={item.to} item={item} />
            ))}
          </nav>
          <div className="mt-auto space-y-3">
            <ThemeToggle />
            <AccountCard />
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;

  return (
    <Link
      // `to` is a plain string here so one component can serve every nav list;
      // each value is a real route defined in src/routes.
      to={item.to as never}
      activeOptions={{ exact: item.exact ?? false }}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      activeProps={{ className: "bg-indigo/10 font-medium text-indigo hover:bg-indigo/10" }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function AccountCard() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const name = profile?.full_name ?? user?.email ?? "Your account";
  const initial = (profile?.full_name ?? user?.email ?? "T").trim().charAt(0).toUpperCase();

  const onSignOut = async () => {
    setSigningOut(true);
    await signOut();
    goTo(router, "/", { replace: true });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo/12 text-xs font-semibold text-indigo">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {isAdmin ? (
        <Link
          to="/admin"
          className="mt-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-indigo transition-colors hover:bg-indigo/8"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Admin panel
        </Link>
      ) : null}

      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className={cn(
          "mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          signingOut && "opacity-60",
        )}
      >
        <LogOut className="h-3.5 w-3.5" /> {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
