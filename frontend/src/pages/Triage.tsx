import React from 'react';
import { ReviewQueueTable } from '../components/domain/ReviewQueueTable';
import { LinkedFilterBar } from '../components/domain/LinkedFilterBar';

export default function Triage() {
  return (
    <div className="p-6 bg-background min-h-screen text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-mono">Triage Queue</h1>
        <div className="flex items-center space-x-2">
          <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-xs text-foreground-muted">Real-time Polling</span>
        </div>
      </div>
      <LinkedFilterBar />
      <div className="mt-6">
        <ReviewQueueTable />
      </div>
    </div>
  );
}