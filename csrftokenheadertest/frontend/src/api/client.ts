/**
 * Axios client implementing the session-based CSRF header pattern (EARS-003, EARS-004, EARS-008).
 *
 * EARS-003: Response interceptor reads X-CSRF-TOKEN from every response header
 *           and stores it in sessionStorage under the key "csrf-token".
 * EARS-004: Request interceptor reads from sessionStorage and sets X-CSRF-TOKEN
 *           header on POST, PUT, DELETE, PATCH requests automatically.
 * EARS-008: Response interceptor removes the token from sessionStorage and
 *           triggers a page reload when the server returns HTTP 403.
 */
import axios, { type InternalAxiosRequestConfig } from 'axios'

export const CSRF_STORAGE_KEY = 'csrf-token'

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,  // send session cookie with every request
})

// ── Response Interceptor (EARS-003 + EARS-008) ──────────────────────────────
api.interceptors.response.use(
  (response) => {
    // EARS-003: cache the token received in the response header
    const token = response.headers['x-csrf-token'] as string | undefined
    if (token) {
      sessionStorage.setItem(CSRF_STORAGE_KEY, token)
    }
    return response
  },
  (error) => {
    // EARS-008: on 403, clear the stale token and reload to re-acquire
    if (error.response?.status === 403) {
      sessionStorage.removeItem(CSRF_STORAGE_KEY)
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

// ── Request Interceptor (EARS-004) ──────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem(CSRF_STORAGE_KEY)
  const method = config.method?.toUpperCase() ?? ''
  if (token && STATE_CHANGING_METHODS.includes(method)) {
    config.headers['X-CSRF-TOKEN'] = token
  }
  return config
})

export default api
