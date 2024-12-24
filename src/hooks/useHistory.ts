import { useState, useEffect } from "react";
import { HistoryItem } from "../types";

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("urlHistory") || "[]");
    setHistory(savedHistory);
  }, []);

  const addToHistory = (url: string) => {
    const newItem: HistoryItem = {
      url,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => {
      const newHistory = [newItem, ...prev];
      localStorage.setItem("urlHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("urlHistory");
  };

  return { history, addToHistory, clearHistory };
}
