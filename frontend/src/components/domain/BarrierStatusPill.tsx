import React from 'react';
import { cn } from '@/lib/utils';

export const BarrierStatusPill = ({ status, label }: { status: string, label: string }) => {
  const colors: Record<string, string> = {
    INTACT: "bg-emerald-50 text-emerald-700 border-emerald-300",
    DEGRADED: "bg-amber-50 text-amber-700 border-amber-300",
    MISSING: "bg-red-50 text-red-700 border-red-300",
    BYPASSED: "bg-rose-50 text-rose-700 border-rose-300",
    FAILED: "bg-red-100 text-red-800 border-red-400",
    UNKNOWN: "bg-surface-2 text-foreground-dim border-border"
  };
  return (
    <span className={cn("px-2 py-1 text-[10px] uppercase font-mono border rounded-full inline-flex items-center", colors[status] || colors.UNKNOWN)}>
      {label} <span className="ml-1 opacity-70">({status})</span>
    </span>
  );
}