import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_EXPIRED_EVENT = "cinema:auth-expired";
const AUTH_REFRESHED_EVENT = "cinema:auth-refreshed";

const authStorageKeys = () => {
  const isAdminPage = window.location.pathname.startsWith("/admin");
  return isAdminPage ? ["auth"] : ["clientAuth", "auth"];
};

const findStoredAuth = () => {
  const keys = authStorageKeys();
  const stores = [localStorage, sessionStorage];

  for (const store of stores) {
    for (const key of keys) {
      const raw = store.getItem(key);
      if (!raw) continue;
      try {
        const auth = JSON.parse(raw);
        if (auth && typeof auth === "object") return { auth, key, store };
      } catch {
        store.removeItem(key);
      }
    }
  }

  return null;
};

const readAuthFromStorage = () => findStoredAuth()?.auth || {};

const clearStoredAuth = (entry) => {
  if (entry) entry.store.removeItem(entry.key);
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
};

const saveRefreshedAuth = (entry, responseAuth) => {
  const nextAuth = { ...entry.auth, ...responseAuth };
  entry.store.setItem(entry.key, JSON.stringify(nextAuth));
  window.dispatchEvent(new CustomEvent(AUTH_REFRESHED_EVENT, { detail: nextAuth }));
  return nextAuth;
};

axiosClient.interceptors.request.use((config) => {
  const auth = readAuthFromStorage();
  const token = auth.accessToken || auth.token || auth.jwtToken || auth.jwt || auth.bearerToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url || "");
    const isAuthRequest = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"].some(
      (path) => requestUrl.includes(path),
    );

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    const stored = findStoredAuth();
    if (!stored?.auth?.refreshToken) {
      clearStoredAuth(stored);
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${axiosClient.defaults.baseURL || ""}/api/auth/refresh`, {
            refreshToken: stored.auth.refreshToken,
          })
          .then((response) => saveRefreshedAuth(stored, response.data))
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshedAuth = await refreshPromise;
      const refreshedToken =
        refreshedAuth.accessToken || refreshedAuth.token || refreshedAuth.jwtToken || refreshedAuth.jwt;
      if (!refreshedToken) throw new Error("Không nhận được access token mới");

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      clearStoredAuth(stored);
      return Promise.reject(refreshError);
    }
  },
);

export default axiosClient;
