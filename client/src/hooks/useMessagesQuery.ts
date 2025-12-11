import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { ID, Query, Permission, Role } from 'appwrite';
import { databases, appwriteConfig } from '@/lib/appwriteClient';
import { useAuth } from './useAuth';
import type {
    Message,
    MessageWithSender,
    Conversation,
    ConversationWithDetails,
    SendMessageData,
    CreateConversationData,
} from '@/types/message';

const MESSAGES_PER_PAGE = 50;

// Fetch conversations for current user
async function fetchConversations(userId: string): Promise<ConversationWithDetails[]> {
    const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conversations,
        [Query.search('participantIds', userId), Query.orderDesc('lastMessageAt'), Query.limit(50)]
    );

    // Fetch details for each conversation
    const conversationsWithDetails = await Promise.all(
        response.documents.map(async (conv) => {
            const conversation = conv as unknown as Conversation;

            // Fetch participants
            const participants = await Promise.all(
                conversation.participantIds.map(async (participantId) => {
                    try {
                        const user = await databases.getDocument(
                            appwriteConfig.databaseId,
                            appwriteConfig.collections.users,
                            participantId
                        );
                        return {
                            $id: user.$id,
                            fullName: user.fullName as string,
                            username: user.username as string,
                            avatarUrl: user.avatarUrl as string | undefined,
                        };
                    } catch (error) {
                        return {
                            $id: participantId,
                            fullName: 'Unknown User',
                            username: 'unknown',
                        };
                    }
                })
            );

            // Fetch last message
            let lastMessage: Message | undefined;
            try {
                const messages = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.messages,
                    [
                        Query.equal('conversationId', conversation.$id),
                        Query.orderDesc('$createdAt'),
                        Query.limit(1),
                    ]
                );
                lastMessage = messages.documents[0] as unknown as Message;
            } catch (error) {
                // No messages yet
            }

            // Count unread messages
            let unreadCount = 0;
            try {
                const unreadMessages = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.messages,
                    [
                        Query.equal('conversationId', conversation.$id),
                        Query.equal('receiverId', userId),
                        Query.equal('isRead', false),
                    ]
                );
                unreadCount = unreadMessages.total;
            } catch (error) {
                // Error counting unread
            }

            return {
                ...conversation,
                participants,
                lastMessage,
                unreadCount,
            };
        })
    );

    return conversationsWithDetails;
}

// Fetch messages for a conversation with infinite scroll
async function fetchMessages(
    conversationId: string,
    pageParam: number = 0
): Promise<{ documents: MessageWithSender[]; total: number }> {
    const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.messages,
        [
            Query.equal('conversationId', conversationId),
            Query.orderDesc('$createdAt'),
            Query.limit(MESSAGES_PER_PAGE),
            Query.offset(pageParam * MESSAGES_PER_PAGE),
        ]
    );

    // Fetch sender info for each message
    const messagesWithSenders = await Promise.all(
        response.documents.map(async (msg) => {
            const message = msg as unknown as Message;
            try {
                const sender = await databases.getDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.users,
                    message.senderId
                );
                return {
                    ...message,
                    sender: {
                        $id: sender.$id,
                        fullName: sender.fullName as string,
                        username: sender.username as string,
                        avatarUrl: sender.avatarUrl as string | undefined,
                    },
                };
            } catch (error) {
                return {
                    ...message,
                    sender: {
                        $id: message.senderId,
                        fullName: 'Unknown User',
                        username: 'unknown',
                    },
                };
            }
        })
    );

    return {
        documents: messagesWithSenders,
        total: response.total,
    };
}

// Send a message
async function sendMessage(data: SendMessageData, userId: string): Promise<Message> {
    const message = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.messages,
        ID.unique(),
        {
            senderId: userId,
            receiverId: data.receiverId,
            conversationId: data.conversationId,
            content: data.content,
            isRead: false,
        },
        [
            Permission.read(Role.user(userId)),
            Permission.read(Role.user(data.receiverId)),
            Permission.update(Role.user(data.receiverId)),
            Permission.delete(Role.user(userId)),
        ]
    );

    // Update conversation's lastMessageAt
    await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conversations,
        data.conversationId,
        {
            lastMessageAt: new Date().toISOString(),
        }
    );

    return message as unknown as Message;
}

