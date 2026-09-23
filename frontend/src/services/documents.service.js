import { request } from "./api";
let headers = {
  Accept: "*/*",
};

const getDocuments = async () => {
  try {
    const response = await request("/documents", { headers });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { success: false, error: error.message };
  }
};

const getDocument = async (id) => {
  try {
    const response = await request(`/documents/${id}`, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching document by id:", error);
    return { success: false, error: error.message };
  }
};

const deleteDocument = async (id) => {
  try {
    const response = await request(`/documents/${id}`, {
      headers,
      method: "DELETE",
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message };
  }
};

export { getDocuments, getDocument, deleteDocument };
