"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../../types/task";
import { PriorityBadge } from "../ui/Badge";
import Avatar from "../ui/Avatar";

interface TaskCardProps {
    task: Task;
    onClick?: (task: Task) => void;
    isDragging?: boolean;
}

export default function TaskCard({ task, onClick, isDragging }: Readonly<TaskCardProps>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.4 : 1,
    };

    const isOverdue =
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "done";

    return (
        <button
            ref={setNodeRef}
            type="button"
            style={style}
            {...attributes}
            {...listeners}
            className={`task-card select-none ${isDragging ? "shadow-overlay rotate-1 scale-105" : ""
                }`}
            onClick={() => onClick?.(task)}
            aria-label={`Task: ${task.title}`}
        >
            {/* Priority */}
            <div className="mb-2">
                <PriorityBadge priority={task.priority} />
            </div>

            {/* Title */}
            <p className="text-body-sm font-medium text-on-surface line-clamp-2 mb-3">
                {task.title}
            </p>

            {/* Description preview */}
            {task.description && (
                <p className="text-label-sm text-on-surface-variant line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                <div className="flex items-center gap-2">
                    {task.assignee && (
                        <Avatar
                            src={task.assignee.avatarUrl}
                            name={task.assignee.name}
                            size="xs"
                        />
                    )}
                    {!!task.commentCount && task.commentCount > 0 && (
                        <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                            <CommentIcon />
                            {task.commentCount}
                        </span>
                    )}
                </div>

                {task.dueDate && (
                    <span
                        className={`text-label-sm ${isOverdue
                            ? "text-error font-medium"
                            : "text-on-surface-variant"
                            }`}
                    >
                        {formatDueDate(task.dueDate)}
                    </span>
                )}
            </div>
        </button>
    );
}

function formatDueDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CommentIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}