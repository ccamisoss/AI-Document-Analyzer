import { useEffect, useMemo, useRef, useState } from "react";
import authService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { formatDate, sortAnalysesOldestFirst } from "../utils";

import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

import AnalysisResult from "../components/AnalysisResult";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
            sortAnalysesOldestFirst(loadedAnalyses)[0]
              .id,
          );
          navigate(
            `/documentDetail?id=${documentId}&analysis=${sortAnalysesOldestFirst(loadedAnalyses)[0].id}`,
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
        overflow: "hidden",
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
          minHeight: 0,
          flexShrink: 0,
          boxSizing: "border-box",
          paddingBottom: "1.5rem",
          height: "100vh",
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
            minHeight: 0,
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
              {/* Left panel */}
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

              {/* Right panel */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "45%",
                  minHeight: 0,
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
                      <AnalysisResult
                        analysis={analyses.find(
                          (analysis) => analysis.id === selectedAnalysisId,
                        )}
                        sortAnalysesOldestFirst={sortAnalysesOldestFirst}
                        setAnalyses={setAnalyses}
                        setSelectedAnalysisId={setSelectedAnalysisId}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
