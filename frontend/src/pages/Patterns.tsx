import React from 'react';
import { PatternCard } from '../components/domain/PatternCard';
import { SemanticClusterMap } from '../components/domain/SemanticClusterMap';
import { Sparkles, Network, Database } from 'lucide-react';
import { useDatasetStore, DATASETS } from '../stores/dataset-store';

const DEFAULT_CATEGORIES = [
  {
    type: 'COMPOUNDING',
    desc: 'Multiple barrier degradations accumulating on a single asset or system over time.',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    patterns: [
      { id: 'PAT-01', type: 'COMPOUNDING', title: 'Wellhead WH-44: BOP hydraulic seal leak + master gate valve seizure', severity: 'CRITICAL', report_count: 5 },
      { id: 'PAT-02', type: 'COMPOUNDING', title: 'Workover Rig-08: Derrick guide wire corrosion + load cell sensor drift', severity: 'HIGH', report_count: 4 }
    ]
  },
  {
    type: 'EMERGING',
    desc: 'Rapidly rising precursors identified across recent shifts.',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    patterns: [
      { id: 'PAT-03', type: 'EMERGING', title: 'Scaffolding toe-board dislodgements during monsoon wind gusts', severity: 'HIGH', report_count: 8 },
      { id: 'PAT-04', type: 'EMERGING', title: 'Incomplete lock-out tag-out (LOTO) isolation during slurry pump rebuilds', severity: 'HIGH', report_count: 6 }
    ]
  },
  {
    type: 'RECURRING',
    desc: 'Persistently repeated hazards across multiple assets/locations.',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    patterns: [
      { id: 'PAT-05', type: 'RECURRING', title: 'Line-of-fire exposure during high-pressure hose connection and disconnect', severity: 'HIGH', report_count: 14 },
      { id: 'PAT-06', type: 'RECURRING', title: 'Inadequate secondary containment during chemical tank decanting', severity: 'REVIEW', report_count: 9 }
    ]
  },
  {
    type: 'SYSTEMIC',
    desc: 'Broad organizational or procedure-level precursor trends.',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    patterns: [
      { id: 'PAT-07', type: 'SYSTEMIC', title: 'Work authorization delays leading to unpermitted hot work permits', severity: 'CRITICAL', report_count: 11 }
    ]
  }
];

export default function Patterns() {
  const rawData = useDatasetStore((s) => s.rawData);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);

  // Group rawData.patterns if available
  let categories = DEFAULT_CATEGORIES;
  if (rawData?.patterns && rawData.patterns.length > 0) {
    const rawPatterns = rawData.patterns;
    const compounding = rawPatterns.filter((p: any) => p.type === 'COMPOUNDING');
    const emerging = rawPatterns.filter((p: any) => p.type === 'EMERGING');
    const recurring = rawPatterns.filter((p: any) => p.type === 'RECURRING');
    const systemic = rawPatterns.filter((p: any) => p.type === 'SYSTEMIC');

    categories = [
      {
        type: 'COMPOUNDING',
        desc: 'Multiple barrier degradations accumulating on a single asset or system over time.',
        badgeColor: 'bg-red-50 text-red-700 border-red-200',
        patterns: compounding
      },
      {
        type: 'EMERGING',
        desc: 'Rapidly rising precursors identified across recent shifts.',
        badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
        patterns: emerging
      },
      {
        type: 'RECURRING',
        desc: 'Persistently repeated hazards across multiple assets/locations.',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        patterns: recurring
      },
      ...(systemic.length > 0 ? [{
        type: 'SYSTEMIC',
        desc: 'Broad organizational or procedure-level precursor trends.',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        patterns: systemic
      }] : [])
    ].filter(cat => cat.patterns.length > 0);
  }

  const totalPatterns = categories.reduce((acc, cat) => acc + cat.patterns.length, 0);

  return (
    <div className="p-4 bg-background min-h-screen text-foreground space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" /> Tier-2 Safety Pattern Intelligence
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Automated multi-report clustering and semantic reasoning across field operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-surface-1 border border-border rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>Dataset: <strong>{activeMeta?.label}</strong></span>
            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold">
              {activeMeta?.tag}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-surface-2 border border-border rounded-lg text-xs font-mono text-foreground-dim">
            {totalPatterns} Patterns Active
          </span>
        </div>
      </div>

      {/* Interactive Semantic 2D Embedding Cluster Space */}
      <SemanticClusterMap />

      {categories.map(cat => (
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
            {cat.patterns.map((p: any, i: number) => (
              <PatternCard key={p.id || i} pattern={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}