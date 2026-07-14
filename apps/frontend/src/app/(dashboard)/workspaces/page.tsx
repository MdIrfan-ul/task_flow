"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import CreateWorkspaceModal from "@/components/workspaces/CreateWorkSpaceModal";
import Avatar from "@/components/ui/Avatar";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function WorkspacesPage() {
    const router = useRouter();
    const { workspaces, isLoading, refetch } = useWorkspaces();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const roleStyle: Record<string, { bg: string; color: string }> = {
        owner: { bg: "#dbe1ff", color: "#00174b" },
        admin: { bg: "#e1e0ff", color: "#07006c" },
        member: { bg: "#eaedff", color: "#434655" },
    };

    return (

        <div className="mx-auto w-full max-w-7xl px-8 py-8">

            {/* Page header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--color-on-surface)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 6 }}>
                        Workspaces
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)" }}>
                        Switch between teams or create a new workspace to collaborate.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="btn-primary"
                    style={{ gap: 8, flexShrink: 0 }}
                >
                    <PlusIcon /> New Workspace
                </button>

            </div>


            {/* Loading skeletons */}
            {isLoading && (
                <>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map(i => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="h-40 rounded-xl bg-surface-container animate-pulse"
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Empty state */}
            {!isLoading && workspaces.length === 0 && (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "80px 24px", gap: 20, textAlign: "center",
                    background: "var(--color-surface-container-lowest)",
                    border: "2px dashed var(--color-outline-variant)",
                    borderRadius: "var(--radius-lg)",
                }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <WorkspaceIllustration />
                    </div>
                    <div>
                        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 8 }}>
                            No workspaces yet
                        </p>
                        <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", maxWidth: 320 }}>
                            Create your first workspace to start organizing projects and collaborating with your team.
                        </p>
                    </div>
                    <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
                        <PlusIcon /> Create workspace
                    </button>
                </div>
            )}

            {/* Workspace grid */}
            {!isLoading && workspaces.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {workspaces.map((ws) => {
                        const role = ws.myRole ?? "member";
                        const rs = roleStyle[role] ?? roleStyle.member;
                        return (
                            <div
                                key={ws.id}
                                onClick={() => router.push(`/workspaces/${ws.id}`)}
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
                            >
                                {/* Card header */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <Avatar src={ws.avatarUrl} name={ws.name} size="md" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {ws.name}
                                        </p>
                                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginTop: 2 }}>
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
                                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                                        Open <ArrowIcon />
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
                            minHeight: 160,
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
                        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-on-surface-variant)" }}>
                            New workspace
                        </p>
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

function WorkspaceIllustration() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="3" stroke="var(--color-on-surface-variant)" strokeWidth="1.8" />
            <circle cx="17" cy="7" r="3" stroke="var(--color-on-surface-variant)" strokeWidth="1.8" />
            <path d="M2 21c0-3 2.5-5 5-5s5 2 5 5M12 21c0-3 2.5-5 5-5s5 2 5 5" stroke="var(--color-on-surface-variant)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}