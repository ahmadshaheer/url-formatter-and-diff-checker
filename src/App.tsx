import { useState } from "react";
import "./App.css";
import { HistorySection } from "./components/HistorySection";
import { URLParser } from "./components/URLParser";
import { DiffViewer } from "./components/DiffViewer";
import { Header } from "./components/Header";
import { useHistory } from "./hooks/useHistory";
import { urlToReadableJson, computeUrlDiff } from "./utils/urlParser";
import { ParsedUrl, DiffResult } from "./types";

function App() {
  const { history, addToHistory, clearHistory } = useHistory();
  const [url, setUrl] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedUrl | null>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [activeTab, setActiveTab] = useState<"parser" | "diff">("parser");

  const parseUrl = () => {
    if (!url.trim()) return;
    const result = urlToReadableJson(url);
    setParsedResult(result);
    if (!result.error) {
      addToHistory(url);
    }
  };

  const startNewUrl = () => {
    if (url.trim()) {
      addToHistory(url);
    }
    setUrl("");
    setParsedResult(null);
    setActiveIndex(null);
    setActiveTab("parser");
  };

  const toggleItemSelection = (index: number) => {
    setSelectedItems((prev) => {
      const newSelection = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].slice(-2);

      if (newSelection.length < 2) {
        setDiffResult(null);
      } else {
        const [oldIndex, newIndex] = newSelection;
        const oldUrl = history[oldIndex].url;
        const newUrl = history[newIndex].url;
        const diff = computeUrlDiff(oldUrl, newUrl);
        setDiffResult(diff);
      }

      setActiveTab("diff");
      return newSelection;
    });
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      clearHistory();
      setSelectedItems([]);
      setActiveIndex(null);
      setDiffResult(null);
    }
  };

  return (
    <div className="container">
      <HistorySection
        history={history}
        isHistoryCollapsed={isHistoryCollapsed}
        selectedItems={selectedItems}
        activeIndex={activeIndex}
        onToggleCollapse={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
        onItemClick={(index) => {
          if (selectedItems.length > 0) {
            toggleItemSelection(index);
          } else {
            setUrl(history[index].url);
            setActiveIndex(index);
            setActiveTab("parser");
          }
        }}
        onItemContextMenu={toggleItemSelection}
        onNewUrl={startNewUrl}
        onClearHistory={handleClearHistory}
      />

      <div className="main-content">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "parser" && (
          <URLParser
            url={url}
            parsedResult={parsedResult}
            onUrlChange={setUrl}
            onParse={parseUrl}
          />
        )}

        {activeTab === "diff" && (
          <div className="tab-content">
            {selectedItems.length < 2 ? (
              <div className="diff-instructions">
                <p>Right-click two URLs from the history to compare them.</p>
                <p>Selected: {selectedItems.length}/2 URLs</p>
              </div>
            ) : (
              diffResult && <DiffViewer diffResult={diffResult} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
