import { ID, Query } from 'appwrite';
import { databases } from '../appwrite';
import { appwriteConfig } from '../appwrite-config';
import type { User, InsertUser } from '@shared/schema';

class UsersService {
    private collectionId = appwriteConfig.collections.users;
    private databaseId = appwriteConfig.databaseId;

    /**
     * Create a new user profile
     */
    /**
     * Helper to map Appwrite document to User interface
     */
    private mapDocumentToUser(doc: any): User {
        return {
            ...doc,
            id: doc.$id,
        } as unknown as User;
    }

    /**
     * Create a new user profile
     */
    async createUser(data: InsertUser): Promise<User> {
        try {
            const response = await databases.createDocument(
                this.databaseId,
                this.collectionId,
                ID.unique(),
                {
                    ...data,
                    profileViews: 0,
                    connectionsCount: 0,
                }
            );
            return this.mapDocumentToUser(response);
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    /**
     * Get user by ID
     */
    async getUser(userId: string): Promise<User | null> {
        try {
            const response = await databases.getDocument(
                this.databaseId,
                this.collectionId,
                userId
            );
            return this.mapDocumentToUser(response);
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal('email', email)]
            );
            return response.documents.length > 0
                ? this.mapDocumentToUser(response.documents[0])
                : null;
        } catch (error: any) {
            console.error('Get user by email error:', error);
            if (error?.code === 400 && error?.message?.includes('Index')) {
                console.error('POSSIBLE CAUSE: Missing Index on "email" attribute in "users" collection.');
            }
            return null;
        }
    }

    /**
     * Get user by username
     */
    async getUserByUsername(username: string): Promise<User | null> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal('username', username)]
            );
            return response.documents.length > 0
                ? this.mapDocumentToUser(response.documents[0])
                : null;
        } catch (error) {
            console.error('Get user by username error:', error);
            return null;
        }
    }

    /**
     * Get all users
     */
    async getAllUsers(): Promise<User[]> {
        try {
            console.log('UsersService: Fetching users from Appwrite...');
            console.log('Database ID:', this.databaseId);
            console.log('Collection ID:', this.collectionId);

            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.limit(100)]
            );

            console.log('UsersService: Raw response:', response);
            console.log('UsersService: Documents count:', response.documents.length);

            return response.documents.map(doc => this.mapDocumentToUser(doc));
        } catch (error) {
            console.error('Get all users error:', error);
            return [];
        }
    }

    /**
     * Update user profile
     */
    async updateUser(userId: string, data: Partial<User>): Promise<User | null> {
        try {
            const response = await databases.updateDocument(
                this.databaseId,
                this.collectionId,
                userId,
                data
            );
            return this.mapDocumentToUser(response);
        } catch (error) {
            console.error('Update user error:', error);
            return null;
        }
    }

    /**
     * Search users by skills
     */
    async searchUsersBySkills(skills: string[]): Promise<User[]> {
        try {
            const queries = skills.map(skill =>
                Query.search('skillsToShare', skill)
            );

            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                queries
            );
            return response.documents.map(doc => this.mapDocumentToUser(doc));
        } catch (error) {
            console.error('Search users by skills error:', error);
            return [];
        }
    }

    /**
     * Search users by department
     */
    async searchUsersByDepartment(department: string): Promise<User[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal('department', department)]
            );
            return response.documents.map(doc => this.mapDocumentToUser(doc));
        } catch (error) {
            console.error('Search users by department error:', error);
            return [];
        }
    }

    /**
     * Increment profile views
     */
    async incrementProfileViews(userId: string): Promise<void> {
        try {
            const user = await this.getUser(userId);
            if (user) {
                await this.updateUser(userId, {
                    profileViews: (user.profileViews || 0) + 1,
                });
            }
        } catch (error) {
            console.error('Increment profile views error:', error);
        }
    }
}

export const usersService = new UsersService();
