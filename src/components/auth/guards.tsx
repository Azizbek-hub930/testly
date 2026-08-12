import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { TestlyLogo } from "@/components/brand/testly-mark";
import { TestlyPageLoader } from "@/components/site/testly-loader";
import { Cta } from "@/components/site/cta";
import { useAuth } from "@/lib/auth/context";
import { goTo } from "@/lib/navigation";

/**
 * Client-side route guards.
 *
 * These decide what gets *rendered*. They are not the security boundary —
 * Row Level Security is. Every table in the schema refuses to hand a
 * non-admin a single waitlist row even if this component were bypassed.
 */

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, configured } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (configured && status === "unauthenticated") {
      goTo(router, "/signin", { replace: true, search: { redirect: pathname } });
    }
  }, [configured, status, router, pathname]);

  if (!configured) return <BackendNotConfigured />;
  if (status === "loading") return <TestlyPageLoader label="Checking your session" />;
  if (status === "unauthenticated") return <TestlyPageLoader label="Redirecting" />;

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, configured, isAdmin, profileLoading } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (configured && status === "unauthenticated") {
      goTo(router, "/signin", { replace: true, search: { redirect: pathname } });
    }
  }, [configured, status, router, pathname]);

  if (!configured) return <BackendNotConfigured />;
  if (status === "loading") return <TestlyPageLoader label="Checking your session" />;
  if (status === "unauthenticated") return <TestlyPageLoader label="Redirecting" />;
  if (profileLoading) return <TestlyPageLoader label="Verifying access" />;
  if (!isAdmin) return <Forbidden />;

  return <>{children}</>;
}

export function Forbidden() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface">
          <ShieldAlert className="h-6 w-6 text-indigo" />
        </div>
        <p className="eyebrow mt-6 text-muted-foreground">403 · Forbidden</p>
        <h1 className="display mt-3 text-3xl">Admins only.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This area holds early-access signups and account data. Your account doesn't have
          administrator access.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Cta asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Cta>
          <Cta variant="outline" asChild>
            <Link to="/">Go home</Link>
          </Cta>
        </div>
      </div>
    </div>
  );
}

export function BackendNotConfigured() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <div className="w-full max-w-lg">
        <TestlyLogo />
        <h1 className="display mt-8 text-3xl">Backend not connected.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This deployment has no Supabase credentials, so accounts, uploads and the waitlist can't
          run yet.
        </p>
        <div className="paper-card mt-6 p-5">
          <p className="eyebrow text-muted-foreground">Add to your environment</p>
          <pre className="mt-3 overflow-x-auto font-mono text-xs leading-6 text-foreground/80">
            {`VITE_SUPABASE_URL=…\nVITE_SUPABASE_ANON_KEY=…`}
          </pre>
          <p className="mt-4 text-xs text-muted-foreground">
            See <span className="font-mono">.env.example</span> and the setup steps in{" "}
            <span className="font-mono">README.md</span>.
          </p>
        </div>
        <div className="mt-8">
          <Cta variant="outline" asChild>
            <Link to="/">Back to the landing page</Link>
          </Cta>
        </div>
      </div>
    </div>
  );
}
