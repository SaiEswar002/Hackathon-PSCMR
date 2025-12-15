import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ID, Query, Permission, Role } from 'appwrite';
import { databases, storage } from '@/lib/appwriteClient';
import { appwriteConfig } from '@/lib/appwrite-config';
import { useAuth } from './useAuth';
import type { Post, PostWithAuthor, CreatePostData, PostsResponse } from '@/types/post';

const POSTS_PER_PAGE = 10;

// Fetch posts with pagination
async function fetchPosts(pageParam: number = 0): Promise<PostsResponse> {
    const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.posts,
        [
            Query.orderDesc('$createdAt'),
            Query.limit(POSTS_PER_PAGE),
            Query.offset(pageParam * POSTS_PER_PAGE),
        ]
    );

    return {
        documents: response.documents as unknown as Post[],
        total: response.total,
    };
}

// Fetch post with author information
async function fetchPostWithAuthor(post: Post): Promise<PostWithAuthor> {
    try {
        const author = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.users,
            post.authorId
        );

        return {
            ...post,
            author: {
                $id: author.$id,
                fullName: author.fullName as string,
                username: author.username as string,
                email: author.email as string,
                avatarUrl: author.avatarUrl as string | undefined,
                department: author.department as string | undefined,
            },
        };
    } catch (error) {
        console.error('Error fetching author:', error);
        // Return post with placeholder author if fetch fails
        return {
            ...post,
            author: {
                $id: post.authorId,
                fullName: 'Unknown User',
                username: 'unknown',
                email: '',
            },
        };
    }
}

// Fetch posts with authors
async function fetchPostsWithAuthors(pageParam: number = 0): Promise<PostsResponse> {
    const postsResponse = await fetchPosts(pageParam);

    // Fetch authors for all posts in parallel
    const postsWithAuthors = await Promise.all(
        postsResponse.documents.map((post) => fetchPostWithAuthor(post))
    );

    return {
        documents: postsWithAuthors as unknown as Post[],
        total: postsResponse.total,
    };
}

// Create post with optional image upload
async function createPost(data: CreatePostData, userId: string): Promise<Post> {
    if (!userId) {
        console.error('❌ createPost: userId is missing/empty');
        throw new Error('Cannot create post: User ID is missing');
    }

    let imageUrl: string | undefined;

    // Upload image if provided
    if (data.image) {
        const fileResponse = await storage.createFile(
            appwriteConfig.buckets.postImages, // Use correct bucket from config
            ID.unique(),
            data.image
        );

        imageUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.buckets.postImages}/files/${fileResponse.$id}/view?project=${appwriteConfig.projectId}`;
    }

    console.log('📝 Creating document with authorId:', userId);

    // Create post document
    const post = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.posts,
        ID.unique(),
        {
            authorId: userId,
            content: data.content,
            postType: data.postType,
            tags: data.tags || [],
            imageUrl,
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
        },
        [
            Permission.read(Role.any()), // Public read
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
        ]
    );

    return post as unknown as Post;
}

// Toggle like on a post
async function toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
    if (isLiked) {
        // Unlike: Find and delete the like document
        const likes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.postLikes || 'post_likes',
            [Query.equal('postId', postId), Query.equal('userId', userId)]
        );

        if (likes.documents.length > 0) {
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.postLikes || 'post_likes',
                likes.documents[0].$id
            );
        }

        // Decrement like count
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.posts,
            postId
        );

        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.posts,
            postId,
            {
                likesCount: Math.max(0, (post.likesCount as number) - 1),
            }
        );
    } else {
        // Like: Create like document
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.postLikes || 'post_likes',
            ID.unique(),
            {
                postId,
                userId,
            },
            [
                Permission.read(Role.users()),
                Permission.delete(Role.user(userId)),
            ]
        );

        // Increment like count
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.posts,
            postId
        );

        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.posts,
            postId,
            {
                likesCount: (post.likesCount as number) + 1,
            }
        );
    }
}

// Check if user has liked a post
async function checkIfLiked(postId: string, userId: string): Promise<boolean> {
    try {
        const likes = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.postLikes || 'post_likes',
            [Query.equal('postId', postId), Query.equal('userId', userId)]
        );

        return likes.documents.length > 0;
    } catch (error) {
        return false;
    }
}

// Hook for infinite posts feed
export function useInfinitePosts() {
    return useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: ({ pageParam = 0 }) => fetchPostsWithAuthors(pageParam),
        getNextPageParam: (lastPage, allPages) => {
            const totalFetched = allPages.reduce((sum, page) => sum + page.documents.length, 0);
            return totalFetched < lastPage.total ? allPages.length : undefined;
        },
        initialPageParam: 0,
    });
}

// Hook for creating a post
export function useCreatePost() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePostData) => {
            if (!user) throw new Error('User not authenticated');
            console.log('Creating post for user:', user.$id, user);
            return createPost(data, user.$id);
        },
        onSuccess: () => {
            // Invalidate and refetch posts
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}

// Hook for toggling like with optimistic updates
export function useToggleLike(postId: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (isLiked: boolean) => {
            if (!user) throw new Error('User not authenticated');
            await toggleLike(postId, user.$id, isLiked);
        },
        onMutate: async (isLiked: boolean) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            // Snapshot previous value
            const previousPosts = queryClient.getQueryData(['posts']);

            // Optimistically update
            queryClient.setQueryData(['posts'], (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: PostsResponse) => ({
                        ...page,
                        documents: page.documents.map((post: Post) =>
                            post.$id === postId
                                ? {
                                    ...post,
                                    likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
                                }
                                : post
                        ),
                    })),
                };
            });

            return { previousPosts };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousPosts) {
                queryClient.setQueryData(['posts'], context.previousPosts);
            }
        },
        onSettled: () => {
            // Refetch after mutation
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}

// Hook to check if user liked a post
export function useCheckLiked(postId: string) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['post-like', postId, user?.$id],
        queryFn: async () => {
            if (!user) return false;
            return checkIfLiked(postId, user.$id);
        },
        enabled: !!user,
    });
}
