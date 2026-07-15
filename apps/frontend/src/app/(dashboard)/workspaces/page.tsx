"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import CreateWorkspaceModal from "@/components/workspaces/CreateWorkSpaceModal";
import Avatar from "@/components/ui/Avatar";

export default function WorkspacesPage() {
    const router = useRouter();
    const { workspaces, isLoading, refetch } = useWorkspaces();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const roleStyle: Record<string, { bg: string; color: string }> = {
        owner: { bg: "#dbe1ff", color: "#00174b" },
        admin: { bg: "#e1e0ff", color: "#07006c" },
        member: { bg: "#eaedff", color: "#434655" },
    };

    // Compute stats from workspaces
    const totalMembers = 124; // placeholder — replace with real API data
    const activeProjects = 42;
    const storageUsed = 82;

    return (
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)", cursor: "pointer" }}
                    onClick={() => router.push("/dashboard")}>
                    Main Hub
                </span>
                <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>›</span>
                <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 500 }}>
                    Workspaces
                </span>
            </div>

            {/* Page header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--color-on-surface)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 6 }}>
                        Workspaces
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)" }}>
                        Manage your teams and centralized resources.
                    </p>
                </div>
                <button onClick={() => setIsCreateOpen(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PlusIcon /> Create Workspace
                </button>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
                {/* Total Members */}
                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Total Members
                    </p>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1 }}>
                            {totalMembers}
                        </p>
                        {/* Sparkline */}
                        <svg width="60" height="24" viewBox="0 0 60 24" aria-hidden="true">
                            <polyline points="0,18 10,14 20,16 30,10 40,12 50,8 60,6"
                                fill="none" stroke="var(--color-primary)" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Active Projects */}
                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Active Projects
                    </p>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1 }}>
                            {activeProjects}
                        </p>
                        <svg width="60" height="24" viewBox="0 0 60 24" aria-hidden="true">
                            <polyline points="0,20 10,18 20,20 30,14 40,16 50,10 60,8"
                                fill="none" stroke="var(--color-primary)" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Storage Used */}
                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Storage Used
                    </p>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1 }}>
                            {storageUsed}%
                        </p>
                        {/* Progress bar */}
                        <div style={{ width: 80, height: 6, background: "var(--color-surface-container-high)", borderRadius: 9999, overflow: "hidden", marginBottom: 4 }}>
                            <div style={{ width: `${storageUsed}%`, height: "100%", background: storageUsed > 80 ? "var(--color-error)" : "var(--color-primary)", borderRadius: 9999, transition: "width 0.6s ease" }} />
                        </div>
                    </div>
                </div>

                {/* AI Insights */}
                <div style={{
                    borderRadius: "var(--radius-md)", padding: "16px 20px",
                    background: "linear-gradient(135deg, #4648d4 0%, #7a1bc8 100%)",
                    display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden"
                }}>
                    {/* shimmer overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <SparkIcon />
                        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            AI Insights
                        </p>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
                        Optimization suggested for {workspaces.length > 0 ? workspaces.length : 3} stagnant projects.
                    </p>
                </div>
            </div>

            {/* Loading skeletons */}
            {isLoading && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ height: 160, background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && workspaces.length === 0 && (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "80px 24px", gap: 20, textAlign: "center",
                    background: "var(--color-surface-container-lowest)",
                    border: "2px dashed var(--color-outline-variant)",
                    borderRadius: "var(--radius-lg)",
                }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <WorkspaceIcon />
                    </div>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>No workspaces yet</p>
                        <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", maxWidth: 320 }}>
                            Create your first workspace to start organizing projects and collaborating with your team.
                        </p>
                    </div>
                    <button onClick={() => setIsCreateOpen(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PlusIcon /> Create workspace
                    </button>
                </div>
            )}

            {/* Workspace grid */}
            {!isLoading && workspaces.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {workspaces.map((ws) => {
                        const role = ws.myRole ?? "member";
                        const rs = roleStyle[role] ?? roleStyle.member;
                        return (
                            <div
                                key={ws.id}
                                style={{
                                    background: "var(--color-surface-container-lowest)",
                                    border: "1px solid var(--color-outline-variant)",
                                    borderRadius: "var(--radius-md)",
                                    padding: "20px",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16,
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.borderColor = "var(--color-primary)";
                                    el.style.transform = "translateY(-2px)";
                                    el.style.boxShadow = "0px 8px 24px rgba(0,74,198,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.borderColor = "var(--color-outline-variant)";
                                    el.style.transform = "translateY(0)";
                                    el.style.boxShadow = "none";
                                }}
                                onClick={() => router.push(`/workspaces/${ws.id}`)}
                            >
                                {/* Card header */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <Avatar src={ws.avatarUrl} name={ws.name} size="md" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {ws.name}
                                        </p>
                                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginTop: 1 }}>
                                            /{ws.slug}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: rs.bg, color: rs.color, flexShrink: 0 }}>
                                        {role}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: "var(--color-outline-variant)", opacity: 0.5 }} />

                                {/* Card footer */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                                        {new Date(ws.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                                        Enter Workspace <ArrowIcon />
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Create new card */}
                    <div
                        onClick={() => setIsCreateOpen(true)}
                        style={{
                            border: "2px dashed var(--color-outline-variant)",
                            borderRadius: "var(--radius-md)",
                            padding: "20px",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            minHeight: 140,
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.borderColor = "var(--color-primary)";
                            el.style.background = "var(--color-primary-fixed)";
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.borderColor = "var(--color-outline-variant)";
                            el.style.background = "transparent";
                        }}
                    >
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <PlusIcon color="var(--color-on-surface-variant)" />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)" }}>New Workspace</p>
                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>Create a new space for your team.</p>
                    </div>
                </div>
            )}

            <CreateWorkspaceModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={() => refetch()}
            />
        </div>
    );
}

function PlusIcon({ color = "currentColor" }: { color?: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SparkIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
        </svg>
    );
}

function WorkspaceIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="3" stroke="var(--color-on-surface-variant)" strokeWidth="1.8" />
            <circle cx="17" cy="7" r="3" stroke="var(--color-on-surface-variant)" strokeWidth="1.8" />
            <path d="M2 21c0-3 2.5-5 5-5s5 2 5 5M12 21c0-3 2.5-5 5-5s5 2 5 5" stroke="var(--color-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}