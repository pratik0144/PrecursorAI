import React from 'react';
import { cn } from '@/lib/utils';

export const ConfidenceMeter = ({ score = 0 }: { score?: number }) => {
  const percent = score * 100;
  let color = "text-red-500";
  if (score >= 0.8) color = "text-green-500";
  else if (score >= 0.5) color = "text-amber-500";
  
  return (
    <div className={cn("font-mono text-sm border px-2 py-1 rounded inline-block", color, "border-current opacity-80")}>
      {percent.toFixed(0)}% CONF
    </div>
  );
}