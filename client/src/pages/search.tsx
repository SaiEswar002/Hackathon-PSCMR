import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Search, Filter, UserPlus, Users } from "lucide-react";
import type { User } from "@shared/schema";

interface SearchPageProps {
  currentUser: User | null;
}

const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
const availabilityOptions = ["Full-time", "Part-time", "Weekends only", "Flexible"];

export default function SearchPage({ currentUser }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");
  const [hasProjectExperience, setHasProjectExperience] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredUsers = users?.filter((user) => {
    if (user.id === currentUser?.id) return false;
    
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skillsToShare?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.skillsToLearn?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-search-title">Search Students</h1>
          <p className="text-muted-foreground">Find students by name, skills, or department</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card className="shadow-sm sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Skill Level</Label>
                  <Select value={skillLevel} onValueChange={setSkillLevel}>
                    <SelectTrigger className="mt-1.5" data-testid="select-skill-level">
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any level</SelectItem>
                      {skillLevels.map((level) => (
                        <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Availability</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger className="mt-1.5" data-testid="select-availability">
                      <SelectValue placeholder="Any availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any availability</SelectItem>
                      {availabilityOptions.map((opt) => (
                        <SelectItem key={opt} value={opt.toLowerCase().replace(" ", "-")}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="project-experience"
                    checked={hasProjectExperience}
                    onCheckedChange={(checked) => setHasProjectExperience(!!checked)}
                    data-testid="checkbox-project-experience"
                  />
                  <Label htmlFor="project-experience" className="text-sm">
                    Has project experience
                  </Label>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSkillLevel("all");
                    setAvailability("all");
                    setHasProjectExperience(false);
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-3">
            <Card className="shadow-sm mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name, skill, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-students"
                  />
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24 mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="shadow-sm hover:shadow-md transition-shadow" data-testid={`card-user-${user.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate" data-testid={`text-user-name-${user.id}`}>
                            {user.fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {user.academicYear} | {user.department}
                          </p>
                        </div>
                      </div>

                      {user.skillsToShare && user.skillsToShare.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {user.skillsToShare.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {user.skillsToShare.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.skillsToShare.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <Button size="sm" className="flex-1" data-testid={`button-connect-${user.id}`}>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                        <Link href={`/profile/${user.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-profile-${user.id}`}>
                            View
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
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No students found</p>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
