"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { Workspace, WorkspaceStats } from "../types/workspace";

interface CreateWorkspacePayload {
    name: string;
}

interface UseWorkspacesResult {
    workspaces: Workspace[];
    isLoading: boolean;
    error: string | null;
    createWorkspace: (payload: CreateWorkspacePayload) => Promise<Workspace>;
    refetch: () => Promise<void>;
    workspaceStats: WorkspaceStats | undefined;
}

/**
 * Fetches every workspace the current user belongs to. Used by the
 * sidebar's workspace switcher and the /workspaces list page.
 *
 * For the "currently active" workspace and its members, use
 * useWorkspace(workspaceId) instead — the active workspace is derived
 * from the URL, not from this hook.
 */
export function useWorkspaces(): UseWorkspacesResult {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [workspaceStats, setWorkspaceStats] = useState<WorkspaceStats | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkspaces = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiGet<Workspace[]>("/workspaces/mine");
            setWorkspaces(data);
        } catch {
            setError("Couldn't load your workspaces. Try refreshing.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiGet<WorkspaceStats>("/workspaces/stats");
            console.log("stats response:", data);
            setWorkspaceStats(data);

        } catch {
            setError("Couldn't load your workspaces. Try refreshing.");

        } finally {
            setIsLoading(false);

        }
    }, [])

    const createWorkspace = useCallback(
        async (payload: CreateWorkspacePayload) => {
            const created = await apiPost<Workspace>("/workspaces", payload);
            setWorkspaces((prev) => [...prev, created]);
            return created;
        },
        []
    );

    const refetch = useCallback(async () => {
        await Promise.all([
            fetchWorkspaces(),
            fetchStats(),
        ]);
    }, [fetchWorkspaces, fetchStats]);


    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        workspaces,
        isLoading,
        error,
        createWorkspace,
        workspaceStats,
        refetch
    };
}