"use client";

import { useAuth } from "@/context/AuthContext";
import { SkeletonCard } from "@/components/ui/Skeleton";

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
}

export default function DashboardPage() {
    const { user } = useAuth();
    const firstName = user?.name?.split(" ")[0] ?? "";

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-headline-lg text-on-surface">
                        {getGreeting()}, {firstName}
                    </h1>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                        Here&apos;s what&apos;s happening across your projects today.
                    </p>
                </div>
                <button className="btn-secondary flex items-center gap-2 text-label-md">
                    <CalendarIcon />
                    This Week
                </button>
            </div>

            {/* Stats row — placeholder until StatsCards component is built */}
            <div className="grid grid-cols-4 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>

            {/* Middle row placeholder */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 h-72 bg-surface-container-lowest rounded-md border border-outline-variant/30 flex items-center justify-center">
                    <p className="text-body-sm text-on-surface-variant">
                        Project Progress Chart — coming soon
                    </p>
                </div>
                <div className="h-72 bg-surface-container-lowest rounded-md border border-outline-variant/30 flex items-center justify-center">
                    <p className="text-body-sm text-on-surface-variant">
                        AI Insights — coming soon
                    </p>
                </div>
            </div>

            {/* Bottom row placeholder */}
            <div className="grid grid-cols-2 gap-6">
                <div className="h-56 bg-surface-container-lowest rounded-md border border-outline-variant/30 flex items-center justify-center">
                    <p className="text-body-sm text-on-surface-variant">
                        Task Trend — coming soon
                    </p>
                </div>
                <div className="h-56 bg-surface-container-lowest rounded-md border border-outline-variant/30 flex items-center justify-center">
                    <p className="text-body-sm text-on-surface-variant">
                        Activity Feed — coming soon
                    </p>
                </div>
            </div>
        </div>
    );
}

function CalendarIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}