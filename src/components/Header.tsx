import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Plus } from "lucide-react";

interface HeaderProps {
  activeTab: "parser" | "diff";
  onTabChange: (tab: "parser" | "diff") => void;
  onNewUrl: () => void;
}

export function Header({ activeTab, onTabChange, onNewUrl }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>URL Parser</h1>
          <button className="new-url-button" onClick={onNewUrl} title="New URL">
            <Plus size={16} />
            <span>New URL</span>
          </button>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="theme-icon">
            {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
          </span>
          <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "parser" ? "active" : ""}`}
          onClick={() => onTabChange("parser")}
        >
          URL Parser
        </button>
        <button
          className={`tab ${activeTab === "diff" ? "active" : ""}`}
          onClick={() => onTabChange("diff")}
        >
          Diff Checker
        </button>
      </div>
    </>
  );
}
