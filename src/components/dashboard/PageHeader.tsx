import * as React from "react";

import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-2 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        <h1 className="font-display text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
