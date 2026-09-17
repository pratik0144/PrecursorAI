import React from 'react';
import { Settings as SettingsIcon, Sliders, Shield, Database, Cpu } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-4 bg-background text-foreground min-h-screen space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary" /> System & Ruleset Configuration
        </h1>
        <p className="text-xs text-foreground-muted mt-0.5">
          Manage deterministic threshold parameters, taxonomy mappings, and LLM provider endpoints.
        </p>
      </div>

      <div className="space-y-4">
        {/* Ruleset Configuration */}
        <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Sliders className="w-4 h-4 text-primary" /> Deterministic Ruleset Engine (v1.2.0)
          </div>
          <p className="text-xs text-foreground-muted leading-relaxed">
            All SIF precursor decisions are stamped with a Ruleset Version ID to guarantee identical results on re-evaluation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-surface-2 rounded-md border border-border space-y-1">
              <span className="text-foreground-dim text-[11px]">HIGH ENERGY THRESHOLD</span>
              <div className="font-bold text-foreground">1,500 Joules (CSRA)</div>
            </div>
            <div className="p-3 bg-surface-2 rounded-md border border-border space-y-1">
              <span className="text-foreground-dim text-[11px]">CONFIDENCE GATE MINIMUM</span>
              <div className="font-bold text-foreground">0.75 (Forces Review if lower)</div>
            </div>
            <div className="p-3 bg-surface-2 rounded-md border border-border space-y-1">
              <span className="text-foreground-dim text-[11px]">PATTERN RECURRENCE THRESHOLD</span>
              <div className="font-bold text-foreground">≥ 3 reports in 30 days</div>
            </div>
            <div className="p-3 bg-surface-2 rounded-md border border-border space-y-1">
              <span className="text-foreground-dim text-[11px]">VECTOR DIMENSION (MATRYOSHKA)</span>
              <div className="font-bold text-foreground">1536-dim HNSW Indexing</div>
            </div>
          </div>
        </div>

        {/* AI Provider Config */}
        <div className="p-5 bg-surface-1 border border-border rounded-lg shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Cpu className="w-4 h-4 text-primary" /> Active LLM Provider
          </div>
          <div className="flex items-center justify-between p-3 bg-surface-2 rounded-md border border-border text-xs font-mono">
            <div>
              <span className="font-bold text-foreground">Google Gemini 2.0 Flash</span>
              <div className="text-[11px] text-foreground-dim">Provider abstraction: GeminiProvider (fallback: Ollama on-prem)</div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
