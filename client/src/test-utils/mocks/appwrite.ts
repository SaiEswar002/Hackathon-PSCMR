import { vi } from 'vitest';

// Mock Appwrite Account
export const mockAccount = {
    get: vi.fn(),
    create: vi.fn(),
    createEmailPasswordSession: vi.fn(),
    deleteSession: vi.fn(),
    createVerification: vi.fn(),
    updateVerification: vi.fn(),
    createRecovery: vi.fn(),
    updateRecovery: vi.fn(),
    updateEmail: vi.fn(),
    updatePassword: vi.fn(),
    getSession: vi.fn(),
};

// Mock Appwrite Databases
export const mockDatabases = {
    listDocuments: vi.fn(),
    getDocument: vi.fn(),
    createDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
};

// Mock Appwrite Storage
export const mockStorage = {
    createFile: vi.fn(),
    getFile: vi.fn(),
    getFileView: vi.fn(),
    getFileDownload: vi.fn(),
    deleteFile: vi.fn(),
    listFiles: vi.fn(),
};

// Mock Appwrite Client
export const mockClient = {
    setEndpoint: vi.fn().mockReturnThis(),
    setProject: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
};

// Mock Appwrite Realtime
export const mockRealtime = {
    subscribe: vi.fn((channels, callback) => {
        // Return unsubscribe function
        return () => { };
    }),
};

// Mock appwriteConfig
export const mockAppwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'test-project',
    databaseId: 'test-database',
    collections: {
        users: 'users',
        posts: 'posts',
        connections: 'connections',
        messages: 'messages',
        conversations: 'conversations',
        projects: 'projects',
        tasks: 'tasks',
        events: 'events',
        savedItems: 'saved_items',
        postLikes: 'post_likes',
    },
    buckets: {
        avatars: 'avatars',
        banners: 'banners',
        postMedia: 'post_images',
        projectImages: 'project_images',
        eventImages: 'event_images',
    },
};

// Helper to reset all mocks
export const resetAllMocks = () => {
    Object.values(mockAccount).forEach((mock) => mock.mockReset());
    Object.values(mockDatabases).forEach((mock) => mock.mockReset());
    Object.values(mockStorage).forEach((mock) => mock.mockReset());
    mockClient.subscribe.mockReset();
    mockRealtime.subscribe.mockReset();
};

// Mock successful responses
export const mockSuccessfulAuth = () => {
    mockAccount.get.mockResolvedValue({
        $id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerification: true,
    });

    mockAccount.create.mockResolvedValue({
        $id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
    });

    mockAccount.createEmailPasswordSession.mockResolvedValue({
        $id: 'session-123',
        userId: 'user-123',
    });
};

export const mockSuccessfulPostCreation = () => {
    mockDatabases.createDocument.mockResolvedValue({
        $id: 'post-123',
        authorId: 'user-123',
        content: 'Test post',
        postType: 'skill_offer',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
    });

    mockStorage.createFile.mockResolvedValue({
        $id: 'file-123',
        name: 'test-image.jpg',
    });
};

export const mockSuccessfulMessageSend = () => {
    mockDatabases.createDocument.mockResolvedValue({
        $id: 'message-123',
        senderId: 'user-123',
        receiverId: 'user-456',
        conversationId: 'conv-123',
        content: 'Test message',
        isRead: false,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
    });
};
