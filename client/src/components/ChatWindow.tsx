import { useState, useRef, useEffect, FormEvent } from 'react';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/useMessagesQuery';
import { useRealtime } from '@/hooks/useRealtime';
import { useQueryClient } from '@tanstack/react-query';
import type { MessageWithSender, ConversationWithDetails } from '@/types/message';

interface ChatWindowProps {
    conversation: ConversationWithDetails | null;
    currentUserId: string;
}

export function ChatWindow({ conversation, currentUserId }: ChatWindowProps) {
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useMessages(conversation?.$id || null);

    const sendMessageMutation = useSendMessage(conversation?.$id || '');
    const markAsReadMutation = useMarkAsRead();

    // Flatten all messages
    const allMessages = data?.pages.flatMap((page) => page.documents).reverse() || [];

    // Get other participant
    const otherParticipant = conversation?.participants.find((p) => p.$id !== currentUserId);

    // Realtime subscription for new messages
    useRealtime(
        conversation ? `databases.*.collections.messages.documents` : '',
        (response) => {
            const message = response.payload as MessageWithSender;

            // Only update if message belongs to current conversation
            if (message.conversationId === conversation?.$id) {
                if (response.events.includes('*.create')) {
                    // Invalidate to fetch new message
                    queryClient.invalidateQueries({ queryKey: ['messages', conversation.$id] });
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });

                    // Mark as read if we're the receiver
                    if (message.receiverId === currentUserId) {
                        markAsReadMutation.mutate(conversation.$id);
                    }
                }
            }
        }
    );

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [allMessages.length]);

    // Mark messages as read when conversation opens
    useEffect(() => {
        if (conversation) {
            markAsReadMutation.mutate(conversation.$id);
        }
    }, [conversation?.$id]);

    // Handle send message
    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim() || !conversation || !otherParticipant) return;

        const content = messageInput.trim();
        setMessageInput('');

        try {
            await sendMessageMutation.mutateAsync({
                conversationId: conversation.$id,
                receiverId: otherParticipant.$id,
                content,
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            // Restore message on error
            setMessageInput(content);
        }
    };

    // Handle scroll to load more
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.currentTarget;

        // Load more when scrolled to top
        if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    // Group messages by date
    const groupedMessages: { date: string; messages: MessageWithSender[] }[] = [];
    let currentDate = '';

    allMessages.forEach((message) => {
        const messageDate = formatMessageDate(message.$createdAt);
        if (messageDate !== currentDate) {
            currentDate = messageDate;
            groupedMessages.push({ date: messageDate, messages: [message] });
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(message);
        }
    });

    if (!conversation) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <svg
                        className="w-24 h-24 text-gray-300 mx-auto mb-4"
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
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No conversation selected</h3>
                    <p className="text-gray-500">Choose a conversation to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {otherParticipant?.avatarUrl ? (
                        <img
                            src={otherParticipant.avatarUrl}
                            alt={otherParticipant.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {otherParticipant?.fullName.charAt(0).toUpperCase() || '?'}
                        </div>
                    )}

                    {/* Info */}
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {otherParticipant?.fullName || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {isTyping ? 'typing...' : 'Active now'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
            >
                {/* Load more indicator */}
                {isFetchingNextPage && (
                    <div className="text-center py-2">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading messages...</p>
                        </div>
                    </div>
                )}

                {!isLoading && groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {/* Date Separator */}
                        <div className="flex items-center justify-center my-4">
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                                {group.date}
                            </span>
                        </div>

                        {/* Messages */}
                        {group.messages.map((message) => {
                            const isSentByMe = message.senderId === currentUserId;
                            const isOptimistic = message.$id.startsWith('temp-');

                            return (
                                <div
                                    key={message.$id}
                                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mb-2`}
                                >
                                    <div className={`flex items-end gap-2 max-w-[70%] ${isSentByMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar (only for received messages) */}
                                        {!isSentByMe && (
                                            <div className="flex-shrink-0">
                                                {message.sender.avatarUrl ? (
                                                    <img
                                                        src={message.sender.avatarUrl}
                                                        alt={message.sender.fullName}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                                        {message.sender.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Message Bubble */}
                                        <div>
                                            <div
                                                className={`px-4 py-2 rounded-2xl ${isSentByMe
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-900 border border-gray-200'
                                                    } ${isOptimistic ? 'opacity-60' : ''}`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                                                <span className="text-xs text-gray-500">
                                                    {formatMessageTime(message.$createdAt)}
                                                </span>
                                                {isSentByMe && (
                                                    <span className="text-xs">
                                                        {isOptimistic ? (
                                                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        ) : message.isRead ? (
                                                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    {/* Attachment Button */}
                    <button
                        type="button"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                        </svg>
                    </button>

                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e as any);
                                }
                            }}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none max-h-32"
                            style={{ minHeight: '48px' }}
                        />

                        {/* Emoji Button */}
                        <button
                            type="button"
                            className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sendMessageMutation.isPending ? (
                            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
