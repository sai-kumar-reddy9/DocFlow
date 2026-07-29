import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col justify-center items-center selection:bg-indigo-500 selection:text-white">
      <div className="max-w-3xl w-full space-y-8 text-center">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          DocFlow Platform Prototype
        </div>

        {/* Hero title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Secure Document Workflow Platform
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Enterprise document management built with Next.js 16 App Router, FastAPI, PostgreSQL, and Redis.
          </p>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Access Login Page &rarr;
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Explore Dashboard Prototype
          </Link>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 text-left">
          <Link href="/documents" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all group">
            <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">My Documents</h3>
            <p className="text-[11px] text-slate-400">View file lists & metadata</p>
          </Link>
          <Link href="/upload" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all group">
            <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Upload Document</h3>
            <p className="text-[11px] text-slate-400">PDF, DOCX, XLSX dropzone</p>
          </Link>
          <Link href="/workflow" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all group">
            <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">System Workflow</h3>
            <p className="text-[11px] text-slate-400">Architecture visualization</p>
          </Link>
          <Link href="/admin" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 transition-all group">
            <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Admin Console</h3>
            <p className="text-[11px] text-slate-400">Metrics & analytics</p>
          </Link>
          <Link href="/admin/users" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 transition-all group">
            <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">User Management</h3>
            <p className="text-[11px] text-slate-400">Roles & account permissions</p>
          </Link>
          <Link href="/admin/health" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 transition-all group">
            <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">System Health</h3>
            <p className="text-[11px] text-slate-400">Service diagnostics & logs</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
