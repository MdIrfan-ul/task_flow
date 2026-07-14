"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Workspace } from "@/types/workspace";

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (workspace: Workspace) => void;
}

export default function CreateWorkspaceModal({
    isOpen,
    onClose,
    onCreated,
}: CreateWorkspaceModalProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createWorkspace } = useWorkspaces();
    const { showToast } = useToast();

    const handleClose = () => {
        setName("");
        setError(null);
        onClose();
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Workspace name is required");
            return;
        }
        if (name.trim().length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const workspace = await createWorkspace({ name: name.trim() });
            showToast("Workspace created", "success");
            onCreated?.(workspace);
            handleClose();
        } catch {
            setError("Failed to create workspace. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="New workspace"
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                    >
                        Create workspace
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <Input
                    label="Workspace name"
                    placeholder="e.g. Acme Corp, Personal, Side Project"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError(null);
                    }}
                    autoFocus
                    maxLength={80}
                />
                {error && (
                    <p style={{ fontSize: "var(--text-label-md)", color: "var(--color-error)" }}>
                        {error}
                    </p>
                )}
            </div>
        </Modal>
    );
}