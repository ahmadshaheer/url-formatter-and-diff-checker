import { HistoryItem as HistoryItemType } from "../types";
import { HistoryItem } from "./HistoryItem";

interface HistorySectionProps {
  history: HistoryItemType[];
  isHistoryCollapsed: boolean;
  selectedItems: number[];
  activeIndex: number | null;
  onToggleCollapse: () => void;
  onItemClick: (index: number) => void;
  onItemContextMenu: (index: number) => void;
  onNewUrl: () => void;
  onClearHistory: () => void;
}

export function HistorySection({
  history,
  isHistoryCollapsed,
  selectedItems,
  activeIndex,
  onToggleCollapse,
  onItemClick,
  onItemContextMenu,
  onNewUrl,
  onClearHistory,
}: HistorySectionProps) {
  return (
    <div className={`history-section ${isHistoryCollapsed ? "collapsed" : ""}`}>
      <div className="history-header">
        <button
          className="toggle-history"
          onClick={onToggleCollapse}
          title={isHistoryCollapsed ? "Expand history" : "Collapse history"}
        >
          {isHistoryCollapsed ? "→" : "←"}
        </button>
        <h3 className="history-title">Recent URLs</h3>
        <div className="history-buttons">
          <button className="new-url-button" onClick={onNewUrl} title="New URL">
            {isHistoryCollapsed ? "" : "New URL"}
          </button>
          <button
            className="clear-history"
            onClick={onClearHistory}
            title="Clear History"
          >
            {isHistoryCollapsed ? "" : "Clear History"}
          </button>
        </div>
      </div>
      <div className="history-list">
        {history.map((item, index) => (
          <HistoryItem
            key={index}
            item={item}
            index={index}
            isCollapsed={isHistoryCollapsed}
            isActive={activeIndex === index}
            isSelected={selectedItems.includes(index)}
            onClick={() => onItemClick(index)}
            onContextMenu={(e) => {
              e.preventDefault();
              onItemContextMenu(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}
