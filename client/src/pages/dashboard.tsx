import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Users, FolderKanban, Calendar, BookOpen, TrendingUp, 
  ArrowRight, Sparkles, CheckCircle2, Clock
} from "lucide-react";
import type { User, Project, Event, MatchResult } from "@shared/schema";

interface DashboardProps {
  currentUser: User | null;
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const { data: connections, isLoading: connectionsLoading } = useQuery<User[]>({
    queryKey: ["/api/connections"],
    enabled: !!currentUser,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!currentUser,
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!currentUser,
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<MatchResult[]>({
    queryKey: ["/api/matches"],
    enabled: !!currentUser,
  });

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please log in to view your dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ongoingProjects = projects?.filter(p => p.status === "active").slice(0, 3) || [];
  const upcomingEvents = events?.slice(0, 3) || [];
  const topRecommendations = recommendations?.slice(0, 4) || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {currentUser.fullName.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your network</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-connections">
                {connections?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                <FolderKanban className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-projects">
                {ongoingProjects.length}
              </p>
              <p className="text-xs text-muted-foreground">Active Projects</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-skills-shared">
                {currentUser.skillsToShare?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Skills Shared</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-skills-learning">
                {currentUser.skillsToLearn?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Learning</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Current Connections
              </CardTitle>
              <Link href="/network">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {connectionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : connections && connections.length > 0 ? (
                <div className="space-y-3">
                  {connections.slice(0, 4).map((connection) => (
                    <div key={connection.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={connection.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {connection.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{connection.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{connection.department}</p>
                      </div>
                      <Button variant="outline" size="sm">Message</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No connections yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                Ongoing Projects
              </CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {projectsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : ongoingProjects.length > 0 ? (
                <div className="space-y-3">
                  {ongoingProjects.map((project) => (
                    <div key={project.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-medium text-sm text-foreground truncate">{project.name}</p>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </Badge>
                      </div>
                      <Progress value={60} className="h-1.5" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No ongoing projects</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Recommended Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recommendationsLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-6 w-20" />
                  ))}
                </div>
              ) : topRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {[...new Set(topRecommendations.flatMap(r => r.skillsTheyCanTeach))].slice(0, 6).map((skill) => (
                    <div key={skill} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium text-foreground">{skill}</span>
                      <Badge variant="outline" className="text-xs">
                        {topRecommendations.filter(r => r.skillsTheyCanTeach.includes(skill)).length} mentors
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Add skills to learn to get recommendations</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Upcoming Workshops
              </CardTitle>
              <Link href="/events">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary flex-shrink-0">
                        <span className="text-[10px] font-medium uppercase">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{event.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
