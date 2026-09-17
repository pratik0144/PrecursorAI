import React from 'react';
import { cn } from '@/lib/utils';
import { Filter, Search } from 'lucide-react';

interface LinkedFilterBarProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  className?: string;
}

export const LinkedFilterBar: React.FC<LinkedFilterBarProps> = ({ 
  activeFilter = 'ALL', 
  onFilterChange, 
  searchTerm = '',
  onSearchChange,
  className 
}) => {
  const filters = [
    { id: 'ALL', label: 'All Incidents' },
    { id: 'CRITICAL', label: 'Critical / SIF', color: 'text-red-700 bg-red-50 border-red-200' },
    { id: 'HIGH', label: 'High Priority', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    { id: 'REVIEW', label: 'Pending Review', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { id: 'ROUTINE', label: 'Routine', color: 'text-teal-700 bg-teal-50 border-teal-200' }
  ];

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-1 border border-border rounded-lg shadow-xs", className)}>
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <Filter className="w-4 h-4 text-foreground-dim mr-1 shrink-0" />
        {filters.map(f => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange?.(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all shrink-0 border cursor-pointer",
                isActive 
                  ? (f.color || "bg-primary text-primary-foreground border-primary")
                  : "bg-surface-2 text-foreground-muted border-border hover:bg-surface-3 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-foreground-dim" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Filter by keyword, asset, rule..."
          className="h-8 w-60 rounded-md border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-primary text-foreground"
        />
      </div>
    </div>
  );
};
