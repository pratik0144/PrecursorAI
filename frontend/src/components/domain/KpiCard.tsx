import React from 'react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'flat';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, trend, className }) => {
  return (
    <div className={cn("p-4 border border-gray-800 bg-black rounded-lg flex flex-col relative", className)}>
      <span className="text-xs text-gray-500 uppercase">{label}</span>
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-2xl font-mono text-white tabular-nums">{value}</span>
        {trend === 'up' && <span className="text-green-500">↑</span>}
        {trend === 'down' && <span className="text-red-500">↓</span>}
        {trend === 'flat' && <span className="text-gray-500">→</span>}
      </div>
      <span className="absolute top-2 right-2 text-[10px] text-gray-700 bg-gray-900 px-1 rounded">DEMO</span>
    </div>
  );
};
