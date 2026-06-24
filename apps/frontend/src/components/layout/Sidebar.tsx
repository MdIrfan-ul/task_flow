"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
    { label: "Workspaces", href: "/workspaces", icon: <WorkspacesIcon /> },
    { label: "Projects", href: "/projects", icon: <ProjectsIcon /> },
    { label: "My Tasks", href: "/my-tasks", icon: <TasksIcon /> },
    { label: "AI Assistant", href: "/ai-assistant", icon: <AIIcon /> },
    { label: "Reports", href: "/reports", icon: <ReportsIcon /> },
    { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
];

interface SidebarProps {
    onNewProject?: () => void;
}

export default function Sidebar({ onNewProject }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-sidebar-width h-screen bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col flex-shrink-0">
            <div className="px-6 py-5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                    <SparkIcon />
                </div>
                <div>
                    <p className="text-body-md font-semibold text-on-surface leading-tight">
                        TaskFlow
                    </p>
                    <p className="text-label-sm text-on-surface-variant leading-tight">
                        AI-Powered PM
                    </p>
                </div>
            </div>

            <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto scrollbar-thin">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname?.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={isActive ? "nav-item nav-item-active" : "nav-item"}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-3 py-4 border-t border-outline-variant/20">
                <button onClick={onNewProject} className="btn-primary w-full">
                    <PlusIcon />
                    New Project
                </button>
            </div>
        </aside>
    );
}

function SparkIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill="white"
            />
        </svg>
    );
}

function DashboardIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

function WorkspacesIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path
                d="M2 21c0-3 2.5-5 5-5s5 2 5 5M12 21c0-3 2.5-5 5-5s5 2 5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ProjectsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TasksIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M7 11l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function AIIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 3L14 9L20 11L14 13L12 19L10 13L4 11L10 9L12 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ReportsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path
                d="M12 1v4M12 19v4M4.2 4.2l2.9 2.9M16.9 16.9l2.9 2.9M1 12h4M19 12h4M4.2 19.8l2.9-2.9M16.9 7.1l2.9-2.9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}