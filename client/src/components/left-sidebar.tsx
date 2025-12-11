import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Rocket, Code, Palette, TrendingUp, Brain, Hash } from "lucide-react";

const modules = [
  { id: "business", label: "Business", icon: Briefcase },
  { id: "startup", label: "Startup", icon: Rocket },
  { id: "coding", label: "Coding", icon: Code },
  { id: "design", label: "Design", icon: Palette },
  { id: "marketing", label: "Marketing", icon: TrendingUp },
  { id: "aiml", label: "AI/ML", icon: Brain },
];

const trendingTopics = [
  "#AI",
  "#EV",
  "#FinTech",
  "#Hackathons",
  "#WebDev",
  "#MachineLearning",
  "#Startups",
  "#UXDesign",
];

interface LeftSidebarProps {
  selectedModule?: string;
  onModuleSelect?: (moduleId: string) => void;
}

export function LeftSidebar({ selectedModule, onModuleSelect }: LeftSidebarProps) {
  return (
    <aside className="space-y-5">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Modules</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isSelected = selectedModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleSelect?.(module.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-200 hover-elevate active-elevate-2 ${
                    isSelected
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                  data-testid={`button-module-${module.id}`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{module.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="cursor-pointer text-xs font-normal"
                data-testid={`badge-trending-${topic.slice(1).toLowerCase()}`}
              >
                <Hash className="h-3 w-3 mr-1" />
                {topic.slice(1)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
