import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message, User } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  sender: User | undefined;
  isSent: boolean;
  showAvatar?: boolean;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function MessageBubble({ message, sender, isSent, showAvatar = true }: MessageBubbleProps) {
  return (
    <div
      className={`flex items-end gap-2 ${isSent ? "flex-row-reverse" : ""}`}
      data-testid={`message-${message.id}`}
    >
      {showAvatar && !isSent && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={sender?.avatarUrl || undefined} alt={sender?.fullName} />
          <AvatarFallback className="text-xs bg-muted">
            {sender?.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      {!showAvatar && !isSent && <div className="w-8" />}
      
      <div className={`max-w-[70%] ${isSent ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isSent
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className={`text-[10px] text-muted-foreground mt-1 block ${isSent ? "text-right" : ""}`}>
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
