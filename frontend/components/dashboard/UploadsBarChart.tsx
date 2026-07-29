"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { DailyUploadStat } from "@/lib/mock-data";

interface UploadsBarChartProps {
  data: DailyUploadStat[];
}

/**
 * UploadsBarChart Component
 * 
 * Future Integration:
 * Replace `data` prop with live response from FastAPI via TanStack Query:
 * `const { data = MOCK_UPLOADS_LAST_7_DAYS } = useQuery({ queryKey: ['analytics', 'uploads-7d'], queryFn: fetchWeeklyUploads });`
 */
export default function UploadsBarChart({ data }: UploadsBarChartProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Uploads (Last 7 Days)
          </h3>
          <p className="text-xs text-slate-400">
            Daily document upload volume over the past week
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">
          Weekly Activity
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="day"
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
              cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
            />
            <Bar dataKey="uploads" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === data.length - 1 ? "#818cf8" : "#4f46e5"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
