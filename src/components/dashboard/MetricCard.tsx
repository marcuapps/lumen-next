import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value?: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success" | "info";
  loading?: boolean;
}

const TONE_TEXT: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  success: "text-emerald-600 dark:text-emerald-400",
  info: "text-foreground",
};

const TONE_ICON: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-muted text-foreground",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  loading,
}: Props) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              TONE_ICON[tone],
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </div>
        </div>

        <div className="mt-5 space-y-1.5">
          {loading ? (
            <>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div
                className={cn(
                  "font-display text-3xl font-bold tracking-tight tabular-nums sm:text-[34px]",
                  TONE_TEXT[tone],
                )}
              >
                {value ?? "—"}
              </div>
              {hint && (
                <p className="text-xs text-muted-foreground">{hint}</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
