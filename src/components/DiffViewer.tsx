import "./DiffViewer.css";
import ReactDiffViewer from "react-diff-viewer-continued";
import { DiffResult } from "../types";
import { formatJsonString } from "../utils/urlParser";
import { useTheme } from "../context/ThemeContext";

interface DiffViewerProps {
  diffResult: DiffResult;
}

export function DiffViewer({ diffResult }: DiffViewerProps) {
  const { theme } = useTheme();

  const oldJson = {
    baseUrl: diffResult.base_url.old,
    params: {
      ...diffResult.params.unchanged,
      ...diffResult.params.removed,
      ...Object.fromEntries(
        Object.entries(diffResult.params.changed).map(([key, value]) => [
          key,
          value.old,
        ])
      ),
    },
  };

  const newJson = {
    baseUrl: diffResult.base_url.new,
    params: {
      ...diffResult.params.unchanged,
      ...diffResult.params.added,
      ...Object.fromEntries(
        Object.entries(diffResult.params.changed).map(([key, value]) => [
          key,
          value.new,
        ])
      ),
    },
  };

  return (
    <>
      <h3 className="diff-title">URL Comparison</h3>
      <div className="diff-result">
        <ReactDiffViewer
          oldValue={formatJsonString(oldJson)}
          newValue={formatJsonString(newJson)}
          splitView={true}
          useDarkTheme={theme === "dark"}
          hideLineNumbers={false}
          showDiffOnly={false}
          extraLinesSurroundingDiff={3}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: "var(--pre-bg)",
                diffViewerColor: "var(--text-color)",
                addedBackground: "#2d4b2d",
                addedColor: "#fff",
                removedBackground: "#4b2d2d",
                removedColor: "#fff",
                wordAddedBackground: "#357935",
                wordRemovedBackground: "#793535",
              },
              light: {
                diffViewerBackground: "var(--pre-bg)",
                diffViewerColor: "var(--text-color)",
                addedBackground: "#e6ffe6",
                addedColor: "#000",
                removedBackground: "#ffe6e6",
                removedColor: "#000",
                wordAddedBackground: "#ccffcc",
                wordRemovedBackground: "#ffcccc",
              },
            },
          }}
        />
      </div>
    </>
  );
}
