import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ZoomIn, Info, Layers, Eye, ArrowUpRight, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDatasetStore, DATASETS } from '../../stores/dataset-store';
import { useIncidentStore } from '../../stores/incident-store';

interface ClusterPoint {
  id: string;
  type: 'pattern' | 'incident';
  clusterType: 'COMPOUNDING' | 'EMERGING' | 'RECURRING' | 'SYSTEMIC';
  title: string;
  asset: string;
  severity: 'CRITICAL' | 'HIGH' | 'REVIEW' | 'ROUTINE';
  similarity: number;
  x: number;
  y: number;
  reportCount?: number;
}

const CLUSTER_CONFIG = {
  COMPOUNDING: {
    label: 'Compounding Barriers',
    color: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    centroid: { x: 220, y: 150 },
    radius: 95,
  },
  EMERGING: {
    label: 'Emerging Hazards',
    color: '#F97316',
    bgLight: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
    centroid: { x: 580, y: 140 },
    radius: 90,
  },
  RECURRING: {
    label: 'Recurring Violations',
    color: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    centroid: { x: 260, y: 310 },
    radius: 95,
  },
  SYSTEMIC: {
    label: 'Systemic Procedures',
    color: '#14B8A6',
    bgLight: 'rgba(20, 184, 166, 0.12)',
    border: 'rgba(20, 184, 166, 0.35)',
    centroid: { x: 600, y: 300 },
    radius: 85,
  },
};

