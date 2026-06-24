"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";
import {
    PendingInvite,
    Workspace,
    WorkspaceMember,
    WorkspaceRole,
} from "../types/workspace";

interface UseWorkspaceResult {
    workspace: Workspace | null;
    members: WorkspaceMember[];
    pendingInvites: PendingInvite[];
    isLoading: boolean;
    error: string | null;
    isOwner: boolean;
    isOwnerOrAdmin: boolean;
    inviteMember: (email: string, role: WorkspaceRole) => Promise<void>;
    removeMember: (memberId: string) => Promise<void>;
    updateMemberRole: (memberId: string, role: WorkspaceRole) => Promise<void>;
    revokeInvite: (inviteId: string) => Promise<void>;
    refetch: () => Promise<void>;
}

/**
 * Fetches a single workspace by ID, plus its members and pending
 * invites. The workspaceId comes from the URL (e.g. params.workspaceId
 * in app/(dashboard)/workspaces/[workspaceId]/page.tsx) — this hook
 * doesn't track "current workspace" itself, the route does.
 *
 * Pass null/undefined while the ID isn't known yet (e.g. during the
 * brief window before Next.js resolves dynamic params) and the hook
 * will simply stay idle.
 */
export function useWorkspace(workspaceId: string | undefined): UseWorkspaceResult {
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkspace = useCallback(async () => {
        if (!workspaceId) return;

        setIsLoading(true);
        setError(null);

        try {
            const [workspaceData, membersData, invitesData] = await Promise.all([
                apiGet<Workspace>(`/workspaces/${workspaceId}`),
                apiGet<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),
                apiGet<PendingInvite[]>(`/workspaces/${workspaceId}/invites`),
            ]);

            setWorkspace(workspaceData);
            setMembers(membersData);
            setPendingInvites(invitesData);
        } catch {
            setError("Couldn't load this workspace. It may not exist, or you may not have access.");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchWorkspace();
    }, [fetchWorkspace]);

    const inviteMember = useCallback(
        async (email: string, role: WorkspaceRole) => {
            if (!workspaceId) return;
            const invite = await apiPost<PendingInvite>(
                `/workspaces/${workspaceId}/invite`,
                { email, role }
            );
            setPendingInvites((prev) => [...prev, invite]);
        },
        [workspaceId]
    );

    const removeMember = useCallback(
        async (memberId: string) => {
            if (!workspaceId) return;
            await apiDelete(`/workspaces/${workspaceId}/members/${memberId}`);
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        },
        [workspaceId]
    );

    const updateMemberRole = useCallback(
        async (memberId: string, role: WorkspaceRole) => {
            if (!workspaceId) return;
            const updated = await apiPatch<WorkspaceMember>(
                `/workspaces/${workspaceId}/members/${memberId}`,
                { role }
            );
            setMembers((prev) =>
                prev.map((m) => (m.id === memberId ? updated : m))
            );
        },
        [workspaceId]
    );

    const revokeInvite = useCallback(
        async (inviteId: string) => {
            if (!workspaceId) return;
            await apiDelete(`/workspaces/${workspaceId}/invites/${inviteId}`);
            setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
        },
        [workspaceId]
    );

    return {
        workspace,
        members,
        pendingInvites,
        isLoading,
        error,
        isOwner: workspace?.myRole === "owner",
        isOwnerOrAdmin: workspace?.myRole === "owner" || workspace?.myRole === "admin",
        inviteMember,
        removeMember,
        updateMemberRole,
        revokeInvite,
        refetch: fetchWorkspace,
    };
}