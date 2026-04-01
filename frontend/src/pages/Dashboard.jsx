import { useEffect, useState } from "react";
import authService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

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
          throw new Error('You are not authenticated');
        }

        const res = await fetch(`${API_BASE_URL}/documents`, {
          method: 'GET',
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
          throw new Error(data.error || data.message || 'Failed to load documents');
        }

        setDocuments(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        setError(e.message || 'Failed to load documents');
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
    <div style={{ width: '100%', maxWidth: 900, padding: '0 1rem' }}>
      <h1 style={{ margin: '1.5rem 0 1rem', color: 'white' }}>Dashboard</h1>

      {loading && <p style={{ color: 'white' }}>Loading documents...</p>}
      {error && <p style={{ color: 'white' }}>{error}</p>}

      {!loading && !error && documents.length === 0 && (
        <p style={{ color: 'white' }}>No documents yet.</p>
      )}

      {!loading && !error && documents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleClickDocument(doc.id)}
              style={{
                textAlign: 'left',
                width: '100%',
                background: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '1rem',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: '#2d3748' }}>
                    Document {doc.id}
                  </div>
                  <div style={{ color: '#4a5568', fontSize: '0.9rem' }}>
                    Created: {formatDate(doc.createdAt)}
                  </div>
                </div>
                <div style={{ color: '#4a5568', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  {doc.updatedAt ? `Updated: ${formatDate(doc.updatedAt)}` : null}
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  color: '#4a5568',
                  fontSize: '0.95rem',
                  lineHeight: 1.4,
                  maxHeight: 56,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {(doc.content || '').slice(0, 220)}
                {(doc.content || '').length > 220 ? '...' : ''}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