// Mark messages as read
async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const unreadMessages = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.messages,
        [
            Query.equal('conversationId', conversationId),
            Query.equal('receiverId', userId),
            Query.equal('isRead', false),
        ]
    );

    await Promise.all(
        unreadMessages.documents.map((msg) =>
            databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                msg.$id,
                { isRead: true }
            )
        )
    );
}

// Create or find conversation
async function findOrCreateConversation(
    otherUserId: string,
    currentUserId: string
): Promise<string> {
    // Try to find existing conversation
    const conversations = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conversations,
        [Query.search('participantIds', currentUserId), Query.equal('isGroup', false)]
    );

    const existingConv = conversations.documents.find((conv) => {
        const participants = conv.participantIds as string[];
        return participants.includes(otherUserId) && participants.length === 2;
    });

    if (existingConv) {
        return existingConv.$id;
    }

    // Create new conversation
    const newConv = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.conversations,
        ID.unique(),
        {
            participantIds: [currentUserId, otherUserId],
            isGroup: false,
            lastMessageAt: new Date().toISOString(),
        },
        [
            Permission.read(Role.user(currentUserId)),
            Permission.read(Role.user(otherUserId)),
            Permission.update(Role.user(currentUserId)),
            Permission.update(Role.user(otherUserId)),
        ]
    );

    return newConv.$id;
}

// Hook: Fetch conversations
export function useConversations() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['conversations', user?.$id],
        queryFn: () => {
            if (!user) throw new Error('User not authenticated');
            return fetchConversations(user.$id);
        },
        enabled: !!user,
    });
}

// Hook: Fetch messages with infinite scroll
export function useMessages(conversationId: string | null) {
    return useInfiniteQuery({
        queryKey: ['messages', conversationId],
        queryFn: ({ pageParam = 0 }) => {
            if (!conversationId) throw new Error('No conversation selected');
            return fetchMessages(conversationId, pageParam);
        },
        getNextPageParam: (lastPage, allPages) => {
            const totalFetched = allPages.reduce((sum, page) => sum + page.documents.length, 0);
            return totalFetched < lastPage.total ? allPages.length : undefined;
        },
        enabled: !!conversationId,
        initialPageParam: 0,
    });
}

// Hook: Send message with optimistic update
export function useSendMessage(conversationId: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SendMessageData) => {
            if (!user) throw new Error('User not authenticated');
            return sendMessage(data, user.$id);
        },
        onMutate: async (data: SendMessageData) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

            // Snapshot previous value
            const previousMessages = queryClient.getQueryData(['messages', conversationId]);

            // Optimistically add message
            const optimisticMessage: MessageWithSender = {
                $id: `temp-${Date.now()}`,
                senderId: user!.$id,
                receiverId: data.receiverId,
                conversationId: data.conversationId,
                content: data.content,
                isRead: false,
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                sender: {
                    $id: user!.$id,
                    fullName: user!.name || 'You',
                    username: user!.email.split('@')[0],
                    avatarUrl: undefined,
                },
            };

            queryClient.setQueryData(['messages', conversationId], (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map((page: any, index: number) =>
                        index === 0
                            ? {
                                ...page,
                                documents: [optimisticMessage, ...page.documents],
                            }
                            : page
                    ),
                };
            });

            return { previousMessages };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousMessages) {
                queryClient.setQueryData(['messages', conversationId], context.previousMessages);
            }
        },
        onSuccess: () => {
            // Invalidate conversations to update last message
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onSettled: () => {
            // Refetch messages
            queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        },
    });
}

// Hook: Mark as read
export function useMarkAsRead() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string) => {
            if (!user) throw new Error('User not authenticated');
            return markMessagesAsRead(conversationId, user.$id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}

// Hook: Find or create conversation
export function useFindOrCreateConversation() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (otherUserId: string) => {
            if (!user) throw new Error('User not authenticated');
            return findOrCreateConversation(otherUserId, user.$id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });
}
