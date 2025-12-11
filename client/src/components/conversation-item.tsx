import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ConversationWithDetails, User } from "@shared/schema";

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ConversationItem({ conversation, currentUserId, isSelected, onClick }: ConversationItemProps) {
  const otherParticipants = conversation.participants.filter(p => p.id !== currentUserId);
  const displayUser = otherParticipants[0];
  const hasUnread = (conversation.unreadCount || 0) > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 hover-elevate ${
        isSelected ? "bg-primary/10" : "hover:bg-muted"
      }`}
      data-testid={`conversation-${conversation.id}`}
    >
      {conversation.isGroup ? (
        <div className="relative h-12 w-12 flex-shrink-0">
          <div className="absolute top-0 left-0 h-8 w-8">
            <Avatar className="h-8 w-8 border-2 border-card">
              <AvatarImage src={otherParticipants[0]?.avatarUrl || undefined} />
              <AvatarFallback className="text-xs bg-muted">
                {otherParticipants[0]?.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute bottom-0 right-0 h-8 w-8">
            <Avatar className="h-8 w-8 border-2 border-card">
              <AvatarImage src={otherParticipants[1]?.avatarUrl || undefined} />
              <AvatarFallback className="text-xs bg-muted">
                {otherParticipants[1]?.fullName.charAt(0) || "+"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      ) : (
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={displayUser?.avatarUrl || undefined} alt={displayUser?.fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {displayUser?.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-medium truncate ${hasUnread ? "text-foreground" : "text-foreground"}`}>
            {conversation.isGroup ? conversation.groupName : displayUser?.fullName}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-sm truncate ${hasUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {conversation.lastMessage?.content || "No messages yet"}
          </p>
          {hasUnread && (
            <Badge className="h-5 min-w-5 flex items-center justify-center text-xs px-1.5">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
