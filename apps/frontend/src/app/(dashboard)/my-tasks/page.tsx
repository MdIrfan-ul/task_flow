"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

interface RawTask {
    id: string;
    title: string;
    description?: string;
    status: "todo" | "in_progress" | "done";
    priority: "high" | "medium" | "low";
    dueDate?: string | null;
    commentCount?: number;
    assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
}

interface EnrichedTask extends RawTask {
    projectId: number;
    projectName: string;
    workspaceId: number;
}

interface Project {
    id: number;
    name: string;
    workspace_id: number;
}

function startOfDay(d: Date) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
}

function daysBetween(a: Date, b: Date) {
    return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000);
}

export default function MyTasksPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { workspaces, isLoading: wsLoading } = useWorkspaces();

    const [tasks, setTasks] = useState<EnrichedTask[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<"list" | "calendar" | "board">("list");

    useEffect(() => {
        if (wsLoading || workspaces.length === 0 || !user) return;

        async function load() {
            setIsLoading(true);
            try {
                const allProjects = (
                    await Promise.all(
                        workspaces.map((ws) => apiGet<Project[]>(`/workspaces/${ws.id}/projects`))
                    )
                ).flat();

                const perProjectTasks = await Promise.all(
                    allProjects.map((p) =>
                        apiGet<RawTask[]>(`/projects/${p.id}/tasks`).then((list) =>
                            list.map((t) => ({ ...t, projectId: p.id, projectName: p.name, workspaceId: p.workspace_id }))
                        )
                    )
                );

                const mine = perProjectTasks.flat().filter((t) => t.assignee?.id === user?.id);
                setTasks(mine);
            } catch {
                showToast("Couldn't load your tasks", "error");
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [workspaces, wsLoading, user, showToast]);

    const toggleComplete = async (task: EnrichedTask) => {
        const nextStatus = task.status === "done" ? "todo" : "done";
        setTasks((prev) => prev?.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)) ?? null);
        try {
            await apiPatch(`/tasks/${task.id}/status`, { status: nextStatus });
        } catch {
            showToast("Couldn't update task", "error");
            setTasks((prev) => prev?.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)) ?? null);
        }
    };

    const derived = useMemo(() => {
        const list = tasks ?? [];
        const now = new Date();
        const active = list.filter((t) => t.status !== "done");
        const projectCount = new Set(list.map((t) => t.projectId)).size;

        const withDue = active.filter((t) => t.dueDate);
        const overdue = withDue
            .filter((t) => daysBetween(new Date(t.dueDate!), now) < 0)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
        const upcoming = withDue
            .filter((t) => daysBetween(new Date(t.dueDate!), now) >= 0)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

        const today = active.filter((t) => t.dueDate && daysBetween(new Date(t.dueDate), now) === 0);
        const tomorrow = active.filter((t) => t.dueDate && daysBetween(new Date(t.dueDate), now) === 1);
        const noDueToday = active.filter((t) => !t.dueDate);

        const next7 = withDue.filter((t) => {
            const d = daysBetween(new Date(t.dueDate!), now);
            return d >= 0 && d <= 7;
        });

        const done = list.filter((t) => t.status === "done").length;
        const completionPct = list.length > 0 ? Math.round((done / list.length) * 100) : 0;

        return {
            active,
            projectCount,
            overdueFocus: overdue[0] ?? null,
            nextUpFocus: upcoming[0] ?? null,
            today: [...today, ...tomorrow.length === 0 ? noDueToday.slice(0, Math.max(0, 3 - today.length)) : []],
            tomorrow,
            next7,
            done,
            total: list.length,
            completionPct,
            criticalDeadlines: upcoming.slice(0, 2),
        };
    }, [tasks]);

    const busy = isLoading || wsLoading;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr", gap: 24, maxWidth: 1280, margin: "0 auto" }}>
            {/* Main column */}
            <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
                    <div>
                        <h1 style={{ fontSize: "var(--text-headline-lg)", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-on-surface)", marginBottom: 6 }}>
                            My Tasks
                        </h1>
                        <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)" }}>
                            {busy ? (
                                "Loading your tasks…"
                            ) : (
                                <>
                                    You have <strong style={{ color: "var(--color-primary)" }}>{derived.active.length} active tasks</strong> across{" "}
                                    {derived.projectCount} project{derived.projectCount === 1 ? "" : "s"}.
                                </>
                            )}
                        </p>
                    </div>

                    <div style={{ display: "flex", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                        {(["list", "calendar", "board"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => {
                                    if (v === "list") setView(v);
                                    else showToast(`${v[0].toUpperCase()}${v.slice(1)} view coming soon`, "success");
                                }}
                                style={{
                                    padding: "8px 18px",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    background: view === v ? "var(--color-surface-container-lowest)" : "transparent",
                                    color: view === v ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                                    border: "none",
                                    borderRight: v !== "board" ? "1px solid var(--color-outline-variant)" : "none",
                                    cursor: "pointer",
                                }}
                            >
                                {v[0].toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority focus */}
                {!busy && (derived.overdueFocus || derived.nextUpFocus) && (
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <SparkIcon size={14} color="var(--color-primary)" />
                            <h2 style={{ fontSize: "var(--text-headline-sm)", fontWeight: 600, color: "var(--color-on-surface)" }}>Priority Focus</h2>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", letterSpacing: "0.04em" }}>
                                AI SORTED
                            </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {derived.overdueFocus && (
                                <FocusCard
                                    tag="OVERDUE"
                                    tagColor="var(--color-error)"
                                    tagBg="var(--color-error-container)"
                                    task={derived.overdueFocus}
                                    onClick={() => router.push(`/workspaces/${derived.overdueFocus!.workspaceId}/projects/${derived.overdueFocus!.projectId}`)}
                                />
                            )}
                            {derived.nextUpFocus && (
                                <FocusCard
                                    tag="NEXT UP"
                                    tagColor="var(--color-primary)"
                                    tagBg="var(--color-primary-fixed)"
                                    task={derived.nextUpFocus}
                                    onClick={() => router.push(`/workspaces/${derived.nextUpFocus!.workspaceId}/projects/${derived.nextUpFocus!.projectId}`)}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Today */}
                <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: "var(--text-headline-sm)", fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 14 }}>Today</h2>
                    {busy ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{ height: 56, background: "var(--color-surface-container)", borderRadius: "var(--radius)", animation: "pulse 1.5s ease-in-out infinite" }} />
                            ))}
                        </div>
                    ) : derived.today.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {derived.today.map((task) => (
                                <TaskRow key={task.id} task={task} onToggle={() => toggleComplete(task)} onClick={() => router.push(`/workspaces/${task.workspaceId}/projects/${task.projectId}`)} />
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)" }}>Nothing due today. 🎉</p>
                    )}
                    <button
                        onClick={() => showToast("Open a project board to add a task", "success")}
                        style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: "var(--text-body-sm)", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                        <PlusIcon /> Create new task
                    </button>
                </div>

                {/* Upcoming week */}
                <div>
                    <h2 style={{ fontSize: "var(--text-headline-sm)", fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 14 }}>Upcoming Week</h2>
                    <div style={{ border: "1px dashed var(--color-outline-variant)", borderRadius: "var(--radius-lg)", padding: "28px 24px", textAlign: "center", background: "var(--color-surface-container-low)" }}>
                        <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)", marginBottom: 6 }}>
                            {busy ? "…" : `${derived.next7.length} task${derived.next7.length === 1 ? "" : "s"} scheduled for the next 7 days`}
                        </p>
                        <button onClick={() => router.push("/reports")} className="link-primary" style={{ fontSize: "var(--text-body-sm)", fontWeight: 600, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer" }}>
                            View Timeline
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="stat-card">
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                        Completion
                    </p>
                    <p style={{ fontSize: 32, fontWeight: 700, color: "var(--color-primary)", marginBottom: 8 }}>{busy ? "—" : `${derived.completionPct}%`}</p>
                    <div style={{ height: 6, background: "var(--color-surface-container-high)", borderRadius: 9999, overflow: "hidden" }}>
                        <div style={{ width: `${busy ? 0 : derived.completionPct}%`, height: "100%", background: "var(--color-primary)", borderRadius: 9999, transition: "width 0.6s ease" }} />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)", marginTop: 8 }}>
                        {busy ? "" : `${derived.done} of ${derived.total} of your tasks are done`}
                    </p>
                </div>

                <div className="stat-card">
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                        Completed
                    </p>
                    <p style={{ fontSize: 32, fontWeight: 700, color: "var(--color-on-surface)" }}>{busy ? "—" : derived.done}</p>
                    <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>tasks marked done across all projects</p>
                </div>

                <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                        Critical Deadlines
                    </p>
                    {busy ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[1, 2].map((i) => (
                                <div key={i} style={{ height: 36, background: "var(--color-surface-container)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
                            ))}
                        </div>
                    ) : derived.criticalDeadlines.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {derived.criticalDeadlines.map((task) => {
                                const d = new Date(task.dueDate!);
                                const daysLeft = daysBetween(d, new Date());
                                return (
                                    <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 40, textAlign: "center", flexShrink: 0 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-error)", textTransform: "uppercase" }}>
                                                {d.toLocaleDateString("en-US", { month: "short" })}
                                            </p>
                                            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--color-on-surface)" }}>{d.getDate()}</p>
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {task.title}
                                            </p>
                                            <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>
                                                {daysLeft === 0 ? "Due today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ fontSize: "var(--text-body-sm)", color: "var(--color-on-surface-variant)" }}>No upcoming deadlines.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function FocusCard({
    tag,
    tagColor,
    tagBg,
    task,
    onClick,
}: {
    tag: string;
    tagColor: string;
    tagBg: string;
    task: EnrichedTask;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="ai-gradient-border"
            style={{ borderRadius: "var(--radius-lg)", padding: 20, cursor: "pointer" }}
        >
            <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, background: tagBg, color: tagColor, marginBottom: 12, letterSpacing: "0.04em" }}>
                {tag}
            </span>
            <p style={{ fontSize: "var(--text-body-md)", fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 6 }}>{task.title}</p>
            {task.description && (
                <p className="line-clamp-2" style={{ fontSize: 13, color: "var(--color-on-surface-variant)", lineHeight: 1.5, marginBottom: 14 }}>
                    {task.description}
                </p>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-primary)" }} />
                    {task.projectName}
                </span>
                {task.dueDate && (
                    <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                        {new Date(task.dueDate).toLocaleDateString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                )}
            </div>
        </div>
    );
}

function TaskRow({ task, onToggle, onClick }: { task: EnrichedTask; onToggle: () => void; onClick: () => void }) {
    const priorityStyle =
        task.priority === "high"
            ? { bg: "var(--color-error-container)", color: "var(--color-on-error-container)" }
            : task.priority === "medium"
                ? { bg: "var(--color-tertiary-fixed)", color: "var(--color-on-tertiary-fixed)" }
                : { bg: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 8px",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                opacity: task.status === "done" ? 0.5 : 1,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--color-surface-container-low)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    border: `2px solid ${task.status === "done" ? "var(--color-primary)" : "var(--color-outline)"}`,
                    background: task.status === "done" ? "var(--color-primary)" : "transparent",
                    flexShrink: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                aria-label="Toggle complete"
            >
                {task.status === "done" && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            <div style={{ flex: 1, minWidth: 0 }} onClick={onClick}>
                <p style={{ fontSize: "var(--text-body-md)", fontWeight: 500, color: "var(--color-on-surface)", textDecoration: task.status === "done" ? "line-through" : "none" }}>
                    {task.title}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-primary)" }} />
                    <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{task.projectName}</span>
                    {task.dueDate && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)" }}>
                            · {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                    )}
                </div>
            </div>

            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, background: priorityStyle.bg, color: priorityStyle.color, flexShrink: 0 }}>
                {task.priority.toUpperCase()}
            </span>

            {task.commentCount ? (
                <span style={{ fontSize: 11, color: "var(--color-outline)", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <CommentIcon /> {task.commentCount}
                </span>
            ) : null}
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

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

function CommentIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}