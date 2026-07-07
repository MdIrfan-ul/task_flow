"use client";

import RequireAuth from "@/context/RequireAuth";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";

function ShellWrapper({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (!user) return null;
    return <DashboardShell user={user}>{children}</DashboardShell>;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireAuth>
            <ShellWrapper>{children}</ShellWrapper>
        </RequireAuth>
    );
}