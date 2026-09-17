import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, LayoutDashboard, ShieldCheck, ArrowRight, MapPin, Sparkles, Satellite } from 'lucide-react';

export default function PortalSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8">
      {/* Header Branding */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
            P
          </div>
          <div>
            <h1 className="font-bold text-xl font-mono tracking-tight text-foreground">PrecursorAI</h1>
            <p className="text-xs text-foreground-muted">Operational Safety & SIF Intelligence System</p>
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
              onClick={() => navigate('/worker')}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Submit Field Report <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Higher Official / Management */}
          <div 
            onClick={() => navigate('/command-center')}
            className="p-6 bg-surface-1 border-2 border-border hover:border-primary rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-2xs">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                    HSSE Officer & Management
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-mono font-bold">
                    Full Suite
                  </span>
                </div>
                <p className="text-xs text-foreground-muted leading-relaxed font-sans">
                  Access the complete Command Center, live Mapbox satellite hazard heatmap, triage review queue, and SIF analytics.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60 text-xs font-mono text-foreground-dim">
                <div className="flex items-center gap-2">
                  <Satellite className="w-3.5 h-3.5 text-primary" /> Live 3D Satellite Map & Heatmap
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 3-Factor SIF Risk Engine
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-primary" /> Incident Triage & Alerts
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/command-center')}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              Open Command Center <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-foreground-dim">
        <span>PrecursorAI Platform · Oil & Natural Gas Operational Safety</span>
        <span>No Credentials Required · Direct Role Access</span>
      </div>
    </div>
  );
}
