import { useEffect, useState } from "react";
import authService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { formatDate } from "../utils";

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

      {loading && <p style={{ color: "white" }}>Loading documents...</p>}
      {error && <p style={{ color: "white" }}>{error}</p>}

      {!loading && !error && documents.length === 0 && (
        <p style={{ color: "white" }}>No documents yet.</p>
      )}

      {!loading && !error && documents.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "0 1.5rem",
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
                  style={{ fill: "#667eea", fontSize: "2.5rem", padding: "0 0.5rem" }}
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
