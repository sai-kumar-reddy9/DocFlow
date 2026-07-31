"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUserDocuments, useDeleteDocument } from "@/hooks/use-dashboard";

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const { data: docsData, isLoading } = useUserDocuments();
  const deleteMutation = useDeleteDocument();

  const documents = docsData?.items?.map((doc: any) => ({
    id: doc.id,
    name: doc.original_filename,
    type: doc.file_extension.replace(".", "").toUpperCase(),
    size: `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB`,
    status: doc.upload_status,
    uploadedAt: new Date(doc.created_at).toLocaleString(),
  })) || [];

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (id: string, filename: string) => {
    const downloadUrl = `http://localhost:8000/api/v1/documents/${id}/download`;
    window.open(downloadUrl, "_blank");
  };

  const filteredDocuments = documents.filter((doc: any) => {
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
          {["ALL", "PDF", "DOCX", "TXT"].map((type) => (
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading your documents...
                  </td>
                </tr>
              ) : filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc: any) => (
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
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{doc.uploadedAt}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc.id, doc.name)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleteMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs transition-colors border border-red-500/20 disabled:opacity-50"
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
