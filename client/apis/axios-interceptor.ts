import { api } from "./axios";

// Temporary in-memory storage for access token
let accessToken: string | null = null;

// Function to set access token in memory called after login/refresh
// setAccessToken() - update interceptor memory update interceptor memory
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// REQUEST INTERCEPTOR - Automatically attach Bearer token to Authorization header
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR - Automatically refresh access token if 401 Unauthorized
api.interceptors.response.use(
  // If request succeeded return response normally
  (response) => response,
  // If request failed, check if it's because of expired access token
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refresh = await api.post("/api/auth/refresh");

        const newToken = refresh.data.accessToken;

        setAccessToken(newToken);

        // Attach new access token to original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry the original request with new access token
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

/*
Original request:
GET /api/users
Authorization: Bearer <expired-token>
Response: 401 Unauthorized
We store it so we can retry it later.

--------------

User logged in
      ↓
accessToken stored
      ↓
User requests /users
      ↓
Request interceptor adds token
      ↓
Backend says token expired
      ↓
Response interceptor triggers
      ↓
POST /auth/refresh
      ↓
New accessToken returned
      ↓
Original request retried
      ↓
User receives response
*/
