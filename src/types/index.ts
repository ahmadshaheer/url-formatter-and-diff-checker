export interface ParsedUrl {
  error?: string;
  baseUrl: string;
  params: Record<string, string | string[] | object>;
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
    added: Record<string, string | string[] | object>;
    removed: Record<string, string | string[] | object>;
    changed: Record<
      string,
      { old: string | string[] | object; new: string | string[] | object }
    >;
    unchanged: Record<string, string | string[] | object>;
  };
}

export type Theme = "light" | "dark";
