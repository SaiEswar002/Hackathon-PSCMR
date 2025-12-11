import { ID, Query } from 'appwrite';
import { databases } from '../appwrite';
import { appwriteConfig } from '../appwrite-config';
import type { Message, InsertMessage, Conversation, InsertConversation, ConversationWithDetails } from '@shared/schema';
import { usersService } from './users.service';

class MessagesService {
    private messagesCollectionId = appwriteConfig.collections.messages;
    private conversationsCollectionId = appwriteConfig.collections.conversations;
    private databaseId = appwriteConfig.databaseId;

    /**
     * Create a new message
     */
    async createMessage(data: InsertMessage): Promise<Message> {
        try {
            const response = await databases.createDocument(
                this.databaseId,
                this.messagesCollectionId,
                ID.unique(),
                {
                    ...data,
                    isRead: false,
                }
            );

            // Update conversation's last message timestamp
            await databases.updateDocument(
                this.databaseId,
                this.conversationsCollectionId,
                data.conversationId,
                { lastMessageAt: new Date().toISOString() }
            );

            return response as unknown as Message;
        } catch (error) {
            console.error('Create message error:', error);
            throw error;
        }
    }

    /**
     * Get messages by conversation
     */
    async getMessagesByConversation(conversationId: string): Promise<Message[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.messagesCollectionId,
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('$createdAt'),
                    Query.limit(100),
                ]
            );
            return response.documents as unknown as Message[];
        } catch (error) {
            console.error('Get messages by conversation error:', error);
            return [];
        }
    }

    /**
     * Mark message as read
     */
    async markAsRead(messageId: string): Promise<Message | null> {
        try {
            const response = await databases.updateDocument(
                this.databaseId,
                this.messagesCollectionId,
                messageId,
                { isRead: true }
            );
            return response as unknown as Message;
        } catch (error) {
            console.error('Mark message as read error:', error);
            return null;
        }
    }

    /**
     * Mark all messages in conversation as read
     */
    async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
        try {
            const messages = await this.getMessagesByConversation(conversationId);
            const unreadMessages = messages.filter(
                msg => !msg.isRead && msg.receiverId === userId
            );

            for (const message of unreadMessages) {
                await this.markAsRead(message.id);
            }
        } catch (error) {
            console.error('Mark conversation as read error:', error);
        }
    }

    /**
     * Create a new conversation
     */
    async createConversation(data: InsertConversation): Promise<Conversation> {
        try {
            const response = await databases.createDocument(
                this.databaseId,
                this.conversationsCollectionId,
                ID.unique(),
                {
                    ...data,
                    lastMessageAt: new Date().toISOString(),
                }
            );
            return response as unknown as Conversation;
        } catch (error) {
            console.error('Create conversation error:', error);
            throw error;
        }
    }

    /**
     * Get conversation by ID
     */
    async getConversation(conversationId: string): Promise<Conversation | null> {
        try {
            const response = await databases.getDocument(
                this.databaseId,
                this.conversationsCollectionId,
                conversationId
            );
            return response as unknown as Conversation;
        } catch (error) {
            console.error('Get conversation error:', error);
            return null;
        }
    }

    /**
     * Get conversations by user
     */
    async getConversationsByUser(userId: string): Promise<ConversationWithDetails[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.conversationsCollectionId,
                [
                    Query.search('participantIds', userId),
                    Query.orderDesc('lastMessageAt'),
                ]
            );

            const conversations: ConversationWithDetails[] = [];

            for (const conv of response.documents) {
                const conversation = conv as unknown as Conversation;

                // Get participants
                const participants = await Promise.all(
                    conversation.participantIds.map(id => usersService.getUser(id))
                );
                const validParticipants = participants.filter(p => p !== null);

                // Get last message
                const messages = await this.getMessagesByConversation(conversation.id);
                const lastMessage = messages[messages.length - 1];

                // Count unread messages
                const unreadCount = messages.filter(
                    msg => !msg.isRead && msg.receiverId === userId
                ).length;

                conversations.push({
                    ...conversation,
                    participants: validParticipants,
                    lastMessage,
                    unreadCount,
                });
            }

            return conversations;
        } catch (error) {
            console.error('Get conversations by user error:', error);
            return [];
        }
    }

    /**
     * Find or create conversation between two users
     */
    async findOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
        try {
            // Try to find existing conversation
            const response = await databases.listDocuments(
                this.databaseId,
                this.conversationsCollectionId,
                [
                    Query.equal('participantIds', [user1Id, user2Id]),
                    Query.equal('isGroup', false),
                ]
            );

            if (response.documents.length > 0) {
                return response.documents[0] as unknown as Conversation;
            }

            // Create new conversation if not found
            return await this.createConversation({
                participantIds: [user1Id, user2Id],
                isGroup: false,
                groupName: null,
                groupCategory: null,
                lastMessageAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Find or create conversation error:', error);
            throw error;
        }
    }

    /**
     * Delete conversation
     */
    async deleteConversation(conversationId: string): Promise<boolean> {
        try {
            await databases.deleteDocument(
                this.databaseId,
                this.conversationsCollectionId,
                conversationId
            );
            return true;
        } catch (error) {
            console.error('Delete conversation error:', error);
            return false;
        }
    }
}

export const messagesService = new MessagesService();
