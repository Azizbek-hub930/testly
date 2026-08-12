import { Github, Linkedin, Twitter } from "lucide-react";

import { TestlyLogo } from "@/components/brand/testly-mark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-xs">
            <TestlyLogo />
            <p className="mt-4 text-sm text-muted-foreground">AI-powered assessment generation.</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                ["Product", "/#product"],
                ["How it Works", "/#how-it-works"],
                ["Solutions", "/#solutions"],
                ["FAQ", "/#faq"],
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                ["Early Access", "/#early-access"],
                ["Dashboard", "/dashboard"],
                ["Sign In", "/signin"],
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
              ]}
            />
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Testly. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a
                key={i}
                href="/#"
                aria-label="Social link"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-indigo/40 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="text-sm text-foreground/75 transition-colors hover:text-indigo"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
