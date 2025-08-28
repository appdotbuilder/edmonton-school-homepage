import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type CreateEventInput } from '../schema';
import { getUpcomingEvents } from '../handlers/get_upcoming_events';

// Test event data
const createTestEvent = (daysOffset: number, title: string): CreateEventInput => {
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + daysOffset);
  
  return {
    title,
    description: `Description for ${title}`,
    event_date: eventDate,
    event_time: '10:00 AM',
    location: 'School Auditorium'
  };
};

describe('getUpcomingEvents', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return upcoming events ordered by date', async () => {
    // Create test events - past, today, and future
    const pastEvent = createTestEvent(-5, 'Past Event');
    const todayEvent = createTestEvent(0, 'Today Event');
    const futureEvent1 = createTestEvent(3, 'Future Event 1');
    const futureEvent2 = createTestEvent(1, 'Future Event 2');

    // Insert events in random order
    await db.insert(eventsTable).values([
      pastEvent,
      futureEvent1,
      todayEvent,
      futureEvent2
    ]).execute();

    const results = await getUpcomingEvents();

    // Should only return today's and future events, ordered by date
    expect(results).toHaveLength(3);
    expect(results[0].title).toBe('Today Event');
    expect(results[1].title).toBe('Future Event 2');
    expect(results[2].title).toBe('Future Event 1');

    // Verify dates are in ascending order
    for (let i = 1; i < results.length; i++) {
      expect(results[i].event_date >= results[i-1].event_date).toBe(true);
    }
  });

  it('should respect limit parameter', async () => {
    // Create multiple future events
    const events = [];
    for (let i = 1; i <= 5; i++) {
      events.push(createTestEvent(i, `Event ${i}`));
    }

    await db.insert(eventsTable).values(events).execute();

    const results = await getUpcomingEvents(3);

    expect(results).toHaveLength(3);
    expect(results[0].title).toBe('Event 1');
    expect(results[1].title).toBe('Event 2');
    expect(results[2].title).toBe('Event 3');
  });

  it('should use default limit of 10', async () => {
    // Create 15 future events
    const events = [];
    for (let i = 1; i <= 15; i++) {
      events.push(createTestEvent(i, `Event ${i}`));
    }

    await db.insert(eventsTable).values(events).execute();

    const results = await getUpcomingEvents();

    // Should return only 10 events (default limit)
    expect(results).toHaveLength(10);
    expect(results[0].title).toBe('Event 1');
    expect(results[9].title).toBe('Event 10');
  });

  it('should return empty array when no upcoming events exist', async () => {
    // Create only past events
    const pastEvents = [
      createTestEvent(-5, 'Past Event 1'),
      createTestEvent(-2, 'Past Event 2')
    ];

    await db.insert(eventsTable).values(pastEvents).execute();

    const results = await getUpcomingEvents();

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should include events from today', async () => {
    const todayEvent = createTestEvent(0, 'Today Event');
    
    await db.insert(eventsTable).values([todayEvent]).execute();

    const results = await getUpcomingEvents();

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Today Event');
    
    // Verify the event date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(results[0].event_date);
    eventDate.setHours(0, 0, 0, 0);
    expect(eventDate.getTime()).toBe(today.getTime());
  });

  it('should handle events with all fields populated', async () => {
    const completeEvent: CreateEventInput = {
      title: 'Complete Event',
      description: 'A fully detailed event',
      event_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      event_time: '2:30 PM',
      location: 'Main Library'
    };

    await db.insert(eventsTable).values([completeEvent]).execute();

    const results = await getUpcomingEvents();

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Complete Event');
    expect(results[0].description).toBe('A fully detailed event');
    expect(results[0].event_time).toBe('2:30 PM');
    expect(results[0].location).toBe('Main Library');
    expect(results[0].id).toBeDefined();
    expect(results[0].created_at).toBeInstanceOf(Date);
    expect(results[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle events with nullable fields', async () => {
    const minimalEvent: CreateEventInput = {
      title: 'Minimal Event',
      description: 'Basic event description',
      event_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      event_time: null,
      location: null
    };

    await db.insert(eventsTable).values([minimalEvent]).execute();

    const results = await getUpcomingEvents();

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Minimal Event');
    expect(results[0].description).toBe('Basic event description');
    expect(results[0].event_time).toBeNull();
    expect(results[0].location).toBeNull();
  });
});