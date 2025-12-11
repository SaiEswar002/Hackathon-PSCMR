import { ID, Query } from 'appwrite';
import { databases } from '../appwrite';
import { appwriteConfig } from '../appwrite-config';
import type { Project, InsertProject, Task, InsertTask } from '@shared/schema';

class ProjectsService {
    private projectsCollectionId = appwriteConfig.collections.projects;
    private tasksCollectionId = appwriteConfig.collections.tasks;
    private databaseId = appwriteConfig.databaseId;

    /**
     * Create a new project
     */
    async createProject(data: InsertProject): Promise<Project> {
        try {
            const response = await databases.createDocument(
                this.databaseId,
                this.projectsCollectionId,
                ID.unique(),
                data
            );
            return response as unknown as Project;
        } catch (error) {
            console.error('Create project error:', error);
            throw error;
        }
    }

    /**
     * Get project by ID
     */
    async getProject(projectId: string): Promise<Project | null> {
        try {
            const response = await databases.getDocument(
                this.databaseId,
                this.projectsCollectionId,
                projectId
            );
            return response as unknown as Project;
        } catch (error) {
            console.error('Get project error:', error);
            return null;
        }
    }

    /**
     * Get all projects
     */
    async getAllProjects(): Promise<Project[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.projectsCollectionId,
                [Query.orderDesc('$createdAt'), Query.limit(100)]
            );
            return response.documents as unknown as Project[];
        } catch (error) {
            console.error('Get all projects error:', error);
            return [];
        }
    }

    /**
     * Get projects by user (owner or member)
     */
    async getProjectsByUser(userId: string): Promise<Project[]> {
        try {
            const ownerProjects = await databases.listDocuments(
                this.databaseId,
                this.projectsCollectionId,
                [Query.equal('ownerId', userId)]
            );

            const memberProjects = await databases.listDocuments(
                this.databaseId,
                this.projectsCollectionId,
                [Query.search('memberIds', userId)]
            );

            // Combine and deduplicate
            const allProjects = [...ownerProjects.documents, ...memberProjects.documents];
            const uniqueProjects = Array.from(
                new Map(allProjects.map(p => [p.$id, p])).values()
            );

            return uniqueProjects as unknown as Project[];
        } catch (error) {
            console.error('Get projects by user error:', error);
            return [];
        }
    }

    /**
     * Update project
     */
    async updateProject(projectId: string, data: Partial<Project>): Promise<Project | null> {
        try {
            const response = await databases.updateDocument(
                this.databaseId,
                this.projectsCollectionId,
                projectId,
                data
            );
            return response as unknown as Project;
        } catch (error) {
            console.error('Update project error:', error);
            return null;
        }
    }

    /**
     * Delete project
     */
    async deleteProject(projectId: string): Promise<boolean> {
        try {
            await databases.deleteDocument(
                this.databaseId,
                this.projectsCollectionId,
                projectId
            );
            return true;
        } catch (error) {
            console.error('Delete project error:', error);
            return false;
        }
    }

    /**
     * Add member to project
     */
    async addMember(projectId: string, userId: string): Promise<Project | null> {
        try {
            const project = await this.getProject(projectId);
            if (!project) return null;

            const memberIds = project.memberIds || [];
            if (memberIds.includes(userId)) {
                return project; // Already a member
            }

            return await this.updateProject(projectId, {
                memberIds: [...memberIds, userId],
            });
        } catch (error) {
            console.error('Add member error:', error);
            return null;
        }
    }

    /**
     * Remove member from project
     */
    async removeMember(projectId: string, userId: string): Promise<Project | null> {
        try {
            const project = await this.getProject(projectId);
            if (!project) return null;

            const memberIds = project.memberIds || [];
            return await this.updateProject(projectId, {
                memberIds: memberIds.filter(id => id !== userId),
            });
        } catch (error) {
            console.error('Remove member error:', error);
            return null;
        }
    }

    /**
     * Create a task
     */
    async createTask(data: InsertTask): Promise<Task> {
        try {
            const response = await databases.createDocument(
                this.databaseId,
                this.tasksCollectionId,
                ID.unique(),
                {
                    ...data,
                    isCompleted: false,
                }
            );
            return response as unknown as Task;
        } catch (error) {
            console.error('Create task error:', error);
            throw error;
        }
    }

    /**
     * Get tasks by project
     */
    async getTasksByProject(projectId: string): Promise<Task[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.tasksCollectionId,
                [Query.equal('projectId', projectId)]
            );
            return response.documents as unknown as Task[];
        } catch (error) {
            console.error('Get tasks by project error:', error);
            return [];
        }
    }

    /**
     * Update task
     */
    async updateTask(taskId: string, data: Partial<Task>): Promise<Task | null> {
        try {
            const response = await databases.updateDocument(
                this.databaseId,
                this.tasksCollectionId,
                taskId,
                data
            );
            return response as unknown as Task;
        } catch (error) {
            console.error('Update task error:', error);
            return null;
        }
    }

    /**
     * Toggle task completion
     */
    async toggleTaskCompletion(taskId: string): Promise<Task | null> {
        try {
            const task = await databases.getDocument(
                this.databaseId,
                this.tasksCollectionId,
                taskId
            );

            return await this.updateTask(taskId, {
                isCompleted: !(task as any).isCompleted,
            });
        } catch (error) {
            console.error('Toggle task completion error:', error);
            return null;
        }
    }

    /**
     * Delete task
     */
    async deleteTask(taskId: string): Promise<boolean> {
        try {
            await databases.deleteDocument(
                this.databaseId,
                this.tasksCollectionId,
                taskId
            );
            return true;
        } catch (error) {
            console.error('Delete task error:', error);
            return false;
        }
    }
}

export const projectsService = new ProjectsService();
