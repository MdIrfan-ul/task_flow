"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { SkeletonRow } from "@/components/ui/Skeleton";

type ActivityType = "task_completed" | "comment_added" | "member_joined";

interface Activity {
    id: string;
    type: ActivityType;
    actorName: string;
    actorAvatar?: string | null;
    subject: string;
    context?: string;
    createdAt: string;
}

function formatTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

const activityConfig: Record<ActivityType, { bg: string; color: string; verb: string; suffix?: string }> = {
    task_completed: {
        bg: "var(--color-secondary-fixed)",
        color: "var(--color-on-secondary-fixed)",
        verb: "completed",
    },
    comment_added: {
        bg: "var(--color-primary-fixed)",
        color: "var(--color-primary)",
        verb: "commented on",
    },
    member_joined: {
        bg: "var(--color-tertiary-fixed)",
        color: "var(--color-tertiary)",
        verb: "joined",
        suffix: "workspace",
    },
};

function ActivityIcon({ type }: { type: ActivityType }) {
    const { bg, color } = activityConfig[type];
    return (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {type === "task_completed" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
            {type === "comment_added" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
            )}
            {type === "member_joined" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 11h6M19 8v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            )}
        </div>
    );
}

function ActivityItem({ activity, isLast }: { activity: Activity; isLast: boolean }) {
    const config = activityConfig[activity.type];
    return (
        <div style={{ display: "flex", gap: 12, position: "relative" }}>
            {!isLast && (
                <div style={{ position: "absolute", left: 15, top: 32, bottom: -16, width: 1, background: "var(--color-outline-variant)", opacity: 0.4 }} />
            )}
            <ActivityIcon type={activity.type} />
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <p style={{ fontSize: 13, color: "var(--color-on-surface)", lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600 }}>{activity.actorName}</span>{" "}
                        <span style={{ color: "var(--color-on-surface-variant)" }}>{config.verb}</span>{" "}
                        <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>{activity.subject}</span>
                        {config.suffix && <span style={{ color: "var(--color-on-surface-variant)" }}> {config.suffix}</span>}
                    </p>
                    <span style={{ fontSize: 11, color: "var(--color-on-surface-variant)", flexShrink: 0, whiteSpace: "nowrap" }}>
                        {formatTime(activity.createdAt)}
                    </span>
                </div>
                {activity.context && (
                    <p style={{
                        fontSize: 12, color: "var(--color-on-surface-variant)", marginTop: 4,
                        padding: "5px 10px", background: "var(--color-surface-container-low)",
                        borderRadius: "var(--radius-sm)", lineHeight: 1.5,
                        fontStyle: activity.type === "comment_added" ? "italic" : "normal",
                    }}>
                        {activity.type === "comment_added" ? `"${activity.context}"` : activity.context}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiGet<Activity[]>("/dashboard/activity")
            .then(setActivities)
            .catch(() => setActivities([]))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div style={{
            background: "var(--color-surface-container-lowest)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-on-surface)" }}>
                    Recent Activity
                </p>
                <button style={{ fontSize: 12, fontWeight: 500, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer" }}>
                    View History
                </button>
            </div>

            {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </div>
            ) : activities.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", textAlign: "center", padding: "24px 0" }}>
                    No recent activity yet. Complete tasks or add comments to see updates here.
                </p>
            ) : (
                <div>
                    {activities.map((activity, i) => (
                        <ActivityItem key={i + 1} activity={activity} isLast={i === activities.length - 1} />
                    ))}
                </div>
            )}
        </div>
    );
}