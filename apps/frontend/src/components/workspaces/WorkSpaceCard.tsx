"use client";

import { useRouter } from "next/navigation";
import { Workspace } from "@/types/workspace";
import Avatar from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

interface WorkspaceCardProps {
    workspace: Workspace;
}

const roleColors: Record<string, "info" | "success" | "neutral"> = {
    owner: "info",
    admin: "success",
    member: "neutral",
};

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(`/workspaces/${workspace.id}`)}
            style={{
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-md)",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--color-primary)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "var(--shadow-card)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--color-outline-variant)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar
                    src={workspace.avatarUrl}
                    name={workspace.name}
                    size="md"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                        style={{
                            fontSize: "var(--text-body-md)",
                            fontWeight: 600,
                            color: "var(--color-on-surface)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {workspace.name}
                    </p>
                    <p
                        style={{
                            fontSize: "var(--text-label-sm)",
                            color: "var(--color-on-surface-variant)",
                        }}
                    >
                        /{workspace.slug}
                    </p>
                </div>
                <Badge color={roleColors[workspace.myRole] ?? "neutral"}>
                    {workspace.myRole}
                </Badge>
            </div>

            {/* Footer */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid var(--color-outline-variant)",
                }}
            >
                <p
                    style={{
                        fontSize: "var(--text-label-sm)",
                        color: "var(--color-on-surface-variant)",
                    }}
                >
                    Created {new Date(workspace.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </p>
                <span
                    style={{
                        fontSize: "var(--text-label-sm)",
                        color: "var(--color-primary)",
                        fontWeight: 500,
                    }}
                >
                    Open →
                </span>
            </div>
        </div>
    );
}