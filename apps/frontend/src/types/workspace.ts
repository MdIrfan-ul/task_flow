export type WorkspaceRole = "owner" | "admin" | "member";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    avatar_url?: string | null;
    created_at: string;
    myRole: WorkspaceRole;
}

export interface WorkspaceMember {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    role: WorkspaceRole;
    joinedAt: string;
}

export interface PendingInvite {
    id: string;
    email: string;
    role: WorkspaceRole;
    invitedAt: string;
}