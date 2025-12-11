import { realtime } from '../appwrite';
import { appwriteConfig } from '../appwrite-config';
import type { RealtimeResponseEvent } from 'appwrite';

type RealtimeCallback = (payload: RealtimeResponseEvent<any>) => void;

class RealtimeService {
    private databaseId = appwriteConfig.databaseId;

    /**
     * Subscribe to messages in a conversation
     */
    subscribeToMessages(conversationId: string, callback: RealtimeCallback) {
        const channel = `databases.${this.databaseId}.collections.${appwriteConfig.collections.messages}.documents`;

        return realtime.subscribe(channel, (response) => {
            // Filter for messages in this conversation
            const message = response.payload as any;
            if (message.conversationId === conversationId) {
                callback(response);
            }
        });
    }

    /**
     * Subscribe to all messages for a user
     */
    subscribeToUserMessages(userId: string, callback: RealtimeCallback) {
        const channel = `databases.${this.databaseId}.collections.${appwriteConfig.collections.messages}.documents`;

        return realtime.subscribe(channel, (response) => {
            const message = response.payload as any;
            if (message.receiverId === userId || message.senderId === userId) {
                callback(response);
            }
        });
    }

    /**
     * Subscribe to posts feed
     */
    subscribeToPosts(callback: RealtimeCallback) {
        const channel = `databases.${this.databaseId}.collections.${appwriteConfig.collections.posts}.documents`;
        return realtime.subscribe(channel, callback);
    }

    /**
     * Subscribe to connection requests for a user
     */
    subscribeToConnections(userId: string, callback: RealtimeCallback) {
        const channel = `databases.${this.databaseId}.collections.${appwriteConfig.collections.connections}.documents`;

        return realtime.subscribe(channel, (response) => {
            const connection = response.payload as any;
            if (connection.userId === userId || connection.connectedUserId === userId) {
                callback(response);
            }
        });
    }

    /**
     * Subscribe to project tasks
     */
    subscribeToProjectTasks(projectId: string, callback: RealtimeCallback) {
        const channel = `databases.${this.databaseId}.collections.${appwriteConfig.collections.tasks}.documents`;

        return realtime.subscribe(channel, (response) => {
            const task = response.payload as any;
            if (task.projectId === projectId) {
                callback(response);
            }
        });
    }

    /**
     * Subscribe to events
     */
    subscribeToEvents(callback: RealtimeCallback) {
        const channel = `databases.${this.databaseId}.collections.${appwriteConfig.collections.events}.documents`;
        return realtime.subscribe(channel, callback);
    }

    /**
     * Subscribe to a specific event
     */
    subscribeToEvent(eventId: string, callback: RealtimeCallback) {
        const channel = `databases.${this.databaseId}.collections.${appwriteConfig.collections.events}.documents.${eventId}`;
        return realtime.subscribe(channel, callback);
    }

    /**
     * Subscribe to conversations
     */
    subscribeToConversations(userId: string, callback: RealtimeCallback) {
        const channel = `databases.${this.databaseId}.collections.${appwriteConfig.collections.conversations}.documents`;

        return realtime.subscribe(channel, (response) => {
            const conversation = response.payload as any;
            if (conversation.participantIds?.includes(userId)) {
                callback(response);
            }
        });
    }

    /**
     * Unsubscribe from a channel
     */
    unsubscribe(unsubscribeFunction: () => void) {
        unsubscribeFunction();
    }
}

export const realtimeService = new RealtimeService();
