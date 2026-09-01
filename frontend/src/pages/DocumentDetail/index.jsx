import { useEffect, useMemo, useRef, useState } from "react";
import authService from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { formatDate, sortAnalysesOldestFirst } from "../../utils";
import styles from "./index.module.css";

import AnalysisResult from "../../components/AnalysisResult";
import AnalysisTabs from "../../components/AnalysisTabs";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";

import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DocumentDetail() {
  const [document, setDocument] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          setSelectedAnalysisId(sortAnalysesOldestFirst(loadedAnalyses)[0].id);
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
    } catch (e) {}
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.subContainer}>
        {/* Header */}
        <div className={styles.headerContainer}>
          <button onClick={() => navigate("/")}>
            <KeyboardBackspaceIcon />
          </button>
          <h1>Document Detail</h1>
        </div>

        <div className={styles.contentContainer}>
          {/* Loading and error messages */}
          {loading && <Loader />}
          {error && <ErrorMessage isFullHeight={true} message={error} />}
          {!loading && !error && !document && (
            <ErrorMessage isFullHeight={true} message="Document not found." />
          )}

          {/* Document Preview */}
          {!loading && !error && document && (
            <div className={styles.whiteContainer}>
              {/* Left panel */}
              <div className={styles.leftPanel}>
                <div className={styles.leftPanelHeaderContainer}>
                  <span>{document.filename}</span>
                  <button onClick={() => handleDeleteDocument(document.id)}>
                    <DeleteIcon />
                  </button>
                </div>
                <div className={styles.leftPanelDateContainer}>
                  <span>
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
              <div className={styles.rightPanel}>
                <div className={styles.rightPanelHeaderContainer}>
                  <h2>Analyses</h2>
                  <button
                    onClick={() =>
                      navigate("/analyze", { state: { document } })
                    }
                  >
                    <AddOutlinedIcon /> New Analysis
                  </button>
                </div>
                {analyses.length === 0 ? (
                  <ErrorMessage
                    isFullHeight={true}
                    message="No analyses yet."
                  />
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
