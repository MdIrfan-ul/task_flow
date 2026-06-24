import { ReactNode } from "react";

export type Priority = "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";

interface PriorityBadgeProps {
    priority: Priority;
}

interface StatusBadgeProps {
    status: TaskStatus;
}

interface CustomBadgeProps {
    children: ReactNode;
    color?: "info" | "success" | "warning" | "danger" | "neutral";
}

const priorityClasses: Record<Priority, string> = {
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low",
};

const priorityLabels: Record<Priority, string> = {
    high: "High",
    medium: "Medium",
    low: "Low",
};

const statusClasses: Record<TaskStatus, string> = {
    todo: "status-todo",
    in_progress: "status-in-progress",
    done: "status-done",
};

const statusLabels: Record<TaskStatus, string> = {
    todo: "To do",
    in_progress: "In progress",
    done: "Done",
};

const customColorClasses: Record<string, string> = {
    info: "bg-primary-fixed text-on-primary-fixed",
    success: "bg-secondary-fixed text-on-secondary-fixed",
    warning: "bg-tertiary-fixed text-on-tertiary-fixed",
    danger: "bg-error-container text-on-error-container",
    neutral: "bg-surface-container text-on-surface-variant",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    return (
        <span className={priorityClasses[priority]}>{priorityLabels[priority]}</span>
    );
}

export function StatusBadge({ status }: StatusBadgeProps) {
    return <span className={statusClasses[status]}>{statusLabels[status]}</span>;
}

export function Badge({ children, color = "neutral" }: CustomBadgeProps) {
    return (
        <span
            className={`text-label-sm px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${customColorClasses[color]}`}
        >
            {children}
        </span>
    );
}