"use client";

import React, { useState } from "react";
import Link from "next/link";

interface DocumentItem {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "XLSX";
  size: string;
  status: "PROCESSED" | "PENDING" | "ERROR";
  uploadedAt: string;
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: "doc-1", name: "Q3_Financial_Audit_Report.pdf", type: "PDF", size: "4.2 MB", status: "PROCESSED", uploadedAt: "2026-07-28 14:32" },
    { id: "doc-2", name: "Vendor_Contract_Agreement_2026.docx", type: "DOCX", size: "1.8 MB", status: "PROCESSED", uploadedAt: "2026-07-27 10:15" },
    { id: "doc-3", name: "Employee_Payroll_Summary_July.xlsx", type: "XLSX", size: "3.1 MB", status: "PENDING", uploadedAt: "2026-07-28 09:44" },
    { id: "doc-4", name: "Product_Roadmap_Q4_v2.pdf", type: "PDF", size: "8.6 MB", status: "PROCESSED", uploadedAt: "2026-07-25 16:20" },
    { id: "doc-5", name: "System_Architecture_Blueprint.docx", type: "DOCX", size: "2.4 MB", status: "PROCESSED", uploadedAt: "2026-07-24 11:05" },
    { id: "doc-6", name: "Q2_Sales_Projections.xlsx", type: "XLSX", size: "5.0 MB", status: "PROCESSED", uploadedAt: "2026-07-22 18:30" },
  ]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    }
  };

  const handleDownload = (name: string) => {
    alert(`Downloading ${name} (File download handler will stream from FastAPI backend).`);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "ALL" || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            My Documents
          </h2>
          <p className="text-sm text-slate-400">
            View, search, download, and manage your stored document metadata.
          </p>
        </div>

        <Link
          href="/upload"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all w-fit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Document
        </Link>
      </div>

      {/* Controls Bar: Search + Filter Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by document name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80 self-start md:self-auto">
          {["ALL", "PDF", "DOCX", "XLSX"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === type
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Filename</th>
                <th className="p-4">Format</th>
                <th className="p-4">File Size</th>
                <th className="p-4">Status</th>
                <th className="p-4">Uploaded At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold ${
                        doc.type === "PDF" ? "bg-red-500/10 text-red-400 border border-red-500/20" : doc.type === "DOCX" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {doc.type}
                      </span>
                      <span className="truncate max-w-sm">{doc.name}</span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{doc.type}</td>
                    <td className="p-4 text-slate-400">{doc.size}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        doc.status === "PROCESSED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{doc.uploadedAt}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc.name)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs transition-colors border border-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No documents found matching your filter criteria.
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
