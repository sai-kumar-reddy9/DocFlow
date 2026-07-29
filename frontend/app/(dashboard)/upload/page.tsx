"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const allowedExtensions = [".pdf", ".docx", ".xlsx"];

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError("Invalid file format. Only PDF, DOCX, and XLSX files are permitted.");
      setSelectedFile(null);
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a valid document to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/documents");
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Upload Document
        </h2>
        <p className="text-sm text-slate-400">
          Upload your files (PDF, DOCX, or XLSX) to store on local filesystem and track metadata in PostgreSQL.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropzone Container */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`p-10 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-4 ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              Drag and drop your file here, or{" "}
              <label className="text-indigo-400 hover:text-indigo-300 cursor-pointer underline underline-offset-4">
                browse files
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </label>
            </p>
            <p className="text-xs text-slate-500">
              Supported Formats: PDF, DOCX, XLSX (Max size: 15 MB)
            </p>
          </div>

          {/* Allowed Format Badges */}
          <div className="flex gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono font-bold">.PDF</span>
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">.DOCX</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">.XLSX</span>
          </div>
        </div>

        {/* Selected File Card */}
        {selectedFile && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold uppercase">
                {selectedFile.name.split(".").pop()}
              </div>
              <div>
                <p className="text-xs font-semibold text-white truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors p-1"
            >
              Remove
            </button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Uploading document...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Start Upload & Store Metadata"}
        </button>
      </form>
    </div>
  );
}
