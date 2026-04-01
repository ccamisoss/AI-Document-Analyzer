import { useEffect, useMemo, useState } from "react";
import authService from "../services/auth.service";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function AnalysisResultRenderer({ result }) {
  const summary = result?.summary;
  const keyPoints = result?.keyPoints;
  const insights = result?.insights;
  const notes = result?.notes;
  const answers = result?.answers;

  if (!summary && !keyPoints && !insights && !notes && !answers) {
    return null;
  }

  return (
    <div
      className="response-panel success-panel"
      style={{ width: "100%", marginTop: "1rem" }}
    >
      <h2 className="response-title" style={{ fontSize: "1.25rem" }}>
        Analysis Result
      </h2>

      {summary && summary.trim() && (
        <section className="response-section">
          <h3 className="section-title">Summary</h3>
          <div className="summary-text">
            {summary.split("\n").map((line, idx) => (
              <p key={idx}>{line || "\u00A0"}</p>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(keyPoints) && keyPoints.length > 0 && (
        <section className="response-section">
          <h3 className="section-title">Key Points</h3>
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
  );
}

export default function DocumentDetail() {
  const [document, setDocument] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState(null);
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const documentId = params.get("id");
  const token = useMemo(() => authService.getToken(), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!token) {
          console.log("No token found, redirecting to login...");
          throw new Error("You are not authenticated");
        }

        const [docsRes, analysesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/documents`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/documents/${documentId}/analyses`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (docsRes.status === 401 || analysesRes.status === 401) {
          authService.logout();
          window.location.reload();
          return;
        }

        const docsJson = await docsRes.json();
        if (!docsRes.ok) {
          throw new Error(
            docsJson.error || docsJson.message || "Failed to load document",
          );
        }

        const found = (Array.isArray(docsJson.data) ? docsJson.data : []).find(
          (d) => String(d.id) === String(documentId),
        );
        setDocument(found || null);

        const analysesJson = await analysesRes.json();
        if (!analysesRes.ok) {
          throw new Error(
            analysesJson.error ||
              analysesJson.message ||
              "Failed to load analyses",
          );
        }

        setAnalyses(Array.isArray(analysesJson.data) ? analysesJson.data : []);
      } catch (e) {
        console.log("Error loading document details:", e);
        setError(e.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    if (documentId) load();
  }, [documentId, token]);

  useEffect(() => {
    setExpandedAnalysisId(null);
    setDeleteError(null);
    setDeletingAnalysisId(null);
  }, [documentId]);

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
          authService.logout();
          window.location.reload();
          return;
        }
        throw new Error(
          data.error || data.message || "Failed to delete analysis",
        );
      }

      setAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
      setExpandedAnalysisId((prev) => (prev === analysisId ? null : prev));
    } catch (e) {
      setDeleteError(e.message || "Failed to delete analysis");
    } finally {
      setDeletingAnalysisId(null);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 1000, padding: "0 1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.5rem 1rem",
            background: "white",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
          }}
        >
          Back to Dashboard
        </button>
      </div>

      <h1 style={{ margin: "1.5rem 0 1rem", color: "white" }}>
        Document Detail
      </h1>

      {loading && <p style={{ color: "white" }}>Loading...</p>}
      {error && <p style={{ color: "white" }}>{error}</p>}

      {!loading && !error && !document && (
        <p style={{ color: "white" }}>Document not found.</p>
      )}

      {!loading && !error && document && (
        <>
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: "1rem",
              width: "100%",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#2d3748" }}>
                  {document.filename.split(".")[0]}
                </div>
                <div style={{ color: "#4a5568", fontSize: "0.9rem" }}>
                  Created: {formatDate(document.createdAt)}
                </div>
              </div>
              <div
                style={{
                  color: "#4a5568",
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                }}
              >
                Updated: {formatDate(document.updatedAt)}
              </div>
              <iframe
                src={`${API_BASE_URL}/${document.path.replace("\\", "/")}`}
                width="100%"
                height="600px"
              />
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ margin: "0 0 1rem", color: "white" }}>Analyses</h2>

            {analyses.length === 0 && (
              <p style={{ color: "white" }}>No analyses yet.</p>
            )}

            {analyses.map((analysis, idx) => (
              <div
                key={analysis.id || idx}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "1rem",
                  width: "100%",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    const id = analysis.id ?? String(idx);
                    setExpandedAnalysisId((prev) => (prev === id ? null : id));
                  }}
                  onClick={() => {
                    const id = analysis.id ?? String(idx);
                    setExpandedAnalysisId((prev) => (prev === id ? null : id));
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {(() => {
                    const id = analysis.id ?? String(idx);
                    const isOpen = expandedAnalysisId === id;
                    const summary = analysis?.result?.summary;
                    const summarySnippet =
                      typeof summary === "string"
                        ? summary.trim().slice(0, 180)
                        : "";

                    return (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "1rem",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: "#2d3748" }}>
                              Analysis #{analyses.length - idx}
                            </div>
                            <div
                              style={{ color: "#4a5568", fontSize: "0.9rem" }}
                            >
                              Created: {formatDate(analysis.createdAt)}
                            </div>
                            <div
                              style={{ color: "#4a5568", fontSize: "0.9rem" }}
                            >
                              Prompt Version: {analysis.promptVersion}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 8,
                            }}
                          >
                            {analysis.userPrompt ? (
                              <div
                                style={{
                                  color: "#4a5568",
                                  fontSize: "0.85rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                User prompt: yes
                              </div>
                            ) : (
                              <div
                                style={{
                                  color: "#4a5568",
                                  fontSize: "0.85rem",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                User prompt: no
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!analysis.id) return;
                                handleDeleteAnalysis(analysis.id);
                              }}
                              disabled={
                                !analysis.id ||
                                deletingAnalysisId === analysis.id
                              }
                              style={{
                                padding: "0.35rem 0.6rem",
                                background:
                                  deletingAnalysisId === analysis.id
                                    ? "#fed7d7"
                                    : "#e53e3e",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                cursor:
                                  !analysis.id ||
                                  deletingAnalysisId === analysis.id
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              {deletingAnalysisId === analysis.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>

                        {summarySnippet && !isOpen && (
                          <div
                            style={{
                              marginTop: 10,
                              color: "#4a5568",
                              fontSize: "0.95rem",
                              lineHeight: 1.4,
                              maxHeight: 56,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {summarySnippet}
                            {String(summary).length > 180 ? "..." : ""}
                          </div>
                        )}

                        <div
                          style={{
                            marginTop: 10,
                            color: "#718096",
                            fontSize: "0.9rem",
                          }}
                        >
                          {isOpen ? "Hide details" : "Show details"}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {(() => {
                  const id = analysis.id ?? String(idx);
                  const isOpen = expandedAnalysisId === id;
                  if (!isOpen) return null;

                  return (
                    <>
                      {analysis.userPrompt ? (
                        <div
                          style={{
                            marginTop: "0.75rem",
                            background: "#f7fafc",
                            border: "1px solid #e2e8f0",
                            padding: "0.75rem",
                            borderRadius: 10,
                            color: "#2d3748",
                            whiteSpace: "pre-wrap",
                            fontSize: "0.9rem",
                            lineHeight: 1.4,
                          }}
                        >
                          {analysis.userPrompt}
                        </div>
                      ) : null}

                      <AnalysisResultRenderer result={analysis.result} />
                    </>
                  );
                })()}
              </div>
            ))}
          </div>

          {deleteError && <p style={{ color: "white" }}>{deleteError}</p>}
        </>
      )}
    </div>
  );
}
