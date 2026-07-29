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
import { UserRoleStat } from "@/lib/mock-data";

interface UserRolesPieChartProps {
  data: UserRoleStat[];
}

/**
 * UserRolesPieChart Component
 * 
 * Future Integration:
 * Replace `data` prop with live response from FastAPI via TanStack Query:
 * `const { data = MOCK_USER_ROLES_DISTRIBUTION } = useQuery({ queryKey: ['admin', 'analytics', 'user-roles'], queryFn: fetchUserRolesDistribution });`
 */
export default function UserRolesPieChart({ data }: UserRolesPieChartProps) {
  const totalUsers = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            User Roles Distribution
          </h3>
          <p className="text-xs text-slate-400">
            Account role split across platform ({totalUsers} total)
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">
          RBAC Security
        </div>
      </div>

      <div className="h-64 w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
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
              formatter={(value: any) => [`${value} accounts`, "Total"]}
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
