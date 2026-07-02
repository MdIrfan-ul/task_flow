"use client";

import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task, Column } from "../../types/task";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
    column: Column;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onAddTask?: (columnId: Column["id"]) => void;
}

export default function KanbanColumn({
    column,
    tasks,
    onTaskClick,
    onAddTask,
}: Readonly<KanbanColumnProps>) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

    return (
        <div className="kanban-column flex flex-col w-72 shrink-0 h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-3">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: column.color }}
                        aria-hidden="true"
                    />
                    <h3 className="text-label-lg font-semibold text-on-surface">
                        {column.label}
                    </h3>
                    <span className="text-label-sm text-on-surface-variant bg-surface-variant rounded-full px-2 py-0.5">
                        {tasks.length}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => onAddTask?.(column.id)}
                    className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded"
                    aria-label={`Add task to ${column.label}`}
                >
                    <PlusIcon />
                </button>
            </div>

            {/* Droppable task list */}
            <div
                ref={setNodeRef}
                className={`flex-1 flex flex-col gap-2 p-2 rounded-lg overflow-y-auto min-h-[120px] transition-colors ${isOver ? "bg-surface-variant/60" : "bg-transparent"
                    }`}
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-label-sm text-on-surface-variant italic py-8">
                        No tasks
                    </div>
                )}
            </div>
        </div>
    );
}

function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}