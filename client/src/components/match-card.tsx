import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Eye, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { MatchResult } from "@shared/schema";

interface MatchCardProps {
  match: MatchResult;
  onConnect: (userId: string) => void;
}

export function MatchCard({ match, onConnect }: MatchCardProps) {
  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md" data-testid={`card-match-${match.user.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-card shadow-sm">
            <AvatarImage src={match.user.avatarUrl || undefined} alt={match.user.fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {match.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{match.user.fullName}</h3>
              <Badge className="bg-gradient-to-r from-[#7b2ff7] to-[#4facfe] text-white border-0 gap-1">
                <Sparkles className="h-3 w-3" />
                {match.compatibilityScore}% Match
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {match.user.academicYear} | {match.user.department}
            </p>
          </div>
        </div>

        {match.skillsTheyCanTeach.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Can teach you</p>
            <div className="flex flex-wrap gap-1.5">
              {match.skillsTheyCanTeach.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs font-normal bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {skill}
                </Badge>
              ))}
              {match.skillsTheyCanTeach.length > 4 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{match.skillsTheyCanTeach.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {match.skillsYouCanTeach.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">You can teach</p>
            <div className="flex flex-wrap gap-1.5">
              {match.skillsYouCanTeach.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs font-normal bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {skill}
                </Badge>
              ))}
              {match.skillsYouCanTeach.length > 4 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{match.skillsYouCanTeach.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
          <Button
            className="flex-1"
            size="sm"
            onClick={() => onConnect(match.user.id)}
            data-testid={`button-connect-${match.user.id}`}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
          <Link href={`/profile/${match.user.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-${match.user.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
