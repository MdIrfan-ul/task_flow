"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { useToast } from "../ui/Toast";
import { apiPost } from "../../lib/api";
import { Task, TaskPriority, TaskStatus } from "../../types/task";
import { WorkspaceMember } from "../../types/workspace";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    defaultStatus?: TaskStatus;
    members?: WorkspaceMember[];
    onCreated?: (task: Task) => void;
}

interface FormState {
    title: string;
    description: string;
    priority: TaskPriority;
    assigneeId: string;
    dueDate: Date | undefined;
}

const initialForm: FormState = {
    title: "",
    description: "",
    priority: "medium",
    assigneeId: "",
    dueDate: undefined,
};

const PRIORITIES: { value: TaskPriority; label: string }[] = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
];

export default function CreateTaskModal({
    isOpen,
    onClose,
    projectId,
    defaultStatus = "todo",
    members = [],
    onCreated,
}: CreateTaskModalProps) {
    const [form, setForm] = useState<FormState>(initialForm);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleClose = () => {
        setForm(initialForm);
        setErrors({});
        setShowDatePicker(false);
        onClose();
    };

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (form.title.length > 120) newErrors.title = "Title must be under 120 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const task = await apiPost<Task>(`/projects/${projectId}/tasks`, {
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                priority: form.priority,
                status: defaultStatus,
                assigneeId: form.assigneeId || undefined,
                dueDate: form.dueDate ? form.dueDate.toISOString() : undefined,
            });

            showToast("Task created", "success");
            onCreated?.(task);
            handleClose();
        } catch {
            showToast("Failed to create task", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="New task"
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
                        Create task
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                {/* Title */}
                <Input
                    label="Title"
                    placeholder="What needs to be done?"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    error={errors.title}
                    autoFocus
                    maxLength={120}
                />

                {/* Description */}
                <Textarea
                    label="Description"
                    placeholder="Add more detail... (optional)"
                    value={form.description}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={3}
                    maxLength={1000}
                />

                {/* Priority + Assignee row */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Priority */}
                    <div>
                        <label className="block text-label-md text-on-surface mb-1.5">
                            Priority
                        </label>
                        <div className="flex gap-2">
                            {PRIORITIES.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
                                    className={`flex-1 py-1.5 rounded-full text-label-sm font-medium border transition-all ${form.priority === p.value
                                        ? p.value === "high"
                                            ? "bg-error-container text-on-error-container border-error/30"
                                            : p.value === "medium"
                                                ? "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/30"
                                                : "bg-surface-container text-on-surface-variant border-outline-variant"
                                        : "bg-transparent text-on-surface-variant border-outline-variant hover:bg-surface-container"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assignee */}
                    <div>
                        <label className="block text-label-md text-on-surface mb-1.5">
                            Assignee
                        </label>
                        <select
                            value={form.assigneeId}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, assigneeId: e.target.value }))
                            }
                            className="input-field"
                        >
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                                <option key={m.userId} value={m.userId}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Due date */}
                <div>
                    <label className="block text-label-md text-on-surface mb-1.5">
                        Due date
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowDatePicker((v) => !v)}
                        className="input-field text-left text-body-sm"
                    >
                        {form.dueDate ? format(form.dueDate, "MMM d, yyyy") : "Pick a date..."}
                    </button>

                    {showDatePicker && (
                        <div className="mt-2 bg-surface-container-lowest rounded-md border border-outline-variant/30 shadow-card p-2 inline-block">
                            <DayPicker
                                mode="single"
                                selected={form.dueDate}
                                onSelect={(date) => {
                                    setForm((f) => ({ ...f, dueDate: date }));
                                    setShowDatePicker(false);
                                }}
                                disabled={{ before: new Date() }}
                                classNames={{
                                    selected:
                                        "bg-primary text-on-primary rounded-full",
                                    today: "font-bold text-primary",
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}