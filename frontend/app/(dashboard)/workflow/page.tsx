"use client";

import React from "react";

export default function WorkflowPage() {
  const steps = [
    { num: "01", title: "User Authentication", desc: "Argon2id password verification -> HTTP-only JWT Cookie issued", tech: "FastAPI + Next.js Middleware", status: "Active" },
    { num: "02", title: "Document Upload", desc: "Multipart form submission -> Extension & MIME Type (PDF, DOCX, XLSX) validation", tech: "Pydantic v2 + Next.js", status: "Active" },
    { num: "03", title: "Storage & Persistence", desc: "Save file to backend/uploads/{user_id}/ -> Record metadata in PostgreSQL", tech: "SQLAlchemy ORM + Local Filesystem", status: "Active" },
    { num: "04", title: "Redis Cache Invalidation", desc: "Invalidate cached document lists & statistics keys in Redis", tech: "Redis Client", status: "Active" },
    { num: "05", title: "External AI Queue Handoff", desc: "AI Lead Generation module reads stored document for external processing", tech: "Asynchronous Queue (AI Team)", status: "Future Integration" },
    { num: "06", title: "Dashboard Update", desc: "TanStack Query cache refetch -> Real-time UI updates", tech: "TanStack Query + Zustand", status: "Active" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          System Architecture & Workflow Engine
        </h2>
        <p className="text-sm text-slate-400">
          Visual representation of the end-to-end data pipeline from document upload to PostgreSQL metadata storage and Redis cache updates.
        </p>
      </div>

      {/* Demo callout box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            Interactive HTML Workflow Demo
          </h3>
          <p className="text-xs text-slate-300">
            A standalone interactive HTML prototype is available in your workspace root directory: <code className="text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded border border-purple-500/30">workflow-demo/index.html</code>.
          </p>
        </div>
      </div>

      {/* Step by step pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.num} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative group hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold font-mono text-indigo-400">
                {step.num}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                step.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              }`}>
                {step.status}
              </span>
            </div>

            <h4 className="text-base font-bold text-white">{step.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            <p className="text-[11px] font-mono font-semibold text-slate-500 pt-2 border-t border-slate-800">
              {step.tech}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
