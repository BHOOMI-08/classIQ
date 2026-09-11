/**
 * Central Native Fetch API Wrapper for ClassIQ Client
 * Replaces Axios with native Fetch API throughout the entire application.
 */

let inMemoryAccessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => {
  return inMemoryAccessToken;
};

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Safely parse JSON or text response body.
 * Handles empty responses (e.g. 204 No Content) gracefully.
 */
async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  const text = await response.text();
  return text || null;
}

/**
 * Standard default error messages for HTTP status codes.
 */
function getStatusDefaultMessage(status) {
  switch (status) {
    case 400:
      return 'Bad Request. Please check your inputs.';
    case 401:
      return 'Unauthorized. Authentication required.';
    case 403:
      return 'Forbidden. You do not have permission to access this resource.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict. Resource already exists.';
    case 422:
      return 'Unprocessable entity. Validation failed.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Internal server error. Please try again later.';
    default:
      return `Request failed with status ${status}`;
  }
}

/**
 * Main request executor using native Fetch API.
 */
export async function request(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
    isRetry = false,
    skipAuth = false,
    ...customConfig
  } = options;

  const requestHeaders = { ...headers };

  // Attach Authorization header if access token exists in memory
  if (inMemoryAccessToken && !skipAuth) {
    requestHeaders['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  let requestBody = body;

  // Handle body serializing: JSON vs FormData
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const config = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Always send HTTP-only cookies
    signal,
    ...customConfig,
  };

  if (requestBody !== undefined) {
    config.body = requestBody;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // Silent Token Refresh handling on 401 Unauthorized
    if (
      response.status === 401 &&
      !isRetry &&
      !endpoint.includes('/auth/refresh') &&
      !endpoint.includes('/auth/login')
    ) {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });

            if (!refreshRes.ok) {
              throw new Error('Refresh failed');
            }

            const data = await parseResponseBody(refreshRes);
            const newToken = data?.data?.accessToken;

            if (!newToken) {
              throw new Error('No access token in refresh response');
            }

            setAccessToken(newToken);
            return newToken;
          } catch (err) {
            setAccessToken(null);
            window.dispatchEvent(new Event('auth:unauthorized'));
            throw err;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      try {
        const newAccessToken = await refreshPromise;
        // Retry the original request once with updated token
        return request(endpoint, {
          ...options,
          isRetry: true,
          headers: {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } catch (refreshErr) {
        throw new ApiError('Session expired. Please log in again.', 401);
      }
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
      let errorMessage = data?.message || data?.error || getStatusDefaultMessage(response.status);
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const detailMsgs = data.errors
          .map((e) => (typeof e === 'object' ? e.message : e))
          .filter(Boolean);
        if (detailMsgs.length > 0) {
          errorMessage = detailMsgs.join('. ');
        }
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(error.message || 'Network request failed', 500);
  }
}

export const api = {
  get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body }),
  put: (url, body, options = {}) => request(url, { ...options, method: 'PUT', body }),
  patch: (url, body, options = {}) => request(url, { ...options, method: 'PATCH', body }),
  delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' }),
};

export default api;
