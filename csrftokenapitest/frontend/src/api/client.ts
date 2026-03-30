/**
 * Axios client with CSRF token management.
 *
 * EARS-002: When a non-GET request is initiated and no CSRF token is cached,
 *           automatically fetch a new token from GET /api/csrf first.
 * EARS-003: While processing any non-GET request, attach the current CSRF token
 *           as the X-CSRF-TOKEN header via the Axios request interceptor.
 */
import axios, { type InternalAxiosRequestConfig } from 'axios';

let csrfToken: string | null = null;

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

// Request interceptor (EARS-002 + EARS-003)
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.method !== 'get') {
    if (!csrfToken) {
      // EARS-002: auto-fetch if no cached token
      const res = await axios.get<{ token: string }>('http://localhost:8080/api/csrf', {
        withCredentials: true,
      });
      csrfToken = res.data.token;
    }
    // EARS-003: attach token header
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  return config;
});

// Response interceptor: update cached token from response header so each
// subsequent non-GET request always carries the latest session token.
apiClient.interceptors.response.use(response => {
  const newToken = response.headers['x-csrf-token'] as string | undefined;
  if (newToken) {
    csrfToken = newToken;
  }
  return response;
});

export default apiClient;
export function getCsrfToken(): string | null {
  return csrfToken;
}
export function setCsrfToken(token: string): void {
  csrfToken = token;
}
