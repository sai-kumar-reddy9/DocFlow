"use client";

import React from "react";
import { StorageStats } from "@/types/dashboard";

interface StorageProgressCardProps {
  stats: StorageStats;
}

export default function StorageProgressCard({ stats }: StorageProgressCardProps) {
  const percentage = Math.min(Math.round((stats.usedMb / stats.totalMb) * 100), 100);
  const availableMb = Math.max(stats.totalMb - stats.usedMb, 0);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Storage Usage
          </h3>
          <p className="text-xs text-slate-400">
            Account storage quota and file count
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold">
          Capacity
        </div>
      </div>

      {/* Numerical overview */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {stats.usedMb.toFixed(1)} <span className="text-sm font-normal text-slate-400">MB</span>
          </span>
          <span className="text-xs text-slate-500 block">
            of {(stats.totalMb / 1024).toFixed(1)} GB allocated
          </span>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-indigo-400">
            {percentage}%
          </span>
          <span className="text-[11px] text-slate-400 block font-medium">Used</span>
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
          <span>Available: {(availableMb / 1024).toFixed(2)} GB</span>
          <span>{stats.documentCount} Files Tracked</span>
        </div>
      </div>
    </div>
  );
}
