import type { ConversationWithDetails } from '@/types/message';

interface ConversationListProps {
    conversations: ConversationWithDetails[];
    selectedConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
    currentUserId: string;
}

export function ConversationList({
    conversations,
    selectedConversationId,
    onSelectConversation,
    currentUserId,
}: ConversationListProps) {
    const getOtherParticipant = (conversation: ConversationWithDetails) => {
        return conversation.participants.find((p) => p.$id !== currentUserId);
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const truncateMessage = (text: string, maxLength: number = 40) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <svg
                            className="w-16 h-16 text-gray-300 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <p className="text-gray-500 font-medium">No conversations yet</p>
                        <p className="text-sm text-gray-400 mt-1">Start chatting with someone!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {conversations.map((conversation) => {
                            const otherParticipant = getOtherParticipant(conversation);
                            const isSelected = conversation.$id === selectedConversationId;

                            return (
                                <button
                                    key={conversation.$id}
                                    onClick={() => onSelectConversation(conversation.$id)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 relative">
                                        {otherParticipant?.avatarUrl ? (
                                            <img
                                                src={otherParticipant.avatarUrl}
                                                alt={otherParticipant.fullName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                                {otherParticipant?.fullName.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        )}
                                        {/* Online indicator (placeholder) */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {otherParticipant?.fullName || 'Unknown User'}
                                            </h3>
                                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                {formatTime(conversation.lastMessageAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600 truncate">
                                                {conversation.lastMessage
                                                    ? truncateMessage(conversation.lastMessage.content)
                                                    : 'No messages yet'}
                                            </p>
                                            {conversation.unreadCount > 0 && (
                                                <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
