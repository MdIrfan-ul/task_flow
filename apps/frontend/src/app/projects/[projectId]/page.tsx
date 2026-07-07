"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { Task, TaskStatus, COLUMNS } from "@/types/task";
import { useWorkspace } from "@/hooks/useWorkspace";
import { apiGet, apiPatch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function ProjectPage() {
    const { projectId, workspaceId } = useParams<{
        projectId: string;
        workspaceId: string;
    }>();

    const { members } = useWorkspace(workspaceId);
    const { showToast } = useToast();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);

    // Fetch tasks
    useEffect(() => {
        if (!projectId) return;
        let cancelled = false;

        async function fetchTasks() {
            setIsLoading(true);
            try {
                const data = await apiGet<Task[]>(`/projects/${projectId}/tasks`);
                if (!cancelled) setTasks(data);
            } catch {
                if (!cancelled) showToast("Couldn't load tasks", "error");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchTasks();
        return () => { cancelled = true; };
    }, [projectId, showToast]);

    // Persist status/order changes from drag-and-drop
    const handleTasksChange = async (updatedTasks: Task[]) => {
        setTasks(updatedTasks);
        // Find tasks whose status changed and persist them
        const statusChanges = updatedTasks.filter((updated) => {
            const original = tasks.find((t) => t.id === updated.id);
            return original && original.status !== updated.status;
        });

        for (const task of statusChanges) {
            try {
                await apiPatch(`/tasks/${task.id}/status`, { status: task.status });
            } catch {
                showToast("Couldn't save task status", "error");
            }
        }
    };

    const handleTaskCreated = (task: Task) => {
        setTasks((prev) => [...prev, task]);
        setSelectedTaskId(task.id);
    };

    const handleTaskUpdated = (updated: Task) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    };

    const handleTaskDeleted = (taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setSelectedTaskId(null);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Page header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <h1 className="text-headline-sm text-on-surface font-semibold">Board</h1>
                <button
                    onClick={() => setCreateStatus("todo")}
                    className="btn-primary"
                >
                    <PlusIcon />
                    Add task
                </button>
            </div>

            {/* Kanban board — uses your existing interface */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex gap-4 h-full">
                        {COLUMNS.map((col) => (
                            <div
                                key={col.id}
                                className="kanban-column animate-pulse bg-surface-container-low"
                            >
                                <div className="h-4 w-20 bg-surface-container rounded-md mb-4" />
                                <div className="flex flex-col gap-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-24 bg-surface-container rounded-md" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <KanbanBoard
                        columns={COLUMNS}
                        tasks={tasks}
                        onTasksChange={handleTasksChange}
                        onTaskClick={(task) => setSelectedTaskId(task.id)}
                        onAddTask={(columnId) => setCreateStatus(columnId as TaskStatus)}
                    />
                )}
            </div>

            {/* Task detail slide-in panel */}
            <TaskDetailPanel
                taskId={selectedTaskId}
                members={members}
                onClose={() => setSelectedTaskId(null)}
                onUpdated={handleTaskUpdated}
                onDeleted={handleTaskDeleted}
            />

            {/* Create task modal */}
            <CreateTaskModal
                isOpen={!!createStatus}
                onClose={() => setCreateStatus(null)}
                projectId={projectId}
                defaultStatus={createStatus ?? "todo"}
                members={members}
                onCreated={handleTaskCreated}
            />
        </div>
    );
}

function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}