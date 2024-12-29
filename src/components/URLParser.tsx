import "./URLParser.css";
import { ParsedUrl } from "../types";
import { JsonEditor } from "jsoneditor-react";
import "jsoneditor/dist/jsoneditor.css";
import ace from "brace";
import "jsoneditor-react/es/editor.min.css";
import "brace/mode/json";
import "brace/theme/github";
import "brace/theme/monokai";
import { useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface URLParserProps {
  url: string;
  parsedResult: ParsedUrl | null;
  onUrlChange: (url: string) => void;
  onParse: () => void;
  alert?: React.ReactNode;
  shouldFocus?: boolean;
}

// Add type for editor instance
type EditorType = InstanceType<typeof JsonEditor>;

export function URLParser({
  url,
  parsedResult,
  onUrlChange,
  onParse,
  alert,
  shouldFocus,
}: URLParserProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<EditorType>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        onParse();
      }
    };

    const textarea = textareaRef.current;
    textarea?.addEventListener("keydown", handleKeyDown);

    return () => {
      textarea?.removeEventListener("keydown", handleKeyDown);
    };
  }, [onParse]);

  useEffect(() => {
    if (shouldFocus) {
      textareaRef.current?.focus();
    }
  }, [shouldFocus]);

  useEffect(() => {
    // Small delay to ensure editor is mounted and initialized
    const timer = setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.expandAll();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [parsedResult]);

  return (
    <div className="tab-content">
      <textarea
        ref={textareaRef}
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Paste your URL here... (Ctrl+Enter to parse)"
      />
      <button className="parse-button" onClick={onParse}>
        Parse URL
      </button>
      {parsedResult && (
        <div className="json-editor-container">
          <JsonEditor
            key={JSON.stringify(parsedResult)}
            mode="tree"
            value={parsedResult}
            history
            onChange={() => {}}
            ace={ace}
            theme={theme === "dark" ? "ace/theme/monokai" : "ace/theme/github"}
            ref={editorRef}
          />
        </div>
      )}
      {alert}
    </div>
  );
}
