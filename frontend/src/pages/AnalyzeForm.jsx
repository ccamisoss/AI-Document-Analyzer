import { useEffect, useMemo, useState } from "react";
import authService from "../services/auth.service";
import { useSession } from "../hooks/useSession";
import { useLocation, useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TEST_REDIRECT_DELAY_MS = 3_000;

function AnalyzeForm() {
  const { logout } = useSession();
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const state = useLocation().state;
  const [document, setDocument] = useState(state?.document || null);
  const navigate = useNavigate();

  // Memoize so createObjectURL isn't called on every prompt keystroke.
  const previewSrc = useMemo(() => {
    if (document?.path) {
      return `${API_BASE_URL}/${document.path.replace("\\", "/")}`;
    }
    if (file) {
      return URL.createObjectURL(file);
    }
    return undefined;
  }, [document, file]);

  useEffect(() => {
    return () => {
      if (previewSrc?.startsWith("blob:")) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setDocument(null);
      setError(null);
      setPrompt("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !document) {
      setError("Please select a PDF file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("You are not authenticated");
      }

      let body = null;
      let headers = {
        Authorization: `Bearer ${token}`,
      };
      let url = null;

      if (document) {
        body = JSON.stringify({ prompt: prompt.trim() });
        headers["Content-Type"] = "application/json";
        url = `${API_BASE_URL}/documents/${document.id}/analyses`;
      } else {
        const formData = new FormData();
        formData.append("file", file);
        if (prompt.trim()) {
          formData.append("prompt", prompt.trim());
        }
        body = formData;
        url = `${API_BASE_URL}/analysis`;
      }

      const fetchResponse = await fetch(url, {
        method: "POST",
        body: body,
        headers: headers,
      });

      const data = await fetchResponse.json();

      if (!fetchResponse.ok) {
        if (fetchResponse.status === 401) {
          logout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(
          data.error || data.message || "Error processing the document",
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, TEST_REDIRECT_DELAY_MS),
      );

      navigate(`/documentDetail?id=${data.data.document.id}`);
      setFile(null);
      setPrompt("");
      e.target.reset();
    } catch (err) {
      setError(err.message || "Error sending the document");
    } finally {
      setLoading(false);
    }
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
        Document Analyzer
      </h1>
      <div style={{ padding: "0 2rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <form onSubmit={handleSubmit} className="upload-form">
          <div style={{ flex: 1, display: "flex" }}>
            <iframe
              src={previewSrc}
              width="100%"
              style={{
                flex: 1,
                borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "5px",
              }}
              title="PDF Preview"
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              width: "50%",
              padding: "1rem",
            }}
          >
            <div className="file-input-container">
              <label for="pdf-file" htmlFor="pdf-file" className="file-label">
                Document Upload
              </label>
              <input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="file-input"
                placeholder="Select a PDF file"
              />
            </div>

            <div className="prompt-input-container">
              <label htmlFor="prompt" className="prompt-label">
                Prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                className="prompt-textarea"
                placeholder="Enter an optional prompt to guide the analysis or ask questions about the document..."
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={loading || (!file && !document)}
              className="submit-button"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default AnalyzeForm;
