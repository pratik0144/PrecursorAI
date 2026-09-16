import React from 'react';
import { cn } from '@/lib/utils';

export const BarrierStatusPill = ({ status, label }: { status: string, label: string }) => {
  const colors: Record<string, string> = {
    INTACT: "bg-emerald-950 text-emerald-400 border-emerald-500/50",
    DEGRADED: "bg-amber-950 text-amber-400 border-amber-500/50",
    MISSING: "bg-red-950 text-red-400 border-red-500/50",
    BYPASSED: "bg-rose-950 text-rose-400 border-rose-500/50",
    FAILED: "bg-red-950 text-red-500 border-red-500",
    UNKNOWN: "bg-gray-900 text-gray-400 border-gray-700"
  };
  return (
    <span className={cn("px-2 py-1 text-[10px] uppercase font-mono border rounded-full inline-flex items-center", colors[status] || colors.UNKNOWN)}>
      {label} <span className="ml-1 opacity-70">({status})</span>
    </span>
  );
}