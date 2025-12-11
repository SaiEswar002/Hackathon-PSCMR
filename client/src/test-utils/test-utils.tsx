import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                cacheTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });

interface AllTheProvidersProps {
    children: ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
    const queryClient = createTestQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data generators
export const createMockUser = (overrides = {}) => ({
    $id: 'user-123',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    emailVerification: true,
    phoneVerification: false,
    prefs: {},
    ...overrides,
});

export const createMockPost = (overrides = {}) => ({
    $id: 'post-123',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    authorId: 'user-123',
    content: 'Test post content',
    postType: 'skill_offer' as const,
    tags: ['javascript', 'react'],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
    $id: 'message-123',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    senderId: 'user-123',
    receiverId: 'user-456',
    conversationId: 'conv-123',
    content: 'Test message',
    isRead: false,
    ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
    $id: 'conv-123',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    participantIds: ['user-123', 'user-456'],
    isGroup: false,
    lastMessageAt: new Date().toISOString(),
    ...overrides,
});

// Helper to wait for loading states to finish
export const waitForLoadingToFinish = () =>
    new Promise((resolve) => setTimeout(resolve, 0));
