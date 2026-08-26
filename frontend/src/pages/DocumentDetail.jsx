import { useEffect, useMemo, useRef, useState } from "react";
import authService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { formatDate } from "../utils";

import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AnalysisResultRenderer({ analysis }) {
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
    <div style={{ overflowY: "auto", overflowX: "hidden", flex: 1 }}>
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
          {" "}
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

      {/* Sent Prompt */}
      {userPrompt && (
        <div
          style={{
            padding: "1rem",
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
              padding: "0.5rem",
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
          {!showUserPrompt && (
            <div
              style={{
                padding: "0.5rem",
                boxSizing: "border-box",
                border: "1px solid #757575",
                borderRadius: "5px",
                backgroundColor: "#1a1a1a",
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
          padding: "1rem",
          boxSizing: "border-box",
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
  );
}

function sortAnalysesOldestFirst(items) {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function AnalysisTabs({ analyses, selectedAnalysisId, onSelect }) {
  const scrollRef = useRef(null);

  const sortedAnalyses = useMemo(
    () => sortAnalysesOldestFirst(analyses),
    [analyses, sortAnalysesOldestFirst],
  );

  const scrollTabs = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 140, behavior: "smooth" });
  };

  return (
    <div className="analysis-tabs-bar">
      <button
        type="button"
        className="analysis-tabs-arrow"
        onClick={() => scrollTabs(-1)}
        disabled={
          selectedAnalysisId === sortedAnalyses[0].id ||
          sortedAnalyses.length === 1
        }
        aria-label="Scroll tabs left"
      >
        <ChevronLeftOutlinedIcon fontSize="small" />
      </button>
      <div className="analysis-tabs-scroll" ref={scrollRef}>
        {sortedAnalyses.map((analysis, idx) => {
          const isActive = selectedAnalysisId === analysis.id;
          const label = `Analysis ${analysis.id}`;

          return (
            <button
              key={analysis.id}
              type="button"
              className={`analysis-tab${isActive ? " analysis-tab--active" : ""}`}
              onClick={() => onSelect(analysis.id)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="analysis-tabs-arrow"
        onClick={() => scrollTabs(1)}
        disabled={
          selectedAnalysisId === sortedAnalyses[sortedAnalyses.length - 1].id ||
          sortedAnalyses.length === 1
        }
        aria-label="Scroll tabs right"
      >
        <ChevronRightOutlinedIcon fontSize="small" />
      </button>
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
  const { logout } = useSession();
  const params = new URLSearchParams(window.location.search);
  const documentId = params.get("id");
  const token = useMemo(() => authService.getToken(), []);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  const setAnalysis = (analysisId) => {
    setSelectedAnalysisId(analysisId);
    // change ulr id
    navigate(`/documentDetail?id=${documentId}&analysis=${analysisId}`);
  };

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
          logout();
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

        const loadedAnalyses = Array.isArray(analysesJson.data)
          ? analysesJson.data
          : [];
        setAnalyses(loadedAnalyses);
        const analysisId = params.get("analysis");
        if (analysisId) {
          setAnalysis(analysisId);
        }
        if (loadedAnalyses.length > 0) {
          setSelectedAnalysisId(
            sortAnalysesOldestFirst(loadedAnalyses)[loadedAnalyses.length - 1]
              .id,
          );
          navigate(
            `/documentDetail?id=${documentId}&analysis=${sortAnalysesOldestFirst(loadedAnalyses)[loadedAnalyses.length - 1].id}`,
          );
        }
      } catch (e) {
        console.log("Error loading document details:", e);
        setError(e.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    if (documentId) load();
  }, [documentId, token, logout]);

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
      setExpandedAnalysisId((prev) => (prev === analysisId ? null : prev));
    } catch (e) {
      setDeleteError(e.message || "Failed to delete analysis");
    } finally {
      setDeletingAnalysisId(null);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!documentId) return;

    try {
      const tokenNow = authService.getToken();
      if (!tokenNow) {
        throw new Error("You are not authenticated");
      }

      const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
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
          data.error || data.message || "Failed to delete document",
        );
      }

      navigate("/");
    } catch (e) {
      setDeleteError(e.message || "Failed to delete document");
    }
  };

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        alignSelf: "stretch",
        overflow: "auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          minHeight: "100%",
          flexShrink: 0,
          boxSizing: "border-box",
          paddingBottom: "1.5rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1rem 0.75rem 1rem",
            flexShrink: 0,
            backgroundColor: "white",
            borderBottom: "1px solid black",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <KeyboardBackspaceIcon />
          </button>
          <h1>Document Detail</h1>
        </div>
        <div
          style={{
            padding: "0 1.5rem",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* Loading and error messages */}
          {loading && <p style={{ color: "white" }}>Loading...</p>}
          {error && <p style={{ color: "white" }}>{error}</p>}
          {!loading && !error && !document && (
            <p style={{ color: "white" }}>Document not found.</p>
          )}

          {/* Document Preview */}
          {!loading && !error && document && (
            <div
              style={{
                background: "white",
                borderRadius: 5,
                width: "100%",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "row",
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "55%",
                  display: "flex",
                  flexDirection: "column",
                  borderRight: "1px solid #2d2d2d",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "1rem",
                    boxSizing: "border-box",
                    height: "70px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#2d3748",
                      fontSize: "1.25rem",
                    }}
                  >
                    {document.filename}
                  </span>
                  <button
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                    }}
                    onClick={() => handleDeleteDocument(document.id)}
                  >
                    <DeleteIcon />
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.9rem",
                    padding: "1rem 1rem 1rem 1rem",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    borderTop: "1px solid #2d2d2d",
                    height: "50px",
                  }}
                >
                  <span
                    style={{
                      color: "#4a5568",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <ScheduleIcon style={{ fontSize: "1.2rem" }} />{" "}
                    {formatDate(document.createdAt)}
                  </span>
                </div>
                <iframe
                  src={`${API_BASE_URL}/${document.path.replace("\\", "/")}`}
                  style={{
                    flex: 1,
                    border: "none",
                    borderBottomLeftRadius: "5px",
                  }}
                  title="PDF Preview"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "45%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    borderBottom: "1px solid #2d2d2d",
                    height: "71px",
                    boxSizing: "border-box",
                  }}
                >
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                    Analyses
                  </h2>
                  <button
                    onClick={() =>
                      navigate("/analyze", { state: { document } })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem",
                    }}
                  >
                    <AddOutlinedIcon /> New Analysis
                  </button>
                </div>
                {analyses.length === 0 ? (
                  <p style={{ padding: "1rem", margin: 0 }}>No analyses yet.</p>
                ) : (
                  <>
                    <AnalysisTabs
                      analyses={analyses}
                      selectedAnalysisId={selectedAnalysisId}
                      onSelect={setAnalysis}
                    />
                    {selectedAnalysisId && (
                      <AnalysisResultRenderer
                        analysis={analyses.find(
                          (analysis) => analysis.id === selectedAnalysisId,
                        )}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analyses list */}
      {/* {!loading && !error && document && (
        <>
          <div style={{ padding: "2rem" }}>
            

            {analyses.length === 0 && (
              <p style={{ color: "white" }}>No analyses yet.</p>
            )}

            {analyses.map((analysis, idx) => (
              <div
                key={analysis.id || idx}
                style={{
                  background: "white",
                  borderRadius: 5,
                  width: "100%",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
                  marginBottom: "1.25rem",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "#2d3748",
                    fontSize: "3rem",
                    paddingLeft: "1rem",
                  }}
                >
                  {analyses.length - idx}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    padding: "1rem",
                    flex: 1,
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      const id = analysis.id ?? String(idx);
                      setExpandedAnalysisId((prev) =>
                        prev === id ? null : id,
                      );
                    }}
                    onClick={() => {
                      const id = analysis.id ?? String(idx);
                      setExpandedAnalysisId((prev) =>
                        prev === id ? null : id,
                      );
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
                            <div>
                              <span
                                style={{
                                  color: "#4a5568",
                                  fontSize: "0.8rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <ScheduleIcon />{" "}
                                {formatDate(analysis.createdAt)}
                              </span>
                              
                            </div>

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
                                border: "none",
                                borderRadius: 5,
                                background: "transparent",
                                cursor:
                                  !analysis.id ||
                                  deletingAnalysisId === analysis.id
                                    ? "wait"
                                    : "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              <DeleteIcon color="error" />
                            </button>
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
                          <>
                            <span
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginTop: "0.75rem",
                              }}
                            >
                              User prompt:
                            </span>
                            <div
                              style={{
                                background: "#f7fafc",
                                border: "1px solid #e2e8f0",
                                padding: "0.75rem",
                                borderRadius: 5,
                                color: "#2d3748",
                                whiteSpace: "pre-wrap",
                                fontSize: "0.9rem",
                                lineHeight: 1.4,
                              }}
                            >
                              {analysis.userPrompt}
                            </div>
                          </>
                        ) : null}

                        <h2
                          className="response-title"
                          style={{ fontSize: "1.25rem" }}
                        >
                          Analysis Result
                        </h2>
                        <AnalysisResultRenderer result={analysis.result} />
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          {deleteError && <p style={{ color: "white" }}>{deleteError}</p>}
        </>
      )} */}
    </div>
  );
}
