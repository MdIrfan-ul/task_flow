import { Project } from "src/projects/entities/project.entity";
import { Comment } from "src/tasks/entities/comment.entity";
import { Task } from "src/tasks/entities/task.entity";
import { User } from "src/users/entities/user.entity";
import { WorkspaceMember } from "src/workspaces/entities/workspace-member.entity";
import { Workspace } from "src/workspaces/entities/workspace.entity";

export const sequelizeModels = [
    User,
    Workspace,
    WorkspaceMember,
    Project,
    Task,
    Comment
]