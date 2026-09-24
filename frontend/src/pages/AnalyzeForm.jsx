import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createAnalysis } from "../services/analisis.service";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

function AnalyzeForm() {
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
      let body = null;
      let url = null;

      if (document) {
        body = JSON.stringify({ prompt: prompt.trim() });
        url = `/documents/${document.id}/analyses`;
      } else {
        const formData = new FormData();
        formData.append("file", file);
        if (prompt.trim()) {
          formData.append("prompt", prompt.trim());
        }
        body = formData;
        url = `/analysis`;
      }

      const { success, error, data } = await createAnalysis(body, url);

      if (!success) {
        throw new Error(error || "Error processing the document");
      }

      navigate(
        `/documentDetail?id=${data.document.id}&analysis=${data.analysis.id}`,
      );
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
        Document Analyzer
      </h1>
      <div
        style={{
          padding: "0 1.5rem",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <form onSubmit={handleSubmit} className="upload-form">
          <div
            style={{
              flex: 1,
              display: "flex",
              padding: "1rem",
              boxSizing: "border-box",
            }}
          >
            {previewSrc ? (
              <iframe
                src={previewSrc}
                width="100%"
                style={{
                  flex: 1,
                  borderRadius: 5,
                  border: "none",
                }}
                title="PDF Preview"
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 5,
                  border: "2px solid #e2e8f0",
                  gap: "0.7rem",
                }}
              >
                <DescriptionOutlinedIcon
                  style={{
                    fontSize: "5rem",
                    fill: "#667eea",
                    padding: "1rem",
                  }}
                />
                <span style={{ fontSize: "1.5rem" }}>No document selected</span>
                <p
                  style={{
                    fontSize: "0.8rem",
                    width: "60%",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  Select a PDF to preview your document before analyzing it.
                </p>
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              width: "45%",
              padding: "1rem",
              paddingLeft: "0",
            }}
          >
            <div className="file-input-container">
              <label htmlFor="pdf-file" className="file-label">
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
