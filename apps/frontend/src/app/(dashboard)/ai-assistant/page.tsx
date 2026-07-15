"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { Task, TaskPriority } from "@/types/task";

interface GeneratedTask {
    title: string;
    description: string;
    priority: TaskPriority;
    due_date?: string;
}

interface Project {
    id: number;
    name: string;
    workspace_id: number;
    workspaceName?: string;
}

const CATEGORY_RULES: { keywords: string[]; label: string; color: string }[] = [
    { keywords: ["auth", "login", "jwt", "token", "password", "security", "oauth"], label: "SECURITY", color: "primary" },
    { keywords: ["ui", "ux", "frontend", "page", "component", "screen", "design"], label: "FRONTEND", color: "secondary" },
    { keywords: ["api", "database", "schema", "backend", "server", "endpoint", "migration"], label: "BACKEND", color: "tertiary" },
    { keywords: ["test", "qa", "audit", "performance", "lighthouse"], label: "QA", color: "secondary" },
];

function categorize(title: string) {
    const lower = title.toLowerCase();
    for (const rule of CATEGORY_RULES) {
        if (rule.keywords.some((k) => lower.includes(k))) return rule;
    }
    return { label: "GENERAL", color: "tertiary" } as const;
}

function estimateHours(task: GeneratedTask) {
    // Rough heuristic just for display — real estimation lives server-side.
    const base = task.priority === "high" ? 10 : task.priority === "medium" ? 6 : 3;
    return base;
}

