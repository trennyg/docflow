"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/upload", label: "Upload" },
  { href: "/app/jobs", label: "Jobs" },
  { href: "/app/billing", label: "Billing" },
  { href: "/app/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-border">
        <span className="text-text-primary font-semibold tracking-tight">Docflow</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-muted hover:text-text-primary hover:bg-border/30"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
