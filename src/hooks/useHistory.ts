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

    const newIndex = 0; // Index will be 0 since we add to the start
    setHistory((prev) => {
      const newHistory = [newItem, ...prev];
      localStorage.setItem("urlHistory", JSON.stringify(newHistory));
      return newHistory;
    });
    return newIndex;
  };

  const findDuplicateIndex = (url: string): number => {
    return history.findIndex((item) => item.url === url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("urlHistory");
  };

  const deleteHistoryItem = (index: number) => {
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory.splice(index, 1);
      localStorage.setItem("urlHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const updateHistoryItem = (index: number, url: string) => {
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory[index] = {
        url,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("urlHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    findDuplicateIndex,
    deleteHistoryItem,
    updateHistoryItem,
  };
}
