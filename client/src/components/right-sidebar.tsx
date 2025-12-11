import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Users, Share2, BookOpen, Bookmark, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";

interface RightSidebarProps {
  currentUser: User | null;
  savedItemsCount?: number;
}

const topStories = [
  { id: 1, title: "AI Research Team wins National Hackathon", category: "Innovation" },
  { id: 2, title: "Web3 Workshop this Friday", category: "Workshop" },
  { id: 3, title: "New UX Design Club looking for members", category: "Collaboration" },
  { id: 4, title: "Python Bootcamp registrations open", category: "Learning" },
];

export function RightSidebar({ currentUser, savedItemsCount = 0 }: RightSidebarProps) {
  return (
    <aside className="space-y-5">
      {currentUser && (
        <Card className="shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-[#7b2ff7] to-[#4facfe]" />
          <CardContent className="pt-0 pb-5 -mt-8">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-16 w-16 border-4 border-card shadow-md">
                <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {currentUser.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-3 font-semibold text-foreground" data-testid="text-profile-name">
                {currentUser.fullName}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-profile-details">
                {currentUser.academicYear} | {currentUser.department}
              </p>
              <Link href="/profile" className="w-full mt-4">
                <Button className="w-full" size="sm" data-testid="button-view-profile">
                  View Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {currentUser && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Analytics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold text-foreground" data-testid="text-profile-views">
                  {currentUser.profileViews || 0}
                </p>
                <p className="text-xs text-muted-foreground">Profile Views</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold text-foreground" data-testid="text-connections-count">
                  {currentUser.connectionsCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">Connections</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold text-foreground" data-testid="text-skills-shared">
                  {currentUser.skillsToShare?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Skills Shared</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold text-foreground" data-testid="text-skills-learning">
                  {currentUser.skillsToLearn?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Learning</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Saved Items
          </CardTitle>
          <span className="text-xs text-muted-foreground">{savedItemsCount} items</span>
        </CardHeader>
        <CardContent className="pt-0">
          {savedItemsCount > 0 ? (
            <Link href="/saved">
              <Button variant="ghost" className="w-full justify-between text-sm" data-testid="button-view-saved">
                View saved items
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No saved items yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Top Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {topStories.map((story) => (
              <div
                key={story.id}
                className="group cursor-pointer"
                data-testid={`story-${story.id}`}
              >
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {story.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{story.category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
