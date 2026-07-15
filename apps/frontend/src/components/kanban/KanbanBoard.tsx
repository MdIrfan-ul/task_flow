"use client";

import { useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Task, Column } from "../../types/task";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
    columns: Column[];
    tasks: Task[];
    onTasksChange?: (tasks: Task[]) => void;
    onTaskClick?: (task: Task) => void;
    onAddTask?: (columnId: string) => void;
}

export default function KanbanBoard({
    columns,
    tasks,
    onTasksChange,
    onTaskClick,
    onAddTask,
}: Readonly<KanbanBoardProps>) {
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
    );

    const tasksByColumn = (columnId: string) =>
        localTasks
            .filter((t) => t.status === columnId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    function handleDragStart(event: DragStartEvent) {
        const task = localTasks.find((t) => t.id === event.active.id);
        setActiveTask(task ?? null);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        if (activeId === overId) return;

        setLocalTasks((prev) => {
            const activeTask = prev.find((t) => t.id === activeId);
            if (!activeTask) return prev;

            const overColumn = columns.find((c) => c.id === overId);
            const overTask = prev.find((t) => t.id === overId);
            const targetStatus = overColumn ? overColumn.id : overTask?.status;

            if (!targetStatus || activeTask.status === targetStatus) return prev;

            return prev.map((t) =>
                t.id === activeId ? { ...t, status: targetStatus } : t
            );
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeIndex = localTasks.findIndex((t) => t.id === activeId);
        const overIndex = localTasks.findIndex((t) => t.id === overId);

        let updated = localTasks;
        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
            updated = arrayMove(localTasks, activeIndex, overIndex);
        }

        setLocalTasks(updated);
        onTasksChange?.(updated);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board flex gap-4 h-full overflow-x-auto p-4">
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        tasks={tasksByColumn(column.id)}
                        onTaskClick={onTaskClick}
                        onAddTask={onAddTask}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
            </DragOverlay>
        </DndContext>
    );
}