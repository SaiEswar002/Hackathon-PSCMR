// Message types
export interface Message {
    $id: string;
    senderId: string;
    receiverId: string;
    conversationId: string;
    content: string;
    isRead: boolean;
    $createdAt: string;
    $updatedAt: string;
}

export interface MessageWithSender extends Message {
    sender: {
        $id: string;
        fullName: string;
        username: string;
        avatarUrl?: string;
    };
}

export interface Conversation {
    $id: string;
    participantIds: string[];
    isGroup: boolean;
    groupName?: string;
    groupCategory?: string;
    lastMessageAt?: string;
    $createdAt: string;
    $updatedAt: string;
}

export interface ConversationWithDetails extends Conversation {
    participants: Array<{
        $id: string;
        fullName: string;
        username: string;
        avatarUrl?: string;
    }>;
    lastMessage?: Message;
    unreadCount: number;
}

export interface SendMessageData {
    conversationId: string;
    receiverId: string;
    content: string;
}

export interface CreateConversationData {
    participantIds: string[];
    isGroup?: boolean;
    groupName?: string;
}
