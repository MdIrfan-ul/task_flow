"use client";

import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
} from "recharts";

interface ProjectProgress {
    name: string;
    progress: number;
    planned: number;
}

export default function ProjectProgressChart() {
    const [data, setData] = useState<ProjectProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<ProjectProgress[]>("/dashboard/project-progress")
            .then(setData)
            .catch((err) => {
                console.error(err);
                setData([]);
            })
            .finally(() => setLoading(false));
    }, []);
    if (loading) {
        return (
            <div className="stat-card flex items-center justify-center h-full">
                Loading...
            </div>
        );
    }

    return (
        <div className="stat-card flex flex-col gap-4"
            style={{ height: "100%" }}>
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

                <p
                    style={{
                        fontSize: "var(--text-label-sm)",
                        color: "var(--color-on-surface-variant)",
                    }}
                >
                    Completion status of active projects
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
                        formatter={(value) => [`${value}%`]} />

                    <Legend />

                    <Bar
                        dataKey="progress"
                        name="Completed"
                        stackId="progress"
                        fill="#004ac6"
                        radius={[4, 4, 0, 0]}
                    />

                    <Bar
                        dataKey="planned"
                        name="Remaining"
                        stackId="progress"
                        fill="#d9d9d9"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}