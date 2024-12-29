import { useState, useEffect } from "react";
import "./App.css";
import { HistorySection } from "./components/HistorySection";
import { URLParser } from "./components/URLParser";
import { DiffViewer } from "./components/DiffViewer";
import { Header } from "./components/Header";
import { useHistory } from "./hooks/useHistory";
import { urlToReadableJson, computeUrlDiff } from "./utils/urlParser";
import { ParsedUrl, DiffResult } from "./types";
import { Alert } from "./components/Alert";

function App() {
  const {
    history,
    addToHistory,
    clearHistory,
    findDuplicateIndex,
    deleteHistoryItem,
    updateHistoryItem,
  } = useHistory();
  const [url, setUrl] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedUrl | null>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [activeTab, setActiveTab] = useState<"parser" | "diff">("parser");
  const [duplicateAlert, setDuplicateAlert] = useState<{
    url: string;
    index: number;
  } | null>(null);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<number | null>(null);
  const [shouldFocusTextarea, setShouldFocusTextarea] = useState(false);

  const handleAddUrl = (url: string) => {
    const duplicateIndex = findDuplicateIndex(url);
    if (duplicateIndex !== -1) {
      if (duplicateIndex === activeIndex) {
        updateHistoryItem(duplicateIndex, url);
      } else {
        setDuplicateAlert({ url, index: duplicateIndex });
      }
      return;
    }
    const newIndex = addToHistory(url);
    setActiveIndex(newIndex);
  };

  const handleSwitchToExisting = () => {
    if (duplicateAlert) {
      const { index } = duplicateAlert;
      setUrl(history[index].url);
      setActiveIndex(index);
      const result = urlToReadableJson(history[index].url);
      setParsedResult(result);
      setDuplicateAlert(null);
    }
  };

  const parseUrl = () => {
    if (!url.trim()) return;
    const result = urlToReadableJson(url);
    setParsedResult(result);
    if (!result.error) {
      if (activeIndex !== null) {
        updateHistoryItem(activeIndex, url);
      } else {
        handleAddUrl(url);
      }
    }
  };

  const startNewUrl = () => {
    setUrl("");
    setParsedResult(null);
    setActiveIndex(null);
    setActiveTab("parser");
    setShouldFocusTextarea(true);
  };

  useEffect(() => {
    if (shouldFocusTextarea) {
      setShouldFocusTextarea(false);
    }
  }, [shouldFocusTextarea]);

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
    setShowClearAlert(true);
  };

  const handleConfirmClear = () => {
    clearHistory();
    setSelectedItems([]);
    setActiveIndex(null);
    setDiffResult(null);
    setShowClearAlert(false);
    setUrl("");
    setParsedResult(null);
  };

  const handleDeleteItem = (index: number) => {
    setDeleteAlert(index);
  };

  const handleConfirmDelete = () => {
    if (deleteAlert !== null) {
      deleteHistoryItem(deleteAlert);
      if (activeIndex === deleteAlert) {
        setActiveIndex(null);
        setUrl("");
        setParsedResult(null);
      }
      if (selectedItems.includes(deleteAlert)) {
        setSelectedItems([]);
        setDiffResult(null);
      }
      setDeleteAlert(null);
    }
  };

  const exitDiffMode = () => {
    setSelectedItems([]);
    setDiffResult(null);
    setActiveTab("parser");
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
            const selectedUrl = history[index].url;
            setUrl(selectedUrl);
            setActiveIndex(index);
            setActiveTab("parser");
            const result = urlToReadableJson(selectedUrl);
            setParsedResult(result);
          }
        }}
        onItemContextMenu={toggleItemSelection}
        onNewUrl={startNewUrl}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteItem}
      />

      <div className="main-content">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewUrl={startNewUrl}
        />

        {activeTab === "parser" && (
          <URLParser
            url={url}
            parsedResult={parsedResult}
            onUrlChange={setUrl}
            onParse={parseUrl}
            shouldFocus={shouldFocusTextarea}
          />
        )}

        {activeTab === "diff" && (
          <div className="tab-content">
            {selectedItems.length < 2 ? (
              <div className="diff-instructions">
                <p>Right-click two URLs from the history to compare them.</p>
                <p>Selected: {selectedItems.length}/2 URLs</p>
                {selectedItems.length > 0 && (
                  <button className="cancel-diff-button" onClick={exitDiffMode}>
                    Clear Selection
                  </button>
                )}
              </div>
            ) : (
              <div className="diff-container">
                <div className="diff-header">
                  <button className="exit-diff-button" onClick={exitDiffMode}>
                    Exit Diff Checker
                  </button>
                </div>
                {diffResult && <DiffViewer diffResult={diffResult} />}
              </div>
            )}
          </div>
        )}
      </div>

      {showClearAlert && (
        <Alert
          message="Are you sure you want to clear all history?"
          onYes={handleConfirmClear}
          onNo={() => setShowClearAlert(false)}
        />
      )}
      {duplicateAlert && (
        <Alert
          message={`This URL already exists as item #${
            history.length - duplicateAlert.index
          } in the sidebar.`}
          onYes={() => {
            addToHistory(duplicateAlert.url);
            setActiveIndex(0);
            setDuplicateAlert(null);
          }}
          onNo={() => {
            handleSwitchToExisting();
            setDuplicateAlert(null);
          }}
        />
      )}
      {deleteAlert !== null && (
        <Alert
          message={`Are you sure you want to delete this URL?`}
          onYes={handleConfirmDelete}
          onNo={() => setDeleteAlert(null)}
        />
      )}
    </div>
  );
}

export default App;
