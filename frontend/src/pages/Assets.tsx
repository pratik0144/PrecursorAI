import React from 'react';
import { Box, Wrench, ShieldAlert, ArrowRight, Search, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Assets() {
  const assets = [
    { id: 'AST-WH-44', name: 'Wellhead WH-44', type: 'WELLHEAD', location: 'Assam / Duliajan', status: 'CRITICAL', precursors: 5, health: '38%' },
    { id: 'AST-RIG-12', name: 'Workover Rig #12', type: 'WORKOVER_RIG', location: 'Assam / Naharkatia', status: 'CRITICAL', precursors: 4, health: '45%' },
    { id: 'AST-BOP-02', name: 'BOP Stack 10K PSI', type: 'BOP_WELL_CONTROL', location: 'Assam / Moran Field', status: 'HIGH', precursors: 3, health: '62%' },
    { id: 'AST-DR-03', name: 'Drilling Rig DR-03', type: 'DRILLING_RIG', location: 'Rajasthan / Barmer', status: 'HIGH', precursors: 3, health: '68%' },
    { id: 'AST-GGS-01', name: 'Group Gathering Station 01', type: 'GGS', location: 'Gujarat / Mehsana', status: 'ROUTINE', precursors: 1, health: '92%' },
    { id: 'AST-PL-09', name: 'Cross-Field Hydrocarbon Pipeline', type: 'PIPELINE', location: 'Assam / Duliajan', status: 'ROUTINE', precursors: 0, health: '96%' }
  ];

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
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-foreground-dim" />
          <input 
            type="text" 
            placeholder="Search assets by name, rig ID..."
            className="h-8 w-64 rounded-md border border-border bg-surface-1 pl-8 pr-3 text-xs outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
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
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${asset.status === 'CRITICAL' ? 'bg-red-100 text-red-800' : asset.status === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'}`}>
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
                Precursors: <strong className="text-red-600">{asset.precursors}</strong>
              </span>
              <span className="text-foreground-muted">
                Health: <strong className="text-foreground">{asset.health}</strong>
              </span>
              <ArrowRight className="w-4 h-4 text-foreground-dim group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
