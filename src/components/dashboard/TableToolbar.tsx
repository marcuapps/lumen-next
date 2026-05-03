"use client";

import { Search } from "lucide-react";

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
    <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search flight, airline, or origin"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="terminal-select"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Terminal
          </Label>
          <Select value={terminal} onValueChange={onTerminalChange}>
            <SelectTrigger id="terminal-select" className="h-9 w-[120px]">
              <SelectValue />
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
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5">
          <Switch
            id="delayed-only"
            checked={delayedOnly}
            onCheckedChange={onDelayedOnlyChange}
          />
          <Label
            htmlFor="delayed-only"
            className="cursor-pointer text-xs font-medium"
          >
            Delayed only
          </Label>
        </div>
      </div>
    </div>
  );
}
