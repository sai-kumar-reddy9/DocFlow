"use client";

import React, { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    maxFileSizeMb: 15,
    allowedFormats: ["PDF", "DOCX", "XLSX"],
    storagePath: "backend/uploads",
    redisCacheTTLSeconds: 3600,
    rateLimitRequestsPerMin: 60,
    cookieHttpOnly: true,
    cookieSecure: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Application Settings
        </h2>
        <p className="text-sm text-slate-400">
          Configure security protocols, storage parameters, and backend system thresholds.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Security Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
            Security & Authentication Protocols
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">HTTP-only Cookie Security</p>
                <p className="text-[11px] text-slate-400">Prevents XSS attacks by isolating JWT tokens from client scripts.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.cookieHttpOnly}
                onChange={(e) => setSettings({ ...settings, cookieHttpOnly: e.target.checked })}
                className="h-4 w-4 rounded bg-slate-900 border-slate-800 text-indigo-600 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <p className="text-xs font-semibold text-white">Argon2id Hashing Algorithm</p>
                <p className="text-[11px] text-slate-400">Memory-hard password hashing engine for enterprise protection.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
            Storage & Document Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Max Upload Limit (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSizeMb}
                onChange={(e) => setSettings({ ...settings, maxFileSizeMb: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Local Storage Subdirectory
              </label>
              <input
                type="text"
                value={settings.storagePath}
                onChange={(e) => setSettings({ ...settings, storagePath: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Redis Cache Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
            Redis Cache & Rate Limiting
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Cache TTL (Seconds)
              </label>
              <input
                type="number"
                value={settings.redisCacheTTLSeconds}
                onChange={(e) => setSettings({ ...settings, redisCacheTTLSeconds: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Rate Limit Threshold (req/min)
              </label>
              <input
                type="number"
                value={settings.rateLimitRequestsPerMin}
                onChange={(e) => setSettings({ ...settings, rateLimitRequestsPerMin: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/30"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
