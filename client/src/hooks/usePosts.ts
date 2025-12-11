import { useState, useEffect, useCallback } from 'react';
import { ID, Query, Permission, Role } from 'appwrite';
import { databases, storage, appwriteConfig } from '@/lib/appwriteClient';
import { useAuth } from './useAuth';

// Types
interface Post {
    $id: string;
    authorId: string;
    content: string;
    postType: 'skill_offer' | 'project_invite' | 'workshop' | 'learning_request';
    tags?: string[];
    imageUrl?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    $createdAt: string;
    $updatedAt: string;
}

interface CreatePostData {
    content: string;
    postType: 'skill_offer' | 'project_invite' | 'workshop' | 'learning_request';
    tags?: string[];
    image?: File;
}

export function usePosts() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all posts
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.posts,
                [Query.orderDesc('$createdAt'), Query.limit(50)]
            );

            setPosts(response.documents as unknown as Post[]);
        } catch (err: any) {
            console.error('Fetch posts error:', err);
            setError(err.message || 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    }, []);

    // Create post with optional media upload
    const createPost = useCallback(async (data: CreatePostData) => {
        if (!user) {
            throw new Error('You must be logged in to create a post');
        }

        try {
            let imageUrl: string | undefined;

            // Upload image if provided
            if (data.image) {
                const fileResponse = await storage.createFile(
                    appwriteConfig.buckets.postMedia,
                    ID.unique(),
                    data.image
                );

                // Generate image URL
                imageUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.buckets.postMedia}/files/${fileResponse.$id}/view?project=${appwriteConfig.projectId}`;
            }

            // Create post document
            const post = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.posts,
                ID.unique(),
                {
                    authorId: user.$id,
                    content: data.content,
                    postType: data.postType,
                    tags: data.tags || [],
                    imageUrl,
                    likesCount: 0,
                    commentsCount: 0,
                    sharesCount: 0,
                },
                [
                    Permission.read(Role.users()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id)),
                ]
            );

            // Add to local state
            setPosts((prev) => [post as unknown as Post, ...prev]);

            return post;
        } catch (err: any) {
            console.error('Create post error:', err);
            throw new Error(err.message || 'Failed to create post');
        }
    }, [user]);

    // Like post
    const likePost = useCallback(async (postId: string) => {
        if (!user) {
            throw new Error('You must be logged in to like a post');
        }

        try {
            const post = posts.find((p) => p.$id === postId);
            if (!post) return;

            // Update likes count
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.posts,
                postId,
                {
                    likesCount: post.likesCount + 1,
                }
            );

            // Update local state
            setPosts((prev) =>
                prev.map((p) =>
                    p.$id === postId ? { ...p, likesCount: p.likesCount + 1 } : p
                )
            );
        } catch (err: any) {
            console.error('Like post error:', err);
            throw new Error(err.message || 'Failed to like post');
        }
    }, [user, posts]);

    // Delete post
    const deletePost = useCallback(async (postId: string) => {
        try {
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.posts,
                postId
            );

            // Remove from local state
            setPosts((prev) => prev.filter((p) => p.$id !== postId));
        } catch (err: any) {
            console.error('Delete post error:', err);
            throw new Error(err.message || 'Failed to delete post');
        }
    }, []);

    // Load posts on mount
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        loading,
        error,
        fetchPosts,
        createPost,
        likePost,
        deletePost,
    };
}
