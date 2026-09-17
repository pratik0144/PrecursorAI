import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Analytics() {
  const lsrStats = [
    { rule: 'Line of Fire', count: 48, trend: '+12%', color: 'bg-red-500' },
    { rule: 'Energy Isolation (LOTO)', count: 34, trend: '+4%', color: 'bg-orange-500' },
    { rule: 'Bypassing Safety Controls', count: 28, trend: '-2%', color: 'bg-amber-500' },
    { rule: 'Safe Mechanical Lifting', count: 22, trend: '+8%', color: 'bg-amber-500' },
    { rule: 'Work Authorisation', count: 19, trend: '-5%', color: 'bg-teal-500' },
    { rule: 'Working at Height', count: 16, trend: '-10%', color: 'bg-teal-500' },
    { rule: 'Confined Space', count: 9, trend: '0%', color: 'bg-emerald-500' },
    { rule: 'Hot Work', count: 7, trend: '-14%', color: 'bg-emerald-500' },
    { rule: 'Driving Safety', count: 4, trend: '-20%', color: 'bg-emerald-500' },
  ];

  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-4">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Long-Term Safety Trends & Analytics
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Multi-month trend analysis across IOGP Life-Saving Rules, high-energy precursors, and location heatmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* IOGP Rules Bar Breakdown */}
        <div className="lg:col-span-8 bg-surface-1 border border-border rounded-lg shadow-sm p-5 space-y-4">
          <h3 className="font-mono text-xs font-semibold uppercase text-foreground-muted tracking-wider">
            IOGP 9 Life-Saving Rules Precursor Exposure
          </h3>
          <div className="space-y-3 pt-1">
            {lsrStats.map((lsr, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-foreground">{lsr.rule}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground-dim">{lsr.count} precursors</span>
                    <span className={`text-[10px] font-bold ${lsr.trend.startsWith('+') ? 'text-red-600' : 'text-emerald-600'}`}>
                      {lsr.trend}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className={`h-full ${lsr.color}`} style={{ width: `${(lsr.count / 48) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive SIF Reduction Target */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-1 border border-border rounded-lg shadow-sm p-5 space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase text-foreground-muted tracking-wider">
              Triage Performance KPIs
            </h3>
            <div className="space-y-3 pt-1 text-xs font-mono">
              <div className="p-3 bg-surface-2 rounded-md border border-border flex justify-between items-center">
                <span>Mean Time-to-Triage (MTTT)</span>
                <strong className="text-foreground text-sm">12.4 mins</strong>
              </div>
              <div className="p-3 bg-surface-2 rounded-md border border-border flex justify-between items-center">
                <span>AI Pipeline Latency</span>
                <strong className="text-foreground text-sm">1.8s avg</strong>
              </div>
              <div className="p-3 bg-surface-2 rounded-md border border-border flex justify-between items-center">
                <span>False-Positive Rate</span>
                <strong className="text-emerald-700 text-sm">3.2%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
