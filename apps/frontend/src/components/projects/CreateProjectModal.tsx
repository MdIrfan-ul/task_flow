"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { useToast } from "../ui/Toast";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId?: string;
    onCreated?: (project: { id: string; name: string }) => void;
}

interface FormState {
    name: string;
    description: string;
}

const initialForm: FormState = { name: "", description: "" };

export default function CreateProjectModal({
    isOpen,
    onClose,
    workspaceId,
    onCreated,
}: CreateProjectModalProps) {
    const [form, setForm] = useState<FormState>(initialForm);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handleClose = () => {
        setForm(initialForm);
        setError(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setError("Project name is required");
            return;
        }

        if (!workspaceId) {
            setError("No workspace selected. Open this from inside a workspace.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // TODO: replace with shared `api` client once lib/api.ts (axios + token
            // refresh interceptor) is wired up. Keeping this self-contained for now.
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/projects`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        name: form.name.trim(),
                        description: form.description.trim(),
                    }),
                }
            );

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Failed to create project");
            }

            const project = await res.json();

            showToast("Project created", "success");
            onCreated?.(project);
            handleClose();
            router.push(`/projects/${project.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="New project"
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose} type="button">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        type="submit"
                        form="create-project-form"
                    >
                        Create project
                    </Button>
                </>
            }
        >
            <form id="create-project-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Project name"
                    placeholder="e.g. Q1 Website Redesign"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    autoFocus
                    maxLength={80}
                />

                <Textarea
                    label="Description"
                    placeholder="What's this project about? (optional)"
                    value={form.description}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={3}
                    maxLength={300}
                />

                {error && <p className="text-label-md text-error">{error}</p>}
            </form>
        </Modal>
    );
}