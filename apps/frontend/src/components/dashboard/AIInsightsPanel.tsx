"use client";

import { useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface Insight {
    type: "risk" | "action" | "deadline";
    title: string;
    description: string;
}

const PLACEHOLDER_INSIGHTS: Insight[] = [
    {
        type: "risk",
        title: "3 Projects at risk",
        description: "Resource bottleneck detected in Backend Dev.",
    },
    {
        type: "action",
        title: "Suggested action",
        description: "Reassign Task #42 to Sarah to optimize velocity.",
    },
    {
        type: "deadline",
        title: "Next deadline: Tomorrow",
        description: "Client Presentation: Design Systems Review.",
    },
];

const insightConfig = {
    risk: {
        icon: <RiskIcon />,
        color: "var(--color-error)",
        bg: "var(--color-error-container)",
    },
    action: {
        icon: <ActionIcon />,
        bg: "var(--color-primary-fixed)",
        color: "var(--color-primary)",
    },
    deadline: {
        icon: <DeadlineIcon />,
        bg: "var(--color-tertiary-fixed)",
        color: "var(--color-tertiary)",
    },
};

interface Project {
    id: number;
    name: string;
}

interface AIInsightsPanelProps {
    projects: Project[];
}

export default function AIInsightsPanel() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insights, setInsights] = useState<Insight[]>(PLACEHOLDER_INSIGHTS);
    const { showToast } = useToast();

    const runDeepAnalysis = async () => {
        setIsAnalyzing(true);

        try {
            const data = await apiGet<{ insights: Insight[] }>(
                "/ai/dashboard-insights"
            );

            setInsights(data.insights);
            showToast("Analysis complete", "success");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div
            className="ai-gradient-border flex flex-col gap-4 rounded-lg p-5"
            style={{ height: "100%" }}
        >
            {/* Header */}
            <div className="flex items-center gap-2">
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7a1bc8, #004ac6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <SparkIcon />
                </div>
                <p
                    style={{
                        fontSize: "var(--text-headline-sm)",
                        fontWeight: 600,
                        color: "var(--color-on-surface)",
                    }}
                >
                    AI Insights
                </p>
            </div>

            {/* Insight cards */}
            <div className="flex flex-col gap-3 flex-1">
                {insights.map((insight, i) => {
                    const config = insightConfig[insight.type];
                    return (
                        <div
                            key={i}
                            style={{
                                background: config.bg,
                                borderRadius: "var(--radius)",
                                padding: "10px 12px",
                                display: "flex",
                                gap: 10,
                                alignItems: "flex-start",
                            }}
                        >
                            <span style={{ color: config.color, flexShrink: 0, marginTop: 1 }}>
                                {config.icon}
                            </span>
                            <div>
                                <p
                                    style={{
                                        fontSize: "var(--text-label-md)",
                                        fontWeight: 600,
                                        color: config.color,
                                        marginBottom: 2,
                                    }}
                                >
                                    {insight.title}
                                </p>
                                <p
                                    style={{
                                        fontSize: "var(--text-label-sm)",
                                        color: "var(--color-on-surface-variant)",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {insight.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Run Deep Analysis button */}
            <button
                onClick={runDeepAnalysis}
                disabled={isAnalyzing}
                style={{
                    width: "100%",
                    padding: "10px",
                    background: "var(--color-on-surface)",
                    color: "var(--color-surface-container-lowest)",
                    borderRadius: "var(--radius)",
                    fontSize: "var(--text-label-md)",
                    fontWeight: 500,
                    border: "none",
                    cursor: isAnalyzing ? "not-allowed" : "pointer",
                    opacity: isAnalyzing ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "opacity 0.15s",
                }}
            >
                {isAnalyzing ? (
                    <>
                        <span
                            style={{
                                width: 14,
                                height: 14,
                                border: "2px solid currentColor",
                                borderTopColor: "transparent",
                                borderRadius: "50%",
                                display: "inline-block",
                                animation: "spin 0.8s linear infinite",
                            }}
                        />
                        Analyzing...
                    </>
                ) : (
                    <>Run Deep Analysis →</>
                )}
            </button>
        </div>
    );
}

function SparkIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
        </svg>
    );
}

function RiskIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ActionIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function DeadlineIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}