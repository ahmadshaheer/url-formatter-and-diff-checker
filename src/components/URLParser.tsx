import { ParsedUrl } from "../types";
import { JsonEditor as Editor } from "jsoneditor-react";
import "jsoneditor/dist/jsoneditor.css";
import ace from "brace";
import "jsoneditor-react/es/editor.min.css";
import "brace/mode/json";
import "brace/theme/github";

interface URLParserProps {
  url: string;
  parsedResult: ParsedUrl | null;
  onUrlChange: (url: string) => void;
  onParse: () => void;
  alert?: React.ReactNode;
}

export function URLParser({
  url,
  parsedResult,
  onUrlChange,
  onParse,
  alert,
}: URLParserProps) {
  return (
    <div className="tab-content">
      <textarea
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Paste your URL here..."
      />
      <button className="parse-button" onClick={onParse}>
        Parse URL
      </button>
      {parsedResult && (
        <div className="json-editor-container">
          <Editor
            mode="tree"
            value={parsedResult}
            history
            onChange={() => {}} // Read-only mode
            ace={ace}
            theme="ace/theme/github"
          />
        </div>
      )}
      {alert}
    </div>
  );
}
