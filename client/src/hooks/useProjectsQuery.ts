import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ID, Query, Permission, Role } from 'appwrite';
import { databases, storage, appwriteConfig } from '@/lib/appwriteClient';
import { useAuth } from './useAuth';
import type {
    Project,
    ProjectWithDetails,
    Task,
    TaskWithAssignee,
    CreateProjectData,
    UpdateProjectData,
    CreateTaskData,
    UpdateTaskData,
    InviteMemberData,
} from '@/types/project';

// Fetch all projects
async function fetchProjects(): Promise<Project[]> {
    const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
    );

    return response.documents as unknown as Project[];
}

// Fetch user's projects (owned or member)
async function fetchUserProjects(userId: string): Promise<Project[]> {
    const ownedProjects = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        [Query.equal('ownerId', userId)]
    );

    const memberProjects = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        [Query.search('memberIds', userId)]
    );

    const allProjects = [...ownedProjects.documents, ...memberProjects.documents];
    const uniqueProjects = Array.from(new Map(allProjects.map((p) => [p.$id, p])).values());

    return uniqueProjects as unknown as Project[];
}

// Fetch project with full details
async function fetchProjectDetails(projectId: string): Promise<ProjectWithDetails> {
    const project = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        projectId
    );

    // Fetch owner
    const owner = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.users,
        project.ownerId as string
    );

    // Fetch members
    const memberIds = (project.memberIds as string[]) || [];
    const members = await Promise.all(
        memberIds.map(async (memberId) => {
            try {
                const user = await databases.getDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.users,
                    memberId
                );
                return {
                    $id: user.$id,
                    fullName: user.fullName as string,
                    username: user.username as string,
                    avatarUrl: user.avatarUrl as string | undefined,
                };
            } catch (error) {
                return null;
            }
        })
    );

    // Fetch tasks
    const tasksResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tasks,
        [Query.equal('projectId', projectId), Query.orderDesc('$createdAt')]
    );

    return {
        ...(project as unknown as Project),
        owner: {
            $id: owner.$id,
            fullName: owner.fullName as string,
            username: owner.username as string,
            avatarUrl: owner.avatarUrl as string | undefined,
        },
        members: members.filter((m) => m !== null) as any[],
        tasks: tasksResponse.documents as unknown as Task[],
    };
}

