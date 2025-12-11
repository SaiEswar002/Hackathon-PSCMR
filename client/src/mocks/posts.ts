import type { Post, PostWithAuthor } from '@/types/post';

// Mock user data
export const mockUser = {
    $id: 'user-123',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@university.edu',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    department: 'Computer Science',
};

export const mockUser2 = {
    $id: 'user-456',
    fullName: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@university.edu',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    department: 'Engineering',
};

// Mock posts
export const mockPost: PostWithAuthor = {
    $id: 'post-1',
    authorId: mockUser.$id,
    content: 'Looking for someone to help with React! I can teach Python in exchange. 🚀',
    postType: 'skill_offer',
    tags: ['react', 'python', 'webdev'],
    imageUrl: undefined,
    likesCount: 12,
    commentsCount: 5,
    sharesCount: 2,
    $createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    $updatedAt: new Date(Date.now() - 3600000).toISOString(),
    author: mockUser,
};

export const mockPostWithImage: PostWithAuthor = {
    $id: 'post-2',
    authorId: mockUser2.$id,
    content: 'Just finished my first full-stack project! Check it out 👇',
    postType: 'project_invite',
    tags: ['fullstack', 'nodejs', 'mongodb'],
    imageUrl: 'https://picsum.photos/800/400',
    likesCount: 45,
    commentsCount: 12,
    sharesCount: 8,
    $createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    $updatedAt: new Date(Date.now() - 7200000).toISOString(),
    author: mockUser2,
};

export const mockWorkshopPost: PostWithAuthor = {
    $id: 'post-3',
    authorId: mockUser.$id,
    content: 'Hosting a free workshop on TypeScript best practices this Saturday! Limited spots available.',
    postType: 'workshop',
    tags: ['typescript', 'workshop', 'learning'],
    imageUrl: undefined,
    likesCount: 67,
    commentsCount: 23,
    sharesCount: 15,
    $createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    $updatedAt: new Date(Date.now() - 86400000).toISOString(),
    author: mockUser,
};

export const mockLearningPost: PostWithAuthor = {
    $id: 'post-4',
    authorId: mockUser2.$id,
    content: 'Anyone know a good resource for learning Docker? I\'m struggling with container orchestration.',
    postType: 'learning_request',
    tags: ['docker', 'devops', 'help'],
    imageUrl: undefined,
    likesCount: 8,
    commentsCount: 15,
    sharesCount: 1,
    $createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    $updatedAt: new Date(Date.now() - 172800000).toISOString(),
    author: mockUser2,
};

// Array of all mock posts
export const mockPosts: PostWithAuthor[] = [
    mockPost,
    mockPostWithImage,
    mockWorkshopPost,
    mockLearningPost,
];

// Mock posts response for pagination
export const mockPostsPage1 = {
    documents: [mockPost, mockPostWithImage],
    total: 4,
};

export const mockPostsPage2 = {
    documents: [mockWorkshopPost, mockLearningPost],
    total: 4,
};

// Mock like data
export const mockPostLike = {
    $id: 'like-1',
    postId: 'post-1',
    userId: 'user-123',
    $createdAt: new Date().toISOString(),
};

// Helper function to create mock post
export function createMockPost(overrides?: Partial<PostWithAuthor>): PostWithAuthor {
    return {
        $id: `post-${Math.random().toString(36).substr(2, 9)}`,
        authorId: mockUser.$id,
        content: 'This is a test post',
        postType: 'skill_offer',
        tags: [],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        author: mockUser,
        ...overrides,
    };
}

// Helper function to create mock user
export function createMockUser(overrides?: Partial<typeof mockUser>) {
    return {
        $id: `user-${Math.random().toString(36).substr(2, 9)}`,
        fullName: 'Test User',
        username: 'testuser',
        email: 'test@university.edu',
        avatarUrl: undefined,
        department: undefined,
        ...overrides,
    };
}
