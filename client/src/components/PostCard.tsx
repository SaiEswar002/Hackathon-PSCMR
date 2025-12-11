import { useState, useEffect } from 'react';
import { useToggleLike } from '@/hooks/usePostsQuery';
import type { PostWithAuthor } from '@/types/post';
import { useAuth } from '@/hooks/useAuth';
import { databases, appwriteConfig } from '@/lib/appwriteClient';
import { Query } from 'appwrite';

interface PostCardProps {
    post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [isCheckingLike, setIsCheckingLike] = useState(true);
    const toggleLikeMutation = useToggleLike(post.$id);

    // Check if user has liked this post
    useEffect(() => {
        async function checkLikeStatus() {
            if (!user) {
                setIsCheckingLike(false);
                return;
            }

            try {
                const likes = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.postLikes || 'post_likes',
                    [Query.equal('postId', post.$id), Query.equal('userId', user.$id)]
                );

                setIsLiked(likes.documents.length > 0);
            } catch (error) {
                console.error('Error checking like status:', error);
            } finally {
                setIsCheckingLike(false);
            }
        }

        checkLikeStatus();
    }, [post.$id, user]);

    const handleLike = async () => {
        if (!user || toggleLikeMutation.isPending) return;

        // Optimistically update UI
        setIsLiked(!isLiked);

        try {
            await toggleLikeMutation.mutateAsync(isLiked);
        } catch (error) {
            // Revert on error
            setIsLiked(isLiked);
            console.error('Error toggling like:', error);
        }
    };

    const handleComment = () => {
        // TODO: Open comment modal/section
        console.log('Comment on post:', post.$id);
    };

    const handleShare = () => {
        // TODO: Implement share functionality
        console.log('Share post:', post.$id);
    };

    const getPostTypeColor = (type: string) => {
        switch (type) {
            case 'skill_offer':
                return 'bg-blue-100 text-blue-800';
            case 'project_invite':
                return 'bg-purple-100 text-purple-800';
            case 'workshop':
                return 'bg-green-100 text-green-800';
            case 'learning_request':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPostTypeLabel = (type: string) => {
        return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <article className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {post.author.avatarUrl ? (
                            <img
                                src={post.author.avatarUrl}
                                alt={post.author.fullName}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-gray-100">
                                {post.author.fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Author Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                {post.author.fullName}
                            </h3>
                            {post.author.department && (
                                <span className="text-sm text-gray-500">• {post.author.department}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">@{post.author.username}</span>
                            <span className="text-gray-300">•</span>
                            <time className="text-sm text-gray-500">{formatDate(post.$createdAt)}</time>
                        </div>
                    </div>

                    {/* Post Type Badge */}
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPostTypeColor(
                            post.postType
                        )}`}
                    >
                        {getPostTypeLabel(post.postType)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-4">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Image */}
            {post.imageUrl && (
                <div className="px-6 pb-4">
                    <img
                        src={post.imageUrl}
                        alt="Post content"
                        className="w-full rounded-lg object-cover max-h-96 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(post.imageUrl, '_blank')}
                    />
                </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        disabled={!user || isCheckingLike || toggleLikeMutation.isPending}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isLiked
                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                : 'text-gray-600 hover:bg-gray-100'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isLiked ? (
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        )}
                        <span className="text-sm">
                            {toggleLikeMutation.isPending ? '...' : post.likesCount}
                        </span>
                    </button>

                    {/* Comment Button */}
                    <button
                        onClick={handleComment}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <span className="text-sm">{post.commentsCount}</span>
                    </button>

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                        </svg>
                        <span className="text-sm">{post.sharesCount}</span>
                    </button>

                    {/* More Options */}
                    <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    );
}
