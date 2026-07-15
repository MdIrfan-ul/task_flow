"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { useToast } from "../ui/Toast";
import { apiPost } from "@/lib/api";
import { AxiosError } from "axios";

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

interface CreatedProject {
    id: string;
    name: string;
    workspace_id: string | number;
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
            const project = await apiPost<CreatedProject>(
                `/workspaces/${workspaceId}/projects`,
                {
                    name: form.name.trim(),
                    description: form.description.trim(),
                }
            );

            showToast("Project created", "success");
            onCreated?.(project);
            handleClose();

            // Use the workspace_id the API actually created the project under,
            // rather than trusting the prop we were passed — this route only
            // exists nested under a workspace (/workspaces/:id/projects/:id).
            const url = `/workspaces/${workspaceId}/projects/${project.id}`;


            // router.push(`/workspaces/${project.workspace_id}/projects/${project.id}`);
            router.push(url);
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? err.response?.data?.message || "Failed to create project"
                    : "Something went wrong";
            setError(message);
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