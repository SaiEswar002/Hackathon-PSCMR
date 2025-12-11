import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleLike } from '@/hooks/usePostsQuery';
import type { Post } from '@/types/post';

// Mock Appwrite
vi.mock('@/lib/appwriteClient', () => ({
    databases: {
        listDocuments: vi.fn(),
        getDocument: vi.fn(),
        updateDocument: vi.fn(),
        createDocument: vi.fn(),
        deleteDocument: vi.fn(),
    },
    appwriteConfig: {
        databaseId: 'test-db',
        collections: {
            posts: 'posts',
            postLikes: 'post_likes',
        },
    },
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            $id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
        },
        isAuthenticated: true,
    }),
}));

describe('useToggleLike Hook', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  );

it('should optimistically update like count when liking a post', async () => {
    const postId = 'post-123';

    // Set initial posts data
    const initialPosts = {
        pages: [
            {
                documents: [
                    {
                        $id: postId,
                        authorId: 'author-123',
                        content: 'Test post',
                        postType: 'skill_offer',
                        tags: [],
                        likesCount: 5,
                        commentsCount: 0,
                        sharesCount: 0,
                        $createdAt: new Date().toISOString(),
                        $updatedAt: new Date().toISOString(),
                    } as Post,
                ],
                total: 1,
            },
        ],
        pageParams: [0],
    };

    queryClient.setQueryData(['posts'], initialPosts);

    const { result } = renderHook(() => useToggleLike(postId), { wrapper });

    // Trigger like (isLiked = false means we're liking it)
    result.current.mutate(false);

    // Check optimistic update
    await waitFor(() => {
        const data = queryClient.getQueryData(['posts']) as any;
        const post = data.pages[0].documents[0];
        expect(post.likesCount).toBe(6); // Should be incremented optimistically
    });
});

it('should optimistically update like count when unliking a post', async () => {
    const postId = 'post-456';

    const initialPosts = {
        pages: [
            {
                documents: [
                    {
                        $id: postId,
                        authorId: 'author-123',
                        content: 'Test post',
                        postType: 'skill_offer',
                        tags: [],
                        likesCount: 10,
                        commentsCount: 0,
                        sharesCount: 0,
                        $createdAt: new Date().toISOString(),
                        $updatedAt: new Date().toISOString(),
                    } as Post,
                ],
                total: 1,
            },
        ],
        pageParams: [0],
    };

    queryClient.setQueryData(['posts'], initialPosts);

    const { result } = renderHook(() => useToggleLike(postId), { wrapper });

    // Trigger unlike (isLiked = true means we're unliking it)
    result.current.mutate(true);

    // Check optimistic update
    await waitFor(() => {
        const data = queryClient.getQueryData(['posts']) as any;
        const post = data.pages[0].documents[0];
        expect(post.likesCount).toBe(9); // Should be decremented optimistically
    });
});

it('should rollback on error', async () => {
    const postId = 'post-789';

    const initialPosts = {
        pages: [
            {
                documents: [
                    {
                        $id: postId,
                        authorId: 'author-123',
                        content: 'Test post',
                        postType: 'skill_offer',
                        tags: [],
                        likesCount: 7,
                        commentsCount: 0,
                        sharesCount: 0,
                        $createdAt: new Date().toISOString(),
                        $updatedAt: new Date().toISOString(),
                    } as Post,
                ],
                total: 1,
            },
        ],
        pageParams: [0],
    };

    queryClient.setQueryData(['posts'], initialPosts);

    // Mock error
    const { databases } = await import('@/lib/appwriteClient');
    vi.mocked(databases.listDocuments).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useToggleLike(postId), { wrapper });

    // Trigger like
    result.current.mutate(false);

    // Wait for error
    await waitFor(() => {
        expect(result.current.isError).toBe(true);
    });

    // Check rollback - should still be 7
    const data = queryClient.getQueryData(['posts']) as any;
    const post = data.pages[0].documents[0];
    expect(post.likesCount).toBe(7);
});

it('should handle multiple posts correctly', async () => {
    const postId1 = 'post-1';
    const postId2 = 'post-2';

    const initialPosts = {
        pages: [
            {
                documents: [
                    {
                        $id: postId1,
                        authorId: 'author-123',
                        content: 'Test post 1',
                        postType: 'skill_offer',
                        tags: [],
                        likesCount: 5,
                        commentsCount: 0,
                        sharesCount: 0,
                        $createdAt: new Date().toISOString(),
                        $updatedAt: new Date().toISOString(),
                    } as Post,
                    {
                        $id: postId2,
                        authorId: 'author-456',
                        content: 'Test post 2',
                        postType: 'project_invite',
                        tags: [],
                        likesCount: 3,
                        commentsCount: 0,
                        sharesCount: 0,
                        $createdAt: new Date().toISOString(),
                        $updatedAt: new Date().toISOString(),
                    } as Post,
                ],
                total: 2,
            },
        ],
        pageParams: [0],
    };

    queryClient.setQueryData(['posts'], initialPosts);

    const { result } = renderHook(() => useToggleLike(postId1), { wrapper });

    // Like first post
    result.current.mutate(false);

    // Check that only first post was updated
    await waitFor(() => {
        const data = queryClient.getQueryData(['posts']) as any;
        const post1 = data.pages[0].documents[0];
        const post2 = data.pages[0].documents[1];

        expect(post1.likesCount).toBe(6); // Incremented
        expect(post2.likesCount).toBe(3); // Unchanged
    });
});
});
