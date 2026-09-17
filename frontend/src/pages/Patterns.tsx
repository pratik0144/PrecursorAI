import React from 'react';
import { PatternCard } from '../components/domain/PatternCard';
import { Sparkles, Network } from 'lucide-react';

export default function Patterns() {
  const patternCategories = [
    {
      type: 'COMPOUNDING',
      desc: 'Multiple barrier degradations accumulating on a single asset or system over time.',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      patterns: [
        { type: 'COMPOUNDING', title: 'Wellhead WH-44: BOP hydraulic seal leak + master gate valve seizure', severity: 'CRITICAL', report_count: 5 },
        { type: 'COMPOUNDING', title: 'Workover Rig-08: Derrick guide wire corrosion + load cell sensor drift', severity: 'HIGH', report_count: 4 }
      ]
    },
    {
      type: 'EMERGING',
      desc: 'Rapidly rising precursors identified across recent shifts.',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      patterns: [
        { type: 'EMERGING', title: 'Scaffolding toe-board dislodgements during monsoon wind gusts', severity: 'HIGH', report_count: 8 },
        { type: 'EMERGING', title: 'Incomplete lock-out tag-out (LOTO) isolation during slurry pump rebuilds', severity: 'HIGH', report_count: 6 }
      ]
    },
    {
      type: 'RECURRING',
      desc: 'Persistently repeated hazards across multiple assets/locations.',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      patterns: [
        { type: 'RECURRING', title: 'Line-of-fire exposure during high-pressure hose connection and disconnect', severity: 'HIGH', report_count: 14 },
        { type: 'RECURRING', title: 'Inadequate secondary containment during chemical tank decanting', severity: 'REVIEW', report_count: 9 }
      ]
    },
    {
      type: 'SYSTEMIC',
      desc: 'Broad organizational or procedure-level precursor trends.',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      patterns: [
        { type: 'SYSTEMIC', title: 'Work authorization delays leading to unpermitted hot work permits', severity: 'CRITICAL', report_count: 11 }
      ]
    }
  ];

  return (
    <div className="p-4 bg-background min-h-screen text-foreground space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" /> Tier-2 Safety Pattern Intelligence
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Automated multi-report clustering and semantic reasoning across all field operations.
        </p>
      </div>

      {/* Semantic cluster preview */}
      <div className="p-6 border border-border rounded-lg bg-surface-1 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Semantic 2D Cluster Visualization</h3>
        <p className="text-xs text-foreground-muted mt-1 max-w-md">
          Hierarchical DBSCAN clustering projected over 1536-dimensional Matryoshka vector embeddings.
        </p>
      </div>

      {patternCategories.map(cat => (
        <div key={cat.type} className="space-y-3">
          <div className="border-b border-border pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${cat.badgeColor}`}>
                {cat.type}
              </span>
              <span className="text-xs text-foreground-dim font-medium">{cat.desc}</span>
            </div>
            <span className="text-xs font-mono text-foreground-dim">{cat.patterns.length} patterns</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {cat.patterns.map((p, i) => (
              <PatternCard key={i} pattern={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}