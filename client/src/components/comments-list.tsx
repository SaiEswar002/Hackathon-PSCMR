import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { postsService } from "@/lib/appwrite-services/posts.service";
import type { User } from "@shared/schema";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
    $id: string;
    postId: string;
    authorId: string;
    content: string;
    createdAt: string;
    author: {
        fullName: string;
        avatarUrl?: string;
    };
}

interface CommentsListProps {
    postId: string;
    currentUser: User | null;
    onCommentAdded?: () => void;
}

export function CommentsList({ postId, currentUser, onCommentAdded }: CommentsListProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchComments = async () => {
        try {
            const fetchedComments = await postsService.getComments(postId);
            setComments(fetchedComments);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        // Use $id for Appwrite compatibility, fallback to id
        const userId = (currentUser as any).$id || currentUser.id;

        setIsSubmitting(true);
        try {
            await postsService.createComment(postId, userId, newComment.trim());
            setNewComment("");
            await fetchComments();
            if (onCommentAdded) onCommentAdded();
            toast({ title: "Comment added!" });
        } catch (error) {
            console.error("Failed to add comment", error);
            toast({ title: "Failed to add comment", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-4 border-t border-border">
            <ScrollArea className="max-h-[300px] pr-4">
                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-2">
                            No comments yet. Be the first to say something!
                        </p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.$id} className="flex gap-3 text-sm">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarImage src={comment.author.avatarUrl} />
                                    <AvatarFallback className="text-xs">
                                        {comment.author.fullName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted/50 p-3 rounded-lg flex-1">
                                    <p className="font-semibold text-foreground text-xs">{comment.author.fullName}</p>
                                    <p className="text-foreground mt-1">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {currentUser && (
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                            {currentUser.fullName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 h-9 text-sm"
                    />
                    <Button type="submit" size="icon" disabled={isSubmitting || !newComment.trim()} className="h-9 w-9">
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            )}
        </div>
    );
}
