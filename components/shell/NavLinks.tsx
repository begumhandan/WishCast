"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Target, Wallet } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Genel bakış", short: "Pano", icon: LayoutDashboard },
  { href: "/history", label: "Harcamalar", short: "Harcamalar", icon: Receipt },
  { href: "/goal", label: "Hedef", short: "Hedef", icon: Target },
  { href: "/onboarding", label: "Bütçe ayarları", short: "Bütçe", icon: Wallet },
];

export default function NavLinks({ variant }: { variant: "sidebar" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "bottom") {
    return (
      <ul className="grid grid-cols-4">
        {ITEMS.map(({ href, short, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${active ? "text-accent" : "text-muted"}`}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                {short}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors ${
                active ? "bg-surface-hover text-ink" : "text-muted hover:bg-surface-hover hover:text-ink"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.25 : 1.75} className={active ? "text-accent" : ""} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
