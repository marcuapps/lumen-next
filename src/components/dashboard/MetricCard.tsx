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

const TONE_STYLES: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  success: "text-emerald-600 dark:text-emerald-400",
  info: "text-sky-600 dark:text-sky-400",
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
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          {loading ? (
            <>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <div
                className={cn(
                  "text-2xl font-semibold tracking-tight tabular-nums",
                  TONE_STYLES[tone],
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
