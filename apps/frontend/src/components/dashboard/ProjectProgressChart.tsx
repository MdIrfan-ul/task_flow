"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const PLACEHOLDER_DATA = [
    { name: "Q1 Web", progress: 75, planned: 90 },
    { name: "App V2", progress: 60, planned: 80 },
    { name: "Brand", progress: 90, planned: 85 },
    { name: "Sales", progress: 45, planned: 70 },
    { name: "DevOps", progress: 80, planned: 75 },
];

interface ProjectProgressChartProps {
    data?: { name: string; progress: number; planned: number }[];
}

export default function ProjectProgressChart({
    data = PLACEHOLDER_DATA,
}: ProjectProgressChartProps) {
    return (
        <div
            className="stat-card flex flex-col gap-4"
            style={{ height: "100%" }}
        >
            <div>
                <p
                    style={{
                        fontSize: "var(--text-headline-sm)",
                        fontWeight: 600,
                        color: "var(--color-on-surface)",
                        marginBottom: 4,
                    }}
                >
                    Project Progress Overview
                </p>
                <p style={{ fontSize: "var(--text-label-sm)", color: "var(--color-on-surface-variant)" }}>
                    Real-time status across active milestones
                </p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={data}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    barCategoryGap="30%"
                    barGap={4}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-outline-variant)"
                        opacity={0.4}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "var(--color-surface-container-lowest)",
                            border: "1px solid var(--color-outline-variant)",
                            borderRadius: "var(--radius)",
                            fontSize: 12,
                        }}
                        formatter={(value) => [`${value}%`]}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}
                    />
                    <Bar
                        dataKey="progress"
                        name="Progress"
                        fill="#004ac6"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="planned"
                        name="Planned"
                        fill="var(--color-surface-container-high)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}