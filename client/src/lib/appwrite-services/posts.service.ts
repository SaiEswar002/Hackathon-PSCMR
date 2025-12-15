import { ID, Query } from 'appwrite';
import { databases } from '../appwrite';
import { appwriteConfig } from '../appwrite-config';
import type { Post, InsertPost, PostWithAuthor, User } from '@shared/schema';
import { usersService } from './users.service';

class PostsService {
    private collectionId = appwriteConfig.collections.posts;
    private likesCollectionId = appwriteConfig.collections.postLikes;
    private databaseId = appwriteConfig.databaseId;

    /**
     * Create a new post
     */
    /**
     * Helper to map Appwrite document to Post interface
     */
    private mapDocumentToPost(doc: any): Post {
        return {
            ...doc,
            id: doc.$id,
        } as unknown as Post;
    }

    /**
     * Create a new post
     */
    async createPost(data: InsertPost): Promise<Post> {
        try {
            // Sanitize payload: Remove fields that don't exist in Appwrite schema
            // authorName and authorAvatar are relational/denormalized fields not present in the DB schema
            const { authorName, authorAvatar, ...validData } = data as any;

            const payload = {
                authorId: validData.authorId,
                content: validData.content,
                postType: validData.postType,
                tags: validData.tags,
                imageUrl: validData.imageUrl,
                createdAt: validData.createdAt,
                likesCount: 0,
                commentsCount: 0,
                sharesCount: 0,
            };

            const response = await databases.createDocument(
                this.databaseId,
                this.collectionId,
                ID.unique(),
                payload
            );
            return this.mapDocumentToPost(response);
        } catch (error) {
            console.error('Create post error:', error);
            throw error;
        }
    }

    /**
     * Get post by ID
     */
    async getPost(postId: string): Promise<Post | null> {
        try {
            const response = await databases.getDocument(
                this.databaseId,
                this.collectionId,
                postId
            );
            return this.mapDocumentToPost(response);
        } catch (error) {
            console.error('Get post error:', error);
            return null;
        }
    }

