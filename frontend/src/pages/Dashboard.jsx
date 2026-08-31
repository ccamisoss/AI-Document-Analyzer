import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/auth.service";
import { useSession } from "../hooks/useSession";
import { formatDate } from "../utils";

import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

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
        // setLoading(false);
      }
    };

    loadDocuments();
  }, [logout]);

  const handleClickDocument = (documentId) => {
    navigate(`/documentDetail?id=${documentId}`);
  };

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <h1
        style={{
          padding: "1.25rem 0 0.75rem",
          backgroundColor: "white",
          paddingLeft: "1rem",
          borderBottom: "1px solid black",
        }}
      >
        Dashboard
      </h1>

      {loading && <Loader text="Loading documents..." />}
      {error && <ErrorMessage message={error} isFullHeight={true} />}

      {!loading && !error && documents.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: "1rem",
          }}
        >
          <ErrorMessage message="No documents yet." />
          <Link
            to="/analyze"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: "1.25rem",
              fontWeight: 500,
              backgroundColor: "black",
              padding: "0.5rem 1rem",
              borderRadius: 5,
              width: "fit-content",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            Analyze a document
          </Link>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "0 1.5rem",
            paddingBottom: "1.5rem",
          }}
        >
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                textAlign: "left",
                width: "100%",
                background: "white",
                borderRadius: 5,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                display: "flex",
                gap: "0.5rem",
                padding: "1.5rem",
                boxSizing: "border-box",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <DescriptionOutlinedIcon
                  style={{
                    fill: "#667eea",
                    fontSize: "2.5rem",
                    padding: "0 0.5rem",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#2d3748",
                      fontSize: "1.1rem",
                    }}
                  >
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
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <span
                  style={{
                    color: "#667eea",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {doc.analyses.length} analyses
                </span>
                <button
                  onClick={() => handleClickDocument(doc.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 0.5rem",
                  }}
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
