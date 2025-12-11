import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LeftSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { PostCreation } from "@/components/post-creation";
import { FeedCard } from "@/components/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, PostWithAuthor, InsertPost } from "@shared/schema";

interface HomeProps {
  currentUser: User | null;
}

export default function Home({ currentUser }: HomeProps) {
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<string | undefined>();

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", selectedModule],
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: Omit<InsertPost, "authorId" | "createdAt">) => {
      return apiRequest("POST", "/api/posts", post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest("POST", `/api/posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleLike = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const handleComment = (postId: string) => {
    toast({ title: "Comments coming soon!" });
  };

  const handleShare = (postId: string) => {
    toast({ title: "Sharing coming soon!" });
  };

  const handleSave = (postId: string) => {
    toast({ title: "Post saved!" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,22%)_1fr_minmax(200px,25%)] gap-6">
          <div className="hidden lg:block">
            <LeftSidebar
              selectedModule={selectedModule}
              onModuleSelect={setSelectedModule}
            />
          </div>

          <main className="space-y-5">
            <PostCreation
              currentUser={currentUser}
              onSubmit={(post) => createPostMutation.mutate(post)}
              isLoading={createPostMutation.isPending}
            />

            {postsLoading ? (
              <div className="space-y-5">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full mt-4" />
                      <div className="flex gap-2 mt-4">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-5">
                {posts.map((post) => (
                  <FeedCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    onSave={handleSave}
                  />
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No posts yet. Be the first to share something!
                  </p>
                </CardContent>
              </Card>
            )}
          </main>

          <div className="hidden lg:block">
            <RightSidebar currentUser={currentUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
