import { useState } from 'react';
import { useConversations } from '@/hooks/useMessagesQuery';
import { useAuth } from '@/hooks/useAuth';
import { ConversationList } from '@/components/ConversationList';
import { ChatWindow } from '@/components/ChatWindow';
import { useLocation } from 'wouter';

export function MessagesPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [, setLocation] = useLocation();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    const { data: conversations, isLoading, isError, error } = useConversations();

    // Get selected conversation
    const selectedConversation = conversations?.find((c) => c.$id === selectedConversationId) || null;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to view messages
                    </h1>
                    <button
                        onClick={() => setLocation('/login')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <svg
                        className="w-16 h-16 text-red-500 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load conversations</h2>
                    <p className="text-gray-600 mb-4">
                        {error instanceof Error ? error.message : 'An error occurred'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLocation('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Conversation List (Left Sidebar) */}
                <div className="w-80 flex-shrink-0">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center bg-white border-r">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-600">Loading conversations...</p>
                            </div>
                        </div>
                    ) : (
                        <ConversationList
                            conversations={conversations || []}
                            selectedConversationId={selectedConversationId}
                            onSelectConversation={setSelectedConversationId}
                            currentUserId={user!.$id}
                        />
                    )}
                </div>

                {/* Chat Window (Main Area) */}
                <div className="flex-1">
                    <ChatWindow
                        conversation={selectedConversation}
                        currentUserId={user!.$id}
                    />
                </div>
            </div>
        </div>
    );
}
