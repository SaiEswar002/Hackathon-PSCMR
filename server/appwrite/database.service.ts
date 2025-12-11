import { Query } from 'node-appwrite';
import { databases, appwriteConfig } from './client';
import type { User, MatchResult } from '@shared/schema';

/**
 * Server-side matchmaking algorithm
 * Finds compatible users based on complementary skills
 */
export async function getMatches(userId: string): Promise<MatchResult[]> {
    try {
        const collectionsId = process.env.APPWRITE_USERS_COLLECTION_ID || 'users';

        // Get current user
        const currentUserDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            collectionsId,
            userId
        );
        const currentUser = currentUserDoc as unknown as User;

        // Get all other users
        const allUsersResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            collectionsId,
            [Query.limit(100)]
        );

        const allUsers = allUsersResponse.documents as unknown as User[];
        const otherUsers = allUsers.filter(u => u.id !== userId);

        // Calculate matches
        const matches: MatchResult[] = otherUsers.map(user => {
            const skillsTheyCanTeach = (user.skillsToShare || []).filter(
                skill => (currentUser.skillsToLearn || []).some(
                    learn => learn.toLowerCase() === skill.toLowerCase()
                )
            );

            const skillsYouCanTeach = (currentUser.skillsToShare || []).filter(
                skill => (user.skillsToLearn || []).some(
                    learn => learn.toLowerCase() === skill.toLowerCase()
                )
            );

            const matchingSkills = [...new Set([...skillsTheyCanTeach, ...skillsYouCanTeach])];

            // Calculate compatibility score
            const maxPossibleMatches = Math.max(
                (currentUser.skillsToLearn?.length || 0) + (currentUser.skillsToShare?.length || 0),
                1
            );

            let compatibilityScore = Math.round((matchingSkills.length / maxPossibleMatches) * 100);

            // Bonus points for matching interests
            if (user.interests?.some(i => currentUser.interests?.includes(i))) {
                compatibilityScore = Math.min(compatibilityScore + 20, 99);
            }

            // Bonus points for same department
            if (user.department === currentUser.department) {
                compatibilityScore = Math.min(compatibilityScore + 10, 99);
            }

            return {
                user,
                compatibilityScore,
                matchingSkills,
                skillsTheyCanTeach,
                skillsYouCanTeach,
            };
        });

        // Sort by compatibility score (highest first)
        return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } catch (error) {
        console.error('Get matches error:', error);
        return [];
    }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
    try {
        const postsCollectionId = process.env.APPWRITE_POSTS_COLLECTION_ID || 'posts';
        const connectionsCollectionId = process.env.APPWRITE_CONNECTIONS_COLLECTION_ID || 'connections';
        const projectsCollectionId = process.env.APPWRITE_PROJECTS_COLLECTION_ID || 'projects';

        // Get user's posts count
        const postsResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            postsCollectionId,
            [Query.equal('authorId', userId), Query.limit(1)]
        );

        // Get user's connections count
        const connectionsResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            connectionsCollectionId,
            [
                Query.equal('userId', userId),
                Query.equal('status', 'accepted'),
                Query.limit(1)
            ]
        );

        // Get user's projects count
        const projectsResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            projectsCollectionId,
            [Query.equal('ownerId', userId), Query.limit(1)]
        );

        return {
            postsCount: postsResponse.total,
            connectionsCount: connectionsResponse.total,
            projectsCount: projectsResponse.total,
        };
    } catch (error) {
        console.error('Get user stats error:', error);
        return {
            postsCount: 0,
            connectionsCount: 0,
            projectsCount: 0,
        };
    }
}

export default { getMatches, getUserStats };
