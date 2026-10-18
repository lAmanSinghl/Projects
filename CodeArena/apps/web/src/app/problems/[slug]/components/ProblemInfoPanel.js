import styles from "../page.module.css";
import { Difficulty, Icon } from "./WorkspacePrimitives";
import ProblemDescriptionPanel from "./ProblemDescriptionPanel";
import SubmissionResultPanel from "./SubmissionResultPanel";

export default function ProblemInfoPanel({
  problem,
  activeTab,
  setActiveTab,
  showResultTab,
  descriptionProps,
  submissionResultProps,
}) {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={activeTab === "description" ? styles.activeTab : ""}
            onClick={() => setActiveTab("description")}
          >
            <Icon name="file" />
            Description
          </button>

          {showResultTab && (
            <button
              type="button"
              className={activeTab === "result" ? styles.activeTab : ""}
              onClick={() => setActiveTab("result")}
            >
              <Icon name="check" />
              Result
            </button>
          )}
        </div>
        <Difficulty value={problem.difficulty} />
      </header>

      <div className={styles.leftBody}>
        {activeTab === "description" ? (
          <ProblemDescriptionPanel {...descriptionProps} />
        ) : (
          <SubmissionResultPanel {...submissionResultProps} />
        )}
      </div>
    </section>
  );
}
