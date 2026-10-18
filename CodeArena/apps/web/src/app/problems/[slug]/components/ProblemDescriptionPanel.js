import styles from "../page.module.css";
import { Icon } from "./WorkspacePrimitives";

export default function ProblemDescriptionPanel({
  problem,
  formattedDescription,
  testCases,
  pretty,
  onViewTestCase,
}) {
  return (
    <article className={styles.descriptionBody}>
      <div className={styles.problemTitleRow}>
        <h1>{problem.title}</h1>
      </div>

      <div className={styles.descriptionText}>
        {formattedDescription.map((line, index) =>
          line.trim() ? (
            <p key={`${index}-${line}`}>{line}</p>
          ) : (
            <div className={styles.textGap} key={`gap-${index}`} />
          )
        )}
      </div>

      {testCases.length > 0 && (
        <section className={styles.exampleSection}>
          <div className={styles.sectionHeading}>
            <h2>Examples</h2>
            <span>{testCases.length} public</span>
          </div>

          {testCases.slice(0, 3).map((item, index) => (
            <article className={styles.exampleCard} key={item.id ?? index}>
              <div className={styles.exampleTitle}>
                <strong>Example {index + 1}</strong>
                <button type="button" onClick={() => onViewTestCase(index)}>
                  View test case →
                </button>
              </div>

              <div className={styles.exampleField}>
                <span>Input</span>
                <pre>{pretty(item.input)}</pre>
              </div>

              <div className={styles.exampleField}>
                <span>Expected output</span>
                <pre>{pretty(item.expected_output)}</pre>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className={styles.notice}>
        <Icon name="info" size={15} />
        <p>
          Run evaluates public test cases. Submit evaluates public and hidden
          test cases.
        </p>
      </div>
    </article>
  );
}
