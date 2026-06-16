# task_flow
TaskFlow — AI-powered project management tool built with Next.js, NestJS, MySQL, and OpenAI. Features OAuth authentication, JWT refresh token rotation, role-based workspaces, Kanban boards, and AI-generated task breakdowns.

# Project Setup

# Frontend
```
npx create-next-app@latest frontend --typescript --tailwind --app
```

# Backend
```
npx @nestjs/cli new backend
```
```
cd backend && npm i @nestjs/sequelize sequelize sequelize-typescript mysql2 @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer
```
