"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";
import { apiGet, apiPost } from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import Skeleton, { SkeletonRow } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { WorkspaceRole } from "@/types/workspace";

interface Project {
    id: number;
    name: string;
    description?: string;
    created_at: string;
}

type Tab = "projects" | "members" | "settings";

export default function WorkspaceDetailPage() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const router = useRouter();
    const { showToast } = useToast();

    const { workspace, members, isLoading, isOwnerOrAdmin, inviteMember, removeMember } =
        useWorkspace(workspaceId);

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("projects");
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        if (!workspaceId) return;
        setProjectsLoading(true);
        apiGet<Project[]>(`/workspaces/${workspaceId}/projects`)
            .then(setProjects)
            .catch(() => showToast("Couldn't load projects", "error"))
            .finally(() => setProjectsLoading(false));
    }, [workspaceId, showToast]);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setIsInviting(true);
        try {
            await inviteMember(inviteEmail.trim(), "member");
            showToast(`Invited ${inviteEmail}`, "success");
            setInviteEmail("");
        } catch {
            showToast("Failed to invite member", "error");
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm("Remove this member from the workspace?")) return;
        try {
            await removeMember(memberId);
            showToast("Member removed", "success");
        } catch {
            showToast("Failed to remove member", "error");
        }
    };

    const TABS: { id: Tab; label: string }[] = [
        { id: "projects", label: "Projects" },
        { id: "members", label: `Members (${members.length})` },
        ...(isOwnerOrAdmin ? [{ id: "settings" as Tab, label: "Settings" }] : []),
    ];

    return (
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>

            {/* Back */}
            <button
                onClick={() => router.push("/workspaces")}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-on-surface-variant)", background: "none", border: "none", cursor: "pointer", marginBottom: 24, padding: 0 }}
            >
                <BackIcon /> All Workspaces
            </button>

            {/* Workspace header */}
            {isLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-surface-container)", animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Avatar src={workspace?.avatarUrl} name={workspace?.name ?? ""} size="lg" />
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-on-surface)", marginBottom: 4 }}>
                                {workspace?.name}
                            </h1>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                                    /{workspace?.slug}
                                </span>
                                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--color-outline-variant)" }} />
                                <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: "var(--color-primary-fixed)", color: "var(--color-on-primary-fixed)" }}>
                                    {workspace?.myRole}
                                </span>
                            </div>
                        </div>
                    </div>

                    {activeTab === "projects" && isOwnerOrAdmin && (
                        <Button variant="primary" onClick={() => setIsCreateProjectOpen(true)} icon={<PlusIcon />}>
                            New project
                        </Button>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-outline-variant)", marginBottom: 28, gap: 0 }}>
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "10px 20px",
                            fontSize: 14,
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                            background: "none",
                            border: "none",
                            borderBottom: activeTab === tab.id ? "2px solid var(--color-primary)" : "2px solid transparent",
                            marginBottom: -1,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Projects tab */}
            {activeTab === "projects" && (
                <>
                    {projectsLoading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : projects.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--color-surface-container-lowest)", border: "2px dashed var(--color-outline-variant)", borderRadius: "var(--radius-lg)" }}>
                            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 8 }}>No projects yet</p>
                            <p style={{ fontSize: 14, color: "var(--color-on-surface-variant)", marginBottom: 20 }}>
                                Create your first project to start adding tasks
                            </p>
                            {isOwnerOrAdmin && (
                                <Button variant="primary" onClick={() => setIsCreateProjectOpen(true)} icon={<PlusIcon />}>
                                    New project
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => router.push(`/workspaces/${workspaceId}/projects/${project.id}`)}
                                    style={{
                                        background: "var(--color-surface-container-lowest)",
                                        border: "1px solid var(--color-outline-variant)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "18px 20px",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                    }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget as HTMLDivElement;
                                        el.style.borderColor = "var(--color-primary)";
                                        el.style.boxShadow = "0px 4px 20px rgba(0,74,198,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget as HTMLDivElement;
                                        el.style.borderColor = "var(--color-outline-variant)";
                                        el.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius)", background: "var(--color-primary-fixed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <FolderIcon />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {project.name}
                                        </p>
                                        {project.description && (
                                            <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {project.description}
                                            </p>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 12, color: "var(--color-primary)", flexShrink: 0 }}>→</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Members tab */}
            {activeTab === "members" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Invite form — owners/admins only */}
                    {isOwnerOrAdmin && (
                        <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "16px 20px" }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 12 }}>
                                Invite a member
                            </p>
                            <div style={{ display: "flex", gap: 10 }}>
                                <Input
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                                />
                                <Button variant="primary" onClick={handleInvite} isLoading={isInviting}>
                                    Invite
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Members list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {isLoading ? (
                            <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                        ) : (
                            members.map((member) => {
                                const roleStyle: Record<string, { bg: string; color: string }> = {
                                    owner: { bg: "#dbe1ff", color: "#00174b" },
                                    admin: { bg: "#e1e0ff", color: "#07006c" },
                                    member: { bg: "#eaedff", color: "#434655" },
                                };
                                const rs = roleStyle[member.role] ?? roleStyle.member;
                                return (
                                    <div
                                        key={member.id}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)" }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <Avatar src={member.avatarUrl} name={member.name} size="sm" />
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-on-surface)" }}>{member.name}</p>
                                                <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{member.email}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: rs.bg, color: rs.color }}>
                                                {member.role}
                                            </span>
                                            {isOwnerOrAdmin && member.role !== "owner" && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    style={{ fontSize: 12, color: "var(--color-error)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "var(--radius-sm)" }}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Settings tab */}
            {activeTab === "settings" && (
                <div style={{ maxWidth: 480 }}>
                    <div style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)", marginBottom: 16 }}>Workspace settings</p>
                        <Input label="Workspace name" defaultValue={workspace?.name} />
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-outline-variant)" }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-error)", marginBottom: 8 }}>Danger zone</p>
                            <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", marginBottom: 12 }}>
                                Deleting a workspace is permanent and cannot be undone.
                            </p>
                            <button style={{ fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-error)", color: "var(--color-error)", background: "transparent", cursor: "pointer" }}>
                                Delete workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create project modal */}
            <CreateProjectModal
                isOpen={isCreateProjectOpen}
                onClose={() => setIsCreateProjectOpen(false)}
                workspaceId={workspaceId}
                onCreated={(project) => {
                    setProjects((prev) => [...prev, project as any]);
                    setIsCreateProjectOpen(false);
                }}
            />
        </div>
    );
}

function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

function BackIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function FolderIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    );
}