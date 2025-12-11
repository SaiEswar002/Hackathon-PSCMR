import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectCard } from "@/components/project-card";
import { SkillTagInput } from "@/components/skill-tag-input";
import { Plus, Search, FolderKanban, Users, CheckCircle2, Calendar, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Project, Task } from "@shared/schema";

interface ProjectsProps {
  currentUser: User | null;
}

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  skillsNeeded: z.array(z.string()),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export default function Projects({ currentUser }: ProjectsProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      skillsNeeded: [],
    },
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!currentUser,
  });

  const { data: projectTasks } = useQuery<Task[]>({
    queryKey: ["/api/projects", selectedProject?.id, "tasks"],
    enabled: !!selectedProject,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      return apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: "Project created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject?.id, "tasks"] });
    },
  });

  const myProjects = projects?.filter(p => p.ownerId === currentUser?.id || p.memberIds?.includes(currentUser?.id || ""));
  const exploreProjects = projects?.filter(p => 
    p.ownerId !== currentUser?.id && 
    !p.memberIds?.includes(currentUser?.id || "") &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completedTasks = projectTasks?.filter(t => t.isCompleted).length || 0;
  const totalTasks = projectTasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">Collaborate on exciting projects with other students</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-project">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Project" {...field} data-testid="input-project-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-project-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skillsNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills Needed</FormLabel>
                        <FormControl>
                          <SkillTagInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Add required skills..."
                            data-testid="input-project-skills"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createProjectMutation.isPending} data-testid="button-submit-project">
                      {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="my-projects" className="w-full">
              <TabsList className="w-full sm:w-auto justify-start mb-4">
                <TabsTrigger value="my-projects" className="gap-2">
                  <FolderKanban className="h-4 w-4" />
                  My Projects
                </TabsTrigger>
                <TabsTrigger value="explore" className="gap-2">
                  <Search className="h-4 w-4" />
                  Explore
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-projects">
                {projectsLoading ? (
                  <div className="grid gap-5">
                    {[1, 2].map((i) => (
                      <Card key={i} className="shadow-sm">
                        <CardContent className="p-5">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4 mt-1" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : myProjects && myProjects.length > 0 ? (
                  <div className="grid gap-5">
                    {myProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        members={[]}
                        onViewDetails={(id) => setSelectedProject(projects?.find(p => p.id === id) || null)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                      <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">No projects yet</p>
                      <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="explore">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-projects"
                    />
                  </div>
                </div>
                {exploreProjects && exploreProjects.length > 0 ? (
                  <div className="grid gap-5">
                    {exploreProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        members={[]}
                        onViewDetails={(id) => setSelectedProject(projects?.find(p => p.id === id) || null)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No projects found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            {selectedProject ? (
              <Card className="shadow-sm sticky top-24">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{selectedProject.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {selectedProject.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{selectedProject.description}</p>

                  {totalTasks > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{completedTasks}/{totalTasks} tasks</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Tasks
                    </h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {projectTasks && projectTasks.length > 0 ? (
                          projectTasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <Checkbox
                                checked={task.isCompleted || false}
                                onCheckedChange={(checked) => 
                                  toggleTaskMutation.mutate({ taskId: task.id, isCompleted: !!checked })
                                }
                              />
                              <span className={`text-sm flex-1 ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Members
                    </h4>
                    <div className="flex -space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-card">
                        <AvatarFallback className="text-xs">OP</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <Button className="w-full" size="sm">Join Project</Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a project to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
