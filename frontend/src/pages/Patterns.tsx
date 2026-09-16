import React from 'react';
import { PatternCard } from '../components/domain/PatternCard';

export default function Patterns() {
  return (
    <div className="p-6 bg-background min-h-screen text-foreground">
      <h1 className="text-2xl font-mono mb-6">Patterns Intelligence</h1>
      <div className="mb-8 p-12 border border-border flex items-center justify-center text-foreground-muted rounded bg-surface-2">
        Semantic Cluster Visualization — Coming Soon
      </div>
      {['RECURRING', 'EMERGING', 'COMPOUNDING', 'SYSTEMIC'].map(type => (
        <div key={type} className="mb-8">
          <h2 className="text-lg mb-4 text-gray-300 border-b border-gray-800 pb-2">{type}</h2>
          <div className="grid grid-cols-3 gap-4">
            <PatternCard pattern={{ type, title: 'Sample Pattern for ' + type, severity: 'HIGH' }} />
          </div>
        </div>
      ))}
    </div>
  );
}