import { useEffect, useRef } from 'react';
import { useInfinitePosts } from '@/hooks/usePostsQuery';
import { PostCard } from '@/components/PostCard';
import { CreatePost } from '@/components/CreatePost';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { useQueryClient } from '@tanstack/react-query';
import type { PostWithAuthor } from '@/types/post';

export function FeedPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const observerTarget = useRef<HTMLDivElement>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfinitePosts();

    // Realtime integration - listen for new posts
    useRealtime('databases.*.collections.posts.documents', (response) => {
        console.log('Realtime post event:', response);

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            // Invalidate queries to fetch new posts
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }

        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
            // Update specific post in cache
            const updatedPost = response.payload as PostWithAuthor;

            queryClient.setQueryData(['posts'], (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        documents: page.documents.map((post: PostWithAuthor) =>
                            post.$id === updatedPost.$id ? updatedPost : post
                        ),
                    })),
                };
            });
        }
    });

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Flatten all posts from all pages
    const allPosts = data?.pages.flatMap((page) => page.documents) || [];

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to view the feed
                    </h1>
                    <a
                        href="/login"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Create Post */}
                <CreatePost />

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading posts...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <svg
                            className="w-12 h-12 text-red-600 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">
                            Failed to load posts
                        </h3>
                        <p className="text-red-700 mb-4">
                            {error instanceof Error ? error.message : 'An error occurred'}
                        </p>
                        <button
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Posts List */}
                {!isLoading && !isError && (
                    <>
                        {allPosts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
                                <svg
                                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                    />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No posts yet
                                </h3>
                                <p className="text-gray-600">
                                    Be the first to share something with the community!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {allPosts.map((post) => (
                                    <PostCard key={post.$id} post={post as PostWithAuthor} />
                                ))}
                            </div>
                        )}

                        {/* Infinite Scroll Trigger */}
                        <div ref={observerTarget} className="py-8">
                            {isFetchingNextPage && (
                                <div className="flex justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-sm text-gray-600">Loading more posts...</p>
                                    </div>
                                </div>
                            )}

                            {!hasNextPage && allPosts.length > 0 && (
                                <div className="text-center">
                                    <p className="text-gray-500 font-medium">
                                        🎉 You've reached the end!
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
