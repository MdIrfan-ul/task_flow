# Project Structure Backend

backend/
├──src/
├──auth/# login, register, OAuth, refresh
├──auth.module.ts
├──auth.controller.ts
├──auth.service.ts
├──strategies/
├──jwt.strategy.ts
├──google.strategy.ts
└──github.strategy.ts
├──guards/
├──jwt-auth.guard.ts
└──roles.guard.ts
└──dto/
├──register.dto.ts
└──login.dto.ts
├──users/
├──users.module.ts
├──workspaces/
├──workspaces.module.ts
├──workspaces.controller.ts
├──workspaces.service.ts
├──models/
├──workspace.model.ts
└──workspace-member.model.ts
└──dto/
└──create-workspace.dto.ts
├──projects/
├──projects.module.ts
├──projects.controller.ts
├──projects.service.ts
├──models/
└──project.model.ts
└──dto/
└──create-project.dto.ts
├──tasks/
├──tasks.module.ts
├──tasks.controller.ts
├──tasks.service.ts
├──models/
├──task.model.ts
└──comment.model.ts
└──dto/
├──create-task.dto.ts
└──update-task.dto.ts
├──ai/# OpenAI integration
├──ai.module.ts
├──ai.controller.ts
├──ai.service.ts
└──dto/
├──generate-tasks.dto.ts
└──summarize.dto.ts
├──database/
├──database.module.ts# Sequelize connection
└──database.providers.ts
├──common/
├──decorators/
├──current-user.decorator.ts
└──roles.decorator.ts
└──models/
└──refresh-token.model.ts
└──app.module.ts# root module
├──.env
├──nest-cli.json
└──package.json