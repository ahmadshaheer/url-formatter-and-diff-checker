export interface ParsedUrl {
  base_url: string;
  params: Record<string, any>;
  error?: string;
}

export interface HistoryItem {
  url: string;
  timestamp: string;
}

export interface DiffResult {
  base_url: {
    old: string;
    new: string;
    changed: boolean;
  };
  params: {
    added: Record<string, any>;
    removed: Record<string, any>;
    changed: Record<string, { old: any; new: any }>;
    unchanged: Record<string, any>;
  };
}

export type Theme = "light" | "dark";
