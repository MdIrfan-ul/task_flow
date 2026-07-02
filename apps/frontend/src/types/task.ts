export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "high" | "medium" | "low";

export interface TaskAssignee {
    id: string;
    name: string;
    avatarUrl?: string | null;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    order?: number;
    assignee?: TaskAssignee | null;
    dueDate?: string | null;
    commentCount?: number;
    projectId: string;
}

export interface Column {
    id: TaskStatus;
    label: string;
    color: string;
}

export const COLUMNS: Column[] = [
    { id: "todo", label: "To Do", color: "#737686" },
    { id: "in_progress", label: "In Progress", color: "#004ac6" },
    { id: "done", label: "Done", color: "#4648d4" },
];