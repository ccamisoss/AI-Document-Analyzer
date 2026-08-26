import { useState } from "react";
import { formatDate } from "../utils";

import ScheduleIcon from "@mui/icons-material/Schedule";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function AnalysisResultRenderer({ analysis }) {
  const summary = analysis?.result?.summary;
  const keyPoints = analysis?.result?.keyPoints;
  const insights = analysis?.result?.insights;
  const notes = analysis?.result?.notes;
  const answers = analysis?.result?.answers;
  const userPrompt = analysis?.userPrompt;
  const createdAt = analysis?.createdAt;
  const [showUserPrompt, setShowUserPrompt] = useState(false);

  const handleShowUserPrompt = () => {
    setShowUserPrompt(!showUserPrompt);
  };

  return (
    <>
      {/* Date and delete button */}
      <div
        style={{
          padding: "1rem",
          borderBlock: "1px solid #2d2d2d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#4a5568",
            fontFamily: "monospace",
            fontSize: "0.8rem",
            margin: 0,
          }}
        >
          <ScheduleIcon /> {formatDate(createdAt)}
        </span>
        <button
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
          }}
          onClick={() => handleDeleteAnalysis(analysis.id)}
        >
          <DeleteIcon />
        </button>
      </div>

      <div
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          padding: "1rem",
        }}
      >
        {/* Sent Prompt */}
        {userPrompt && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #757575 ",
                borderRadius: "5px",
                padding: "0.5rem 1rem",
                boxSizing: "border-box",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                Sent Prompt
              </span>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                }}
                onClick={handleShowUserPrompt}
              >
                {showUserPrompt ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>
            </div>
            {showUserPrompt && (
              <div
                style={{
                  padding: "0.5rem 1rem",
                  boxSizing: "border-box",
                  border: "1px solid #757575",
                  borderRadius: "5px",
                  backgroundColor: "#1a1a1a",
                  maxHeight: "200px",
                  overflowY: "auto",
                  fontSize: "0.9rem",
                  scrollbarWidth: "thin",
                }}
              >
                <p style={{ color: "#ffffff" }}>{userPrompt}</p>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            boxSizing: "border-box",
            marginTop: "1.5rem",
          }}
        >
          <h3 style={{ margin: 0 }}>Result</h3>
          <div style={{ width: "100%" }}>
            {summary && summary.trim() && (
              <section className="response-section">
                <div className="summary-text">
                  {summary.split("\n").map((line, idx) => (
                    <p key={idx}>{line || "\u00A0"}</p>
                  ))}
                </div>
              </section>
            )}

            {Array.isArray(keyPoints) && keyPoints.length > 0 && (
              <section className="response-section">
                <span className="section-title">Key Points</span>
                <ul className="bullet-list">
                  {keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </section>
            )}

            {Array.isArray(insights) && insights.length > 0 && (
              <section className="response-section">
                <h3 className="section-title">Insights</h3>
                <ul className="bullet-list">
                  {insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </section>
            )}

            {notes && String(notes).trim() && (
              <section className="response-section">
                <h3 className="section-title">Notes</h3>
                <p className="notes-text">{notes}</p>
              </section>
            )}

            {Array.isArray(answers) && answers.length > 0 && (
              <section className="response-section">
                <h3 className="section-title">Answers</h3>
                <ol className="numbered-list">
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
