import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { TestlyLogo } from "@/components/brand/testly-mark";
import { Button, EASE } from "@/components/home/ui";
import { WaitlistLink } from "@/components/home/waitlist";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "How it works", href: "/#workflow" },
  { label: "Exams", href: "/#exams" },
  { label: "Who it's for", href: "/#audience" },
  { label: "FAQ", href: "/#faq" },
];

export function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4"
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 rounded-full border pl-5 pr-2 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled || menuOpen
            ? "border-white/10 bg-ink/70 shadow-[0_16px_40px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Link to="/" aria-label="Testly home" className="flex shrink-0 items-center">
          <TestlyLogo tone="dark" />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm text-mist transition-colors duration-200 hover:text-snow"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Button size="sm" asChild>
            <WaitlistLink>Join the waitlist</WaitlistLink>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-snow"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="glass mx-auto mt-2 max-w-[1120px] rounded-3xl p-3 md:hidden"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-base text-snow/85 hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
            <Button size="lg" className="mt-2 w-full" asChild>
              <WaitlistLink onClick={() => setMenuOpen(false)}>Join the waitlist</WaitlistLink>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
