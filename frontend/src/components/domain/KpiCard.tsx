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
    <div className={cn("p-4 border border-border bg-surface-1 rounded-lg shadow-sm flex flex-col relative", className)}>
      <span className="text-xs text-foreground-muted uppercase">{label}</span>
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-2xl font-mono text-foreground tabular-nums">{value}</span>
        {trend === 'up' && <span className="text-green-500">↑</span>}
        {trend === 'down' && <span className="text-red-500">↓</span>}
        {trend === 'flat' && <span className="text-foreground-muted">→</span>}
      </div>
    </div>
  );
};
