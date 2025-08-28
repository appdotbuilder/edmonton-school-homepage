import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import type { Event } from '../../../server/src/schema';

interface EventsSectionProps {
  events: Event[];
}

export function EventsSection({ events }: EventsSectionProps) {
  // Default events when no data is available
  const defaultEvents: Partial<Event>[] = [
    {
      id: 1,
      title: "Parent-Teacher Conference Week",
      description: "Individual meetings with teachers to discuss student progress and goals for the upcoming semester.",
      event_date: new Date('2024-02-15'),
      event_time: "9:00 AM - 6:00 PM",
      location: "Main Building Classrooms"
    },
    {
      id: 2,
      title: "Spring Science Exhibition",
      description: "Students showcase their innovative science projects and experiments to the community.",
      event_date: new Date('2024-02-22'),
      event_time: "7:00 PM",
      location: "School Gymnasium"
    },
    {
      id: 3,
      title: "Winter Athletic Championships",
      description: "Annual winter sports competition featuring basketball, volleyball, and indoor track events.",
      event_date: new Date('2024-02-28'),
      event_time: "10:00 AM",
      location: "Athletic Complex"
    },
    {
      id: 4,
      title: "Art Show Opening Night",
      description: "Celebrate student creativity with an exhibition of artwork from all grade levels.",
      event_date: new Date('2024-03-05'),
      event_time: "6:30 PM",
      location: "Art Gallery"
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = (date: Date | string) => {
    return new Date(date) > new Date();
  };

  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Upcoming Events</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Join us for exciting school events, important meetings, and community gatherings throughout the year.
        </p>
      </div>

      {displayEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">No upcoming events scheduled at this time.</p>
          <p className="text-slate-400 text-sm mt-2">Check back soon for new events!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {displayEvents.map((event, index) => (
            <Card key={event.id || index} className="hover:shadow-lg transition-shadow duration-300 group relative">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge 
                    variant={event.event_date && isUpcoming(event.event_date) ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {event.event_date && isUpcoming(event.event_date) ? "Upcoming" : "Past Event"}
                  </Badge>
                  {event.event_date && (
                    <div className="flex items-center text-xs text-slate-500 gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.event_date)}
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {event.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {event.description || 'More details to be announced.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.event_time && (
                    <div className="flex items-center text-sm text-slate-600 gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      {event.event_time}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center text-sm text-slate-600 gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {event.location}
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                      Learn More →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center">
        <Button variant="outline" size="lg" className="font-semibold">
          <Calendar className="h-4 w-4 mr-2" />
          View Full Calendar
        </Button>
      </div>
    </section>
  );
}