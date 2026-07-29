/**
 * DocFlow Analytics Mock Data
 * 
 * NOTE: These mock data structures mirror the exact schema expected from future
 * FastAPI endpoints (`/api/v1/analytics/dashboard` and `/api/v1/admin/analytics`).
 * In future phases, TanStack Query (`useQuery`) will fetch live data from FastAPI and
 * replace these mock references seamlessly without modifying the Recharts components.
 */

// 1. User Dashboard: Uploads over the last 7 days
export interface DailyUploadStat {
  day: string;
  uploads: number;
}

export const MOCK_UPLOADS_LAST_7_DAYS: DailyUploadStat[] = [
  { day: "Mon", uploads: 8 },
  { day: "Tue", uploads: 12 },
  { day: "Wed", uploads: 5 },
  { day: "Thu", uploads: 15 },
  { day: "Fri", uploads: 10 },
  { day: "Sat", uploads: 6 },
  { day: "Sun", uploads: 9 },
];

// 2. Document Format Distribution (PDF, DOCX, XLSX)
export interface FileTypeStat {
  name: string;
  value: number;
  color: string;
}

export const MOCK_DOCUMENTS_BY_FILE_TYPE: FileTypeStat[] = [
  { name: "PDF Documents", value: 45, color: "#ef4444" },   // Red-500
  { name: "DOCX Files", value: 28, color: "#3b82f6" },       // Blue-500
  { name: "XLSX Spreadsheets", value: 17, color: "#10b981" }, // Emerald-500
];

// 3. User Storage Usage Statistics
export interface StorageStats {
  usedMb: number;
  totalMb: number;
  documentCount: number;
}

export const MOCK_STORAGE_STATS: StorageStats = {
  usedMb: 142.5,
  totalMb: 5120, // 5 GB limit
  documentCount: 48,
};

// 4. Admin Dashboard: 14-Day Upload & Processing Trend
export interface DailyTrendStat {
  date: string;
  uploads: number;
  processed: number;
}

export const MOCK_DAILY_UPLOAD_TREND: DailyTrendStat[] = [
  { date: "Jul 15", uploads: 24, processed: 22 },
  { date: "Jul 16", uploads: 32, processed: 30 },
  { date: "Jul 17", uploads: 18, processed: 18 },
  { date: "Jul 18", uploads: 45, processed: 42 },
  { date: "Jul 19", uploads: 29, processed: 28 },
  { date: "Jul 20", uploads: 51, processed: 48 },
  { date: "Jul 21", uploads: 38, processed: 36 },
  { date: "Jul 22", uploads: 42, processed: 40 },
  { date: "Jul 23", uploads: 60, processed: 58 },
  { date: "Jul 24", uploads: 48, processed: 45 },
  { date: "Jul 25", uploads: 35, processed: 35 },
  { date: "Jul 26", uploads: 28, processed: 27 },
  { date: "Jul 27", uploads: 54, processed: 50 },
  { date: "Jul 28", uploads: 68, processed: 65 },
];

// 5. Admin Dashboard: User Roles Distribution
export interface UserRoleStat {
  name: string;
  value: number;
  color: string;
}

export const MOCK_USER_ROLES_DISTRIBUTION: UserRoleStat[] = [
  { name: "Standard Users", value: 1185, color: "#6366f1" }, // Indigo-500
  { name: "System Administrators", value: 63, color: "#a855f7" }, // Purple-500
];

// 6. Admin System Quick Metrics
export interface AdminSystemMetrics {
  totalUsers: number;
  totalDocuments: number;
  uploadsToday: number;
  activeUsersToday: number;
  storageUsedGb: number;
  storageLimitGb: number;
}

export const MOCK_ADMIN_SYSTEM_METRICS: AdminSystemMetrics = {
  totalUsers: 1248,
  totalDocuments: 8920,
  uploadsToday: 68,
  activeUsersToday: 142,
  storageUsedGb: 34.2,
  storageLimitGb: 500.0,
};
