import React, { useState } from 'react';
import { Box, Wrench, ShieldAlert, ArrowRight, Search, Activity, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIncidentStore } from '../stores/incident-store';
import { useDatasetStore, DATASETS } from '../stores/dataset-store';

const SEVERITY_RANK: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  REVIEW: 2,
  ROUTINE: 1,
};

function inferAssetType(name: string): string {
  const n = name.toUpperCase();
  if (n.includes('RIG')) return 'DRILLING / WORKOVER RIG';
  if (n.includes('WELL')) return 'WELLHEAD SYSTEM';
  if (n.includes('VESSEL') || n.includes('DRUM') || n.includes('SEPARATOR')) return 'PRESSURE VESSEL';
  if (n.includes('PLANT') || n.includes('GGS') || n.includes('FACILITY')) return 'GATHERING / PROCESS PLANT';
  if (n.includes('PUMP')) return 'SUBSURFACE / TRANSFER PUMP';
  if (n.includes('CRANE')) return 'HEAVY LIFTING CRANE';
  if (n.includes('MANIFOLD') || n.includes('SUBSEA')) return 'SUBSEA INFRASTRUCTURE';
  if (n.includes('PLATFORM')) return 'OFFSHORE PLATFORM';
  if (n.includes('LINE') || n.includes('PIPELINE') || n.includes('FLOWLINE')) return 'HYDROCARBON PIPELINE';
  return 'FIELD ASSET';
}

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState('');
  const incidents = useIncidentStore((s) => s.incidents);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);

  // Group incidents by asset
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

  // Calculate health score per asset
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

  const filteredAssets = assetList.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-background text-foreground space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" /> Physical Asset Precursor Registry
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Operational asset inventory mapped with barrier degradation scores and precursor event histories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 bg-surface-1 border border-border rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>Dataset: <strong>{activeMeta?.label}</strong></span>
            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold">
              {activeMeta?.tag}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-foreground-dim" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets by name, location..."
              className="h-8 w-60 rounded-md border border-border bg-surface-1 pl-8 pr-3 text-xs outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-foreground-muted font-mono text-xs bg-surface-1 border border-border rounded-lg">
            No assets found matching "{searchTerm}".
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <Link 
              key={asset.id} 
              to={`/assets/${asset.id}`}
              className="p-4 bg-surface-1 border border-border rounded-lg shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 bg-surface-2 border border-border rounded text-[10px] font-mono font-semibold text-foreground-muted">
                    {asset.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    asset.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    asset.status === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    asset.status === 'REVIEW' ? 'bg-amber-100 text-amber-800' :
                    'bg-teal-100 text-teal-800'
                  }`}>
                    {asset.status}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                  {asset.name}
                </h3>
                <p className="text-xs text-foreground-dim mt-0.5">{asset.location}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                <span className="text-foreground-muted">
                  Precursors: <strong className={asset.precursors > 2 ? "text-red-600" : "text-foreground"}>{asset.precursors}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground-dim">Health:</span>
                  <span className={`font-bold ${parseInt(asset.health) < 50 ? 'text-red-600' : parseInt(asset.health) < 75 ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {asset.health}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
