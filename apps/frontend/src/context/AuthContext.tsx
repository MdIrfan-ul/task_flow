"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
    api,
    apiPost,
    setAccessToken,
    registerAuthFailureHandler,
} from "../lib/api";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    loginWithOAuth: (provider: "google" | "github") => void;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthResponse {
    user: AuthUser;
    accessToken: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    // Starts true: on first mount we don't yet know if there's a valid
    // refresh-token cookie, so every protected route must wait for this
    // to resolve before deciding to redirect to /login.
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // ─── Silent refresh on mount ────────────────────────────────────────
    // The access token lives in memory and is wiped on every full page
    // reload. If the user still has a valid httpOnly refresh cookie, this
    // exchanges it for a fresh access token without showing a login screen.
    // Also reused by the OAuth callback page: after a Google/GitHub login,
    // the refresh_token cookie is already set by the backend redirect, so
    // calling this hydrates `user` without a second round trip through a
    // dedicated /auth/me endpoint.
    const refreshSession = useCallback(async () => {
        try {
            // restoreSession — interceptor already unwraps, so data IS AuthResponse directly
            const { data } = await api.post<AuthResponse>("/auth/refresh");
            setAccessToken(data.accessToken);
            setUser(data.user);
        } catch {
            setAccessToken(null);
            setUser(null);
            throw new Error("Session refresh failed");
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        refreshSession()
            .catch(() => {
                // Already cleared inside refreshSession; nothing else to do.
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Wire up the 401-refresh-failed handler from lib/api.ts ─────────
    // When a background request's refresh attempt fails (refresh token
    // expired/revoked), api.ts calls this to clear state and bounce to
    // /login — without needing to import React/router itself.
    useEffect(() => {
        registerAuthFailureHandler(() => {
            setAccessToken(null);
            setUser(null);
            router.push("/login");
        });
    }, [router]);

    const login = useCallback(
        async ({ email, password }: LoginPayload) => {
            const data = await apiPost<AuthResponse>("/auth/login", {
                email,
                password,
            });
            setAccessToken(data.accessToken);
            setUser(data?.user);
            router.push("/dashboard");
        },
        [router]
    );

    const register = useCallback(async ({ name, email, password }: RegisterPayload) => {
        await apiPost("/auth/register", { name, email, password });
        router.push("/login?registered=true");
    }, [router]);

    const logout = useCallback(async () => {
        try {
            await apiPost("/auth/logout");
        } finally {
            setAccessToken(null);
            setUser(null);
            router.push("/login");
        }
    }, [router]);

    const loginWithOAuth = useCallback((provider: "google" | "github") => {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
        // Full redirect, not a fetch call — the backend's Passport strategy
        // needs the browser to actually navigate to Google/GitHub and back.
        window.location.href = `${apiBaseUrl}/auth/${provider}`;
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                loginWithOAuth,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}