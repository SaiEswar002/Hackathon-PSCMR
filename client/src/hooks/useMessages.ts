import { useState, useCallback } from 'react';
import { ID, Query, Permission, Role } from 'appwrite';
import { databases, appwriteConfig } from '@/lib/appwriteClient';
import { useAuth } from './useAuth';

// Types
interface Message {
    $id: string;
    senderId: string;
    receiverId: string;
    conversationId: string;
    content: string;
    isRead: boolean;
    $createdAt: string;
    $updatedAt: string;
}

interface Conversation {
    $id: string;
    participantIds: string[];
    isGroup: boolean;
    groupName?: string;
    lastMessageAt?: string;
    $createdAt: string;
    $updatedAt: string;
}

interface SendMessageData {
    receiverId: string;
    content: string;
    conversationId?: string;
}

export function useMessages() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('$createdAt'),
                    Query.limit(100),
                ]
            );

            setMessages(response.documents as unknown as Message[]);
            return response.documents as unknown as Message[];
        } catch (err: any) {
            console.error('Fetch messages error:', err);
            setError(err.message || 'Failed to fetch messages');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch user's conversations
    const fetchConversations = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.conversations,
                [
                    Query.search('participantIds', user.$id),
                    Query.orderDesc('lastMessageAt'),
                ]
            );

            setConversations(response.documents as unknown as Conversation[]);
            return response.documents as unknown as Conversation[];
        } catch (err: any) {
            console.error('Fetch conversations error:', err);
            setError(err.message || 'Failed to fetch conversations');
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Find or create conversation
    const findOrCreateConversation = useCallback(
        async (otherUserId: string): Promise<string> => {
            if (!user) {
                throw new Error('You must be logged in to create a conversation');
            }

            try {
                // Try to find existing conversation
                const response = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.conversations,
                    [
                        Query.equal('participantIds', [user.$id, otherUserId]),
                        Query.equal('isGroup', false),
                    ]
                );

                if (response.documents.length > 0) {
                    return response.documents[0].$id;
                }

                // Create new conversation
                const conversation = await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.conversations,
                    ID.unique(),
                    {
                        participantIds: [user.$id, otherUserId],
                        isGroup: false,
                        lastMessageAt: new Date().toISOString(),
                    },
                    [
                        Permission.read(Role.user(user.$id)),
                        Permission.read(Role.user(otherUserId)),
                        Permission.update(Role.user(user.$id)),
                        Permission.update(Role.user(otherUserId)),
                        Permission.delete(Role.user(user.$id)),
                        Permission.delete(Role.user(otherUserId)),
                    ]
                );

                return conversation.$id;
            } catch (err: any) {
                console.error('Find or create conversation error:', err);
                throw new Error(err.message || 'Failed to create conversation');
            }
        },
        [user]
    );

    // Send message
    const sendMessage = useCallback(
        async (data: SendMessageData) => {
            if (!user) {
                throw new Error('You must be logged in to send a message');
            }

            try {
                // Get or create conversation
                const conversationId =
                    data.conversationId ||
                    (await findOrCreateConversation(data.receiverId));

                // Create message
                const message = await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.messages,
                    ID.unique(),
                    {
                        senderId: user.$id,
                        receiverId: data.receiverId,
                        conversationId,
                        content: data.content,
                        isRead: false,
                    },
                    [
                        Permission.read(Role.user(user.$id)),
                        Permission.read(Role.user(data.receiverId)),
                        Permission.update(Role.user(data.receiverId)),
                        Permission.delete(Role.user(user.$id)),
                    ]
                );

                // Update conversation's last message time
                await databases.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.conversations,
                    conversationId,
                    {
                        lastMessageAt: new Date().toISOString(),
                    }
                );

                // Add to local state
                setMessages((prev) => [...prev, message as unknown as Message]);

                return message;
            } catch (err: any) {
                console.error('Send message error:', err);
                throw new Error(err.message || 'Failed to send message');
            }
        },
        [user, findOrCreateConversation]
    );

    // Mark message as read
    const markAsRead = useCallback(async (messageId: string) => {
        try {
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                messageId,
                { isRead: true }
            );

            // Update local state
            setMessages((prev) =>
                prev.map((m) => (m.$id === messageId ? { ...m, isRead: true } : m))
            );
        } catch (err: any) {
            console.error('Mark as read error:', err);
            throw new Error(err.message || 'Failed to mark message as read');
        }
    }, []);

    return {
        messages,
        conversations,
        loading,
        error,
        fetchMessages,
        fetchConversations,
        sendMessage,
        markAsRead,
    };
}
