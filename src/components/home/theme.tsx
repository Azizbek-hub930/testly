import type { ReactNode } from "react";

/** Page wrapper that applies the landing page's dark palette (see `.home` in styles.css). */
export function HomeShell({ children }: { children: ReactNode }) {
  return <div className="home min-h-screen">{children}</div>;
}
