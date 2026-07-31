const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Send & receive HTTP-only cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: any) => 
    apiFetch<T>(endpoint, { 
      method: "POST", 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  patch: <T>(endpoint: string, body?: any) => 
    apiFetch<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: "DELETE" }),
};
