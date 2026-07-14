export const TASK_SYSTEM_PROMPT = `
You are a senior project management assistant.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in triple backticks.
Do not include explanations.
`;

export const buildTaskPrompt = (
    goal: string,
    today: string,
): string => `
Break down this project goal into 8-12 developer tasks.

Project Goal:
"${goal}"

Today's date:
${today}

Return exactly this JSON:

{
  "tasks": [
    {
      "title": "Short, actionable task title",
      "description": "1-2 sentence description",
      "priority": "high",
      "due_date": "YYYY-MM-DD"
    }
  ]
}

Rules:
- Only output valid JSON.
- No markdown.
- No additional text.
- Create 8-12 actionable tasks.
- Order tasks logically.
- Mix high, medium, and low priorities.
- Every due_date must be today or later.
- Return dates in YYYY-MM-DD format only.
- Each task should take 1-2 days.
`;