import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Branding Side Panel - Hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-12 flex-col justify-between border-r border-slate-800/60">
        {/* Animated Background Decorative Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DocFlow
            </span>
          </Link>
        </div>

        {/* Hero Copy & Value Proposition */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Secure Document Workflow Platform
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight text-white tracking-tight">
            Streamline your documents and team workflows.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Manage your assets, centralize operations, and process document workflows in one secure, high-performance platform.
          </p>

          {/* Testimonial / Highlight Box */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3">
            <p className="text-sm italic text-slate-300">
              &ldquo;DocFlow transformed how our team shares documents and manages administrative tasks across projects.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center font-semibold text-xs text-white">
                AK
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Alex Chen</p>
                <p className="text-xs text-slate-400">Head of Operations at CloudScale</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} DocFlow Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">DocFlow</span>
          </Link>
        </div>

        {/* Main Auth Content (Login or Signup Form) */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {children}
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden text-center text-xs text-slate-500 pt-6">
          &copy; {new Date().getFullYear()} DocFlow Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
