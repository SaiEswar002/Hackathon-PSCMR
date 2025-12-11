import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Image, Paperclip, Send } from "lucide-react";
import type { User, InsertPost } from "@shared/schema";

interface PostCreationProps {
  currentUser: User | null;
  onSubmit: (post: Omit<InsertPost, "authorId" | "createdAt">) => void;
  isLoading?: boolean;
}

export function PostCreation({ currentUser, onSubmit, isLoading }: PostCreationProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({
      content: content.trim(),
      postType: "skill_offer",
      tags: [],
      imageUrl: null,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    });
    setContent("");
  };

  if (!currentUser) return null;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentUser.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share a skill, project, or opportunity..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none border-0 bg-muted focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
              data-testid="textarea-post-content"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-add-image">
                  <Image className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-add-attachment">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || isLoading}
                data-testid="button-submit-post"
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