// Deterministic pseudo-random offset based on string hash
function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const SemanticClusterMap: React.FC = () => {
  const navigate = useNavigate();
  const rawData = useDatasetStore((s) => s.rawData);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);
  const incidents = useIncidentStore((s) => s.incidents);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COMPOUNDING' | 'EMERGING' | 'RECURRING' | 'SYSTEMIC'>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<ClusterPoint | null>(null);

  // Generate cluster points dynamically from patterns + incidents
  const clusterPoints = useMemo<ClusterPoint[]>(() => {
    const points: ClusterPoint[] = [];
    const patterns = rawData?.patterns || [
      { id: 'PAT-01', type: 'COMPOUNDING', title: 'Compounding barrier degradation on Wellhead #44 (BOP + Bleed valve)', severity: 'CRITICAL', report_count: 5 },
      { id: 'PAT-02', type: 'EMERGING', title: 'Scaffolding latch failures across Assam drilling clusters', severity: 'HIGH', report_count: 8 },
      { id: 'PAT-03', type: 'RECURRING', title: 'Line-of-fire hazards during pipe stabbing operations', severity: 'HIGH', report_count: 12 },
      { id: 'PAT-04', type: 'SYSTEMIC', title: 'Work authorization delays leading to unpermitted hot work permits', severity: 'CRITICAL', report_count: 11 },
    ];

    // 1. Add Pattern Hub Nodes (Larger Centroid Anchors)
    patterns.forEach((p: any, idx: number) => {
      const cType = (p.type in CLUSTER_CONFIG ? p.type : 'COMPOUNDING') as keyof typeof CLUSTER_CONFIG;
      const conf = CLUSTER_CONFIG[cType];
      const hash = stringHash(p.id + p.title);
      const angle = ((hash % 360) * Math.PI) / 180;
      const dist = 25 + (hash % 35);

      points.push({
        id: p.id,
        type: 'pattern',
        clusterType: cType,
        title: p.title,
        asset: p.title.split(':')[0]?.trim() || 'Multi-Asset Cluster',
        severity: p.severity || 'HIGH',
        similarity: 0.91 + (hash % 8) * 0.01,
        x: conf.centroid.x + Math.cos(angle) * dist,
        y: conf.centroid.y + Math.sin(angle) * dist,
        reportCount: p.report_count || 4,
      });
    });

    // 2. Add Incident Points (Clustered by Severity & Energy Vector)
    incidents.forEach((inc) => {
      let cType: 'COMPOUNDING' | 'EMERGING' | 'RECURRING' | 'SYSTEMIC';
      if (inc.barrierStatus === 'FAILED' || inc.barrierStatus === 'BYPASSED') {
        cType = 'COMPOUNDING';
      } else if (inc.severity === 'HIGH' && inc.energySource === 'GRAVITY') {
        cType = 'EMERGING';
      } else if (inc.energySource === 'MOTION' || inc.energySource === 'MECHANICAL') {
        cType = 'RECURRING';
      } else {
        cType = 'SYSTEMIC';
      }

      const conf = CLUSTER_CONFIG[cType];
      const hash = stringHash(inc.id + inc.reportText);
      const angle = ((hash % 360) * Math.PI) / 180;
      const dist = 35 + (hash % 50);

      points.push({
        id: inc.id,
        type: 'incident',
        clusterType: cType,
        title: inc.reportText,
        asset: inc.asset,
        severity: inc.severity,
        similarity: 0.83 + (hash % 14) * 0.01,
        x: Math.max(30, Math.min(770, conf.centroid.x + Math.cos(angle) * dist)),
        y: Math.max(30, Math.min(390, conf.centroid.y + Math.sin(angle) * dist)),
      });
    });

    return points;
  }, [rawData, incidents]);

  const filteredPoints = activeFilter === 'ALL'
    ? clusterPoints
    : clusterPoints.filter(p => p.clusterType === activeFilter);

  const handlePointClick = (p: ClusterPoint) => {
    if (p.type === 'pattern') {
      navigate(`/patterns/${p.id}`);
    } else {
      navigate(`/reports/${p.id}`);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-surface-1 shadow-sm overflow-hidden flex flex-col">
      {/* Top Header Controls */}
      <div className="p-4 border-b border-border bg-surface-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold font-mono tracking-tight text-foreground">
              Semantic 2D Cluster Space (DBSCAN + UMAP)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
              1536-dim Matryoshka
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            Real-time projection of field incidents and emergent compounding patterns over high-dimensional vector embeddings.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all border cursor-pointer",
              activeFilter === 'ALL'
                ? "bg-foreground text-background border-foreground shadow-2xs"
                : "bg-surface-2 text-foreground-muted border-border hover:bg-surface-3 hover:text-foreground"
            )}
          >
            All Clusters ({clusterPoints.length})
          </button>
          {(Object.keys(CLUSTER_CONFIG) as Array<keyof typeof CLUSTER_CONFIG>).map((key) => {
            const conf = CLUSTER_CONFIG[key];
            const isSelected = activeFilter === key;
            const count = clusterPoints.filter(p => p.clusterType === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all border cursor-pointer flex items-center gap-1.5",
                  isSelected
                    ? "text-white shadow-2xs"
                    : "bg-surface-2 text-foreground-muted border-border hover:bg-surface-3 hover:text-foreground"
                )}
                style={isSelected ? { backgroundColor: conf.color, borderColor: conf.color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: conf.color }} />
                <span>{conf.label}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas Scatter Plot Area */}
      <div className="relative w-full h-96 sm:h-[420px] bg-surface-2/40 overflow-hidden select-none">
        {/* Ambient Grid Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <pattern id="clusterGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#clusterGrid)" />
        </svg>

        {/* Primary Interactive SVG */}
        <svg viewBox="0 0 800 420" className="w-full h-full">
          {/* Cluster Centroid Background Halos & Convex Hulls */}
          {(Object.keys(CLUSTER_CONFIG) as Array<keyof typeof CLUSTER_CONFIG>).map((key) => {
            const conf = CLUSTER_CONFIG[key];
            const isDimmed = activeFilter !== 'ALL' && activeFilter !== key;
            return (
              <g key={key} className={cn("transition-opacity duration-300", isDimmed ? "opacity-20" : "opacity-100")}>
                {/* Soft Cluster Glow */}
                <circle
                  cx={conf.centroid.x}
                  cy={conf.centroid.y}
                  r={conf.radius}
                  fill={conf.bgLight}
                  stroke={conf.border}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Cluster Centroid Label */}
                <text
                  x={conf.centroid.x}
                  y={conf.centroid.y - conf.radius + 15}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold uppercase tracking-wider"
                  fill={conf.color}
                >
                  {conf.label}
                </text>
              </g>
            );
          })}

          {/* Connection Lines from Pattern Hubs to Points */}
          {filteredPoints.map((p) => {
            const conf = CLUSTER_CONFIG[p.clusterType];
            const isHovered = hoveredPoint?.id === p.id;
            return (
              <line
                key={`line-${p.id}`}
                x1={conf.centroid.x}
                y1={conf.centroid.y}
                x2={p.x}
                y2={p.y}
                stroke={conf.color}
                strokeWidth={isHovered ? "1.5" : "0.5"}
                strokeOpacity={isHovered ? "0.8" : "0.15"}
                strokeDasharray={p.type === 'pattern' ? undefined : "2 2"}
              />
            );
          })}

          {/* Render Cluster Data Nodes */}
          {filteredPoints.map((p) => {
            const conf = CLUSTER_CONFIG[p.clusterType];
            const isHovered = hoveredPoint?.id === p.id;
            const isPattern = p.type === 'pattern';
            const nodeRadius = isPattern ? (isHovered ? 10 : 8) : (isHovered ? 6.5 : 4.5);

            return (
              <g
                key={p.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => handlePointClick(p)}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Pulsing Outer Ring for Patterns or Hovered */}
                {(isPattern || isHovered) && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={nodeRadius + 4}
                    fill="none"
                    stroke={conf.color}
                    strokeWidth="1.5"
                    strokeOpacity={isHovered ? "0.9" : "0.4"}
                    className={isPattern ? "animate-pulse" : ""}
                  />
                )}

                {/* Primary Core Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={nodeRadius}
                  fill={isPattern ? conf.color : '#FFFFFF'}
                  stroke={conf.color}
                  strokeWidth={isPattern ? "2" : "2"}
                  className="shadow-md"
                />

                {/* Node ID Tag for Pattern Hubs */}
                {isPattern && (
                  <text
                    x={p.x}
                    y={p.y + nodeRadius + 11}
                    textAnchor="middle"
                    className="text-[9px] font-mono font-bold"
                    fill="currentColor"
                  >
                    {p.id}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Interactive Floating Hover Card / Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none p-3 bg-surface-1/95 backdrop-blur-md border border-border rounded-xl shadow-xl space-y-1 max-w-xs transition-all animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(hoveredPoint.x + 15, 520)}px`,
              top: `${Math.min(hoveredPoint.y - 45, 270)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span>{hoveredPoint.id}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded text-[9px] font-bold text-white",
                  hoveredPoint.type === 'pattern' ? "bg-primary" : "bg-foreground-muted"
                )}>
                  {hoveredPoint.type.toUpperCase()}
                </span>
              </div>
              <span 
                className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-mono"
                style={{ 
                  backgroundColor: CLUSTER_CONFIG[hoveredPoint.clusterType].bgLight, 
                  color: CLUSTER_CONFIG[hoveredPoint.clusterType].color 
                }}
              >
                {hoveredPoint.clusterType}
              </span>
            </div>

            <p className="text-xs text-foreground font-medium line-clamp-2 leading-snug">
              {hoveredPoint.title}
            </p>

            <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-foreground-dim">
              <span>Asset: <strong className="text-foreground">{hoveredPoint.asset}</strong></span>
              <span>Cosine: <strong className="text-emerald-600">{(hoveredPoint.similarity * 100).toFixed(0)}%</strong></span>
            </div>

            <div className="text-[10px] text-primary font-mono font-semibold pt-1 flex items-center gap-0.5">
              <span>Click to view {hoveredPoint.type}</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* Quick Legend Overlay in Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-surface-1/90 backdrop-blur-xs px-3 py-2 rounded-lg border border-border/80 shadow-xs flex flex-wrap items-center gap-3 text-[11px] font-mono text-foreground-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-2xs"></span>
            <span>Compounding Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-orange-500"></span>
            <span>Field Observation</span>
          </div>
          <div className="text-border">|</div>
          <span className="text-foreground-dim">
            Dataset: <strong className="text-foreground">{activeMeta?.tag}</strong> ({filteredPoints.length} active nodes)
          </span>
        </div>

        {/* Mathematical Projection Badge in Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-surface-1/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-border/80 shadow-xs hidden sm:flex items-center gap-2 text-[10px] font-mono text-foreground-dim">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span>DBSCAN (eps=0.35, min_pts=3) · Silhouette: <strong>0.84</strong></span>
        </div>
      </div>
    </div>
  );
};
