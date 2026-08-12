import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { TestlyLogo } from "@/components/brand/testly-mark";
import { Cta } from "@/components/site/cta";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Product", href: "/#product" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "SAT & IELTS", href: "/#exams" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { status } = useAuth();
  // Signed-in visitors get a way back into the product instead of a sign-in link.
  const signedIn = status === "authenticated";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-4 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full border px-4 transition-all duration-300 sm:px-5",
          scrolled
            ? "h-14 border-border/70 bg-background/75 shadow-[0_10px_30px_-20px_color-mix(in_oklab,var(--navy)_70%,transparent)] backdrop-blur-xl"
            : "h-16 border-transparent bg-background/40 backdrop-blur-sm",
        )}
      >
        <Link to="/" className="shrink-0" aria-label="Testly home">
          <TestlyLogo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="group relative rounded-full px-3 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                {item.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-indigo transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            to={signedIn ? "/dashboard" : "/signin"}
            className="rounded-full px-3 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            {signedIn ? "Dashboard" : "Sign In"}
          </Link>
          <Cta size="sm" asChild>
            <a href="/#early-access">
              Get Early Access <span aria-hidden>→</span>
            </a>
          </Cta>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 pb-5 pt-2">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base text-foreground/80 transition-colors hover:bg-accent"
                >
                  {item.label}
                </a>
              ))}
              <Link
                to={signedIn ? "/dashboard" : "/signin"}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-foreground/80 transition-colors hover:bg-accent"
              >
                {signedIn ? "Dashboard" : "Sign In"}
              </Link>
              <Cta size="lg" className="mt-2 w-full" asChild>
                <a href="/#early-access" onClick={() => setOpen(false)}>
                  Get Early Access <span aria-hidden>→</span>
                </a>
              </Cta>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
