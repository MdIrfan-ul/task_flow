"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useToast } from "@/components/ui/Toast";
import Avatar from "@/components/ui/Avatar";
import { Task } from "@/types/task";

interface Project {
    id: number;
    name: string;
    workspace_id: number;
    workspaceName?: string;
}

interface SummaryData {
    summary: string;
    completedCount: number;
    inProgressCount: number;
    todoCount: number;
    highlights: string[];
    blockers: string[];
}

interface RawTask {
    id: number;
    title: string;
    status: "todo" | "in_progress" | "done";
    priority: "high" | "medium" | "low";
    due_date?: string | null;
    assignee?: { id: number; name: string; avatarUrl?: string | null } | null;
}

export default function ReportsPage() {
    const { showToast } = useToast();
    const { workspaces, isLoading: wsLoading } = useWorkspaces();

    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const [tasks, setTasks] = useState<RawTask[] | null>(null);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Load projects across all workspaces
    useEffect(() => {
        if (wsLoading || workspaces.length === 0) return;
        Promise.all(
            workspaces.map((ws) =>
                apiGet<Project[]>(`/workspaces/${ws.id}/projects`).then((ps) =>
                    ps.map((p) => ({ ...p, workspaceName: ws.name }))
                )
            )
        )
            .then((results) => {
                const flat = results.flat();
                setProjects(flat);
                if (flat.length > 0) setSelectedProjectId(String(flat[0].id));
            })
            .catch(() => showToast("Couldn't load your projects", "error"));
    }, [workspaces, wsLoading, showToast]);

    const loadReport = async (projectId: string) => {
        if (!projectId) return;
        setIsLoadingTasks(true);
        setIsLoadingSummary(true);
        setTasks(null);
        setSummary(null);
        try {
            const [taskData, summaryData] = await Promise.all([
                apiGet<RawTask[]>(`/projects/${projectId}/tasks`),
                apiPost<SummaryData>("/ai/summarize", { projectId: Number(projectId) }),
            ]);
            setTasks(taskData);
            setSummary(summaryData);
            setLastUpdated(new Date());
        } catch {
            showToast("Couldn't load the report", "error");
        } finally {
            setIsLoadingTasks(false);
            setIsLoadingSummary(false);
        }
    };

    useEffect(() => {
        if (selectedProjectId) loadReport(selectedProjectId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProjectId]);

    const regenerateSummary = async () => {
        if (!selectedProjectId) return;
        setIsLoadingSummary(true);
        try {
            const summaryData = await apiPost<SummaryData>("/ai/summarize", {
                projectId: Number(selectedProjectId),
            });
            setSummary(summaryData);
            setLastUpdated(new Date());
        } catch {
            showToast("Failed to regenerate summary", "error");
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const stats = useMemo(() => {
        const list = tasks ?? [];
        const total = list.length;
        const done = list.filter((t) => t.status === "done").length;
        const active = list.filter((t) => t.status !== "done").length;
        const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

        const now = new Date();
        const atRisk = list.filter((t) => {
            if (t.status === "done") return false;
            const overdue = t.due_date ? new Date(t.due_date) < now : false;
            return t.priority === "high" || overdue;
        });

        // Group by assignee for team performance
        const byAssignee = new Map<string, { name: string; avatarUrl?: string | null; total: number; done: number }>();
        for (const t of list) {
            const key = t.assignee ? String(t.assignee.id) : "unassigned";
            const name = t.assignee?.name ?? "Unassigned";
            if (!byAssignee.has(key)) {
                byAssignee.set(key, { name, avatarUrl: t.assignee?.avatarUrl, total: 0, done: 0 });
            }
            const entry = byAssignee.get(key)!;
            entry.total += 1;
            if (t.status === "done") entry.done += 1;
        }
        const team = Array.from(byAssignee.values())
            .filter((m) => m.name !== "Unassigned")
            .map((m) => ({ ...m, pct: m.total > 0 ? Math.round((m.done / m.total) * 100) : 0 }))
            .sort((a, b) => b.pct - a.pct);

        return { total, done, active, completionPct, atRisk, team };
    }, [tasks]);

    const smartInsight =
        summary?.highlights?.[0] ??
        summary?.blockers?.[0] ??
        (stats.total > 0 ? `${stats.done} of ${stats.total} tasks are complete.` : null);

    const handleExportPdf = () => {
        window.print();
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showToast("Report link copied to clipboard", "success");
        } catch {
            showToast("Couldn't copy link", "error");
        }
    };

    const isLoading = isLoadingTasks || isLoadingSummary;

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: "var(--text-headline-lg)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-on-surface)", marginBottom: 6 }}>
                        Reports &amp; Insights
                    </h1>
                    <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)" }}>
                        {lastUpdated
                            ? `Last updated today at ${lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                            : "Select a project to see its report"}
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {projects.length > 0 && (
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            style={{
                                fontSize: "var(--text-label-sm)",
                                color: "var(--color-on-surface-variant)",
                                background: "var(--color-surface-container-low)",
                                border: "1px solid var(--color-outline-variant)",
                                borderRadius: "var(--radius)",
                                padding: "8px 12px",
                            }}
                        >
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.workspaceName} / {p.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <button onClick={handleShare} className="btn-secondary">
                        Share Report
                    </button>
                    <button onClick={handleExportPdf} className="btn-primary">
                        Export PDF
                    </button>
                </div>
            </div>

            {projects.length === 0 && !wsLoading ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-on-surface-variant)" }}>
                    Create a project to start generating reports.
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                    {/* AI Executive Summary */}
                    <div
                        style={{
                            gridColumn: "1 / -1",
                            borderRadius: "var(--radius-lg)",
                            padding: 32,
                            background: "linear-gradient(135deg, #0053db 0%, #4648d4 50%, #7a1bc8 100%)",
                            color: "white",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <SparkIcon size={16} color="white" />
                                <h2 style={{ fontSize: "var(--text-headline-sm)", fontWeight: 600 }}>AI Executive Summary</h2>
                            </div>
                            <button
                                onClick={regenerateSummary}
                                disabled={isLoadingSummary}
                                style={{
                                    fontSize: "var(--text-label-sm)",
                                    color: "white",
                                    background: "rgba(255,255,255,0.15)",
                                    border: "none",
                                    borderRadius: "var(--radius-full)",
                                    padding: "6px 14px",
                                    cursor: isLoadingSummary ? "not-allowed" : "pointer",
                                    opacity: isLoadingSummary ? 0.6 : 1,
                                }}
                            >
                                {isLoadingSummary ? "Regenerating..." : "↻ Regenerate Summary"}
                            </button>
                        </div>

                        {isLoadingSummary ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: 0.8 }}>
                                <div style={{ height: 14, width: "80%", background: "rgba(255,255,255,0.2)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
                                <div style={{ height: 14, width: "60%", background: "rgba(255,255,255,0.2)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
                            </div>
                        ) : summary ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: "uppercase", marginBottom: 8 }}>Summary</p>
                                    <p style={{ fontSize: "var(--text-body-sm)", lineHeight: 1.6 }}>{summary.summary}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: "uppercase", marginBottom: 8 }}>Highlights</p>
                                    {summary.highlights.length > 0 ? (
                                        <ul style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--text-body-sm)" }}>
                                            {summary.highlights.map((h, i) => (
                                                <li key={i}>• {h}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ fontSize: "var(--text-body-sm)", opacity: 0.7 }}>None yet.</p>
                                    )}
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: "uppercase", marginBottom: 8 }}>Next Steps</p>
                                    {summary.blockers.length > 0 ? (
                                        <ul style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--text-body-sm)" }}>
                                            {summary.blockers.map((b, i) => (
                                                <li key={i}>• {b}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ fontSize: "var(--text-body-sm)", opacity: 0.7 }}>No blockers reported.</p>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Overall Completion
                            </p>
                            <p style={{ fontSize: 32, fontWeight: 700, color: "var(--color-primary)" }}>{stats.completionPct}%</p>
                            <div style={{ height: 6, background: "var(--color-surface-container-high)", borderRadius: 9999, overflow: "hidden" }}>
                                <div style={{ width: `${stats.completionPct}%`, height: "100%", background: "var(--color-primary)", borderRadius: 9999, transition: "width 0.6s ease" }} />
                            </div>
                        </div>
                        <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Active Tasks
                            </p>
                            <p style={{ fontSize: 32, fontWeight: 700, color: "var(--color-on-surface)" }}>{stats.active}</p>
                            <p style={{ fontSize: "var(--text-label-sm)", color: "var(--color-on-surface-variant)" }}>
                                {stats.done} completed · {stats.total} total
                            </p>
                        </div>
                    </div>

                    {/* At-risk tasks */}
                    <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-lg)", padding: 24 }}>
                        <p style={{ fontSize: "var(--text-label-sm)", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                            At-Risk Tasks
                        </p>
                        <p style={{ fontSize: 40, fontWeight: 700, color: "var(--color-error)", lineHeight: 1 }}>
                            {String(stats.atRisk.length).padStart(2, "0")}
                        </p>
                        <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)", marginBottom: 16 }}>High Priority / Overdue</p>
                        {stats.atRisk.length > 0 && (
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    fontSize: "var(--text-label-sm)",
                                    color: "var(--color-on-error-container)",
                                    background: "var(--color-error-container)",
                                    padding: "6px 12px",
                                    borderRadius: "var(--radius-full)",
                                }}
                            >
                                ⚠ Needs attention
                            </span>
                        )}
                    </div>

                    {/* Team performance */}
                    <div style={{ gridColumn: "span 2", background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-lg)", padding: 24 }}>
                        <h3 style={{ fontSize: "var(--text-headline-sm)", fontWeight: 600, marginBottom: 20, color: "var(--color-on-surface)" }}>Team Performance</h3>
                        {isLoadingTasks ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} style={{ height: 24, background: "var(--color-surface-container)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
                                ))}
                            </div>
                        ) : stats.team.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {stats.team.map((m) => (
                                    <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <Avatar name={m.name} src={m.avatarUrl} size="sm" />
                                        <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface)", width: 110, flexShrink: 0 }}>
                                            {m.name}
                                        </span>
                                        <div style={{ flex: 1, height: 8, background: "var(--color-surface-container-high)", borderRadius: 9999, overflow: "hidden" }}>
                                            <div style={{ width: `${m.pct}%`, height: "100%", background: "var(--color-primary)", borderRadius: 9999, transition: "width 0.6s ease" }} />
                                        </div>
                                        <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-on-surface-variant)", width: 40, textAlign: "right" }}>
                                            {m.pct}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)" }}>
                                No tasks are assigned to team members yet.
                            </p>
                        )}
                    </div>

                    {/* Smart insight */}
                    <div className="ai-gradient-border" style={{ borderRadius: "var(--radius-lg)", padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <SparkIcon size={14} color="var(--color-primary)" />
                            <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Smart Insight
                            </span>
                        </div>
                        <p style={{ fontSize: "var(--text-body-md)", fontStyle: "italic", color: "var(--color-on-surface)", lineHeight: 1.6, marginBottom: 16 }}>
                            {smartInsight ? `"${smartInsight}"` : "Not enough data yet to generate an insight."}
                        </p>
                        <p style={{ fontSize: "var(--text-label-sm)", color: "var(--color-on-surface-variant)" }}>TaskFlow AI v2.4</p>
                    </div>

                    {/* Historical trend placeholder */}
                    <div style={{ gridColumn: "span 2", background: "var(--color-surface-container-low)", borderRadius: "var(--radius-lg)", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 160 }}>
                        <TrendIcon />
                        <p style={{ fontSize: "var(--text-body-md)", fontWeight: 600, color: "var(--color-on-surface)", marginTop: 12 }}>
                            Historical Project Trend Visualization
                        </p>
                        <p style={{ fontSize: "var(--text-label-sm)", color: "var(--color-on-surface-variant)", marginTop: 4 }}>
                            Trend data will build up as this project accumulates activity over time.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function SparkIcon({ size = 16, color = "white" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={color} />
        </svg>
    );
}

function TrendIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 17l6-6 4 4 8-8" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}