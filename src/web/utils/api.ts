import { useAuthStore } from "../store/authStore";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(true);
    }
  });
  failedQueue = [];
};

/**
 * Custom fetch wrapper with credentials and automatic token refresh interceptor.
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // Send & store HTTP-only cookies
  };

  let response = await fetch(url, config);

  // If 401 Unauthorized, attempt refresh token once
  if (response.status === 401 && !url.includes("/api/v1/auth/login") && !url.includes("/api/v1/auth/refresh")) {
    if (isRefreshing) {
      // Queue requests while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => fetch(url, config))
        .then((res) => res.json());
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        useAuthStore.getState().setAuth(refreshData.user);
        processQueue(null);

        // Retry original request
        response = await fetch(url, config);
      } else {
        processQueue(new Error("Refresh token expired"));
        useAuthStore.getState().setAuth(null);
        throw new Error("Session expired. Please log in again.");
      }
    } catch (err) {
      processQueue(err);
      useAuthStore.getState().setAuth(null);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "An error occurred");
  }

  return data as T;
}
