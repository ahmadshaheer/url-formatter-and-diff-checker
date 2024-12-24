import { ParsedUrl } from "../types";
import { formatJsonString } from "../utils/urlParser";

interface URLParserProps {
  url: string;
  parsedResult: ParsedUrl | null;
  onUrlChange: (url: string) => void;
  onParse: () => void;
}

export function URLParser({
  url,
  parsedResult,
  onUrlChange,
  onParse,
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
      {parsedResult && <pre>{formatJsonString(parsedResult)}</pre>}
    </div>
  );
}
