import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/auth.service";
import { useSession } from "../../hooks/useSession";
import { formatDate } from "../../utils";

import styles from "./index.module.css";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";

import ScheduleIcon from "@mui/icons-material/Schedule";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useSession();

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error("You are not authenticated");
        }

        const res = await fetch(`${API_BASE_URL}/documents`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            logout();
            return;
          }
          throw new Error(
            data.error || data.message || "Failed to load documents",
          );
        }

        setDocuments(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        setError(e.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [logout]);

  const handleClickDocument = (documentId) => {
    navigate(`/documentDetail?id=${documentId}`);
  };

  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.title}>Dashboard</h1>

      {loading && <Loader text="Loading documents..." />}
      {error && <ErrorMessage message={error} isFullHeight={true} />}

      {!loading && !error && documents.length === 0 && (
        <div className={styles.emptyContainer}>
          <ErrorMessage message="No documents yet." />
          <Link to="/analyze" className={styles.analyzeButton}>
            Analyze a document
          </Link>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className={styles.documentsContainer}>
          {documents.map((doc) => (
            <div key={doc.id} className={styles.documentItem}>
              <div className={styles.documentItemHeader}>
                <DescriptionOutlinedIcon className={styles.documentItemIcon} />
                <div className={styles.documentItemTitle}>
                  <span className={styles.documentItemTitleText}>
                    {doc.filename}
                  </span>
                  {doc.analyses.length > 0 && (
                    <span style={{ fontSize: "0.75rem" }}>
                      Last analyzed:{" "}
                      {formatDate(
                        doc.analyses[doc.analyses.length - 1].createdAt,
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.documentItemSubcontainer}>
                <span className={styles.documentItemSubcontainerTitle}>
                  {doc.analyses.length} analyses
                </span>
                <button
                  onClick={() => handleClickDocument(doc.id)}
                  className={styles.documentItemSubcontainerButton}
                >
                  <KeyboardArrowRightOutlinedIcon
                    style={{ fontSize: "1.5rem" }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
