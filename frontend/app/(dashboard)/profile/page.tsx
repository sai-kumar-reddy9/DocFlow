"use client";

import React, { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john@docflow.io",
    role: "ADMIN",
    department: "Software Architecture",
    notifications: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          User Profile
        </h2>
        <p className="text-sm text-slate-400">
          Manage your account credentials, role details, and personal preferences.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          Profile settings updated successfully!
        </div>
      )}

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        {/* Avatar header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
            JD
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{profile.fullName}</h3>
            <p className="text-xs text-slate-400">{profile.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold">
              {profile.role}
            </span>
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Department
            </label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
