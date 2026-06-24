import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";

/**
 * Single shared axios instance for the whole app.
 *
 * Auth model:
 * - Access token: short-lived (15min), sent as `Authorization: Bearer <token>`
 *   on every request. Held in memory only (not localStorage) — see auth.ts.
 * - Refresh token: long-lived (7d), stored in an httpOnly cookie set by the
 *   backend. Never touched by JS. `withCredentials: true` ensures the cookie
 *   rides along on /auth/refresh.
 *
 * On a 401, we call /auth/refresh once, get a new access token, retry the
 * original request. If multiple requests 401 at the same time, only the
 * first triggers a refresh — the rest wait on the same in-flight promise.
 */

declare module "axios" {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL && typeof window !== "undefined") {
    // Fail loud in dev rather than silently hitting a relative URL.
    console.error(
        "NEXT_PUBLIC_API_URL is not set. API requests will fail."
    );
}

export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// ─── In-memory access token ──────────────────────────────────────────
// Kept outside React state so the interceptor (a plain module, not a
// component) can read/write it synchronously. The AuthProvider is the
// only thing that should call setAccessToken — see auth.ts / AuthContext.

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken() {
    return accessToken;
}

// ─── Request interceptor: attach access token ────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// ─── Response interceptor: refresh-on-401 with single-flight queue ───

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeToRefresh(callback: (token: string | null) => void) {
    refreshSubscribers.push(callback);
}

function notifySubscribers(token: string | null) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

/**
 * Called when refresh fails outright (refresh token expired/revoked).
 * AuthProvider overrides this via `onAuthFailure` to clear user state
 * and redirect to /login. Kept as a no-op default so this file has no
 * hard dependency on routing or React context.
 */
let onAuthFailure: () => void = () => { };

export function registerAuthFailureHandler(handler: () => void) {
    onAuthFailure = handler;
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig;

        const isUnauthorized = error.response?.status === 401;
        const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
        const alreadyRetried = originalRequest?._retry;

        if (!isUnauthorized || isRefreshCall || alreadyRetried || !originalRequest) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // If a refresh is already in flight, queue this request behind it
        // instead of firing a second /auth/refresh call.
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeToRefresh((newToken) => {
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    } else {
                        reject(error);
                    }
                });
            });
        }

        isRefreshing = true;

        try {
            const { data } = await axios.post<{ accessToken: string }>(
                `${API_BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true }
            );

            setAccessToken(data.accessToken);
            notifySubscribers(data.accessToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            setAccessToken(null);
            notifySubscribers(null);
            onAuthFailure();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// ─── Typed convenience wrappers ───────────────────────────────────────
// Thin wrappers so call sites don't repeat `.data` unwrapping everywhere.

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await api.get<T>(url, config);
    return data;
}

export async function apiPost<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
): Promise<T> {
    const { data } = await api.post<T>(url, body, config);
    return data;
}

export async function apiPatch<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
): Promise<T> {
    const { data } = await api.patch<T>(url, body, config);
    return data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await api.delete<T>(url, config);
    return data;
}

export default api;