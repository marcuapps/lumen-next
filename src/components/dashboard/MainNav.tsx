"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Table2 } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Analytics", icon: LayoutDashboard },
  { href: "/flights", label: "Flights", icon: Table2 },
] as const;

export function MainNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Preserve search params (notably ?airport=) across nav clicks
  const query = searchParams.toString();
  const querySuffix = query ? `?${query}` : "";

  return (
    <nav className="flex items-center gap-2" aria-label="Primary">
      {ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={`${item.href}${querySuffix}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={isActive ? 2.4 : 2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
