"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useToast } from "@/components/ui/Toast";
import Skeleton from "@/components/ui/Skeleton";

export interface Project {
    id: number;
    name: string;
    description?: string;
    workspace_id: number;
    workspaceName?: string;
    created_at: string;
    taskCount?: number;
}

export default function ProjectsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { workspaces, isLoading: wsLoading } = useWorkspaces();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (wsLoading || workspaces.length === 0) return;

        async function fetchAllProjects() {
            setIsLoading(true);
            try {
                const results = await Promise.all(
                    workspaces.map((ws) =>
                        apiGet<Project[]>(`/workspaces/${ws.id}/projects`).then((projects) =>
                            projects.map((p) => ({ ...p, workspaceName: ws.name }))
                        )
                    )
                );
                setProjects(results.flat());
            } catch {
                showToast("Couldn't load projects", "error");
            } finally {
                setIsLoading(false);
            }
        }

        fetchAllProjects();
    }, [workspaces, wsLoading, showToast]);

    const filtered = projects.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.workspaceName?.toLowerCase().includes(search.toLowerCase())
    );

    // Group by workspace
    const grouped = filtered.reduce<Record<string, Project[]>>((acc, p) => {
        const key = p.workspaceName ?? "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <span
                    style={{ fontSize: 13, color: "var(--color-on-surface-variant)", cursor: "pointer" }}
                    onClick={() => router.push("/dashboard")}
                >
                    Main Hub
                </span>
                <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>›</span>
                <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 500 }}>
                    Projects
                </span>
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--color-on-surface)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 6 }}>
                        Projects
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)" }}>
                        All projects across your workspaces
                    </p>
                </div>

                {/* Search */}
                <div style={{ position: "relative", width: 260 }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-on-surface-variant)" }}>
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: 36, fontSize: 13 }}
                    />
                </div>
            </div>

            {/* Loading */}
            {(isLoading || wsLoading) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {[1, 2].map((i) => (
                        <div key={i}>
                            <Skeleton className="h-5 w-32 mb-3" />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                                {[1, 2, 3].map((j) => (
                                    <div key={j} style={{ height: 100, background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !wsLoading && projects.length === 0 && (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "80px 24px", gap: 16, textAlign: "center",
                    background: "var(--color-surface-container-lowest)",
                    border: "2px dashed var(--color-outline-variant)",
                    borderRadius: "var(--radius-lg)",
                }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FolderIcon size={28} color="var(--color-on-surface-variant)" />
                    </div>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>No projects yet</p>
                        <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)" }}>
                            Create a project from inside a workspace to get started
                        </p>
                    </div>
                    <button onClick={() => router.push("/workspaces")} className="btn-primary">
                        Go to Workspaces
                    </button>
                </div>
            )}

            {/* No search results */}
            {!isLoading && projects.length > 0 && filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--color-on-surface-variant)", fontSize: 14 }}>
                    No projects match &ldquo;{search}&rdquo;
                </div>
            )}

            {/* Projects grouped by workspace */}
            {!isLoading && !wsLoading && filtered.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    {Object.entries(grouped).map(([workspaceName, wsProjects]) => (
                        <div key={workspaceName}>
                            {/* Workspace group label */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {workspaceName}
                                </p>
                                <span style={{ fontSize: 12, fontWeight: 600, padding: "1px 8px", borderRadius: 9999, background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                                    {wsProjects.length}
                                </span>
                            </div>

                            {/* Project cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                                {wsProjects.map((project) => {
                                    const wsId = workspaces.find((w) => w.name === workspaceName)?.id;
                                    return (
                                        <div
                                            key={project.id}
                                            onClick={() => router.push(`/workspaces/${wsId}/projects/${project.id}`)}
                                            style={{
                                                background: "var(--color-surface-container-lowest)",
                                                border: "1px solid var(--color-outline-variant)",
                                                borderRadius: "var(--radius-md)",
                                                padding: "18px 20px",
                                                cursor: "pointer",
                                                transition: "all 0.15s",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 14,
                                            }}
                                            onMouseEnter={(e) => {
                                                const el = e.currentTarget as HTMLDivElement;
                                                el.style.borderColor = "var(--color-primary)";
                                                el.style.boxShadow = "0px 4px 20px rgba(0,74,198,0.08)";
                                                el.style.transform = "translateY(-1px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                const el = e.currentTarget as HTMLDivElement;
                                                el.style.borderColor = "var(--color-outline-variant)";
                                                el.style.boxShadow = "none";
                                                el.style.transform = "translateY(0)";
                                            }}
                                        >
                                            {/* Icon */}
                                            <div style={{ width: 40, height: 40, borderRadius: "var(--radius)", background: "var(--color-primary-fixed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <FolderIcon size={18} color="var(--color-primary)" />
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {project.name}
                                                </p>
                                                {project.description ? (
                                                    <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {project.description}
                                                    </p>
                                                ) : (
                                                    <p style={{ fontSize: 12, color: "var(--color-outline)", marginTop: 2 }}>
                                                        {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </p>
                                                )}
                                            </div>

                                            <span style={{ fontSize: 14, color: "var(--color-primary)", flexShrink: 0 }}>→</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SearchIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function FolderIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    );
}