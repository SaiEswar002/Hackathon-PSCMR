import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  onRsvp: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
  isAttending?: boolean;
}

const eventTypeColors: Record<string, string> = {
  workshop: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  hackathon: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  meetup: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  webinar: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function EventCard({ event, onRsvp, onViewDetails, isAttending }: EventCardProps) {
  const attendeeCount = event.attendeeIds?.length || 0;
  const spotsLeft = event.maxAttendees ? event.maxAttendees - attendeeCount : null;

  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden" data-testid={`card-event-${event.id}`}>
      {event.imageUrl && (
        <div className="h-36 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
            <span className="text-xs font-medium uppercase">
              {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
            </span>
            <span className="text-xl font-bold leading-none">
              {new Date(event.date).getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
              <Badge variant="secondary" className={`text-xs ${eventTypeColors[event.eventType] || eventTypeColors.meetup}`}>
                {event.eventType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{event.time}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{attendeeCount} attending</span>
            {spotsLeft !== null && spotsLeft > 0 && (
              <span className="text-primary">({spotsLeft} spots left)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
          <Button
            className="flex-1"
            size="sm"
            variant={isAttending ? "secondary" : "default"}
            onClick={() => onRsvp(event.id)}
            data-testid={`button-rsvp-${event.id}`}
          >
            {isAttending ? "Cancel RSVP" : "RSVP"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(event.id)}
            data-testid={`button-event-details-${event.id}`}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
