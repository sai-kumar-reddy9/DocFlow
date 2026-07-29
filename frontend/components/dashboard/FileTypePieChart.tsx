"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FileTypeStat } from "@/lib/mock-data";

interface FileTypePieChartProps {
  data: FileTypeStat[];
}

/**
 * FileTypePieChart Component
 * 
 * Future Integration:
 * Replace `data` prop with live response from FastAPI via TanStack Query:
 * `const { data = MOCK_DOCUMENTS_BY_FILE_TYPE } = useQuery({ queryKey: ['analytics', 'file-types'], queryFn: fetchFileTypeDistribution });`
 */
export default function FileTypePieChart({ data }: FileTypePieChartProps) {
  const totalFiles = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Documents by File Type
          </h3>
          <p className="text-xs text-slate-400">
            Format breakdown across stored files ({totalFiles} total)
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">
          Formats
        </div>
      </div>

      <div className="h-64 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.75rem",
                color: "#f8fafc",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              }}
              formatter={(value: any) => [`${value} files`, "Count"]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string) => (
                <span className="text-xs font-medium text-slate-300 ml-1">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
