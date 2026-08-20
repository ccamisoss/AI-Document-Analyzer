import { useEffect, useState } from "react";
import authService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { formatDate } from "../utils";

import UpdateIcon from "@mui/icons-material/Update";
import ScheduleIcon from "@mui/icons-material/Schedule";

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
        gap: "2rem",
      }}
    >
      <h1 style={{ padding: "1.25rem 0 0.75rem", backgroundColor: "white", paddingLeft: "1rem", borderBottom: "1px solid black" }}>Dashboard</h1>

      {loading && <p style={{ color: "white" }}>Loading documents...</p>}
      {error && <p style={{ color: "white" }}>{error}</p>}

      {!loading && !error && documents.length === 0 && (
        <p style={{ color: "white" }}>No documents yet.</p>
      )}

      {!loading && !error && documents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", padding: "0 2rem" }}>
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleClickDocument(doc.id)}
              style={{
                textAlign: "left",
                width: "100%",
                background: "white",
                border: "none",
                borderRadius: 5,
                padding: 0,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                marginBottom: "1rem",
                display: "flex",
              }}
            >
              <span
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 600,
                  paddingLeft: "1rem",
                  paddingTop: "1rem",
                  width: "90px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {doc.id}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                      color: "#2d3748",
                      fontSize: "1.25rem",
                    }}
                  >
                    {doc.filename.split(".")[0]}
                  </span>
                  <div style={{display: "flex", gap: "1rem"}}>
                    <span
                      style={{
                        color: "#4a5568",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <ScheduleIcon /> Created: {formatDate(doc.createdAt)}
                    </span>

                    {doc.updatedAt ? (
                      <span
                        style={{
                          color: "#4a5568",
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <UpdateIcon /> Updated: {formatDate(doc.updatedAt)}
                      </span>
                    ) : null}
                  </div>
                </div>
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
                  {(doc.content || "").slice(0, 220)}
                  {(doc.content || "").length > 220 ? "..." : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