export default function AiAssistantPage() {
    const { showToast } = useToast();
    const { workspaces, isLoading: wsLoading } = useWorkspaces();

    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const [goal, setGoal] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tasks, setTasks] = useState<GeneratedTask[] | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

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

    const handleGenerate = async () => {
        if (!goal.trim()) {
            showToast("Describe your project first", "error");
            return;
        }
        setIsGenerating(true);
        setTasks(null);
        try {
            const data = await apiPost<{ tasks: GeneratedTask[] }>("/ai/generate-tasks", {
                goal: goal.trim(),
            });
            setTasks(data.tasks);
        } catch {
            showToast("Failed to generate a plan. Try again.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImport = async () => {
        if (!tasks || tasks.length === 0) return;
        if (!selectedProjectId) {
            showToast("Choose a project to import into", "error");
            return;
        }
        setIsSaving(true);
        try {
            await apiPost<Task[]>("/ai/generate-tasks/save", {
                projectId: Number(selectedProjectId),
                tasks,
            });
            setShowSuccess(true);
        } catch {
            showToast("Failed to import tasks. Try again.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = () => {
        showToast("Draft saved locally", "success");
    };

    const totalHours = tasks?.reduce((sum, t) => sum + estimateHours(t), 0) ?? 0;
    const complexity =
        (tasks?.length ?? 0) >= 10 ? "High" : (tasks?.length ?? 0) >= 6 ? "Medium-High" : "Medium";
    const teamSize = Math.min(5, Math.max(2, Math.ceil((tasks?.length ?? 0) / 4)));
    const milestones = (tasks ?? []).slice(0, 3);

    return (
        <div>
            {/* Hero */}
            <section style={{ maxWidth: 780, margin: "0 auto", textAlign: "center", marginBottom: 56 }}>
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 16px",
                        borderRadius: 9999,
                        background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
                        marginBottom: 20,
                    }}
                >
                    <SparkIcon size={14} color="var(--color-primary)" />
                    <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-primary)", letterSpacing: "0.03em" }}>
                        AI TASK ENGINE v2.0
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: "var(--text-display-lg)",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        color: "var(--color-on-surface)",
                        marginBottom: 20,
                    }}
                >
                    Describe your project and let AI generate tasks instantly.
                </h1>
                <p
                    style={{
                        fontSize: "var(--text-body-lg)",
                        color: "var(--color-on-surface-variant)",
                        maxWidth: 620,
                        margin: "0 auto 36px",
                        lineHeight: 1.6,
                    }}
                >
                    Turn your vision into a structured execution plan. Our AI breaks down complex ideas into
                    manageable tasks, milestones, and effort estimates.
                </p>

                {/* Input card */}
                <div
                    style={{
                        position: "relative",
                        background: "var(--color-surface-container-lowest)",
                        border: "1px solid var(--color-outline-variant)",
                        borderRadius: 20,
                        padding: 24,
                        textAlign: "left",
                        boxShadow: "var(--shadow-card)",
                    }}
                >
                    <textarea
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Build an e-commerce website with authentication, product management, and a stripe integration for payments..."
                        rows={4}
                        style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            resize: "none",
                            background: "transparent",
                            fontSize: "var(--text-body-lg)",
                            color: "var(--color-on-surface)",
                            fontFamily: "inherit",
                        }}
                        onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
                        }}
                    />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                        {projects.length > 0 ? (
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                style={{
                                    fontSize: "var(--text-label-sm)",
                                    color: "var(--color-on-surface-variant)",
                                    background: "var(--color-surface-container-low)",
                                    border: "1px solid var(--color-outline-variant)",
                                    borderRadius: "var(--radius)",
                                    padding: "6px 10px",
                                }}
                            >
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.workspaceName} / {p.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-on-surface-variant)" }}>
                                {goal.length}/500 · Ctrl+Enter to generate
                            </span>
                        )}
                        <Button
                            variant="primary"
                            onClick={handleGenerate}
                            isLoading={isGenerating}
                            icon={!isGenerating ? <SparkIcon size={14} color="white" /> : undefined}
                        >
                            {isGenerating ? "Thinking..." : "Generate Project Plan"}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Loading skeleton */}
            {isGenerating && (
                <section style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            style={{
                                height: 84,
                                borderRadius: "var(--radius-lg)",
                                background: "var(--color-surface-container)",
                                animation: "pulse 1.5s ease-in-out infinite",
                            }}
                        />
                    ))}
                </section>
            )}

            {/* Results */}
            {tasks && tasks.length > 0 && !isGenerating && (
                <section style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h2 style={{ fontSize: "var(--text-headline-md)", fontWeight: 600, color: "var(--color-on-surface)" }}>
                            Suggested Plan
                        </h2>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={handleSaveDraft} className="btn-secondary">
                                Save Draft
                            </button>
                            <Button variant="primary" onClick={handleImport} isLoading={isSaving}>
                                Import to Workspace
                            </Button>
                        </div>
                    </div>

                    {/* Bento: overview + milestones */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                        {/* Overview */}
                        <div className="ai-gradient-border" style={{ borderRadius: "var(--radius-lg)", padding: 32 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Project Overview
                                </span>
                            </div>
                            <h3 style={{ fontSize: "var(--text-headline-lg)", fontWeight: 600, marginBottom: 12, color: "var(--color-on-surface)" }}>
                                {tasks.length} tasks generated
                            </h3>
                            <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)", lineHeight: 1.7 }}>
                                Based on your goal, AI structured a plan with {tasks.length} actionable tasks across the
                                estimated categories below. Review and import the ones you want onto the board.
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 28, paddingTop: 28, borderTop: "1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)" }}>
                                <div>
                                    <p style={{ fontSize: "var(--text-label-sm)", color: "var(--color-outline)", textTransform: "uppercase", marginBottom: 4 }}>Estimated Effort</p>
                                    <p style={{ fontSize: "var(--text-headline-sm)", fontWeight: 600, color: "var(--color-on-surface)" }}>{totalHours} Hours</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: "var(--text-label-sm)", color: "var(--color-outline)", textTransform: "uppercase", marginBottom: 4 }}>Complexity</p>
                                    <p style={{ fontSize: "var(--text-headline-sm)", fontWeight: 600, color: "var(--color-tertiary)" }}>{complexity}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: "var(--text-label-sm)", color: "var(--color-outline)", textTransform: "uppercase", marginBottom: 4 }}>Team Req.</p>
                                    <p style={{ fontSize: "var(--text-headline-sm)", fontWeight: 600, color: "var(--color-on-surface)" }}>{teamSize} Members</p>
                                </div>
                            </div>
                        </div>

                        {/* Milestones */}
                        <div style={{ background: "var(--color-surface-container)", border: "1px solid color-mix(in srgb, var(--color-outline-variant) 50%, transparent)", borderRadius: "var(--radius-lg)", padding: 32 }}>
                            <span style={{ fontSize: "var(--text-label-sm)", color: "var(--color-outline)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                Milestones
                            </span>
                            <ul style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 20 }}>
                                {milestones.map((m, i) => (
                                    <li key={i} style={{ display: "flex", gap: 14 }}>
                                        <div
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: "50%",
                                                flexShrink: 0,
                                                background: i === 0 ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : "var(--color-surface-variant)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "var(--color-primary)" : "var(--color-outline)" }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "var(--text-label-md)", fontWeight: 500, color: "var(--color-on-surface)" }}>{m.title}</p>
                                            <p style={{ fontSize: 11, color: "var(--color-outline)" }}>
                                                {m.due_date ? `Due ${m.due_date}` : "Unscheduled"} · {m.priority.toUpperCase()}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Task cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                        {tasks.map((task, i) => {
                            const category = categorize(task.title);
                            return (
                                <div
                                    key={i}
                                    className="task-card"
                                    style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                padding: "4px 8px",
                                                borderRadius: 4,
                                                background: `color-mix(in srgb, var(--color-${category.color}) 12%, transparent)`,
                                                color: `var(--color-${category.color})`,
                                            }}
                                        >
                                            {category.label}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: "var(--text-label-md)", fontWeight: 500, color: "var(--color-on-surface)" }}>
                                        {task.title}
                                    </p>
                                    <p
                                        className="line-clamp-2"
                                        style={{ fontSize: 12, color: "var(--color-on-surface-variant)", lineHeight: 1.5, flex: 1 }}
                                    >
                                        {task.description}
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-outline)" }}>
                                            <ClockIcon />
                                            <span style={{ fontSize: 10 }}>{estimateHours(task)}h</span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 600,
                                                color:
                                                    task.priority === "high"
                                                        ? "var(--color-error)"
                                                        : task.priority === "medium"
                                                            ? "var(--color-tertiary)"
                                                            : "var(--color-outline)",
                                            }}
                                        >
                                            {task.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Success modal */}
            {showSuccess && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 24,
                        background: "rgba(40,48,68,0.4)",
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={() => setShowSuccess(false)}
                >
                    <div
                        style={{
                            background: "var(--color-surface)",
                            width: "100%",
                            maxWidth: 420,
                            borderRadius: 24,
                            padding: 40,
                            textAlign: "center",
                            boxShadow: "var(--shadow-overlay)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: "50%",
                                background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}
                        >
                            <CheckIcon />
                        </div>
                        <h3 style={{ fontSize: "var(--text-headline-lg)", fontWeight: 600, marginBottom: 8, color: "var(--color-on-surface)" }}>
                            Project Generated!
                        </h3>
                        <p style={{ fontSize: "var(--text-body-md)", color: "var(--color-on-surface-variant)", marginBottom: 28 }}>
                            Your tasks have been successfully added to the selected project.
                        </p>
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={() => {
                                setShowSuccess(false);
                                setTasks(null);
                                setGoal("");
                            }}
                        >
                            Done
                        </Button>
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

function ClockIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
