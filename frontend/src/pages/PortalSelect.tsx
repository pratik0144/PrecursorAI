import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, LayoutDashboard, ShieldCheck, ArrowRight, MapPin, Sparkles, Satellite, Database, Loader2 } from 'lucide-react';
import { useDatasetStore, DATASETS, DatasetId } from '../stores/dataset-store';
import { cn } from '@/lib/utils';

export default function PortalSelect() {
  const navigate = useNavigate();
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const setActiveDataset = useDatasetStore((s) => s.setActiveDataset);
  const [selectedDataset, setSelectedDataset] = useState<DatasetId>(activeDatasetId || 'demo');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenCommandCenter = () => {
    setIsLoading(true);
    setActiveDataset(selectedDataset);
    setIsLoading(false);
    navigate('/command-center');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8">
      {/* Header Branding */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pb-6 border-b border-border">
        <div className="flex items-center gap-3.5">
          <img 
            src="/logo.png" 
            alt="PrecursorAI Logo" 
            className="w-11 h-11 object-contain shrink-0" 
          />
          <div className="flex flex-col">
            <img 
              src="/logo-name.png" 
              alt="PrecursorAI" 
              className="h-7 w-auto object-contain object-left" 
            />
            <p className="text-xs text-foreground-muted mt-0.5">Operational Safety & SIF Intelligence System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-mono font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live
          </span>
        </div>
      </div>

      {/* Main Role Selection Area */}
      <div className="max-w-4xl mx-auto w-full py-8 sm:py-12 space-y-8 text-center">
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full inline-block">
            Access Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            How would you like to continue?
          </h2>
          <p className="text-sm text-foreground-muted max-w-xl mx-auto">
            Select your role to proceed immediately. No login or signup required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
          {/* Card 1: Field Worker */}
          <div 
            onClick={() => navigate('/worker')}
            className="p-6 bg-surface-1 border-2 border-border hover:border-primary rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 group-hover:scale-105 transition-transform shadow-2xs">
                <HardHat className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                    Field Worker / Operator
                  </h3>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-[10px] font-mono font-bold">
                    Fast Report
                  </span>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed font-sans">
                  Quickly submit near-misses, unsafe conditions, or hazard observations directly from rigs or field sites.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60 text-xs font-mono text-foreground-dim">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Auto GPS Geotagging
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Instant Gemini AI Precursor Check
                </div>
                <div className="flex items-center gap-2">
                  <Satellite className="w-3.5 h-3.5 text-primary" /> Automatic Live Map Update
                </div>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); navigate('/worker'); }}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              Submit Field Report <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Higher Official / Management */}
          <div className="p-6 bg-surface-1 border-2 border-border rounded-xl shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shadow-2xs">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-mono text-foreground">
                    HSSE Officer & Management
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-mono font-bold">
                    Full Suite
                  </span>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed font-sans">
                  Access the Command Center with live satellite hazard map, triage queue, and SIF analytics.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60 text-xs font-mono text-foreground-dim">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 3-Factor SIF Risk Engine
                </div>
                <div className="flex items-center gap-2">
                  <Satellite className="w-3.5 h-3.5 text-primary" /> Live Satellite Map & Heatmap
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-primary" /> Select data source below
                </div>
              </div>

              {/* Dataset Selector */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <div className="text-[10px] font-mono font-bold text-foreground-muted uppercase tracking-wider">
                  Choose Data Source
                </div>
                <div className="space-y-1.5">
                  {DATASETS.map((ds) => (
                    <button
                      key={ds.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedDataset(ds.id); }}
                      className={cn(
                        "w-full p-2.5 rounded-lg border text-left transition-all flex items-center gap-3 cursor-pointer",
                        selectedDataset === ds.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-surface-2 hover:bg-surface-3"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                        selectedDataset === ds.id ? "border-primary" : "border-foreground-dim/40"
                      )}>
                        {selectedDataset === ds.id && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground">{ds.label}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border",
                            ds.id === 'demo' ? "bg-surface-2 text-foreground-dim border-border" :
                            ds.id === 'setA' ? "bg-violet-50 text-violet-700 border-violet-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          )}>{ds.tag}</span>
                        </div>
                        <p className="text-[10px] text-foreground-muted truncate">{ds.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenCommandCenter}
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Loading Dataset...</>
              ) : (
                <>Open Command Center <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-5xl mx-auto w-full pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-foreground-dim">
        <div>Deterministic Ruleset Engine · v1.2.0-prod</div>
        <div>Compliant with IOGP 9 Life-Saving Rules & OISD Standards</div>
      </div>
    </div>
  );
}
