import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { useRealtimePosts } from '@/hooks/useRealtime';

export function HomeFeed() {
    const { user, isAuthenticated, logout } = useAuth();
    const { posts, loading, error, createPost, likePost } = usePosts();
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [postType, setPostType] = useState<'skill_offer' | 'project_invite' | 'workshop' | 'learning_request'>('skill_offer');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Subscribe to realtime post updates
    useRealtimePosts((response) => {
        console.log('Realtime post event:', response);

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            console.log('New post created:', response.payload);
            // Post will be automatically added by the usePosts hook
        }
    });

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPostContent.trim()) {
            alert('Please enter post content');
            return;
        }

        try {
            await createPost({
                content: newPostContent,
                postType,
                tags: [],
                image: selectedImage || undefined,
            });

            // Reset form
            setNewPostContent('');
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            alert('Post created successfully!');
        } catch (err: any) {
            alert(err.message || 'Failed to create post');
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedImage(file);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            await likePost(postId);
        } catch (err: any) {
            alert(err.message || 'Failed to like post');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please log in to view the feed</h1>
                    <a href="/login" className="text-blue-600 hover:underline">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">SSM Feed</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">Welcome, {user?.name}!</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Create Post Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Create a Post</h2>
                    <form onSubmit={handleCreatePost}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Post Type
                            </label>
                            <select
                                value={postType}
                                onChange={(e) => setPostType(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="skill_offer">Skill Offer</option>
                                <option value="project_invite">Project Invite</option>
                                <option value="workshop">Workshop</option>
                                <option value="learning_request">Learning Request</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content
                            </label>
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What's on your mind?"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image (optional)
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="w-full"
                            />
                            {selectedImage && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Selected: {selectedImage.name}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Create Post
                        </button>
                    </form>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Posts</h2>

                    {loading && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading posts...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {!loading && posts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No posts yet. Be the first to post!</p>
                        </div>
                    )}

                    {posts.map((post) => (
                        <div key={post.$id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-2">
                                        {post.postType.replace('_', ' ')}
                                    </span>
                                    <p className="text-sm text-gray-500">
                                        {new Date(post.$createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-800 mb-4 whitespace-pre-wrap">
                                {post.content}
                            </p>

                            {post.imageUrl && (
                                <img
                                    src={post.imageUrl}
                                    alt="Post"
                                    className="w-full rounded-lg mb-4 max-h-96 object-cover"
                                />
                            )}

                            <div className="flex items-center gap-4 pt-4 border-t">
                                <button
                                    onClick={() => handleLike(post.$id)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                                >
                                    <span>👍</span>
                                    <span>{post.likesCount} Likes</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                    <span>💬</span>
                                    <span>{post.commentsCount} Comments</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                                    <span>🔄</span>
                                    <span>{post.sharesCount} Shares</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
