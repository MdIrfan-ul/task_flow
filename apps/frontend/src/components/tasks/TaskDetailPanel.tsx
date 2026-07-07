"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { apiGet, apiPatch, apiDelete } from "../../lib/api";
import { Task, TaskPriority, TaskStatus } from "../../types/task";
import { WorkspaceMember } from "../../types/workspace";
import { PriorityBadge, StatusBadge } from "../ui/Badge";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { useToast } from "../ui/Toast";
import CommentThread from "./CommentThread";
import Skeleton from "../ui/Skeleton";

interface TaskDetailPanelProps {
    taskId: string | null;
    members?: WorkspaceMember[];
    onClose: () => void;
    onUpdated?: (task: Task) => void;
    onDeleted?: (taskId: string) => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
];

export default function TaskDetailPanel({
    taskId,
    members = [],
    onClose,
    onUpdated,
    onDeleted,
}: TaskDetailPanelProps) {
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();

    const fetchTask = useCallback(async () => {
        if (!taskId) return;
        setIsLoading(true);
        try {
            const data = await apiGet<Task>(`/tasks/${taskId}`);
            setTask(data);
        } catch {
            showToast("Couldn't load task", "error");
        } finally {
            setIsLoading(false);
        }
    }, [taskId, showToast]);

    useEffect(() => {
        fetchTask();
        setIsEditingTitle(false);
    }, [fetchTask]);

    const updateField = useCallback(
        async (field: string, value: unknown) => {
            if (!task) return;
            setIsSaving(true);
            try {
                const updated = await apiPatch<Task>(`/tasks/${task.id}`, {
                    [field]: value,
                });
                setTask(updated);
                onUpdated?.(updated);
            } catch {
                showToast("Couldn't update task", "error");
            } finally {
                setIsSaving(false);
            }
        },
        [task, onUpdated, showToast]
    );

    const handleTitleSave = async () => {
        if (!editTitle.trim() || editTitle === task?.title) {
            setIsEditingTitle(false);
            return;
        }
        await updateField("title", editTitle.trim());
        setIsEditingTitle(false);
    };

    const handleDelete = async () => {
        if (!task) return;
        if (!confirm("Delete this task? This can't be undone.")) return;
        setIsDeleting(true);
        try {
            await apiDelete(`/tasks/${task.id}`);
            showToast("Task deleted", "success");
            onDeleted?.(task.id);
            onClose();
        } catch {
            showToast("Couldn't delete task", "error");
            setIsDeleting(false);
        }
    };

    // Slide-in overlay — always rendered, position driven by taskId
    return (
        <>
            {/* Backdrop */}
            {taskId && (
                <div
                    className="fixed inset-0 z-30 bg-on-surface/20"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Panel */}
            <aside
                className={`fixed top-0 right-0 z-40 h-full w-full max-w-md bg-surface-container-lowest shadow-overlay flex flex-col transition-transform duration-300 ease-in-out ${taskId ? "translate-x-0" : "translate-x-full"
                    }`}
                aria-label="Task detail"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {task && <PriorityBadge priority={task.priority} />}
                        {isSaving && (
                            <span className="text-label-sm text-on-surface-variant animate-pulse">
                                Saving...
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            className="text-error hover:text-error hover:bg-error-container"
                        >
                            Delete
                        </Button>
                        <button
                            onClick={onClose}
                            className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
                            aria-label="Close panel"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 flex flex-col gap-5">
                    {isLoading || !task ? (
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ) : (
                        <>
                            {/* Title */}
                            {isEditingTitle ? (
                                <textarea
                                    className="input-field text-headline-sm font-medium resize-none w-full"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleTitleSave();
                                        }
                                        if (e.key === "Escape") setIsEditingTitle(false);
                                    }}
                                    autoFocus
                                    rows={2}
                                    maxLength={120}
                                />
                            ) : (
                                <h2
                                    className="text-headline-sm font-medium text-on-surface cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => {
                                        setEditTitle(task.title);
                                        setIsEditingTitle(true);
                                    }}
                                    title="Click to edit"
                                >
                                    {task.title}
                                </h2>
                            )}

                            {/* Meta fields */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                {/* Status */}
                                <MetaField label="Status">
                                    <select
                                        value={task.status}
                                        onChange={(e) =>
                                            updateField("status", e.target.value as TaskStatus)
                                        }
                                        className="input-field py-1.5 text-label-md"
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </MetaField>

                                {/* Priority */}
                                <MetaField label="Priority">
                                    <select
                                        value={task.priority}
                                        onChange={(e) =>
                                            updateField("priority", e.target.value as TaskPriority)
                                        }
                                        className="input-field py-1.5 text-label-md"
                                    >
                                        {PRIORITY_OPTIONS.map((p) => (
                                            <option key={p.value} value={p.value}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </MetaField>

                                {/* Assignee */}
                                <MetaField label="Assignee">
                                    <select
                                        value={task.assignee?.id ?? ""}
                                        onChange={(e) =>
                                            updateField("assigneeId", e.target.value || null)
                                        }
                                        className="input-field py-1.5 text-label-md"
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((m) => (
                                            <option key={m.userId} value={m.userId}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </MetaField>

                                {/* Due date */}
                                <MetaField label="Due date">
                                    <input
                                        type="date"
                                        value={
                                            task.dueDate
                                                ? format(new Date(task.dueDate), "yyyy-MM-dd")
                                                : ""
                                        }
                                        onChange={(e) =>
                                            updateField(
                                                "dueDate",
                                                e.target.value
                                                    ? new Date(e.target.value).toISOString()
                                                    : null
                                            )
                                        }
                                        className="input-field py-1.5 text-label-md"
                                    />
                                </MetaField>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-label-md text-on-surface-variant mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    defaultValue={task.description ?? ""}
                                    placeholder="Add a description..."
                                    rows={4}
                                    maxLength={1000}
                                    onBlur={(e) => {
                                        if (e.target.value !== (task.description ?? "")) {
                                            updateField("description", e.target.value.trim() || null);
                                        }
                                    }}
                                    className="input-field resize-none text-body-sm"
                                />
                            </div>

                            {/* Divider */}
                            <div className="border-t border-outline-variant/20" />

                            {/* Comments */}
                            <CommentThread taskId={task.id} />
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}

function MetaField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <p className="text-label-sm text-on-surface-variant mb-1">{label}</p>
            {children}
        </div>
    );
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}