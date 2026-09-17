import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Box, ShieldAlert, CheckCircle2, AlertTriangle, Activity, Database, Clock } from 'lucide-react';
import { BarrierStatusPill } from '../components/domain/BarrierStatusPill';
import { EscalationBadge } from '../components/domain/EscalationBadge';
import { useIncidentStore } from '../stores/incident-store';
import { useDatasetStore, DATASETS } from '../stores/dataset-store';

const SEVERITY_RANK: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  REVIEW: 2,
  ROUTINE: 1,
};

function inferAssetType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('wellhead') || n.includes('wh-')) return 'Production Wellhead';
  if (n.includes('rig') || n.includes('dr-')) return 'Drilling / Workover Rig';
  if (n.includes('plant') || n.includes('ggs')) return 'Gas Gathering Station';
  if (n.includes('platform')) return 'Offshore Platform';
  if (n.includes('separator')) return 'Separator Vessel';
  if (n.includes('flowline') || n.includes('pipeline')) return 'Export Flowline';
  if (n.includes('pump') || n.includes('esp')) return 'Pumping Unit / ESP';
  if (n.includes('crane')) return 'Lifting Equipment';
  if (n.includes('manifold')) return 'Subsea Infrastructure';
  if (n.includes('flare')) return 'Flare & Vent System';
  return 'Operational Unit';
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const incidents = useIncidentStore((s) => s.incidents);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);

  // Group current incidents by asset
  const assetMap: Record<string, {
    id: string;
    name: string;
    type: string;
    location: string;
    status: 'CRITICAL' | 'HIGH' | 'REVIEW' | 'ROUTINE';
    precursors: number;
    health: string;
  }> = {};

  incidents.forEach((inc, index) => {
    const rawName = inc.asset || 'General Field Unit';
    const key = rawName.trim();
    if (!assetMap[key]) {
      assetMap[key] = {
        id: `AST-${index + 101}`,
        name: key,
        type: inferAssetType(key),
        location: inc.locationName || 'Field Cluster',
        status: inc.severity,
        precursors: 1,
        health: '100%',
      };
    } else {
      assetMap[key].precursors += 1;
      if (SEVERITY_RANK[inc.severity] > SEVERITY_RANK[assetMap[key].status]) {
        assetMap[key].status = inc.severity;
      }
    }
  });

  const assetList = Object.values(assetMap).map((asset) => {
    const related = incidents.filter(i => (i.asset || '').trim() === asset.name);
    const crit = related.filter(i => i.severity === 'CRITICAL').length;
    const high = related.filter(i => i.severity === 'HIGH').length;
    const rev = related.filter(i => i.severity === 'REVIEW').length;
    const penalty = crit * 25 + high * 15 + rev * 8;
    const healthNum = Math.max(15, 100 - penalty);
    return {
      ...asset,
      health: `${healthNum}%`,
    };
  });

  // Find asset matching id (by id or by name)
  const decodedId = decodeURIComponent(id || '').toLowerCase();
  const asset = assetList.find(a => 
    a.id.toLowerCase() === decodedId ||
    a.name.toLowerCase() === decodedId ||
    a.name.toLowerCase().includes(decodedId)
  ) || assetList[0] || {
    id: id || 'AST-101',
    name: 'Wellhead WH-44',
    type: 'Production Wellhead',
    location: 'Assam / Duliajan Basin',
    status: 'CRITICAL' as const,
    precursors: 3,
    health: '45%'
  };

  const relatedIncidents = incidents.filter(i => (i.asset || '').trim() === asset.name);
  const displayIncidents = relatedIncidents.length > 0 ? relatedIncidents : incidents.slice(0, 3);

  const healthNum = parseInt(asset.health);

  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/assets" className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Asset Registry
        </Link>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-surface-1 border border-border rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>Dataset: <strong>{activeMeta?.label}</strong></span>
            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold">
              {activeMeta?.tag}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 font-mono">
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
              asset.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
              asset.status === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              asset.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
              'bg-teal-100 text-teal-800'
            }`}>
              {asset.status} ASSET STATUS
            </span>
            <span className="text-xs text-foreground-dim">{asset.id}</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{asset.name} ({asset.type})</h1>
          <p className="text-xs text-foreground-muted mt-0.5">{asset.location} · Monitored via PrecursorAI</p>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="text-right">
            <div className="text-foreground-dim text-[11px]">BARRIER HEALTH</div>
            <div className={`text-lg font-bold ${healthNum < 50 ? 'text-red-600' : healthNum < 75 ? 'text-orange-600' : 'text-emerald-600'}`}>
              {asset.health}
            </div>
          </div>
          <div className="text-right border-l border-border pl-4">
            <div className="text-foreground-dim text-[11px]">PRECURSORS</div>
            <div className="text-lg font-bold text-foreground">{displayIncidents.length} events</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Barrier Health Scorecard */}
        <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm space-y-3">
          <h3 className="font-mono text-xs font-semibold uppercase text-foreground-muted tracking-wider">
            Barrier Health & Sensor Scorecard
          </h3>
          <div className="space-y-2">
            {displayIncidents.map((inc, i) => (
              <div key={inc.id || i} className="flex justify-between items-center p-3 bg-surface-2 rounded-md border border-border">
                <div className="space-y-0.5 max-w-xs">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>{inc.energySource} Barrier</span>
                    <span className="text-[10px] font-mono text-foreground-dim">({inc.id})</span>
                  </div>
                  <div className="text-[11px] text-foreground-dim font-sans truncate">
                    {inc.reportText}
                  </div>
                </div>
                <BarrierStatusPill status={inc.barrierStatus} />
              </div>
            ))}
          </div>
        </div>

        {/* Precursor Timeline */}
        <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm space-y-3">
          <h3 className="font-mono text-xs font-semibold uppercase text-foreground-muted tracking-wider">
            Precursor Sequence ({displayIncidents.length} Linked Reports)
          </h3>
          <div className="space-y-3 pl-2 border-l-2 border-primary/40 text-xs">
            {displayIncidents.map((inc) => (
              <div key={inc.id} className="relative pl-3 space-y-1">
                <span className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full ${
                  inc.severity === 'CRITICAL' ? 'bg-red-600' :
                  inc.severity === 'HIGH' ? 'bg-orange-500' : 'bg-teal-500'
                }`}></span>
                <div className="flex items-center gap-2 font-mono text-[11px] text-foreground-dim">
                  <span>{inc.timestamp}</span>
                  <span>·</span>
                  <span className="font-bold text-foreground">{inc.id}</span>
                  <EscalationBadge level={inc.severity} />
                </div>
                <p className="font-medium text-foreground text-xs leading-relaxed">{inc.reportText}</p>
                <Link to={`/reports/${inc.id}`} className="text-primary hover:underline text-[11px] font-mono font-semibold inline-flex items-center gap-1">
                  View Full Report {inc.id} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