    /**
     * Get all posts (sorted by creation date)
     */
    async getAllPosts(): Promise<Post[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.orderDesc('$createdAt'), Query.limit(100)]
            );
            return response.documents.map(doc => this.mapDocumentToPost(doc));
        } catch (error) {
            console.error('Get all posts error:', error);
            return [];
        }
    }

    /**
     * Get posts with author information
     */
    async getPostsWithAuthors(userId?: string): Promise<PostWithAuthor[]> {
        try {
            const posts = await this.getAllPosts();
            const postsWithAuthors: PostWithAuthor[] = [];

            for (const post of posts) {
                const author = await usersService.getUser(post.authorId);
                if (author) {
                    let isLiked = false;
                    if (userId) {
                        isLiked = await this.hasUserLikedPost(post.id, userId);
                    }
                    postsWithAuthors.push({ ...post, author, isLiked });
                }
            }

            return postsWithAuthors;
        } catch (error) {
            console.error('Get posts with authors error:', error);
            return [];
        }
    }

    /**
     * Get posts by author
     */
    async getPostsByAuthor(authorId: string): Promise<Post[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.equal('authorId', authorId),
                    Query.orderDesc('$createdAt'),
                ]
            );
            return response.documents.map(doc => this.mapDocumentToPost(doc));
        } catch (error) {
            console.error('Get posts by author error:', error);
            return [];
        }
    }

    /**
     * Update post
     */
    async updatePost(postId: string, data: Partial<Post>): Promise<Post | null> {
        try {
            const response = await databases.updateDocument(
                this.databaseId,
                this.collectionId,
                postId,
                data
            );
            return this.mapDocumentToPost(response);
        } catch (error) {
            console.error('Update post error:', error);
            return null;
        }
    }

    /**
     * Delete post
     */
    async deletePost(postId: string): Promise<boolean> {
        try {
            await databases.deleteDocument(
                this.databaseId,
                this.collectionId,
                postId
            );
            return true;
        } catch (error) {
            console.error('Delete post error:', error);
            return false;
        }
    }

    /**
     * Like/Unlike a post
     */
    async toggleLike(postId: string, userId: string): Promise<Post | null> {
        if (!postId || !userId) {
            console.error('toggleLike called with missing args:', { postId, userId });
            return null;
        }
        try {
            const hasLiked = await this.hasUserLikedPost(postId, userId);
            const post = await this.getPost(postId);

            if (!post) return null;

            if (hasLiked) {
                // Unlike: Remove like document
                const likeDoc = await this.getLikeDocument(postId, userId);
                if (likeDoc) {
                    await databases.deleteDocument(
                        this.databaseId,
                        this.likesCollectionId,
                        likeDoc.$id
                    );
                }
                // Decrement likes count
                return await this.updatePost(postId, {
                    likesCount: Math.max(0, (post.likesCount || 0) - 1),
                });
            } else {
                // Like: Create like document
                await databases.createDocument(
                    this.databaseId,
                    this.likesCollectionId,
                    ID.unique(),
                    { postId, userId }
                );
                // Increment likes count
                return await this.updatePost(postId, {
                    likesCount: (post.likesCount || 0) + 1,
                });
            }
        } catch (error) {
            console.error('Toggle like error:', error);
            return null;
        }
    }

    /**
     * Check if user has liked a post
     */
    async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
        if (!userId || !postId) return false;
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.likesCollectionId,
                [
                    Query.equal('postId', postId),
                    Query.equal('userId', userId),
                ]
            );
            return response.documents.length > 0;
        } catch (error) {
            console.error('Check like status error:', error);
            return false;
        }
    }

    /**
     * Get like document
     */
    private async getLikeDocument(postId: string, userId: string) {
        if (!userId || !postId) return null;
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.likesCollectionId,
                [
                    Query.equal('postId', postId),
                    Query.equal('userId', userId),
                ]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Get like document error:', error);
            return null;
        }
    }

    /**
     * Get posts by type
     */
    async getPostsByType(postType: string): Promise<Post[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.equal('postType', postType),
                    Query.orderDesc('$createdAt'),
                ]
            );
            return response.documents.map(doc => this.mapDocumentToPost(doc));
        } catch (error) {
            console.error('Get posts by type error:', error);
            return [];
        }
    }

    /**
     * Search posts by tags
     */
    async searchPostsByTags(tags: string[]): Promise<Post[]> {
        try {
            const queries = tags.map(tag => Query.search('tags', tag));
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [...queries, Query.orderDesc('$createdAt')]
            );
            return response.documents.map(doc => this.mapDocumentToPost(doc));
        } catch (error) {
            console.error('Search posts by tags error:', error);
            return [];
        }
    }
    /**
     * Get comments for a post
     */
    async getComments(postId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                appwriteConfig.collections.comments,
                [
                    Query.equal('postId', postId),
                    Query.orderDesc('$createdAt'),
                ]
            );

            // Enrich with author info
            const commentsWithAuthors = await Promise.all(response.documents.map(async (doc) => {
                const author = await usersService.getUser(doc.authorId);
                return {
                    ...doc,
                    author: author || { fullName: 'Unknown User', avatarUrl: '' }
                };
            }));

            return commentsWithAuthors;
        } catch (error) {
            console.error('Get comments error:', error);
            return [];
        }
    }

    /**
     * Create a comment
     */
    /**
     * Create a comment
     */
    async createComment(postId: string, userId: string, content: string): Promise<any> {
        try {
            const comment = await databases.createDocument(
                this.databaseId,
                appwriteConfig.collections.comments,
                ID.unique(),
                {
                    postId,
                    authorId: userId,
                    content,
                    likesCount: 0
                }
            );

            // Update post comments count
            const post = await this.getPost(postId);
            if (post) {
                await this.updatePost(postId, {
                    commentsCount: (post.commentsCount || 0) + 1
                });
            }

            return comment;
        } catch (error) {
            console.error('Create comment error:', error);
            throw error;
        }
    }

    /**
     * Delete a comment
     */
    async deleteComment(commentId: string): Promise<boolean> {
        try {
            // Get comment to find postId
            const comment = await databases.getDocument(
                this.databaseId,
                appwriteConfig.collections.comments,
                commentId
            );

            await databases.deleteDocument(
                this.databaseId,
                appwriteConfig.collections.comments,
                commentId
            );

            // Update post comments count
            if (comment.postId) {
                const post = await this.getPost(comment.postId);
                if (post) {
                    await this.updatePost(comment.postId, {
                        commentsCount: Math.max(0, (post.commentsCount || 0) - 1)
                    });
                }
            }

            return true;
        } catch (error) {
            console.error('Delete comment error:', error);
            return false;
        }
    }
}

export const postsService = new PostsService();