// Create project
async function createProject(data: CreateProjectData, userId: string): Promise<Project> {
    let imageUrl: string | undefined;

    if (data.image) {
        const fileResponse = await storage.createFile(
            appwriteConfig.buckets.projectFiles || 'project_files',
            ID.unique(),
            data.image
        );
        imageUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.buckets.projectFiles}/files/${fileResponse.$id}/view?project=${appwriteConfig.projectId}`;
    }

    const project = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        ID.unique(),
        {
            name: data.name,
            description: data.description,
            ownerId: userId,
            memberIds: [],
            status: 'active',
            skillsNeeded: data.skillsNeeded || [],
            milestones: data.milestones || [],
            imageUrl,
        },
        [
            Permission.read(Role.users()),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
        ]
    );

    return project as unknown as Project;
}

// Update project
async function updateProject(
    projectId: string,
    data: UpdateProjectData,
    currentPermissions: string[]
): Promise<Project> {
    const project = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        projectId,
        data,
        currentPermissions
    );

    return project as unknown as Project;
}

// Add member to project
async function addMember(projectId: string, userId: string): Promise<void> {
    const project = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        projectId
    );

    const memberIds = (project.memberIds as string[]) || [];
    if (memberIds.includes(userId)) {
        throw new Error('User is already a member');
    }

    const updatedMemberIds = [...memberIds, userId];

    // Update project with new member and add their permissions
    await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        projectId,
        { memberIds: updatedMemberIds },
        [
            Permission.read(Role.users()),
            Permission.update(Role.user(project.ownerId as string)),
            ...updatedMemberIds.map((id) => Permission.update(Role.user(id))),
            Permission.delete(Role.user(project.ownerId as string)),
        ]
    );
}

// Remove member from project
async function removeMember(projectId: string, userId: string): Promise<void> {
    const project = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        projectId
    );

    const memberIds = (project.memberIds as string[]) || [];
    const updatedMemberIds = memberIds.filter((id) => id !== userId);

    await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        projectId,
        { memberIds: updatedMemberIds },
        [
            Permission.read(Role.users()),
            Permission.update(Role.user(project.ownerId as string)),
            ...updatedMemberIds.map((id) => Permission.update(Role.user(id))),
            Permission.delete(Role.user(project.ownerId as string)),
        ]
    );
}

// Create task (restricted to project members)
async function createTask(data: CreateTaskData, userId: string): Promise<Task> {
    // Verify user is project member or owner
    const project = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        data.projectId
    );

    const isOwner = project.ownerId === userId;
    const isMember = (project.memberIds as string[])?.includes(userId);

    if (!isOwner && !isMember) {
        throw new Error('Only project members can create tasks');
    }

    // Build permissions for all project members
    const memberIds = (project.memberIds as string[]) || [];
    const allMemberIds = [project.ownerId as string, ...memberIds];

    const task = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tasks,
        ID.unique(),
        {
            projectId: data.projectId,
            title: data.title,
            description: data.description,
            assigneeId: data.assigneeId,
            isCompleted: false,
            dueDate: data.dueDate,
        },
        [
            Permission.read(Role.users()),
            ...allMemberIds.map((id) => Permission.update(Role.user(id))),
            Permission.delete(Role.user(project.ownerId as string)),
        ]
    );

    return task as unknown as Task;
}

// Update task (restricted to project members)
async function updateTask(
    taskId: string,
    data: UpdateTaskData,
    userId: string
): Promise<Task> {
    // Get task to find project
    const task = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tasks,
        taskId
    );

    // Verify user is project member or owner
    const project = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        task.projectId as string
    );

    const isOwner = project.ownerId === userId;
    const isMember = (project.memberIds as string[])?.includes(userId);

    if (!isOwner && !isMember) {
        throw new Error('Only project members can update tasks');
    }

    const updatedTask = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tasks,
        taskId,
        data
    );

    return updatedTask as unknown as Task;
}

// Delete task (owner only)
async function deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tasks,
        taskId
    );

    const project = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.projects,
        task.projectId as string
    );

    if (project.ownerId !== userId) {
        throw new Error('Only project owner can delete tasks');
    }

    await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.tasks,
        taskId
    );
}

// Hooks
export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects,
    });
}

export function useUserProjects() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['user-projects', user?.$id],
        queryFn: () => {
            if (!user) throw new Error('User not authenticated');
            return fetchUserProjects(user.$id);
        },
        enabled: !!user,
    });
}

export function useProjectDetails(projectId: string | null) {
    return useQuery({
        queryKey: ['project', projectId],
        queryFn: () => {
            if (!projectId) throw new Error('No project ID');
            return fetchProjectDetails(projectId);
        },
        enabled: !!projectId,
    });
}

export function useCreateProject() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProjectData) => {
            if (!user) throw new Error('User not authenticated');
            return createProject(data, user.$id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['user-projects'] });
        },
    });
}

export function useUpdateProject(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, permissions }: { data: UpdateProjectData; permissions: string[] }) =>
            updateProject(projectId, data, permissions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useAddMember(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => addMember(projectId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
    });
}

export function useRemoveMember(projectId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => removeMember(projectId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
    });
}

export function useCreateTask() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTaskData) => {
            if (!user) throw new Error('User not authenticated');
            return createTask(data, user.$id);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
        },
    });
}

export function useUpdateTask(projectId: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskData }) => {
            if (!user) throw new Error('User not authenticated');
            return updateTask(taskId, data, user.$id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
    });
}

export function useDeleteTask(projectId: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (taskId: string) => {
            if (!user) throw new Error('User not authenticated');
            return deleteTask(taskId, user.$id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        },
    });
}
