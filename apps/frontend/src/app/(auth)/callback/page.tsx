"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function OAuthCallbackPage() {
    const router = useRouter();
    const { refreshSession } = useAuth();
    const [error, setError] = useState(false);
    const hasRun = useRef(false);

    useEffect(() => {
        // Guard against React 18 strict-mode double-invoke in dev, which
        // would otherwise fire this twice on mount.
        if (hasRun.current) return;
        hasRun.current = true;

        // The backend already set the httpOnly refresh_token cookie as part
        // of the redirect that landed us here. We don't need to read the
        // `token` query param ourselves — refreshSession() exchanges that
        // cookie for an access token and the current user in one call,
        // reusing the exact same flow as the app's normal silent-refresh-on-load.
        refreshSession()
            .then(() => router.replace("/dashboard"))
            .catch(() => setError(true));
    }, [refreshSession, router]);

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
                <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface)" }}>
                    We couldn&apos;t sign you in.
                </p>
                <button onClick={() => router.replace("/login")} className="btn-primary">
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
            <div
                style={{
                    width: 28,
                    height: 28,
                    border: "3px solid var(--color-outline-variant)",
                    borderTopColor: "var(--color-primary)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }}
            />
            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)" }}>Signing you in…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}