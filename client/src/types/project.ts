// Project types
export interface Project {
    $id: string;
    name: string;
    description: string;
    ownerId: string;
    memberIds: string[];
    status: 'active' | 'completed' | 'on_hold';
    skillsNeeded: string[];
    milestones: string[];
    imageUrl?: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ProjectWithDetails extends Project {
    owner: {
        $id: string;
        fullName: string;
        username: string;
        avatarUrl?: string;
    };
    members: Array<{
        $id: string;
        fullName: string;
        username: string;
        avatarUrl?: string;
    }>;
    tasks: Task[];
}

export interface Task {
    $id: string;
    projectId: string;
    title: string;
    description: string;
    assigneeId?: string;
    isCompleted: boolean;
    dueDate?: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface TaskWithAssignee extends Task {
    assignee?: {
        $id: string;
        fullName: string;
        username: string;
        avatarUrl?: string;
    };
}

export interface CreateProjectData {
    name: string;
    description: string;
    skillsNeeded?: string[];
    milestones?: string[];
    image?: File;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    status?: 'active' | 'completed' | 'on_hold';
    skillsNeeded?: string[];
    milestones?: string[];
}

export interface CreateTaskData {
    projectId: string;
    title: string;
    description: string;
    assigneeId?: string;
    dueDate?: string;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    assigneeId?: string;
    isCompleted?: boolean;
    dueDate?: string;
}

export interface InviteMemberData {
    projectId: string;
    userId: string;
}
