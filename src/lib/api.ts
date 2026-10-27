/**
 * Central API URL resolver.
 * - Development defaults to the local Express server on port 5000.
 * - Production uses VITE_API_BASE_URL when configured, or same-origin routes when empty.
 * Keep credentials on authenticated fetch calls; never put server secrets in VITE_* variables.
 */
const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();
const defaultBase = import.meta.env.DEV ? "http://localhost:5000" : "";
const API_BASE_URL = (configuredBase || defaultBase).replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return API_BASE_URL ? `${API_BASE_URL}/${normalizedPath}` : `/${normalizedPath}`;
}
