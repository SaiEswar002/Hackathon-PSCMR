import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, CheckCircle2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project, User } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  members: User[];
  onViewDetails: (projectId: string) => void;
  completedMilestones?: number;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  on_hold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function ProjectCard({ project, members, onViewDetails, completedMilestones = 0 }: ProjectCardProps) {
  const totalMilestones = project.milestones?.length || 0;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md" data-testid={`card-project-${project.id}`}>
      {project.imageUrl && (
        <div className="h-32 overflow-hidden rounded-t-lg">
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className={`p-5 ${project.imageUrl ? "" : "pt-5"}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              <Badge variant="secondary" className={`text-xs ${statusColors[project.status] || statusColors.active}`}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(project.id)}>
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.skillsNeeded && project.skillsNeeded.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.skillsNeeded.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
            {project.skillsNeeded.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{project.skillsNeeded.length - 3}
              </Badge>
            )}
          </div>
        )}

        {totalMilestones > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Progress
              </span>
              <span>{completedMilestones}/{totalMilestones} milestones</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-1.5" />
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className="h-6 w-6 border-2 border-card">
                    <AvatarImage src={member.avatarUrl || undefined} alt={member.fullName} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {member.fullName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 4 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">+{members.length - 4}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(project.id)}
            data-testid={`button-view-project-${project.id}`}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
