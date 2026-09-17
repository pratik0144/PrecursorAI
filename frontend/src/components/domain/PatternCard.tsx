import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export const PatternCard = ({ pattern }: { pattern: any }) => {
  const isCritical = pattern?.severity === 'CRITICAL' || pattern?.type === 'COMPOUNDING';
  
  return (
    <div className="border border-border bg-surface-1 p-3.5 rounded-lg text-sm text-foreground hover:border-primary/50 shadow-xs hover:shadow-sm transition-all cursor-pointer">
      <div className="flex justify-between items-center mb-2">
        <span className={cn(
          "px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md border",
          isCritical ? "bg-red-50 text-red-700 border-red-200" : "bg-primary/10 text-primary border-primary/20"
        )}>
          {pattern?.type || 'EMERGING'}
        </span>
        <span className={cn(
          "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
          isCritical ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
        )}>
          {pattern?.severity || 'HIGH'}
        </span>
      </div>
      <h4 className="font-semibold text-foreground text-sm leading-snug mb-2.5 line-clamp-2">
        {pattern?.title || 'Unknown Pattern Detected'}
      </h4>
      <div className="flex justify-between items-center text-xs text-foreground-dim font-mono pt-2 border-t border-border/50">
        <span>{pattern?.report_count || 6} incidents linked</span>
        <span className="flex items-center gap-1 text-orange-700 font-semibold">
          <TrendingUp className="w-3.5 h-3.5" /> +18%
        </span>
      </div>
    </div>
  );
};