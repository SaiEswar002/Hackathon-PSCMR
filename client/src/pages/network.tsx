import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MatchCard } from "@/components/match-card";
import { Search, Filter, Sparkles, Users, UserPlus, Eye, Globe } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { usersService } from "@/lib/appwrite-services";
import { useToast } from "@/hooks/use-toast";
import type { User, MatchResult } from "@shared/schema";

interface NetworkProps {
  currentUser: User | null;
}

export default function Network({ currentUser }: NetworkProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const { data: matches, isLoading: matchesLoading } = useQuery<MatchResult[]>({
    queryKey: ["/api/matches"],
    enabled: !!currentUser,
  });

  const { data: connections, isLoading: connectionsLoading } = useQuery<User[]>({
    queryKey: ["/api/connections"],
    enabled: !!currentUser,
  });

  const { data: allUsers, isLoading: allUsersLoading } = useQuery<User[]>({
    queryKey: ["appwrite-users"],
    queryFn: async () => {
      console.log("Fetching users from Appwrite...");
      try {
        const users = await usersService.getAllUsers();
        console.log("Appwrite users fetched:", users);
        console.log("Number of users:", users.length);
        return users;
      } catch (error) {
        console.error("Error fetching Appwrite users:", error);
        return [];
      }
    },
    enabled: !!currentUser,
  });

  const connectMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", "/api/connections", { connectedUserId: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({ title: "Connection request sent!" });
    },
    onError: () => {
      toast({ title: "Failed to send connection request", variant: "destructive" });
    },
  });

  const filteredMatches = matches?.filter((match) => {
    const matchesSearch = match.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.skillsTheyCanTeach.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (skillFilter === "all") return matchesSearch;
    return matchesSearch && match.skillsTheyCanTeach.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
  });

  const uniqueSkills = matches
    ? Array.from(new Set(matches.flatMap(m => m.skillsTheyCanTeach)))
    : [];

  const filteredAllUsers = allUsers?.filter((user) => {
    if (user.id === currentUser?.id) return false;

    const matchesSearch =
      user.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.skillsToShare?.some(s => s.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      user.skillsToLearn?.some(s => s.toLowerCase().includes(userSearchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Network</h1>
            <p className="text-muted-foreground">Find students who match your learning goals</p>
          </div>
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="w-full sm:w-auto justify-start mb-6">
            <TabsTrigger value="discover" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-2">
              <Users className="h-4 w-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="all-users" className="gap-2">
              <Globe className="h-4 w-4" />
              All Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <Card className="shadow-sm mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by name or skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-network"
                    />
                  </div>
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger className="w-full sm:w-48" data-testid="select-skill-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      {uniqueSkills.slice(0, 10).map((skill) => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {matchesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredMatches && filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMatches.map((match) => (
                  <MatchCard
                    key={match.user.id}
                    match={match}
                    onConnect={(userId) => connectMutation.mutate(userId)}
                  />
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No matches found</p>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Try adjusting your search or filters" : "Add more skills to find better matches"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="connections">
            {connectionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-sm">
                    <CardContent className="p-5">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : connections && connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {connections.map((connection) => (
                  <MatchCard
                    key={connection.id}
                    match={{
                      user: connection,
                      compatibilityScore: 100,
                      matchingSkills: [],
                      skillsTheyCanTeach: connection.skillsToShare || [],
                      skillsYouCanTeach: currentUser?.skillsToShare || [],
                    }}
                    onConnect={() => { }}
                  />
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No connections yet</p>
                  <p className="text-muted-foreground">
                    Start connecting with students in the Discover tab
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all-users">
            <Card className="shadow-sm mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name, skill, or department..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-all-users"
                  />
                </div>
              </CardContent>
            </Card>

            {allUsersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAllUsers && filteredAllUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAllUsers.map((user) => (
                  <Card key={user.id} className="shadow-sm hover:shadow-md transition-shadow" data-testid={`card-user-${user.id}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-card shadow-sm">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{user.fullName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user.academicYear} | {user.department}
                          </p>
                        </div>
                      </div>

                      {user.skillsToShare && user.skillsToShare.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Skills to Share</p>
                          <div className="flex flex-wrap gap-1.5">
                            {user.skillsToShare.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs font-normal bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                {skill}
                              </Badge>
                            ))}
                            {user.skillsToShare.length > 3 && (
                              <Badge variant="outline" className="text-xs font-normal">
                                +{user.skillsToShare.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {user.skillsToLearn && user.skillsToLearn.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Skills to Learn</p>
                          <div className="flex flex-wrap gap-1.5">
                            {user.skillsToLearn.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs font-normal bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {skill}
                              </Badge>
                            ))}
                            {user.skillsToLearn.length > 3 && (
                              <Badge variant="outline" className="text-xs font-normal">
                                +{user.skillsToLearn.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                        <Button
                          className="flex-1"
                          size="sm"
                          onClick={() => connectMutation.mutate(user.id)}
                          data-testid={`button-connect-${user.id}`}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                        <Link href={`/profile/${user.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-${user.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No users found</p>
                  <p className="text-muted-foreground">
                    {userSearchQuery ? "Try adjusting your search" : "No other users available"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
