export const PROJECT_SUMMARY_SYSTEM_PROMPT = `
You are an experienced project manager.

Analyze the project tasks and return ONLY valid JSON.
Do not use markdown.
Do not include explanations outside the JSON.
`;

export const buildProjectSummaryPrompt = (
    projectName: string,
    taskList: string,
    taskCount: number,
): string => `
Project: "${projectName}"

Tasks (${taskCount} total):
${taskList}

Return exactly this JSON:

{
  "summary": "2-3 sentence plain English summary of overall progress",
  "highlights": [
    "up to 3 positive achievements or completed milestones"
  ],
  "blockers": [
    "up to 3 risks, blockers, or areas needing attention"
  ]
}

Rules:
- Return only valid JSON.
- No markdown.
- No extra text.
- Summary should be concise (2-3 sentences).
- Include at most 3 highlights.
- Include at most 3 blockers.
- If there are no blockers, return an empty array.
`;