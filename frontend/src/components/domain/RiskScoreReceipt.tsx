import React from 'react';

export const RiskScoreReceipt = ({ score = 70 }: { score?: number }) => (
  <div className="font-mono text-sm border border-gray-800 bg-black p-4 rounded text-gray-300 w-full max-w-[280px]">
    <div className="flex justify-between"><span>barrier_weight:</span><span className="text-red-400">+25</span></div>
    <div className="flex justify-between"><span>severity_weight:</span><span className="text-red-400">+30</span></div>
    <div className="flex justify-between"><span>sif_bonus:</span><span className="text-red-400">+20</span></div>
    <div className="flex justify-between"><span>confidence_penalty:</span><span className="text-green-400">-5</span></div>
    <div className="text-right text-gray-600">──</div>
    <div className="flex justify-between font-bold text-white mt-1">
      <span>total:</span>
      <span>{score} → <span className="text-orange-500">HIGH</span></span>
    </div>
  </div>
);