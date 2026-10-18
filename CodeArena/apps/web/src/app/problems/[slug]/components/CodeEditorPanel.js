import styles from "../page.module.css";
import { Icon } from "./WorkspacePrimitives";

export default function CodeEditorPanel({
  language,
  languages,
  languageMeta,
  sourceCode,
  onSourceChange,
  onLanguageChange,
  onReset,
  busyMode,
  onRun,
  onSubmit,
}) {
  return (
    <section className={styles.editorPanel}>
      <header className={styles.panelHeader}>
        <div className={styles.editorTitle}>
          <span className={styles.liveDot} />
          <strong>Code</strong>
        </div>

        <button
          type="button"
          className={styles.resetButton}
          onClick={onReset}
          title="Restore the original starter code for this language"
        >
          Reset code
        </button>

        <label className={styles.languageSelect}>
          <span className={styles.srOnly}>Programming language</span>
          <select value={language} onChange={(event) => onLanguageChange(event.target.value)}>
            {languages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className={styles.editorInfo}>
        <span>main.{languageMeta?.extension}</span>
        <span>Editable source</span>
      </div>

      <div className={styles.codeEditor}>
        <div className={styles.lineNumbers} aria-hidden="true">
          {sourceCode.split("\n").map((_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>

        <textarea
          className={styles.codeInput}
          value={sourceCode}
          onChange={(event) => onSourceChange(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Source code editor"
          wrap="off"
        />
      </div>

      <div className={styles.editorFooter}>
        <span>
          <span className={styles.footerDot} />
          {languageMeta?.label}
        </span>
        <span>{sourceCode.split("\n").length} lines</span>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionHint}>
          {busyMode ? (
            <>
              <span className={styles.spinnerSmall} />
              {busyMode === "run" ? "Running public cases…" : "Submitting…"}
            </>
          ) : (
            <>
              <span className={styles.readyDot} />
              Ready to evaluate
            </>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button
            type="button"
            className={styles.runButton}
            disabled={Boolean(busyMode)}
            onClick={onRun}
          >
            <Icon name="play" size={14} />
            Run
          </button>

          <button
            type="button"
            className={styles.submitButton}
            disabled={Boolean(busyMode)}
            onClick={onSubmit}
          >
            <Icon name="send" size={14} />
            Submit
          </button>
        </div>
      </div>
    </section>
  );
}
