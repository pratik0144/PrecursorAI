import React from 'react';
import { cn } from '@/lib/utils';

export const BarrierChainSwissCheese = ({ barriers = [] }: { barriers: any[] }) => (
  <div className="flex items-center space-x-2 p-4 bg-surface-1 border border-border shadow-sm rounded">
    <div className="text-red-500 font-bold text-xl">⚡</div>
    <div className="flex-1 flex justify-around items-center px-4">
      {barriers.map((b, i) => (
        <div key={i} className={cn("w-4 h-16 rounded", b.status === 'FAILED' ? "bg-red-50 border border-red-400 border-dashed" : "bg-emerald-100 border border-emerald-400")} />
      ))}
    </div>
    <div className="text-blue-400 text-2xl">🧍</div>
  </div>
);