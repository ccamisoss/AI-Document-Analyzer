import authService from "./auth.service";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let onUnauthorized = null;

export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

function handleUnauthorized() {
  if (onUnauthorized) {
    onUnauthorized();
  }

  const error = new Error("You are not authenticated");
  error.isUnauthorized = true;
  throw error;
}

export async function request(path, options = {}) {
  const token = authService.getToken();

  if (!token) {
    handleUnauthorized();
  }

  const headers = {
    Authorization: "Bearer " + token,
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(API_BASE_URL + path, {
    method: options.method || "GET",
    headers: headers,
    body: options.body,
  });

  if (response.status === 401) {
    handleUnauthorized();
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}
