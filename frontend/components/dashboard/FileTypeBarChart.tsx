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
import { FileTypeStat } from "@/lib/mock-data";

interface FileTypeBarChartProps {
  data: FileTypeStat[];
}

/**
 * FileTypeBarChart Component
 * 
 * Future Integration:
 * Replace `data` prop with live response from FastAPI via TanStack Query:
 * `const { data = MOCK_DOCUMENTS_BY_FILE_TYPE } = useQuery({ queryKey: ['admin', 'analytics', 'file-types-bar'], queryFn: fetchGlobalFileTypeStats });`
 */
export default function FileTypeBarChart({ data }: FileTypeBarChartProps) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Platform File Format Breakdown
          </h3>
          <p className="text-xs text-slate-400">
            Total stored files grouped by format (PDF, DOCX, XLSX)
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
          Storage Breakdown
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={120}
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
              formatter={(value: any) => [`${value} files`, "Volume"]}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
