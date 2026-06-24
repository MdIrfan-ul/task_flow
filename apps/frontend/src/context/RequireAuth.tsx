"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "./AuthContext";

/**
 * Wraps the (dashboard) route group's layout. Shows nothing meaningful
 * until the silent-refresh check in AuthProvider resolves, then either
 * renders children or redirects to /login.
 *
 * Usage in app/(dashboard)/layout.tsx:
 *
 *   <RequireAuth>
 *     <DashboardShell user={...}>{children}</DashboardShell>
 *   </RequireAuth>
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-body-sm text-on-surface-variant">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect is in flight via the effect above — render nothing
        // rather than flashing protected content for a frame.
        return null;
    }

    return <>{children}</>;
}