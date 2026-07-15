"use client";

import { useState } from "react";
import Avatar from "../ui/Avatar";

interface HeaderUser {
    name: string;
    role: string;
    avatarUrl?: string | null;
}

interface HeaderProps {
    user: HeaderUser;
    hasUnreadNotifications?: boolean;
    onSearch?: (query: string) => void;
    onNotificationsClick?: () => void;
    onProfileClick?: () => void;
}

export default function Header({
    user,
    hasUnreadNotifications = false,
    onSearch,
    onNotificationsClick,
    onProfileClick,
}: HeaderProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(query);
    };

    return (
        <header className="h-header-height bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-8 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex-1 max-w-md">
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        <SearchIcon />
                    </span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tasks, projects, or team..."
                        className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-transparent rounded-full text-body-sm text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                        aria-label="Search tasks, projects, or team"
                    />
                </div>
            </form>

            <div className="flex items-center gap-5 flex-shrink-0 ml-6">
                <button
                    onClick={onNotificationsClick}
                    className="relative text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label="Notifications"
                >
                    <BellIcon />
                    {hasUnreadNotifications && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-error" />
                    )}
                </button>

                <button
                    onClick={onProfileClick}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-label-md text-on-surface leading-tight">
                            {user.name}
                        </p>
                        <p className="text-label-sm text-on-surface-variant leading-tight">
                            {user.role}
                        </p>
                    </div>
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                </button>
            </div>
        </header>
    );
}

function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function BellIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M18 8a6 6 0 10-12 0c0 4-2 5-2 6h16c0-1-2-2-2-6Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}