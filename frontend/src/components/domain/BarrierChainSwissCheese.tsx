import React from 'react';
import { cn } from '@/lib/utils';

export const BarrierChainSwissCheese = ({ barriers = [] }: { barriers: any[] }) => (
  <div className="flex items-center space-x-2 p-4 bg-gray-900 border border-gray-800 rounded">
    <div className="text-red-500 font-bold text-xl">⚡</div>
    <div className="flex-1 flex justify-around items-center px-4">
      {barriers.map((b, i) => (
        <div key={i} className={cn("w-4 h-16 rounded", b.status === 'FAILED' ? "bg-red-900/30 border border-red-500 border-dashed" : "bg-green-600/50 border border-green-500")} />
      ))}
    </div>
    <div className="text-blue-400 text-2xl">🧍</div>
  </div>
);