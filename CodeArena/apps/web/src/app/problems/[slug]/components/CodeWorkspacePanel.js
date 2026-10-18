import styles from "../page.module.css";
import CodeEditorPanel from "./CodeEditorPanel";
import ExecutionResultsPanel from "./ExecutionResultsPanel";
import { ResizeHandle } from "./WorkspacePrimitives";

export default function CodeWorkspacePanel({
  editorHeight,
  onResize,
  codeEditorProps,
  executionResultsProps,
}) {
  return (
    <section
      className={styles.editorStack}
      data-editor-stack
      style={{
        "--editor-height": `${editorHeight}%`,
        "--tests-height": `${100 - editorHeight}%`,
      }}
    >
      <CodeEditorPanel {...codeEditorProps} />
      <ResizeHandle
        direction="vertical"
        label="code and testcases panels"
        onPointerDown={(event) => onResize(event, "vertical")}
      />
      <ExecutionResultsPanel {...executionResultsProps} />
    </section>
  );
}
