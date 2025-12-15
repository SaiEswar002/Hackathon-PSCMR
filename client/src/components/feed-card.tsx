import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PostWithAuthor, User } from "@shared/schema";
import { CommentsList } from "./comments-list";

interface FeedCardProps {
  post: PostWithAuthor;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  onCommentAdded: () => void;
  onDelete?: (postId: string) => void;
}

const postTypeLabels: Record<string, { label: string; color: string }> = {
  skill_offer: { label: "Skill Offer", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  project_invite: { label: "Project Invite", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  workshop: { label: "Workshop", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  learning_request: { label: "Learning Request", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

function formatTimeAgo(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function FeedCard({ post, currentUser, onLike, onShare, onSave, onCommentAdded, onDelete }: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const postType = postTypeLabels[post.postType] || postTypeLabels.skill_offer;

  // Check if current user is the author
  const isAuthor = currentUser && (
    (currentUser as any).$id === post.authorId ||
    currentUser.id === post.authorId
  );

  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md" data-testid={`card-post-${post.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.author.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground">{post.author.fullName}</h4>
                <Badge variant="secondary" className={`text-xs ${postType.color}`}>
                  {postType.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {post.author.department} | {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-post-menu-${post.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSave(post.id)}>
                <Bookmark className="h-4 w-4 mr-2" />
                Save post
              </DropdownMenuItem>
              {isAuthor && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(post.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                >
                  <MoreHorizontal className="h-4 w-4 mr-2 rotate-90" /> {/* Using rotate as a trash placeholder or import Trash */}
                  Delete post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          {post.imageUrl && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={post.imageUrl}
                alt="Post attachment"
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span data-testid={`text-likes-${post.id}`}>{post.likesCount || 0} likes</span>
            <span data-testid={`text-comments-${post.id}`}>{post.commentsCount || 0} comments</span>
            <span data-testid={`text-shares-${post.id}`}>{post.sharesCount || 0} shares</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 gap-2 ${post.isLiked ? "text-red-500" : ""}`}
            onClick={() => onLike(post.id)}
            data-testid={`button-like-${post.id}`}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => setShowComments(!showComments)}
            data-testid={`button-comment-${post.id}`}
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onShare(post.id)}
            data-testid={`button-share-${post.id}`}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {showComments && (
          <CommentsList
            postId={post.id}
            currentUser={currentUser}
            onCommentAdded={onCommentAdded}
          />
        )}
      </CardContent>
    </Card>
  );
}
