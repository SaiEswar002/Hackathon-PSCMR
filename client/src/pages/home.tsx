import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LeftSidebar } from "@/components/left-sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { PostCreation } from "@/components/post-creation";
import { FeedCard } from "@/components/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User, PostWithAuthor, InsertPost, Post } from "@shared/schema";
import { postsService } from "@/lib/appwrite-services/posts.service";
import { usersService } from "@/lib/appwrite-services/users.service";
import { queryClient } from "@/lib/queryClient";

interface HomeProps {
  currentUser: User | null;
}

export default function Home({ currentUser }: HomeProps) {
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<string | undefined>();

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts", selectedModule, currentUser?.id],
    queryFn: async (): Promise<PostWithAuthor[]> => {
      let rawPosts: any[]; // Using any to bypass initial Post vs Document type mismatch if any
      if (selectedModule) {
        rawPosts = await postsService.searchPostsByTags([selectedModule]);
      } else {
        rawPosts = await postsService.getAllPosts();
      }

      // Enrich posts with author information
      const postsWithAuthors = await Promise.all(
        rawPosts.map(async (post) => {
          try {
            const author = await usersService.getUser(post.authorId);
            let isLiked = false;
            if (currentUser?.id) {
              isLiked = await postsService.hasUserLikedPost(post.id, currentUser.id);
            }

            if (!author) return null;

            const postWithAuthor: PostWithAuthor = {
              ...post,
              author,
              isLiked,
            };
            return postWithAuthor;
          } catch (e) {
            console.error(`Failed to load author for post ${post.id}`, e);
            return null;
          }
        })
      );

      // Filter out posts where author couldn't be found
      return postsWithAuthors.filter((p): p is PostWithAuthor => p !== null);
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: Omit<InsertPost, "authorId" | "createdAt">) => {
      if (!currentUser) throw new Error("You must be logged in to create a post");

      const newPost: InsertPost = {
        ...postData,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
      };

      return postsService.createPost(newPost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Post created successfully!" });
    },
    onError: (error: any) => {
      console.error("Create post error:", error);
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!currentUser) throw new Error("You must be logged in to like a post");
      return postsService.toggleLike(postId, currentUser.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      console.error("Like post error:", error);
      toast({ title: "Failed to like post", variant: "destructive" });
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
