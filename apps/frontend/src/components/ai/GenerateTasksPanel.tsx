"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Task, TaskPriority } from "@/types/task";
import { PriorityBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface GeneratedTask {
    title: string;
    description: string;
    priority: TaskPriority;
}

interface GenerateTasksPanelProps {
    projectId: string;
    onTasksCreated?: (tasks: Task[]) => void;
}

export default function GenerateTasksPanel({
    projectId,
    onTasksCreated,
}: GenerateTasksPanelProps) {
    const [goal, setGoal] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
    const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
    const { showToast } = useToast();

    const handleGenerate = async () => {
        if (!goal.trim()) {
            showToast("Please describe your project goal", "error");
            return;
        }

        setIsGenerating(true);
        setGeneratedTasks([]);
        setSelectedIndexes(new Set());

        try {
            const data = await apiPost<{ tasks: GeneratedTask[] }>(
                "/ai/generate-tasks",
                { goal: goal.trim(), projectId }
            );
            setGeneratedTasks(data.tasks);
            // Select all by default
            setSelectedIndexes(new Set(data.tasks.map((_, i) => i)));
            showToast(`${data.tasks.length} tasks generated`, "success");
        } catch {
            showToast("Failed to generate tasks. Try again.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleTask = (index: number) => {
        setSelectedIndexes((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedIndexes.size === generatedTasks.length) {
            setSelectedIndexes(new Set());
        } else {
            setSelectedIndexes(new Set(generatedTasks.map((_, i) => i)));
        }
    };

    const handleSave = async () => {
        const tasksToSave = generatedTasks.filter((_, i) => selectedIndexes.has(i));
        if (tasksToSave.length === 0) {
            showToast("Select at least one task to add", "error");
            return;
        }

        setIsSaving(true);
        try {
            const created = await apiPost<Task[]>("/ai/generate-tasks/save", {
                projectId,
                tasks: tasksToSave,
            });
            showToast(`${created.length} tasks added to board`, "success");
            onTasksCreated?.(created);
            setGeneratedTasks([]);
            setGoal("");
            setSelectedIndexes(new Set());
        } catch {
            showToast("Failed to save tasks. Try again.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7a1bc8, #004ac6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <SparkIcon />
                </div>
                <div>
                    <p
                        style={{
                            fontSize: "var(--text-headline-sm)",
                            fontWeight: 600,
                            color: "var(--color-on-surface)",
                        }}
                    >
                        AI Task Generator
                    </p>
                    <p
                        style={{
                            fontSize: "var(--text-label-sm)",
                            color: "var(--color-on-surface-variant)",
                        }}
                    >
                        Describe your project goal and AI will break it into tasks
                    </p>
                </div>
            </div>

            {/* Goal input */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label
                    style={{
                        fontSize: "var(--text-label-md)",
                        fontWeight: 500,
                        color: "var(--color-on-surface)",
                    }}
                >
                    Project goal
                </label>
                <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Build a user authentication system with email, Google OAuth, and password reset functionality"
                    rows={3}
                    maxLength={500}
                    className="input-field"
                    style={{ resize: "none", fontSize: "var(--text-body-sm)" }}
                    onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                            handleGenerate();
                        }
                    }}
                />
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <p
                        style={{
                            fontSize: "var(--text-label-sm)",
                            color: "var(--color-on-surface-variant)",
                        }}
                    >
                        {goal.length}/500 · Ctrl+Enter to generate
                    </p>
                    <Button
                        variant="primary"
                        onClick={handleGenerate}
                        isLoading={isGenerating}
                        icon={!isGenerating ? <SparkIcon color="#fff" /> : undefined}
                    >
                        {isGenerating ? "Generating..." : "Generate tasks"}
                    </Button>
                </div>
            </div>

            {/* Generated tasks */}
            {isGenerating && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            style={{
                                height: 72,
                                borderRadius: "var(--radius)",
                                background: "var(--color-surface-container)",
                                animation: "pulse 1.5s ease-in-out infinite",
                            }}
                        />
                    ))}
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "var(--text-label-sm)",
                            color: "var(--color-on-surface-variant)",
                        }}
                    >
                        AI is analyzing your goal...
                    </p>
                </div>
            )}

            {generatedTasks.length > 0 && !isGenerating && (
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Select all header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                        }}
                    >
                        <p
                            style={{
                                fontSize: "var(--text-label-md)",
                                fontWeight: 500,
                                color: "var(--color-on-surface)",
                            }}
                        >
                            {generatedTasks.length} tasks generated
                        </p>
                        <button
                            onClick={toggleAll}
                            style={{
                                fontSize: "var(--text-label-sm)",
                                color: "var(--color-primary)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {selectedIndexes.size === generatedTasks.length
                                ? "Deselect all"
                                : "Select all"}
                        </button>
                    </div>

                    {/* Task list */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            maxHeight: 360,
                            overflowY: "auto",
                            paddingRight: 4,
                        }}
                    >
                        {generatedTasks.map((task, i) => (
                            <div
                                key={i}
                                onClick={() => toggleTask(i)}
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    padding: "12px 14px",
                                    borderRadius: "var(--radius)",
                                    border: `1px solid ${selectedIndexes.has(i)
                                            ? "var(--color-primary)"
                                            : "var(--color-outline-variant)"
                                        }`,
                                    background: selectedIndexes.has(i)
                                        ? "var(--color-primary-fixed)"
                                        : "var(--color-surface-container-lowest)",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                            >
                                {/* Checkbox */}
                                <div
                                    style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 4,
                                        border: `2px solid ${selectedIndexes.has(i)
                                                ? "var(--color-primary)"
                                                : "var(--color-outline-variant)"
                                            }`,
                                        background: selectedIndexes.has(i)
                                            ? "var(--color-primary)"
                                            : "transparent",
                                        flexShrink: 0,
                                        marginTop: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {selectedIndexes.has(i) && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M20 6L9 17l-5-5"
                                                stroke="white"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            marginBottom: 4,
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontSize: "var(--text-body-sm)",
                                                fontWeight: 500,
                                                color: "var(--color-on-surface)",
                                            }}
                                        >
                                            {task.title}
                                        </p>
                                        <PriorityBadge priority={task.priority} />
                                    </div>
                                    {task.description && (
                                        <p
                                            style={{
                                                fontSize: "var(--text-label-sm)",
                                                color: "var(--color-on-surface-variant)",
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save button */}
                    <div style={{ marginTop: 12 }}>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            isLoading={isSaving}
                            className="w-full"
                        >
                            Add {selectedIndexes.size} task
                            {selectedIndexes.size !== 1 ? "s" : ""} to board
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SparkIcon({ color = "white" }: { color?: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill={color}
            />
        </svg>
    );
}