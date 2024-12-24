import "./HistoryItem.css";
import { HistoryItem as HistoryItemType } from "../types";
import { formatTimestamp } from "../utils/dateUtils";
import { Trash2 } from "lucide-react";

interface HistoryItemProps {
  item: HistoryItemType;
  index: number;
  totalItems: number;
  isCollapsed: boolean;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDelete: () => void;
  selectionLabel?: "A" | "B";
}

export function HistoryItem({
  item,
  index,
  totalItems,
  isCollapsed,
  isActive,
  isSelected,
  onClick,
  onContextMenu,
  onDelete,
  selectionLabel,
}: HistoryItemProps) {
  return (
    <div
      className={`history-item ${isActive ? "active" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={item.url}
    >
      <span className="history-url">
        {selectionLabel && (
          <span className="selection-label" data-label={selectionLabel}>
            {selectionLabel}
          </span>
        )}
        {isCollapsed ? totalItems - index : item.url}
      </span>
      {!isCollapsed && (
        <>
          <span className="history-timestamp">
            {formatTimestamp(item.timestamp)}
          </span>
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
    </div>
  );
}
