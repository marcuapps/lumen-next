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
    <nav
      className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1"
      aria-label="Primary"
    >
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
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
