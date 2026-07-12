"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface SummaryData {
    summary: string;
    completedCount: number;
    inProgressCount: number;
    todoCount: number;
    highlights: string[];
    blockers: string[];
}

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName?: string;
}

export default function SummaryModal({
    isOpen,
    onClose,
    projectId,
    projectName = "Project",
}: SummaryModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const { showToast } = useToast();

    const fetchSummary = async () => {
        setIsLoading(true);
        setSummary(null);
        try {
            const data = await apiPost<SummaryData>("/ai/summarize", { projectId });
            setSummary(data);
        } catch {
            showToast("Failed to generate summary", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        if (!summary) fetchSummary();
    };

    // Auto-fetch when modal opens
    if (isOpen && !summary && !isLoading) {
        fetchSummary();
    }

    const total =
        (summary?.completedCount ?? 0) +
        (summary?.inProgressCount ?? 0) +
        (summary?.todoCount ?? 0);

    const completionPct =
        total > 0
            ? Math.round(((summary?.completedCount ?? 0) / total) * 100)
            : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Progress Summary — ${projectName}`}
            size="md"
            footer={
                <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" onClick={fetchSummary} isLoading={isLoading}>
                        Regenerate
                    </Button>
                    <Button variant="primary" onClick={onClose}>
                        Done
                    </Button>
                </div>
            }
        >
            {isLoading ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        padding: "32px 0",
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #7a1bc8, #004ac6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            animation: "pulse 1.5s ease-in-out infinite",
                        }}
                    >
                        <SparkIcon />
                    </div>
                    <p
                        style={{
                            fontSize: "var(--text-body-sm)",
                            color: "var(--color-on-surface-variant)",
                        }}
                    >
                        AI is analyzing your project...
                    </p>
                </div>
            ) : summary ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Progress bar */}
                    <div
                        style={{
                            padding: "16px",
                            background: "var(--color-surface-container-low)",
                            borderRadius: "var(--radius)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 8,
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "var(--text-label-md)",
                                    fontWeight: 500,
                                    color: "var(--color-on-surface)",
                                }}
                            >
                                Overall Completion
                            </p>
                            <p
                                style={{
                                    fontSize: "var(--text-label-md)",
                                    fontWeight: 700,
                                    color: "var(--color-primary)",
                                }}
                            >
                                {completionPct}%
                            </p>
                        </div>
                        <div
                            style={{
                                height: 8,
                                background: "var(--color-surface-container-high)",
                                borderRadius: "var(--radius-full)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${completionPct}%`,
                                    background: "linear-gradient(90deg, #004ac6, #4648d4)",
                                    borderRadius: "var(--radius-full)",
                                    transition: "width 0.6s ease",
                                }}
                            />
                        </div>
                        {/* Task breakdown */}
                        <div
                            style={{
                                display: "flex",
                                gap: 16,
                                marginTop: 12,
                            }}
                        >
                            {[
                                { label: "Done", value: summary.completedCount, color: "#4648d4" },
                                { label: "In Progress", value: summary.inProgressCount, color: "#004ac6" },
                                { label: "To Do", value: summary.todoCount, color: "var(--color-outline)" },
                            ].map((item) => (
                                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: "50%",
                                            background: item.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: "var(--text-label-sm)",
                                            color: "var(--color-on-surface-variant)",
                                        }}
                                    >
                                        {item.value} {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Summary text */}
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #7a1bc8, #004ac6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <SparkIcon size={12} />
                            </div>
                            <p
                                style={{
                                    fontSize: "var(--text-label-md)",
                                    fontWeight: 500,
                                    color: "var(--color-on-surface)",
                                }}
                            >
                                AI Summary
                            </p>
                        </div>
                        <p
                            style={{
                                fontSize: "var(--text-body-sm)",
                                color: "var(--color-on-surface)",
                                lineHeight: 1.7,
                                padding: "12px 14px",
                                background: "var(--color-surface-container-low)",
                                borderRadius: "var(--radius)",
                                borderLeft: "3px solid var(--color-primary)",
                            }}
                        >
                            {summary.summary}
                        </p>
                    </div>

                    {/* Highlights */}
                    {summary.highlights?.length > 0 && (
                        <div>
                            <p
                                style={{
                                    fontSize: "var(--text-label-md)",
                                    fontWeight: 500,
                                    color: "var(--color-on-surface)",
                                    marginBottom: 8,
                                }}
                            >
                                ✅ Highlights
                            </p>
                            <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {summary.highlights.map((h, i) => (
                                    <li
                                        key={i}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 8,
                                            fontSize: "var(--text-body-sm)",
                                            color: "var(--color-on-surface)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: "var(--color-secondary)",
                                                flexShrink: 0,
                                                marginTop: 2,
                                            }}
                                        >
                                            •
                                        </span>
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Blockers */}
                    {summary.blockers?.length > 0 && (
                        <div>
                            <p
                                style={{
                                    fontSize: "var(--text-label-md)",
                                    fontWeight: 500,
                                    color: "var(--color-on-surface)",
                                    marginBottom: 8,
                                }}
                            >
                                ⚠️ Blockers
                            </p>
                            <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {summary.blockers.map((b, i) => (
                                    <li
                                        key={i}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 8,
                                            fontSize: "var(--text-body-sm)",
                                            color: "var(--color-on-surface)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: "var(--color-error)",
                                                flexShrink: 0,
                                                marginTop: 2,
                                            }}
                                        >
                                            •
                                        </span>
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : null}
        </Modal>
    );
}

function SparkIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill="white"
            />
        </svg>
    );
}