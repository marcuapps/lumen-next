"use client";

import { Building2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  delayedOnly: boolean;
  onDelayedOnlyChange: (v: boolean) => void;
  terminal: string;
  terminals: string[];
  onTerminalChange: (v: string) => void;
}

export function TableToolbar({
  search,
  onSearchChange,
  delayedOnly,
  onDelayedOnlyChange,
  terminal,
  terminals,
  onTerminalChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search flight, airline, or origin"
          className="h-10 rounded-full pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={terminal} onValueChange={onTerminalChange}>
          <SelectTrigger
            id="terminal-select"
            className="h-10 w-auto gap-2 rounded-full border bg-card pl-3.5 pr-3 text-sm"
          >
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Terminal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All terminals</SelectItem>
            {terminals.map((t) => (
              <SelectItem key={t} value={t}>
                Terminal {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label
          htmlFor="delayed-only"
          className="flex h-10 cursor-pointer items-center gap-2 rounded-full border bg-card px-3.5 text-sm font-medium"
        >
          <Switch
            id="delayed-only"
            checked={delayedOnly}
            onCheckedChange={onDelayedOnlyChange}
          />
          Delayed only
        </Label>
      </div>
    </div>
  );
}
