import { request } from "./api";
let headers = {
  Accept: "*/*",
};

const getAnalyses = async (documentId) => {
  try {
    const response = await request(`/documents/${documentId}/analyses`, {
      headers,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return { success: false, error: error.message };
  }
};

const deleteAnalysis = async (analysisId) => {
  try {
    const response = await request(`/analysis/${analysisId}`, {
      headers,
      method: "DELETE",
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return { success: false, error: error.message };
  }
};

export { getAnalyses, deleteAnalysis };
