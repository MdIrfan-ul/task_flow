"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Stats {
    totalProjects: number;
    activeTasks: number;
    completedTasks: number;
    teamMembers: number;
    projectsGrowth: number;
    completionRate: number;
    onlineMembers: number;
}

const DEFAULT_STATS: Stats = {
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    projectsGrowth: 0,
    completionRate: 0,
    onlineMembers: 0,
};

function StatCard({
    icon,
    label,
    value,
    badge,
    badgeBg,
    badgeColor,
    trend,
    isLoading,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    badge?: string;
    badgeBg?: string;
    badgeColor?: string;
    trend?: number[];
    isLoading?: boolean;
}) {
    if (isLoading) {
        return (
            <div style={{
                background: "var(--color-surface-container-lowest)",
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                height: 110,
                animation: "pulse 1.5s ease-in-out infinite",
            }} />
        );
    }

    return (
        <div style={{
            background: "var(--color-surface-container-lowest)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
        }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{
                    width: 36, height: 36,
                    borderRadius: "var(--radius)",
                    background: "var(--color-surface-container)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--color-primary)",
                }}>
                    {icon}
                </div>
                {badge && (
                    <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: "3px 8px", borderRadius: 9999,
                        background: badgeBg ?? "var(--color-primary-fixed)",
                        color: badgeColor ?? "var(--color-on-primary-fixed)",
                    }}>
                        {badge}
                    </span>
                )}
            </div>

            <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    {label}
                </p>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                    <p style={{ fontSize: 28, fontWeight: 700, color: "var(--color-on-surface)", lineHeight: 1 }}>
                        {value}
                    </p>
                    {trend && (
                        <svg width="64" height="24" viewBox="0 0 64 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                            <polyline
                                points={trend.map((v, i) => `${(i / (trend.length - 1)) * 64},${24 - (v / Math.max(...trend)) * 20}`).join(" ")}
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function StatsCards() {
    const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiGet<Stats>("/dashboard/stats")
            .then(setStats)
            .catch(() => setStats(DEFAULT_STATS))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <StatCard
                isLoading={isLoading}
                icon={<ProjectIcon />}
                label="Total Projects"
                value={stats.totalProjects}
                badge={stats.projectsGrowth > 0 ? `+${stats.projectsGrowth} new` : undefined}
                badgeBg="var(--color-primary-fixed)"
                badgeColor="var(--color-on-primary-fixed)"
                trend={[3, 5, 4, 7, 6, 9, 8, stats.totalProjects || 1]}
            />
            <StatCard
                isLoading={isLoading}
                icon={<TaskIcon />}
                label="Active Tasks"
                value={stats.activeTasks}
                badge="On track"
                badgeBg="var(--color-secondary-fixed)"
                badgeColor="var(--color-on-secondary-fixed)"
                trend={[10, 14, 12, 18, 15, 20, 22, stats.activeTasks || 1]}
            />
            <StatCard
                isLoading={isLoading}
                icon={<CheckIcon />}
                label="Completed Tasks"
                value={stats.completedTasks}
                badge={`${stats.completionRate}% Rate`}
                badgeBg="var(--color-tertiary-fixed)"
                badgeColor="var(--color-on-tertiary-fixed)"
                trend={[20, 35, 28, 45, 40, 55, 60, stats.completedTasks || 1]}
            />
            <StatCard
                isLoading={isLoading}
                icon={<TeamIcon />}
                label="Team Members"
                value={stats.teamMembers}
                badge={stats.onlineMembers > 0 ? `${stats.onlineMembers} Online` : undefined}
                badgeBg="var(--color-primary-fixed)"
                badgeColor="var(--color-on-primary-fixed)"
                trend={[2, 2, 3, 3, 4, 4, 5, stats.teamMembers || 1]}
            />
        </div>
    );
}

function ProjectIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    );
}

function TaskIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M7 11l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function TeamIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M2 21c0-3 2.5-5 5-5s5 2 5 5M12 21c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}