"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import { SkeletonRow } from "../ui/Skeleton";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        avatarUrl?: string | null;
    };
}

interface CommentThreadProps {
    taskId: string;
}

function formatCommentTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CommentThread({ taskId }: CommentThreadProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    const fetchComments = useCallback(async () => {
        if (!taskId) return;
        setIsLoading(true);
        try {
            const data = await apiGet<Comment[]>(`/tasks/${taskId}/comments`);
            setComments(data);
        } finally {
            setIsLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Scroll to bottom when new comments load
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);

        // Optimistic update
        const optimistic: Comment = {
            id: `temp-${Date.now()}`,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            author: {
                id: user!.id,
                name: user!.name,
                avatarUrl: user!.avatarUrl,
            },
        };
        setComments((prev) => [...prev, optimistic]);
        setContent("");

        try {
            const saved = await apiPost<Comment>(`/tasks/${taskId}/comments`, {
                content: optimistic.content,
            });
            // Replace optimistic comment with real one from server
            setComments((prev) =>
                prev.map((c) => (c.id === optimistic.id ? saved : c))
            );
        } catch {
            // Revert on failure
            setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
            setContent(optimistic.content);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-label-md text-on-surface font-medium">
                Comments{" "}
                {comments.length > 0 && (
                    <span className="text-on-surface-variant font-normal">
                        ({comments.length})
                    </span>
                )}
            </p>

            {/* Comment list */}
            <div className="flex flex-col gap-4 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                {isLoading ? (
                    <>
                        <SkeletonRow />
                        <SkeletonRow />
                    </>
                ) : comments.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant text-center py-4">
                        No comments yet — be the first.
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar
                                src={comment.author.avatarUrl}
                                name={comment.author.name}
                                size="sm"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-label-md text-on-surface font-medium">
                                        {comment.author.name}
                                    </span>
                                    <span className="text-label-sm text-on-surface-variant flex-shrink-0">
                                        {formatCommentTime(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="text-body-sm text-on-surface leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Submit form */}
            <form onSubmit={handleSubmit} className="flex gap-2 items-start pt-1 border-t border-outline-variant/20">
                {user && (
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                )}
                <div className="flex-1 flex gap-2">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write a comment..."
                        rows={1}
                        maxLength={2000}
                        onKeyDown={(e) => {
                            // Cmd/Ctrl + Enter to submit
                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                                handleSubmit(e);
                            }
                        }}
                        className="input-field resize-none flex-1 text-body-sm py-2"
                        style={{ minHeight: "38px" }}
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="btn-primary px-3 py-2 text-label-sm disabled:opacity-40 flex-shrink-0"
                        aria-label="Submit comment"
                    >
                        <SendIcon />
                    </button>
                </div>
            </form>
        </div>
    );
}

function SendIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}