import { HistoryItem as HistoryItemType } from "../types";
import { formatTimestamp } from "../utils/dateUtils";

interface HistoryItemProps {
  item: HistoryItemType;
  index: number;
  isCollapsed: boolean;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function HistoryItem({
  item,
  index,
  isCollapsed,
  isActive,
  isSelected,
  onClick,
  onContextMenu,
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
      <span className="history-url">{isCollapsed ? index + 1 : item.url}</span>
      {!isCollapsed && (
        <span className="history-timestamp">
          {formatTimestamp(item.timestamp)}
        </span>
      )}
    </div>
  );
}
