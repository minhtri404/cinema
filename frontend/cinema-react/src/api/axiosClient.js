import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

const readAuthFromStorage = () => {
  const isAdminPage = window.location.pathname.startsWith("/admin");
  const keys = isAdminPage ? ["auth"] : ["clientAuth", "auth"];
  const stores = [localStorage, sessionStorage];

  for (const store of stores) {
    for (const key of keys) {
      const raw = store.getItem(key);
      if (!raw) continue;
      try {
        const auth = JSON.parse(raw);
        if (auth && typeof auth === "object") return auth;
      } catch {
        store.removeItem(key);
      }
    }
  }

  return {};
};

axiosClient.interceptors.request.use((config) => {
  const auth = readAuthFromStorage();
  const token = auth.accessToken || auth.token || auth.jwtToken || auth.jwt || auth.bearerToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;
