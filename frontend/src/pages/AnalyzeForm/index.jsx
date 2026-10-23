import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createAnalysis } from "../../services/analisis.service";
import { showAlert } from "../../utils";
import styles from "./index.module.css";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

function AnalyzeForm() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const state = useLocation().state;
  const [document, setDocument] = useState(state?.document || null);
  const navigate = useNavigate();

  // Memoize so createObjectURL isn't called on every prompt keystroke.
  const previewSrc = useMemo(() => {
    if (document?.url) {
      return document.url;
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
        showAlert(
          "Error processing the document",
          "Please select a PDF file",
          "error",
        );
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setDocument(null);
      setPrompt("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !document) {
      showAlert(
        "Error processing the document",
        "Please select a PDF file",
        "error",
      );
      return;
    }

    setLoading(true);

    try {
      let body = null;
      let url = null;
      let headers = {};

      if (document) {
        body = JSON.stringify({ prompt: prompt.trim() });
        url = `/documents/${document.id}/analyses`;
        headers = {
          "Content-Type": "application/json",
        };
      } else {
        const formData = new FormData();
        formData.append("file", file);
        if (prompt.trim()) {
          formData.append("prompt", prompt.trim());
        }
        body = formData;
        url = `/analysis`;
      }

      const { success, error, data } = await createAnalysis(body, url, headers);

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
      showAlert("Error processing the document", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.container}
    >
      <h1
        className={styles.title}
      >
        Document Analyzer
      </h1>
      <div
        className={styles.subcontainer}
      >
        <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={styles.previewContainer}
          >
            {previewSrc ? (
              <iframe
                src={previewSrc}
                width="100%"
                className={styles.iframe}
                title="PDF Preview"
              />
            ) : (
              <div
                className={styles.placeholderContainer}
              >
                <DescriptionOutlinedIcon
                  style={{
                    fontSize: "5rem",
                    fill: "#667eea",
                    padding: "1rem",
                  }}
                />
                <span className={styles.placeholderTitle}>No document selected</span>
                <p
                  className={styles.placeholderDescription}
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
      </div>
    </div>
  );
}

export default AnalyzeForm;
