import { useState, useEffect, useCallback } from 'react';
import { ID, Query, Permission, Role } from 'appwrite';
import { databases, appwriteConfig } from '@/lib/appwriteClient';
import { useAuth } from './useAuth';

// Types
interface Project {
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

interface CreateProjectData {
    name: string;
    description: string;
    skillsNeeded?: string[];
    milestones?: string[];
}

export function useProjects() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all projects
    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.projects,
                [Query.orderDesc('$createdAt'), Query.limit(50)]
            );

            setProjects(response.documents as unknown as Project[]);
        } catch (err: any) {
            console.error('Fetch projects error:', err);
            setError(err.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch user's projects (owned or member)
    const fetchUserProjects = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch projects where user is owner
            const ownedProjects = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.projects,
                [Query.equal('ownerId', user.$id)]
            );

            // Fetch projects where user is member
            const memberProjects = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.projects,
                [Query.search('memberIds', user.$id)]
            );

            // Combine and deduplicate
            const allProjects = [...ownedProjects.documents, ...memberProjects.documents];
            const uniqueProjects = Array.from(
                new Map(allProjects.map((p) => [p.$id, p])).values()
            );

            setProjects(uniqueProjects as unknown as Project[]);
        } catch (err: any) {
            console.error('Fetch user projects error:', err);
            setError(err.message || 'Failed to fetch user projects');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Create project
    const createProject = useCallback(async (data: CreateProjectData) => {
        if (!user) {
            throw new Error('You must be logged in to create a project');
        }

        try {
            const project = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.projects,
                ID.unique(),
                {
                    name: data.name,
                    description: data.description,
                    ownerId: user.$id,
                    memberIds: [],
                    status: 'active',
                    skillsNeeded: data.skillsNeeded || [],
                    milestones: data.milestones || [],
                },
                [
                    Permission.read(Role.users()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id)),
                ]
            );

            // Add to local state
            setProjects((prev) => [project as unknown as Project, ...prev]);

            return project;
        } catch (err: any) {
            console.error('Create project error:', err);
            throw new Error(err.message || 'Failed to create project');
        }
    }, [user]);

    // Add member to project
    const addMember = useCallback(async (projectId: string, memberId: string) => {
        try {
            const project = projects.find((p) => p.$id === projectId);
            if (!project) throw new Error('Project not found');

            const updatedMemberIds = [...project.memberIds, memberId];

            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.projects,
                projectId,
                { memberIds: updatedMemberIds }
            );

            // Update local state
            setProjects((prev) =>
                prev.map((p) =>
                    p.$id === projectId ? { ...p, memberIds: updatedMemberIds } : p
                )
            );
        } catch (err: any) {
            console.error('Add member error:', err);
            throw new Error(err.message || 'Failed to add member');
        }
    }, [projects]);

    // Update project status
    const updateStatus = useCallback(
        async (projectId: string, status: 'active' | 'completed' | 'on_hold') => {
            try {
                await databases.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.projects,
                    projectId,
                    { status }
                );

                // Update local state
                setProjects((prev) =>
                    prev.map((p) => (p.$id === projectId ? { ...p, status } : p))
                );
            } catch (err: any) {
                console.error('Update status error:', err);
                throw new Error(err.message || 'Failed to update status');
            }
        },
        []
    );

    // Load projects on mount
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        fetchProjects,
        fetchUserProjects,
        createProject,
        addMember,
        updateStatus,
    };
}
