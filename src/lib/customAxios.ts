// src/lib/customAxios.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { AccountsApi } from "../api/apis/accounts-api";
import { logout } from "./logout";

const customAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add access token to all outgoing requests
customAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

type QueueItem = {
  resolve: (value: string | undefined) => void;
  reject: (error: any) => void;
};

let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Add response interceptor to handle 401s
customAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        logout(); // No refresh token — just logout
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token?: string) => {
              if (originalRequest.headers && token) {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
              }
              resolve(customAxios(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        // const accountsApi = new AccountsApi(undefined, undefined, customAxios);
        const accountsApi = new AccountsApi();

        const res = await accountsApi.accountsTokenRefreshCreate({ refresh: refreshToken });
        console.debug("Token refresh successful");

        const newAccessToken = res.data.access;
        const newRefreshToken = res.data.refresh; // Now assumed to always exist
  
        if (!newAccessToken || !newRefreshToken) {
          throw new Error("Tokens missing in refresh response");
        }

        // Store BOTH tokens (since both are guaranteed)
        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);
        console.debug("Access and refresh tokens updated");

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        return customAxios(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", error);
        processQueue(refreshError, null);
        logout(); // Token refresh failed — logout user
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default customAxios;