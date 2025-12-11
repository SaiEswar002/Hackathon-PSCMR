import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventCard } from "@/components/event-card";
import { Search, Calendar, MapPin, Clock, Users, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Event } from "@shared/schema";

interface EventsProps {
  currentUser: User | null;
}

export default function Events({ currentUser }: EventsProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const rsvpMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return apiRequest("POST", `/api/events/${eventId}/rsvp`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "RSVP updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update RSVP", variant: "destructive" });
    },
  });

  const filteredEvents = events?.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (typeFilter === "all") return matchesSearch;
    return matchesSearch && event.eventType === typeFilter;
  });

  const upcomingEvents = filteredEvents?.filter(e => new Date(e.date) >= new Date()) || [];
  const pastEvents = filteredEvents?.filter(e => new Date(e.date) < new Date()) || [];

  const myEvents = events?.filter(e => 
    e.organizerId === currentUser?.id || 
    e.attendeeIds?.includes(currentUser?.id || "")
  ) || [];

  const isAttending = (eventId: string) => {
    const event = events?.find(e => e.id === eventId);
    return event?.attendeeIds?.includes(currentUser?.id || "") || false;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Events & Workshops</h1>
            <p className="text-muted-foreground">Discover and join learning opportunities</p>
          </div>
        </div>

        <Card className="shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-events"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "workshop", "hackathon", "meetup", "webinar"].map((type) => (
                  <Button
                    key={type}
                    variant={typeFilter === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter(type)}
                    className="capitalize"
                    data-testid={`button-filter-${type}`}
                  >
                    {type === "all" ? "All" : type}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full sm:w-auto justify-start mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="my-events" className="gap-2">
              <Users className="h-4 w-4" />
              My Events
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <Clock className="h-4 w-4" />
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="shadow-sm">
                    <Skeleton className="h-36 w-full rounded-t-lg" />
                    <CardContent className="p-5">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvp={(id) => rsvpMutation.mutate(id)}
                    onViewDetails={(id) => setSelectedEvent(events?.find(e => e.id === id) || null)}
                    isAttending={isAttending(event.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No upcoming events</p>
                  <p className="text-muted-foreground">Check back later for new events</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-events">
            {myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvp={(id) => rsvpMutation.mutate(id)}
                    onViewDetails={(id) => setSelectedEvent(events?.find(e => e.id === id) || null)}
                    isAttending={isAttending(event.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No events yet</p>
                  <p className="text-muted-foreground">RSVP to events to see them here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRsvp={(id) => rsvpMutation.mutate(id)}
                    onViewDetails={(id) => setSelectedEvent(events?.find(e => e.id === id) || null)}
                    isAttending={isAttending(event.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No past events</p>
                  <p className="text-muted-foreground">Past events will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-lg">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between gap-2">
                    <DialogTitle>{selectedEvent.title}</DialogTitle>
                    <Badge variant="secondary" className="capitalize">
                      {selectedEvent.eventType}
                    </Badge>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedEvent.imageUrl && (
                    <div className="h-48 rounded-lg overflow-hidden">
                      <img
                        src={selectedEvent.imageUrl}
                        alt={selectedEvent.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedEvent.date).toLocaleDateString("en-US", { 
                        weekday: "long", month: "long", day: "numeric", year: "numeric" 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedEvent.time}</span>
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedEvent.attendeeIds?.length || 0} attending
                        {selectedEvent.maxAttendees && ` / ${selectedEvent.maxAttendees} max`}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    variant={isAttending(selectedEvent.id) ? "secondary" : "default"}
                    onClick={() => rsvpMutation.mutate(selectedEvent.id)}
                    disabled={rsvpMutation.isPending}
                  >
                    {isAttending(selectedEvent.id) ? "Cancel RSVP" : "RSVP Now"}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
