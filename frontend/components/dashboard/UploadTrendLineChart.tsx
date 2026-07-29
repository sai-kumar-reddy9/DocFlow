"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DailyTrendStat } from "@/lib/mock-data";

interface UploadTrendLineChartProps {
  data: DailyTrendStat[];
}

/**
 * UploadTrendLineChart Component
 * 
 * Future Integration:
 * Replace `data` prop with live response from FastAPI via TanStack Query:
 * `const { data = MOCK_DAILY_UPLOAD_TREND } = useQuery({ queryKey: ['admin', 'analytics', 'upload-trend'], queryFn: fetchDailyUploadTrend });`
 */
export default function UploadTrendLineChart({ data }: UploadTrendLineChartProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Daily Upload & Processing Trend
          </h3>
          <p className="text-xs text-slate-400">
            System document intake volume over the past 14 days
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">
          Platform Traffic
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="processedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.75rem",
                color: "#f8fafc",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              }}
            />
            <Area
              type="monotone"
              dataKey="uploads"
              name="Uploaded Files"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#uploadGradient)"
            />
            <Area
              type="monotone"
              dataKey="processed"
              name="Processed Metadata"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#processedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
