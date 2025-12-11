import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePosts } from '../usePosts';
import { AuthProvider } from '../useAuth';

// Mock Appwrite client with inline definitions
vi.mock('@/lib/appwriteClient', () => ({
    databases: {
        listDocuments: vi.fn(),
        createDocument: vi.fn(),
        updateDocument: vi.fn(),
        deleteDocument: vi.fn(),
    },
    storage: {
        createFile: vi.fn(),
    },
    appwriteConfig: {
        endpoint: 'https://cloud.appwrite.io/v1',
        projectId: 'test-project',
        databaseId: 'test-db',
        collections: {
            posts: 'posts',
            users: 'users',
        },
        buckets: {
            postMedia: 'post_images',
        },
    },
}));

// Mock useAuth
vi.mock('../useAuth', () => ({
    useAuth: vi.fn(() => ({
        user: { $id: 'user-123', email: 'test@example.com' },
    })),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Import the mocked modules
import { databases, storage } from '@/lib/appwriteClient';

describe('usePosts Hook', () => {
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
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );

    const createMockPost = (overrides = {}) => ({
        $id: 'post-123',
        authorId: 'user-123',
        content: 'Test post content',
        postType: 'skill_offer' as const,
        tags: ['javascript'],
        likesCount: 5,
        commentsCount: 0,
        sharesCount: 0,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...overrides,
    });

    describe('fetchPosts', () => {
        it('should fetch posts successfully', async () => {
            const mockPosts = [
                createMockPost({ $id: 'post-1', content: 'Post 1' }),
                createMockPost({ $id: 'post-2', content: 'Post 2' }),
            ];

            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: mockPosts,
                total: 2,
            } as any);

            const { result } = renderHook(() => usePosts(), { wrapper });

            // Initially loading
            expect(result.current.loading).toBe(true);

            // Wait for posts to load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.posts).toHaveLength(2);
            expect(result.current.posts[0].content).toBe('Post 1');
            expect(result.current.posts[1].content).toBe('Post 2');
            expect(result.current.error).toBeNull();
        });

        it('should handle fetch errors', async () => {
            vi.mocked(databases.listDocuments).mockRejectedValue(
                new Error('Failed to fetch posts')
            );

            const { result } = renderHook(() => usePosts(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.posts).toHaveLength(0);
            expect(result.current.error).toBe('Failed to fetch posts');
        });
    });

    describe('createPost', () => {
        it('should create post with content only', async () => {
            const newPost = createMockPost({ content: 'New post content' });
            vi.mocked(databases.createDocument).mockResolvedValue(newPost as any);
            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: [],
                total: 0,
            } as any);

            const { result } = renderHook(() => usePosts(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.createPost({
                    content: 'New post content',
                    postType: 'skill_offer',
                    tags: ['javascript'],
                });
            });

            expect(databases.createDocument).toHaveBeenCalledWith(
                'test-db',
                'posts',
                expect.any(String),
                expect.objectContaining({
                    content: 'New post content',
                    postType: 'skill_offer',
                    tags: ['javascript'],
                    likesCount: 0,
                }),
                expect.any(Array)
            );

            // Post should be added to local state
            expect(result.current.posts).toHaveLength(1);
        });

        it('should create post with image upload', async () => {
            const mockFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
            const fileResponse = { $id: 'file-123' };

            vi.mocked(storage.createFile).mockResolvedValue(fileResponse as any);
            vi.mocked(databases.createDocument).mockResolvedValue(
                createMockPost({ imageUrl: 'https://example.com/file-123' }) as any
            );
            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: [],
                total: 0,
            } as any);

            const { result } = renderHook(() => usePosts(), { wrapper });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.createPost({
                    content: 'Post with image',
                    postType: 'project_invite',
                    image: mockFile,
                });
            });

            // Verify image was uploaded
            expect(storage.createFile).toHaveBeenCalledWith(
                'post_images',
                expect.any(String),
                mockFile
            );

            // Verify post was created with image URL
            expect(databases.createDocument).toHaveBeenCalledWith(
                'test-db',
                'posts',
                expect.any(String),
                expect.objectContaining({
                    content: 'Post with image',
                    imageUrl: expect.stringContaining('file-123'),
                }),
                expect.any(Array)
            );
        });
    });

    describe('likePost - Optimistic Updates', () => {
        it('should optimistically update like count when liking', async () => {
            const mockPost = createMockPost({
                $id: 'post-123',
                likesCount: 5,
            });

            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: [mockPost],
                total: 1,
            } as any);

            vi.mocked(databases.updateDocument).mockResolvedValue({
                ...mockPost,
                likesCount: 6,
            } as any);

            const { result } = renderHook(() => usePosts(), { wrapper });

            await waitFor(() => {
                expect(result.current.posts).toHaveLength(1);
            });

            // Initial like count
            expect(result.current.posts[0].likesCount).toBe(5);

            // Like the post
            await act(async () => {
                await result.current.likePost('post-123');
            });

            // Verify optimistic update
            await waitFor(() => {
                expect(result.current.posts[0].likesCount).toBe(6);
            });

            // Verify API was called
            expect(databases.updateDocument).toHaveBeenCalledWith(
                'test-db',
                'posts',
                'post-123',
                { likesCount: 6 }
            );
        });

        it('should rollback optimistic update on error', async () => {
            const mockPost = createMockPost({
                $id: 'post-123',
                likesCount: 5,
            });

            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: [mockPost],
                total: 1,
            } as any);

            // Mock API failure
            vi.mocked(databases.updateDocument).mockRejectedValue(
                new Error('Network error')
            );

            const { result } = renderHook(() => usePosts(), { wrapper });

            await waitFor(() => {
                expect(result.current.posts).toHaveLength(1);
            });

            // Initial like count
            expect(result.current.posts[0].likesCount).toBe(5);

            // Try to like the post (will fail)
            await expect(
                result.current.likePost('post-123')
            ).rejects.toThrow('Network error');

            // Like count should remain unchanged (rollback)
            expect(result.current.posts[0].likesCount).toBe(5);
        });
    });

    describe('deletePost', () => {
        it('should delete post and remove from local state', async () => {
            const mockPosts = [
                createMockPost({ $id: 'post-1' }),
                createMockPost({ $id: 'post-2' }),
            ];

            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: mockPosts,
                total: 2,
            } as any);

            vi.mocked(databases.deleteDocument).mockResolvedValue({} as any);

            const { result } = renderHook(() => usePosts(), { wrapper });

            await waitFor(() => {
                expect(result.current.posts).toHaveLength(2);
            });

            await act(async () => {
                await result.current.deletePost('post-1');
            });

            expect(databases.deleteDocument).toHaveBeenCalledWith(
                'test-db',
                'posts',
                'post-1'
            );

            // Post should be removed from local state
            expect(result.current.posts).toHaveLength(1);
            expect(result.current.posts[0].$id).toBe('post-2');
        });
    });
});
