"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/components/ui/Toast";
import { Task, TaskStatus, TaskPriority, COLUMNS } from "@/types/task";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import Skeleton from "@/components/ui/Skeleton";
import { AvatarStack } from "@/components/ui/Avatar";

interface Project {
    id: number;
    name: string;
    description?: string;
    workspace_id: number;
}

type ViewMode = "board" | "list";
type FilterPriority = "all" | TaskPriority;
type FilterStatus = "all" | TaskStatus;

export default function ProjectBoardPage() {
    const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
    const router = useRouter();
    const { showToast } = useToast();
    const { members } = useWorkspace(workspaceId);

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("board");
    const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [filterAssignee, setFilterAssignee] = useState<string>("all");

    useEffect(() => {
        if (!projectId) return;
        let cancelled = false;

        async function fetchData() {
            setIsLoading(true);
            try {
                const [proj, taskList] = await Promise.all([
                    apiGet<Project>(`/projects/${projectId}`),
                    apiGet<Task[]>(`/projects/${projectId}/tasks`),
                ]);
                if (!cancelled) {
                    setProject(proj);
                    setTasks(taskList);
                }
            } catch {
                if (!cancelled) showToast("Couldn't load project", "error");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, [projectId, showToast]);

    const handleTasksChange = async (updatedTasks: Task[]) => {
        const statusChanges = updatedTasks.filter((updated) => {
            const original = tasks.find((t) => t.id === updated.id);
            return original && original.status !== updated.status;
        });
        setTasks(updatedTasks);
        for (const task of statusChanges) {
            try {
                await apiPatch(`/tasks/${task.id}/status`, { status: task.status });
            } catch {
                showToast("Couldn't save status", "error");
            }
        }
    };

    // Apply filters
    const filteredTasks = tasks.filter((t) => {
        if (filterPriority !== "all" && t.priority !== filterPriority) return false;
        if (filterStatus !== "all" && t.status !== filterStatus) return false;
        if (filterAssignee !== "all" && t.assignee?.id !== filterAssignee) return false;
        return true;
    });

    const totalTasks = tasks.length;
    const hasActiveFilters = filterPriority !== "all" || filterStatus !== "all" || filterAssignee !== "all";

    const clearFilters = () => {
        setFilterPriority("all");
        setFilterStatus("all");
        setFilterAssignee("all");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)", cursor: "pointer" }}
                    onClick={() => router.push("/projects")}>
                    Projects
                </span>
                <span style={{ fontSize: 13, color: "var(--color-on-surface-variant)" }}>›</span>
                <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 500 }}>
                    {isLoading ? "..." : project?.name}
                </span>
            </div>

            {/* Page header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {isLoading ? (
                        <Skeleton className="h-8 w-48" />
                    ) : (
                        <>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)", letterSpacing: "-0.02em" }}>
                                {project?.name}
                            </h1>
                            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                                {totalTasks} Tasks
                            </span>
                        </>
                    )}
                </div>

                {/* View toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                        {(["board", "list"] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    padding: "7px 16px",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    background: viewMode === mode ? "var(--color-primary)" : "transparent",
                                    color: viewMode === mode ? "white" : "var(--color-on-surface-variant)",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    transition: "all 0.15s",
                                    textTransform: "capitalize",
                                }}
                            >
                                {mode === "board" ? <BoardIcon /> : <ListIcon />}
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexShrink: 0, flexWrap: "wrap" }}>
                {/* Status filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    style={{ fontSize: 13, padding: "7px 12px", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-full)", background: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)", cursor: "pointer" }}
                >
                    <option value="all">⊟ Status</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                {/* Priority filter */}
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                    style={{ fontSize: 13, padding: "7px 12px", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-full)", background: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)", cursor: "pointer" }}
                >
                    <option value="all">⚡ Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                {/* Assignee filter */}
                <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    style={{ fontSize: 13, padding: "7px 12px", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-full)", background: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)", cursor: "pointer" }}
                >
                    <option value="all">👤 Assignee</option>
                    {members.map((m) => (
                        <option key={m.userId} value={m.userId}>{m.name}</option>
                    ))}
                </select>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        style={{ fontSize: 13, fontWeight: 500, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", padding: "7px 4px" }}
                    >
                        Clear All
                    </button>
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Member avatars */}
                {members.length > 0 && (
                    <AvatarStack
                        users={members.map((m) => ({ id: m.userId, name: m.name, avatarUrl: m.avatarUrl }))}
                        max={4}
                    />
                )}

                {/* Add Task button */}
                <button
                    onClick={() => setCreateStatus("todo")}
                    className="btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                >
                    <PlusIcon /> Add Task
                </button>
            </div>

            {/* Board / List view */}
            <div style={{ flex: 1, overflow: "hidden" }}>
                {isLoading ? (
                    <div style={{ display: "flex", gap: 16, height: "100%" }}>
                        {COLUMNS.map((col) => (
                            <div key={col.id} style={{ width: 320, flexShrink: 0 }}>
                                <Skeleton className="h-5 w-24 mb-4" />
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[1, 2].map((i) => (
                                        <div key={i} style={{ height: 100, background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", animation: "pulse 1.5s ease-in-out infinite" }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : viewMode === "board" ? (
                    <KanbanBoard
                        columns={COLUMNS}
                        tasks={filteredTasks}
                        onTasksChange={handleTasksChange}
                        onTaskClick={(task) => setSelectedTaskId(task.id)}
                        onAddTask={(columnId) => setCreateStatus(columnId as TaskStatus)}
                    />
                ) : (
                    // List view
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", height: "100%", paddingRight: 4 }}>
                        {COLUMNS.map((col) => {
                            const colTasks = filteredTasks.filter((t) => t.status === col.id);
                            if (colTasks.length === 0) return null;
                            return (
                                <div key={col.id}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", marginBottom: 4 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col.label}</span>
                                        <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 9999, background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>{colTasks.length}</span>
                                    </div>
                                    {colTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => setSelectedTaskId(task.id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 14,
                                                padding: "12px 16px",
                                                background: "var(--color-surface-container-lowest)",
                                                border: "1px solid var(--color-outline-variant)",
                                                borderRadius: "var(--radius)",
                                                marginBottom: 6,
                                                cursor: "pointer",
                                                transition: "all 0.15s",
                                            }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-primary)"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-outline-variant)"; }}
                                        >
                                            <span style={{
                                                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, flexShrink: 0,
                                                background: task.priority === "high" ? "var(--color-error-container)" : task.priority === "medium" ? "var(--color-tertiary-fixed)" : "var(--color-surface-container-high)",
                                                color: task.priority === "high" ? "var(--color-on-error-container)" : task.priority === "medium" ? "var(--color-on-tertiary-fixed)" : "var(--color-on-surface-variant)",
                                            }}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                            <p style={{ flex: 1, fontSize: 14, color: "var(--color-on-surface)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {task.title}
                                            </p>
                                            {task.dueDate && (
                                                <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <CalIcon /> {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                </span>
                                            )}
                                            {task.assignee && (
                                                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--color-primary-fixed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--color-on-primary-fixed)", flexShrink: 0 }}>
                                                    {task.assignee.name.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                        {filteredTasks.length === 0 && (
                            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--color-on-surface-variant)", fontSize: 14 }}>
                                No tasks match the current filters
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Task detail panel */}
            <TaskDetailPanel
                taskId={selectedTaskId}
                members={members}
                onClose={() => setSelectedTaskId(null)}
                onUpdated={(updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))}
                onDeleted={(id) => { setTasks((prev) => prev.filter((t) => t.id !== id)); setSelectedTaskId(null); }}
            />

            {/* Create task modal */}
            <CreateTaskModal
                isOpen={!!createStatus}
                onClose={() => setCreateStatus(null)}
                projectId={projectId}
                defaultStatus={createStatus ?? "todo"}
                members={members}
                onCreated={(task) => { setTasks((prev) => [...prev, task]); setCreateStatus(null); setSelectedTaskId(task.id); }}
            />
        </div>
    );
}

function PlusIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

function BoardIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="7" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="14" y="3" width="7" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

function ListIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function CalIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}