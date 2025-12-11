import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Plus, MessageSquare, ArrowRight, Hash } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Conversation } from "@shared/schema";

interface GroupsProps {
  currentUser: User | null;
}

const groupCategories = [
  { id: "ml", label: "Machine Learning", count: 5 },
  { id: "startup", label: "Startups", count: 8 },
  { id: "web", label: "Web Development", count: 12 },
  { id: "design", label: "Design", count: 6 },
  { id: "blockchain", label: "Blockchain", count: 3 },
  { id: "mobile", label: "Mobile Dev", count: 4 },
];

interface GroupConversation extends Conversation {
  memberCount?: number;
}

export default function Groups({ currentUser }: GroupsProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<User[]>([]);

  const { data: groups, isLoading: groupsLoading } = useQuery<GroupConversation[]>({
    queryKey: ["/api/groups"],
    enabled: !!currentUser,
  });

  const { data: myGroups } = useQuery<GroupConversation[]>({
    queryKey: ["/api/groups/my"],
    enabled: !!currentUser,
  });

  const demoGroups: GroupConversation[] = [
    { id: "group-1", participantIds: [], isGroup: true, groupName: "ML Enthusiasts", groupCategory: "ml", lastMessageAt: new Date().toISOString(), memberCount: 24 },
    { id: "group-2", participantIds: [], isGroup: true, groupName: "Startup Founders Club", groupCategory: "startup", lastMessageAt: new Date().toISOString(), memberCount: 45 },
    { id: "group-3", participantIds: [], isGroup: true, groupName: "React Developers", groupCategory: "web", lastMessageAt: new Date().toISOString(), memberCount: 67 },
    { id: "group-4", participantIds: [], isGroup: true, groupName: "UI/UX Design Community", groupCategory: "design", lastMessageAt: new Date().toISOString(), memberCount: 32 },
    { id: "group-5", participantIds: [], isGroup: true, groupName: "Web3 Builders", groupCategory: "blockchain", lastMessageAt: new Date().toISOString(), memberCount: 18 },
    { id: "group-6", participantIds: [], isGroup: true, groupName: "Flutter & React Native", groupCategory: "mobile", lastMessageAt: new Date().toISOString(), memberCount: 29 },
  ];

  const displayGroups = groups?.length ? groups : demoGroups;

  const filteredGroups = displayGroups.filter((group) => {
    const matchesSearch = group.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || group.groupCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinGroup = (groupId: string) => {
    toast({ title: "Joined group successfully!" });
  };

  const handleViewMembers = (group: GroupConversation) => {
    setSelectedGroupMembers([]);
    setShowMembersModal(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-groups-title">Groups & Communities</h1>
            <p className="text-muted-foreground">Join communities and collaborate with like-minded students</p>
          </div>
          <Button data-testid="button-create-group">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    !selectedCategory ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                  data-testid="button-category-all"
                >
                  <span className="text-sm font-medium">All Groups</span>
                  <Badge variant="secondary" className="text-xs">{displayGroups.length}</Badge>
                </button>
                {groupCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                    data-testid={`button-category-${category.id}`}
                  >
                    <span className="text-sm font-medium">{category.label}</span>
                    <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-3">
            <Tabs defaultValue="discover" className="w-full">
              <TabsList className="w-full sm:w-auto justify-start mb-4">
                <TabsTrigger value="discover" className="gap-2" data-testid="tab-discover">
                  <Users className="h-4 w-4" />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="my-groups" className="gap-2" data-testid="tab-my-groups">
                  <MessageSquare className="h-4 w-4" />
                  My Groups
                </TabsTrigger>
              </TabsList>

              <Card className="shadow-sm mb-4">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-groups"
                    />
                  </div>
                </CardContent>
              </Card>

              <TabsContent value="discover">
                {groupsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="shadow-sm">
                        <CardContent className="p-4">
                          <Skeleton className="h-16 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredGroups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGroups.map((group) => (
                      <Card key={group.id} className="shadow-sm hover:shadow-md transition-shadow" data-testid={`card-group-${group.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7b2ff7] to-[#4facfe] flex items-center justify-center">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate" data-testid={`text-group-name-${group.id}`}>
                                {group.groupName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                <Users className="h-3 w-3" />
                                <span>{group.memberCount || 0} members</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleJoinGroup(group.id)}
                              data-testid={`button-join-${group.id}`}
                            >
                              Join Group
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewMembers(group)}
                              data-testid={`button-members-${group.id}`}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">No groups found</p>
                      <p className="text-muted-foreground">Try adjusting your search or category filter</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-groups">
                <Card className="shadow-sm">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">No groups yet</p>
                    <p className="text-muted-foreground mb-4">Join groups to start collaborating with others</p>
                    <Button onClick={() => {}}>
                      Discover Groups
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Group Members</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-64">
              {selectedGroupMembers.length > 0 ? (
                <div className="space-y-2">
                  {selectedGroupMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {member.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">{member.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No members to display</p>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
