"use client";

import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Generate 14 days of placeholder data
function generateTrendData() {
    const data = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            completed: Math.floor(Math.random() * 8) + 2,
        });
    }
    return data;
}

const PLACEHOLDER_DATA = generateTrendData();

interface TaskTrendChartProps {
    data?: { date: string; completed: number }[];
}

interface TrendData {
    date: string;
    completed: number;
}

export default function TaskTrendChart() {
    const [data, setData] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<TrendData[]>("/dashboard/task-completion-trend")
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="stat-card flex items-center justify-center h-[220px]">
                Loading...
            </div>
        );
    }

    return (
        <div className="stat-card flex flex-col gap-4">
            <div>
                <p
                    style={{
                        fontSize: "var(--text-headline-sm)",
                        fontWeight: 600,
                        color: "var(--color-on-surface)",
                        marginBottom: 4,
                    }}
                >
                    Task Completion Trend
                </p>
                <p
                    style={{
                        fontSize: "var(--text-label-sm)",
                        color: "var(--color-on-surface-variant)",
                    }}
                >
                    Efficiency measured over 14 days
                </p>
            </div>

            <ResponsiveContainer width="100%" height={160}>
                <AreaChart
                    data={data}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#004ac6" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#004ac6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-outline-variant)"
                        opacity={0.4}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "var(--color-on-surface-variant)" }}
                        axisLine={false}
                        tickLine={false}
                        interval={3}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: "var(--color-on-surface-variant)" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "var(--color-surface-container-lowest)",
                            border: "1px solid var(--color-outline-variant)",
                            borderRadius: "var(--radius)",
                            fontSize: 12,
                        }}
                        formatter={(value) => [`${value} tasks`, "Completed"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#004ac6"
                        strokeWidth={2}
                        fill="url(#completedGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#004ac6" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}