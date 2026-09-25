import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, sortAnalysesOldestFirst, showAlert } from "../../utils";
import { deleteDocument, getDocument } from "../../services/documents.service";
import { getAnalyses } from "../../services/analisis.service";
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
  const params = new URLSearchParams(window.location.search);
  const documentId = params.get("id");
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
        const [docsRes, analysesRes] = await Promise.all([
          getDocument(documentId),
          getAnalyses(documentId),
        ]);

        if (!docsRes.success) {
          throw new Error(docsRes.error || "Failed to load document");
        }
        if (!analysesRes.success) {
          throw new Error(analysesRes.error || "Failed to load analyses");
        }

        setDocument(docsRes.data || null);
        setAnalyses(analysesRes.data || []);
      } catch (e) {
        console.log("Error loading document details:", e);
        setError(e.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    if (documentId) load();
  }, [documentId]);

  useEffect(() => {
    const analysisId = params.get("analysis");

    if (analysisId) {
      setAnalysis(analysisId);
    }

    if (analyses.length > 0) {
      setSelectedAnalysisId(sortAnalysesOldestFirst(analyses)[0].id);
      navigate(
        `/documentDetail?id=${documentId}&analysis=${sortAnalysesOldestFirst(analyses)[0].id}`,
      );
    }
  }, [analyses]);

  const handleDeleteDocument = async (documentId) => {
    if (!documentId) return;
    try {
      const { success, error } = await deleteDocument(documentId);
      if (!success) {
        throw new Error(error || "Failed to delete document");
      }
      navigate("/");
    } catch (e) {
      console.error("Error deleting document:", e);
      showAlert("Error deleting document", e.message, "error");
    }
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
