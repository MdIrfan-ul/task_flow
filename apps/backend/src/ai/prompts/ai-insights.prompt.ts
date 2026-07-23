interface Assignee {
    id?: number;
    name?: string;
}

interface Project {
    id?: number;
    name?: string;
}

interface Task {
    title: string;
    status: string;
    priority: string;
    due_date: Date | null;
    assignee?: Assignee | null;
    project?: Project | null;
}

interface AIInsightsInput {
    projects: Project[];
    tasks: Task[];
}

export const buildAIInsightsPrompt = ({
    projects,
    tasks,
}: AIInsightsInput): string => {
    return `
You are an experienced engineering manager.

Workspace Projects:
${projects.map((p) => `- ${p.name}`).join("\n")}

Tasks:
${tasks
            .map(
                (t) => `- Project: ${t.project?.name ?? "Unknown"}
Title: ${t.title}
Status: ${t.status}
Priority: ${t.priority}
Due: ${t.due_date ? new Date(t.due_date).toISOString().split("T")[0] : "None"}
Assigned: ${t.assignee?.name ?? "Unassigned"}`
            )
            .join("\n\n")}

Analyze the entire workspace.

Focus on:
- Projects that are at risk
- Upcoming or missed deadlines
- High-priority unfinished tasks
- Workload imbalance across assignees
- Overall project health
- Recommended next actions

Return ONLY valid JSON in this format:

{
  "insights": [
    {
      "type": "risk",
      "title": "",
      "description": ""
    },
    {
      "type": "deadline",
      "title": "",
      "description": ""
    },
    {
      "type": "action",
      "title": "",
      "description": ""
    }
  ]
}

Rules:
- Return exactly 3 insights.
- Keep each title under 60 characters.
- Keep each description under 120 characters.
- Do not include markdown or explanations.
`;
};