import { useState } from "react";
import { formatDate, sortAnalysesOldestFirst } from "../../utils";
import authService from "../../services/auth.service";
import styles from "./index.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import ScheduleIcon from "@mui/icons-material/Schedule";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function AnalysisResult({
  analysis,
  setAnalyses,
  setSelectedAnalysisId,
}) {
  const summary = analysis?.result?.summary;
  const keyPoints = analysis?.result?.keyPoints;
  const insights = analysis?.result?.insights;
  const notes = analysis?.result?.notes;
  const answers = analysis?.result?.answers;
  const userPrompt = analysis?.userPrompt;
  const createdAt = analysis?.createdAt;
  const [showUserPrompt, setShowUserPrompt] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState(null);

  const handleDeleteAnalysis = async (analysisId) => {
    if (!analysisId) return;

    setDeleteError(null);
    setDeletingAnalysisId(analysisId);

    try {
      const tokenNow = authService.getToken();
      if (!tokenNow) {
        throw new Error("You are not authenticated");
      }

      const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenNow}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          return;
        }
        throw new Error(
          data.error || data.message || "Failed to delete analysis",
        );
      }

      setAnalyses((prev) => {
        const next = prev.filter((a) => a.id !== analysisId);
        setSelectedAnalysisId((current) => {
          if (current !== analysisId) return current;
          return sortAnalysesOldestFirst(next)[0]?.id ?? null;
        });
        return next;
      });
    } catch (e) {
      setDeleteError(e.message || "Failed to delete analysis");
    } finally {
      setDeletingAnalysisId(null);
    }
  };

  const handleShowUserPrompt = () => {
    setShowUserPrompt(!showUserPrompt);
  };

  return (
    <>
      {/* Date and delete button */}
      <div className={styles.firstContainer}>
        <span className={styles.date}>
          <ScheduleIcon /> {formatDate(createdAt)}
        </span>
        <button
          className={styles.deleteButton}
          onClick={() => handleDeleteAnalysis(analysis.id)}
        >
          <DeleteIcon />
        </button>
      </div>

      <div className={styles.secondContainer}>
        {/* Sent Prompt */}
        {userPrompt && (
          <div className={styles.userPromptContainer}>
            <div>
              <span className={styles.userPromptHeader}>Sent Prompt</span>
              <button
                className={styles.userPromptButton}
                onClick={handleShowUserPrompt}
              >
                {showUserPrompt ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>
            </div>
            {showUserPrompt && (
              <div className={styles.userPromptContent}>
                <p>{userPrompt}</p>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        <div className={styles.resultContainer}>
          <h3 className={styles.resultHeader}>Result</h3>
          <div style={{ width: "100%" }}>
            {summary && summary.trim() && (
              <section className={styles.responseSection}>
                <div className={styles.summaryText}>
                  {summary.split("\n").map((line, idx) => (
                    <p key={idx}>{line || "\u00A0"}</p>
                  ))}
                </div>
              </section>
            )}

            {Array.isArray(keyPoints) && keyPoints.length > 0 && (
              <section className={styles.responseSection}>
                <span className={styles.sectionTitle}>Key Points</span>
                <ul className={styles.bulletList}>
                  {keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </section>
            )}

            {Array.isArray(insights) && insights.length > 0 && (
              <section className={styles.responseSection}>
                <h3 className={styles.sectionTitle}>Insights</h3>
                <ul className={styles.bulletList}>
                  {insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </section>
            )}

            {notes && String(notes).trim() && (
              <section className={styles.responseSection}>
                <h3 className={styles.sectionTitle}>Notes</h3>
                <p className={styles.notesText}>{notes}</p>
              </section>
            )}

            {Array.isArray(answers) && answers.length > 0 && (
              <section className={styles.responseSection}>
                <h3 className={styles.sectionTitle}>Answers</h3>
                <ol className={styles.numberedList}>
                  {answers.map((answer, idx) => (
                    <li key={idx}>{answer}</li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
