"use client";

import React, { useState } from "react";
import { useAdminUsers, useToggleUserStatus, useUpdateUserRole } from "@/hooks/use-dashboard";

export default function UserManagementPage() {
  const { data: usersData, isLoading } = useAdminUsers();
  const toggleStatusMutation = useToggleUserStatus();
  const updateRoleMutation = useUpdateUserRole();

  const users = usersData?.items?.map((u: any) => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role as "ADMIN" | "USER",
    status: u.is_active ? "ACTIVE" : "DISABLED",
    totalDocs: u.total_documents,
    storageMb: (u.total_storage_bytes / (1024 * 1024)).toFixed(2),
    createdAt: new Date(u.created_at).toISOString().split("T")[0],
  })) || [];

  const handleToggleRole = (id: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (confirm(`Change role for this user to ${newRole}?`)) {
      updateRoleMutation.mutate({ userId: id, role: newRole });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextIsActive = currentStatus !== "ACTIVE";
    const actionStr = nextIsActive ? "enable" : "disable";
    if (confirm(`Are you sure you want to ${actionStr} this user account?`)) {
      toggleStatusMutation.mutate({ userId: id, isActive: nextIsActive });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            User Management Console
          </h2>
          <p className="text-sm text-slate-400">
            View all registered users, modify role permissions (ADMIN / USER), and manage account access status.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Files / Storage</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <p className="text-xs font-bold text-white">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === "ADMIN" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {u.totalDocs} files ({u.storageMb} MB)
                    </td>
                    <td className="p-4 text-slate-400">{u.createdAt}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          disabled={updateRoleMutation.isPending}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors disabled:opacity-50"
                          title="Toggle Role between ADMIN and USER"
                        >
                          Toggle Role
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          disabled={toggleStatusMutation.isPending}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors border disabled:opacity-50 ${
                            u.status === "ACTIVE" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No registered users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
