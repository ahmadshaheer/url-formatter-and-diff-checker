import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Plus, Link, Clock } from "lucide-react";
import "./Header.css";

interface HeaderProps {
  activeTab: "parser" | "diff" | "timestamp";
  onTabChange: (tab: "parser" | "diff" | "timestamp") => void;
  onNewUrl: () => void;
}

export function Header({ activeTab, onTabChange, onNewUrl }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className="header">
        <div className="header-left">
          <div className="module-buttons">
            <button
              className={`module-button ${activeTab.startsWith("parser") || activeTab === "diff" ? "active" : ""}`}
              onClick={() => onTabChange("parser")}
              title="URL Parser"
            >
              <Link size={20} />
            </button>
            <button
              className={`module-button ${activeTab === "timestamp" ? "active" : ""}`}
              onClick={() => onTabChange("timestamp")}
              title="Timestamp Converter"
            >
              <Clock size={20} />
            </button>
          </div>
          {activeTab !== "timestamp" && (
            <button className="new-url-button" onClick={onNewUrl} title="New URL">
              <Plus size={16} />
              <span>New URL</span>
            </button>
          )}
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="theme-icon">
            {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
          </span>
          <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      {activeTab !== "timestamp" && (
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
      )}
    </>
  );
}
