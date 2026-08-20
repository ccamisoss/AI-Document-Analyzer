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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
            padding: "0 2rem",
          }}
        >
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
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                padding: "1rem",
                height: "200px",
                justifyContent: "space-between",
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2rem",
                      fontWeight: 600,
                      width: "fit-content",
                    }}
                  >
                    {doc.id}
                  </span>
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
                </div>
              </div>
              <div
                style={{
                  color: "#4a5568",
                  fontSize: "0.85rem",
                  // lineHeight: 1.4,
                  maxHeight: "30%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                }}
              >
                {(doc.content || "").slice(0, 130)}
                {(doc.content || "").length > 130 ? "..." : ""}
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span
                  style={{
                    color: "#4a5568",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ScheduleIcon /> {formatDate(doc.createdAt)}
                </span>

                {doc.updatedAt ? (
                  <span
                    style={{
                      color: "#4a5568",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <UpdateIcon /> {formatDate(doc.updatedAt)}
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
