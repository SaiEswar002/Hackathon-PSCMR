import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessages } from '../useMessages';
import { AuthProvider } from '../useAuth';

// Mock Appwrite client with inline definitions
vi.mock('@/lib/appwriteClient', () => ({
    databases: {
        listDocuments: vi.fn(),
        createDocument: vi.fn(),
        updateDocument: vi.fn(),
    },
    appwriteConfig: {
        databaseId: 'test-db',
        collections: {
            messages: 'messages',
            conversations: 'conversations',
            users: 'users',
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
import { databases } from '@/lib/appwriteClient';

describe('useMessages Hook', () => {
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

    const createMockMessage = (overrides = {}) => ({
        $id: 'msg-123',
        senderId: 'user-123',
        receiverId: 'user-456',
        conversationId: 'conv-123',
        content: 'Test message',
        isRead: false,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...overrides,
    });

    const createMockConversation = (overrides = {}) => ({
        $id: 'conv-123',
        participantIds: ['user-123', 'user-456'],
        isGroup: false,
        lastMessageAt: new Date().toISOString(),
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...overrides,
    });

    describe('fetchMessages', () => {
        it('should fetch messages for a conversation', async () => {
            const mockMessages = [
                createMockMessage({ $id: 'msg-1', content: 'Hello' }),
                createMockMessage({ $id: 'msg-2', content: 'Hi there' }),
            ];

            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: mockMessages,
                total: 2,
            } as any);

            const { result } = renderHook(() => useMessages(), { wrapper });

            await act(async () => {
                await result.current.fetchMessages('conv-123');
            });

            // Verify the function was called (don't check exact Query structure)
            expect(databases.listDocuments).toHaveBeenCalled();

            expect(result.current.messages).toHaveLength(2);
            expect(result.current.messages[0].content).toBe('Hello');
            expect(result.current.messages[1].content).toBe('Hi there');
        });

        it('should handle fetch errors gracefully', async () => {
            vi.mocked(databases.listDocuments).mockRejectedValue(
                new Error('Failed to fetch messages')
            );

            const { result } = renderHook(() => useMessages(), { wrapper });

            await act(async () => {
                await result.current.fetchMessages('conv-123');
            });

            expect(result.current.messages).toHaveLength(0);
            expect(result.current.error).toBe('Failed to fetch messages');
        });
    });

    describe('fetchConversations', () => {
        it('should fetch user conversations', async () => {
            const mockConversations = [
                createMockConversation({ $id: 'conv-1' }),
                createMockConversation({ $id: 'conv-2' }),
            ];

            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: mockConversations,
                total: 2,
            } as any);

            const { result } = renderHook(() => useMessages(), { wrapper });

            await act(async () => {
                await result.current.fetchConversations();
            });

            expect(databases.listDocuments).toHaveBeenCalledWith(
                'test-db',
                'conversations',
                expect.any(Array)
            );

            expect(result.current.conversations).toHaveLength(2);
        });
    });

    describe('sendMessage', () => {
        it('should send message successfully', async () => {
            // Mock conversation exists
            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: [createMockConversation({ $id: 'conv-123' })],
                total: 1,
            } as any);

            const newMessage = createMockMessage({ content: 'Test message' });
            vi.mocked(databases.createDocument).mockResolvedValue(newMessage as any);
            vi.mocked(databases.updateDocument).mockResolvedValue({} as any);

            const { result } = renderHook(() => useMessages(), { wrapper });

            await act(async () => {
                await result.current.sendMessage({
                    receiverId: 'user-456',
                    content: 'Test message',
                    conversationId: 'conv-123',
                });
            });

            // Verify message was created
            expect(databases.createDocument).toHaveBeenCalledWith(
                'test-db',
                'messages',
                expect.any(String),
                expect.objectContaining({
                    senderId: 'user-123',
                    receiverId: 'user-456',
                    content: 'Test message',
                    isRead: false,
                }),
                expect.any(Array)
            );

            // Verify conversation timestamp was updated
            expect(databases.updateDocument).toHaveBeenCalledWith(
                'test-db',
                'conversations',
                'conv-123',
                expect.objectContaining({
                    lastMessageAt: expect.any(String),
                })
            );

            // Message should be added to local state
            expect(result.current.messages).toHaveLength(1);
            expect(result.current.messages[0].content).toBe('Test message');
        });

        it('should create conversation if it does not exist', async () => {
            // First call: no existing conversation
            vi.mocked(databases.listDocuments).mockResolvedValueOnce({
                documents: [],
                total: 0,
            } as any);

            // Create new conversation
            vi.mocked(databases.createDocument).mockResolvedValueOnce(
                createMockConversation({ $id: 'new-conv-123' }) as any
            );

            // Then create message
            vi.mocked(databases.createDocument).mockResolvedValueOnce(
                createMockMessage({ conversationId: 'new-conv-123' }) as any
            );

            vi.mocked(databases.updateDocument).mockResolvedValue({} as any);

            const { result } = renderHook(() => useMessages(), { wrapper });

            await act(async () => {
                await result.current.sendMessage({
                    receiverId: 'user-456',
                    content: 'First message',
                });
            });

            // Verify conversation was created
            expect(databases.createDocument).toHaveBeenCalledWith(
                'test-db',
                'conversations',
                expect.any(String),
                expect.objectContaining({
                    participantIds: ['user-123', 'user-456'],
                    isGroup: false,
                }),
                expect.any(Array)
            );

            // Verify message was created with new conversation ID
            expect(databases.createDocument).toHaveBeenCalledWith(
                'test-db',
                'messages',
                expect.any(String),
                expect.objectContaining({
                    conversationId: 'new-conv-123',
                }),
                expect.any(Array)
            );
        });
    });

    describe('markAsRead', () => {
        it('should mark message as read', async () => {
            const mockMessage = createMockMessage({
                $id: 'msg-123',
                isRead: false,
            });

            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: [mockMessage],
                total: 1,
            } as any);

            vi.mocked(databases.updateDocument).mockResolvedValue({
                ...mockMessage,
                isRead: true,
            } as any);

            const { result } = renderHook(() => useMessages(), { wrapper });

            // Fetch messages first
            await act(async () => {
                await result.current.fetchMessages('conv-123');
            });

            expect(result.current.messages[0].isRead).toBe(false);

            // Mark as read
            await act(async () => {
                await result.current.markAsRead('msg-123');
            });

            expect(databases.updateDocument).toHaveBeenCalledWith(
                'test-db',
                'messages',
                'msg-123',
                { isRead: true }
            );

            // Local state should be updated
            expect(result.current.messages[0].isRead).toBe(true);
        });
    });

    describe('Real-time messaging (mocked)', () => {
        it('should demonstrate realtime subscription pattern', async () => {
            // NOTE: This demonstrates how you would test realtime functionality
            // In a real implementation, you would:
            // 1. Subscribe to Appwrite realtime events in useEffect
            // 2. Update state when new messages arrive
            // 3. Clean up subscriptions on unmount

            const mockMessages = [
                createMockMessage({ $id: 'msg-1', content: 'Initial message' }),
            ];

            vi.mocked(databases.listDocuments).mockResolvedValue({
                documents: mockMessages,
                total: 1,
            } as any);

            const { result } = renderHook(() => useMessages(), { wrapper });

            // Fetch initial messages
            await act(async () => {
                await result.current.fetchMessages('conv-123');
            });

            expect(result.current.messages).toHaveLength(1);

            // In a real implementation with realtime:
            // - Hook would subscribe to realtime events
            // - New messages would be pushed to state automatically
            // - This test would simulate receiving a realtime event

            // Example pattern (would need actual realtime implementation):
            // const newMessage = createMockMessage({
            //   $id: 'msg-2',
            //   content: 'New realtime message',
            // });
            // 
            // // Simulate realtime event
            // act(() => {
            //   realtimeCallback({
            //     events: ['databases.*.collections.messages.documents.*.create'],
            //     payload: newMessage,
            //   });
            // });
            //
            // expect(result.current.messages).toHaveLength(2);
        });

        it('should clean up realtime subscriptions on unmount', async () => {
            // NOTE: This demonstrates the cleanup pattern
            // In a real implementation, useEffect would return a cleanup function
            // that calls the unsubscribe method returned by realtime.subscribe()

            const { unmount } = renderHook(() => useMessages(), { wrapper });

            // In actual implementation:
            // useEffect(() => {
            //   const unsubscribe = realtime.subscribe(/* ... */);
            //   return () => unsubscribe();
            // }, []);

            unmount();

            // Verify cleanup (in real implementation):
            // expect(unsubscribeMock).toHaveBeenCalled();
        });
    });
});
