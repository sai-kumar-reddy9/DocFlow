export interface DailyUploadStat {
  day: string;
  date?: string;
  uploads: number;
}

export interface FileTypeStat {
  name: string;
  value: number;
  color?: string;
}

export interface StorageStats {
  usedMb: number;
  totalMb: number;
  documentCount: number;
}

export interface DailyTrendStat {
  day: string;
  date?: string;
  uploads: number;
  processed?: number;
}

export interface UserRoleStat {
  name: string;
  value: number;
  color?: string;
}
