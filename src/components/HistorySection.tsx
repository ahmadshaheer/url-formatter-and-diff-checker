import "./HistorySection.css";
import { HistoryItem as HistoryItemType } from "../types";
import { HistoryItem } from "./HistoryItem";
import { ChevronLeft, ChevronRight, Eraser } from "lucide-react";

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
  alert?: React.ReactNode;
  onDeleteItem: (index: number) => void;
}

export function HistorySection({
  history,
  isHistoryCollapsed,
  selectedItems,
  activeIndex,
  onToggleCollapse,
  onItemClick,
  onItemContextMenu,
  onClearHistory,
  alert,
  onDeleteItem,
}: HistorySectionProps) {
  return (
    <div className={`history-section ${isHistoryCollapsed ? "collapsed" : ""}`}>
      <div className="history-header">
        <button
          className="toggle-history"
          onClick={onToggleCollapse}
          title={isHistoryCollapsed ? "Expand history" : "Collapse history"}
        >
          {isHistoryCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
        <h3 className="history-title">Recent URLs</h3>
        <div className="history-buttons">
          {history.length > 0 && (
            <button
              className="clear-history"
              onClick={onClearHistory}
              title="Clear History"
            >
              {isHistoryCollapsed ? <Eraser size={16} /> : "Clear History"}
            </button>
          )}
        </div>
      </div>
      <div className="history-list">
        {history.map((item, index) => (
          <HistoryItem
            key={index}
            item={item}
            index={index}
            totalItems={history.length}
            isCollapsed={isHistoryCollapsed}
            isActive={activeIndex === index}
            isSelected={selectedItems.includes(index)}
            onClick={() => onItemClick(index)}
            onContextMenu={(e) => {
              e.preventDefault();
              onItemContextMenu(index);
            }}
            onDelete={() => onDeleteItem(index)}
            selectionLabel={
              selectedItems.includes(index)
                ? selectedItems.indexOf(index) === 0
                  ? "A"
                  : "B"
                : undefined
            }
          />
        ))}
      </div>
      {alert}
    </div>
  );
}
