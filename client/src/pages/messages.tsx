import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationItem } from "@/components/conversation-item";
import { MessageBubble } from "@/components/message-bubble";
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Message, ConversationWithDetails } from "@shared/schema";

interface MessagesProps {
  currentUser: User | null;
}

export default function Messages({ currentUser }: MessagesProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
    enabled: !!currentUser,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedConversation],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        conversationId: selectedConversation,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessageInput("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversationData = conversations?.find(c => c.id === selectedConversation);
  const otherParticipant = selectedConversationData?.participants.find(p => p.id !== currentUser?.id);

  const filteredConversations = conversations?.filter(c => {
    const otherP = c.participants.find(p => p.id !== currentUser?.id);
    return otherP?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please log in to view messages</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-background">
      <div className="h-full max-w-6xl mx-auto">
        <div className="h-full flex">
          <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold text-foreground mb-3">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-conversations"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversationsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))
                ) : filteredConversations && filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      currentUserId={currentUser.id}
                      isSelected={selectedConversation === conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className={`flex-1 flex flex-col ${!selectedConversation ? "hidden md:flex" : "flex"}`}>
            {selectedConversation && selectedConversationData ? (
              <>
                <div className="h-16 px-4 border-b border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedConversation(null)}
                      data-testid="button-back-conversations"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {otherParticipant?.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {selectedConversationData.isGroup ? selectedConversationData.groupName : otherParticipant?.fullName}
                      </h2>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}>
                          <Skeleton className={`h-12 ${i % 2 === 0 ? "w-48" : "w-36"} rounded-2xl`} />
                        </div>
                      ))
                    ) : messages && messages.length > 0 ? (
                      messages.map((message, index) => {
                        const isSent = message.senderId === currentUser.id;
                        const sender = selectedConversationData.participants.find(p => p.id === message.senderId);
                        const prevMessage = messages[index - 1];
                        const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
                        
                        return (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            sender={sender}
                            isSent={isSent}
                            showAvatar={showAvatar}
                          />
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground">Your messages</p>
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
