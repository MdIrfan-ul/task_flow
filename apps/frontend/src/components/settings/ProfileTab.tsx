"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import api from "@/lib/api";

export default function ProfileTab() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [name, setName] = useState(user?.name ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (3MB)
        if (file.size > 3 * 1024 * 1024) {
            showToast("File must be under 3MB", "error");
            return;
        }

        // Validate type
        if (!["image/png", "image/jpg", "image/jpeg"].includes(file.type)) {
            showToast("Only PNG or JPG files are allowed", "error");
            return;
        }

        setSelectedFile(file);
        console.log(file, URL.createObjectURL(file));
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setIsSaving(true);

        try {
            // Use FormData since backend uses FileInterceptor (multipart/form-data)
            const formData = new FormData();
            if (name.trim() && name !== user.name) {
                formData.append("name", name.trim());
            }
            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            await api.patch(`/users/${user.id}/profile`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            showToast("Profile updated", "success");
            setSelectedFile(null);
        } catch {
            showToast("Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const avatarSrc = previewUrl ?? user?.avatarUrl;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

            {/* Personal info card */}
            <div style={{
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)" }}>
                    Personal Information
                </h2>

                {/* Avatar upload */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ position: "relative" }}>
                        <Avatar src={avatarSrc} name={user?.name ?? ""} size="lg" />
                        {selectedFile && (
                            <div style={{
                                position: "absolute", inset: 0, borderRadius: "50%",
                                border: "2px solid var(--color-primary)",
                            }} />
                        )}
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-on-surface)", marginBottom: 4 }}>
                            Profile photo
                        </p>
                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginBottom: 8 }}>
                            PNG or JPG, max 3MB
                        </p>
                        <label
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                fontSize: 12, fontWeight: 500, color: "var(--color-primary)",
                                cursor: "pointer", padding: "6px 12px",
                                border: "1px solid var(--color-primary)",
                                borderRadius: "var(--radius-full)",
                                display: "inline-block",
                            }}
                        >
                            {selectedFile ? "Change again" : "Change photo"}
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpg,image/jpeg"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        {selectedFile && (
                            <p style={{ fontSize: 11, color: "var(--color-secondary)", marginTop: 4 }}>
                                ✓ {selectedFile.name}
                            </p>
                        )}
                    </div>
                </div>

                <Input
                    label="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                />

                <Input
                    label="Email"
                    value={user?.email ?? ""}
                    disabled
                    hint="Contact support to change your email"
                />

                <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={!selectedFile && name === user?.name}
                >
                    Save changes
                </Button>
            </div>

            {/* Danger zone */}
            <div style={{
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-error-container)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
            }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-error)", marginBottom: 8 }}>
                    Danger Zone
                </h2>
                <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginBottom: 16, lineHeight: 1.5 }}>
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                <button style={{
                    fontSize: 13, fontWeight: 500, padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--color-error)",
                    color: "var(--color-error)",
                    background: "transparent",
                    cursor: "pointer",
                }}>
                    Delete account
                </button>
            </div>
        </div>
    );
}