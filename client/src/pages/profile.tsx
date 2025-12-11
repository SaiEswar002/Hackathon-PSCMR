import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2, UserPlus, MessageSquare, Share2, BookOpen, ExternalLink, Github, Globe } from "lucide-react";
import { SiBehance, SiLinkedin } from "react-icons/si";
import { FeedCard } from "@/components/feed-card";
import type { User, PostWithAuthor } from "@shared/schema";

interface ProfileProps {
  currentUser: User | null;
}

export default function Profile({ currentUser }: ProfileProps) {
  const params = useParams<{ id?: string }>();
  const profileId = params.id || currentUser?.id;
  const isOwnProfile = !params.id || params.id === currentUser?.id;

  const { data: profileUser, isLoading: profileLoading } = useQuery<User>({
    queryKey: ["/api/users", profileId],
    enabled: !!profileId,
  });

  const { data: userPosts, isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", "user", profileId],
    enabled: !!profileId,
  });

  const user = isOwnProfile ? currentUser : profileUser;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-48 w-full" />
        <div className="max-w-4xl mx-auto px-4 -mt-16">
          <div className="flex items-end gap-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2 pb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-48 bg-gradient-to-r from-[#7b2ff7] to-[#4facfe]" />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6">
          <Avatar className="h-32 w-32 border-4 border-card shadow-lg">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 sm:pb-4">
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-profile-fullname">
              {user.fullName}
            </h1>
            <p className="text-muted-foreground" data-testid="text-profile-info">
              {user.academicYear} | {user.department}
            </p>
            {user.bio && (
              <p className="text-sm text-muted-foreground mt-2 max-w-lg">{user.bio}</p>
            )}
          </div>
          <div className="flex gap-2 sm:pb-4">
            {isOwnProfile ? (
              <Button variant="outline" data-testid="button-edit-profile">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button data-testid="button-connect-profile">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button variant="outline" data-testid="button-message-profile">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
          <div className="lg:col-span-1 space-y-5">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  Skills to Share
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {user.skillsToShare && user.skillsToShare.length > 0 ? (
                    user.skillsToShare.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Skills to Learn
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                    user.skillsToLearn.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Interests</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {user.interests && user.interests.length > 0 ? (
                    user.interests.map((interest) => (
                      <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No interests added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {user.portfolioLinks && user.portfolioLinks.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {user.portfolioLinks.map((link, index) => {
                    const isGithub = link.includes("github");
                    const isLinkedin = link.includes("linkedin");
                    const isBehance = link.includes("behance");
                    const Icon = isGithub ? Github : isLinkedin ? SiLinkedin : isBehance ? SiBehance : Globe;
                    return (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate flex-1">{link}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="mt-4 space-y-5">
                {postsLoading ? (
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ) : userPosts && userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <FeedCard
                      key={post.id}
                      post={post}
                      onLike={() => {}}
                      onComment={() => {}}
                      onShare={() => {}}
                      onSave={() => {}}
                    />
                  ))
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No posts yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="projects" className="mt-4">
                <Card className="shadow-sm">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No projects yet</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
