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

function StatCard({
    icon,
    label,
    value,
    badge,
    badgeColor,
    trend,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    badge?: string;
    badgeColor?: "success" | "info" | "warning";
    trend?: number[];
}) {
    const badgeClasses = {
        success: "bg-[#e1e0ff] text-[#07006c]",
        info: "bg-[#dbe1ff] text-[#00174b]",
        warning: "bg-[#f0dbff] text-[#2c0051]",
    };

    return (
        <div className="stat-card flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius)",
                        background: "var(--color-surface-container)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-primary)",
                    }}
                >
                    {icon}
                </div>
                {badge && (
                    <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeClasses[badgeColor ?? "info"]}`}
                    >
                        {badge}
                    </span>
                )}
            </div>

            <div>
                <p
                    style={{
                        fontSize: "var(--text-label-sm)",
                        color: "var(--color-on-surface-variant)",
                        marginBottom: 4,
                    }}
                >
                    {label}
                </p>
                <p
                    style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--color-on-surface)",
                        lineHeight: 1,
                    }}
                >
                    {value}
                </p>
            </div>

            {/* Mini sparkline */}
            {trend && (
                <svg width="80" height="24" viewBox="0 0 80 24" aria-hidden="true">
                    <polyline
                        points={trend
                            .map((v, i) => `${(i / (trend.length - 1)) * 80},${24 - (v / Math.max(...trend)) * 20}`)
                            .join(" ")}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
    );
}

export default function StatsCards() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await apiGet<Stats>("/dashboard/stats");
                setStats(data);
            } catch {
                // Use placeholder data if endpoint not ready yet
                setStats({
                    totalProjects: 0,
                    activeTasks: 0,
                    completedTasks: 0,
                    teamMembers: 0,
                    projectsGrowth: 2,
                    completionRate: 84,
                    onlineMembers: 0,
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="stat-card animate-pulse"
                        style={{ height: 120 }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
                icon={<ProjectIcon />}
                label="Total Projects"
                value={stats?.totalProjects ?? 0}
                badge={`+${stats?.projectsGrowth ?? 0} new`}
                badgeColor="info"
                trend={[3, 5, 4, 7, 6, 9, 8, 12]}
            />
            <StatCard
                icon={<TaskIcon />}
                label="Active Tasks"
                value={stats?.activeTasks ?? 0}
                badge="On track"
                badgeColor="success"
                trend={[10, 14, 12, 18, 15, 20, 22, 25]}
            />
            <StatCard
                icon={<CheckIcon />}
                label="Completed Tasks"
                value={stats?.completedTasks ?? 0}
                badge={`${stats?.completionRate ?? 0}% Rate`}
                badgeColor="warning"
                trend={[20, 35, 28, 45, 40, 55, 60, 70]}
            />
            <StatCard
                icon={<TeamIcon />}
                label="Team Members"
                value={stats?.teamMembers ?? 0}
                badge={`${stats?.onlineMembers ?? 0} Online`}
                badgeColor="info"
                trend={[2, 2, 3, 3, 4, 4, 5, 5]}
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