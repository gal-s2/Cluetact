export const baseUrl = window.location.hostname === "localhost" ? "http://localhost:8000" : import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
