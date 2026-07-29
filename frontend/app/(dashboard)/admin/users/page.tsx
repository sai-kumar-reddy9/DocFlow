"use client";

import React, { useState } from "react";

interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserAccount[]>([
    { id: "usr-1", fullName: "Alex Chen", email: "alex@docflow.io", role: "ADMIN", status: "ACTIVE", createdAt: "2026-01-15" },
    { id: "usr-2", fullName: "Sarah Jenkins", email: "sarah@company.com", role: "USER", status: "ACTIVE", createdAt: "2026-03-22" },
    { id: "usr-3", fullName: "Michael Scott", email: "michael@dunder.com", role: "USER", status: "DISABLED", createdAt: "2026-04-05" },
    { id: "usr-4", fullName: "Elena Rostova", email: "elena@techcorp.io", role: "USER", status: "ACTIVE", createdAt: "2026-06-12" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", role: "USER" as "ADMIN" | "USER" });

  const handleToggleRole = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: u.role === "ADMIN" ? "USER" : "ADMIN" } : u))
    );
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE" } : u))
    );
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this user account?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email) return;
    const created: UserAccount = {
      id: `usr-${Date.now()}`,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewUser({ fullName: "", email: "", role: "USER" });
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

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New User
        </button>
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
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
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
                  <td className="p-4 text-slate-400">{u.createdAt}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRole(u.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                        title="Toggle Role between ADMIN and USER"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
                          u.status === "ACTIVE" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                      >
                        {u.status === "ACTIVE" ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-colors border border-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New User Account</h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="jane@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "ADMIN" | "USER" })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
