import React from 'react';

export const EnergyWheel = ({ activeSegments = [] }: { activeSegments?: string[] }) => (
  <div className="w-32 h-32 rounded-full border border-gray-700 flex flex-col items-center justify-center bg-gray-900 text-xs text-gray-400 text-center p-2 mx-auto">
    <span className="font-mono mb-1 text-white">ENERGY</span>
    {activeSegments.length ? activeSegments.join(', ') : 'NONE'}
  </div>
);