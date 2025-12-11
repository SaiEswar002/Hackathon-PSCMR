import { useEffect, useCallback, useRef } from 'react';
import { client } from '@/lib/appwriteClient';
import type { RealtimeResponseEvent } from 'appwrite';

type RealtimeHandler = (response: RealtimeResponseEvent<any>) => void;

export function useRealtime(channel: string | string[], handler: RealtimeHandler) {
    const handlerRef = useRef(handler);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Update handler ref when it changes
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    // Subscribe to channel
    const subscribe = useCallback(() => {
        const channels = Array.isArray(channel) ? channel : [channel];

        try {
            const unsubscribe = client.subscribe(channels, (response) => {
                handlerRef.current(response);
            });

            unsubscribeRef.current = unsubscribe;

            console.log('Subscribed to realtime channels:', channels);
        } catch (error) {
            console.error('Realtime subscription error:', error);
        }
    }, [channel]);

    // Unsubscribe from channel
    const unsubscribe = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
            console.log('Unsubscribed from realtime channel');
        }
    }, []);

    // Subscribe on mount, unsubscribe on unmount
    useEffect(() => {
        subscribe();
        return () => {
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    return { unsubscribe };
}

// Convenience hook for posts feed
export function useRealtimePosts(handler: RealtimeHandler) {
    return useRealtime('databases.*.collections.posts.documents', handler);
}

// Convenience hook for messages
export function useRealtimeMessages(conversationId: string, handler: RealtimeHandler) {
    return useRealtime('databases.*.collections.messages.documents', (response) => {
        const message = response.payload as any;
        if (message.conversationId === conversationId) {
            handler(response);
        }
    });
}

// Convenience hook for projects
export function useRealtimeProject(projectId: string, handler: RealtimeHandler) {
    return useRealtime(
        [
            `databases.*.collections.projects.documents.${projectId}`,
            'databases.*.collections.tasks.documents',
        ],
        handler
    );
}
