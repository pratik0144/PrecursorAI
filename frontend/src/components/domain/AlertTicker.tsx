import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlertTickerProps {
  alerts?: Array<{ id: string; title: string; severity?: string }>;
  className?: string;
}

export const AlertTicker: React.FC<AlertTickerProps> = ({ alerts = [], className }) => {
  const sampleAlerts = alerts.length > 0 ? alerts : [
    { id: 'ALT-101', title: 'High pressure buildup on Well #44 without secondary barrier active', severity: 'CRITICAL' },
    { id: 'ALT-102', title: 'Repeated bypass of LOTO permit during pump maintenance at GGS-2', severity: 'HIGH' },
    { id: 'ALT-103', title: 'Multiple near-miss line-of-fire events during crane lifts', severity: 'HIGH' }
  ];

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-surface-1 border border-border rounded-lg shadow-xs overflow-hidden", className)}>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-bold tracking-wide uppercase shrink-0">
        <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
        Alerts
      </div>
      <div className="flex-1 flex items-center gap-6 overflow-x-auto text-xs text-foreground font-mono scrollbar-none">
        {sampleAlerts.map((a, i) => (
          <Link key={i} to="/alerts" className="flex items-center gap-2 hover:text-primary transition-colors shrink-0">
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", a.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}>
              {a.severity}
            </span>
            <span className="font-sans font-medium">{a.title}</span>
          </Link>
        ))}
      </div>
      <Link to="/alerts" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline shrink-0">
        View all <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
};
