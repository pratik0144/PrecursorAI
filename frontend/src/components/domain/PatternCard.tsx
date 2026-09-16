import React from 'react';

export const PatternCard = ({ pattern }: { pattern: any }) => (
  <div className="border border-gray-800 bg-black p-4 rounded text-sm text-gray-300 hover:border-gray-600 transition-colors cursor-pointer">
    <div className="flex justify-between items-start mb-3">
      <span className="px-2 py-0.5 bg-gray-900 text-[10px] font-mono border border-gray-800 rounded text-gray-400">{pattern?.type}</span>
      <span className="text-[10px] font-mono font-bold text-orange-400">{pattern?.severity}</span>
    </div>
    <h4 className="font-bold text-white mb-2">{pattern?.title || 'Unknown Pattern'}</h4>
    <div className="flex justify-between items-center text-xs text-gray-500 mt-4 font-mono">
      <span>12 INCIDENTS</span>
      <span>TREND: ↗</span>
    </div>
  </div>
);