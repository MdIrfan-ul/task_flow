This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
# Project Structure Frontend

frontend/
├──src/
├──app/# App Router pages
├──(auth)/# route group, no layout
├──login/page.tsx
└──register/page.tsx
├──(dashboard)/# protected layout
├──layout.tsx# sidebar + auth check
├──page.tsx# home → redirect
├──workspaces/[workspaceId]/
└──projects/[projectId]/
└──layout.tsx# root layout
├──components/
├──auth/
└──LoginForm.tsx
├──kanban/
├──KanbanBoard.tsx
├──KanbanColumn.tsx
└──TaskCard.tsx
├──tasks/
├──TaskDetail.tsx
└──CreateTaskModal.tsx
├──ai/
├──GenerateTasksPanel.tsx
└──SummaryModal.tsx
└──ui/# shared: Button, Modal, Toast
├──lib/
├──api.ts# axios instance + interceptors
└──auth.ts# token helpers
├──hooks/
├──useAuth.ts
├──useTasks.ts
└──useWorkspace.ts
└──types/
└──index.ts# shared TS interfaces
├──.env.local
├──next.config.ts
└──package.json
