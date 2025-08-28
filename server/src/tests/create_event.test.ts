import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type CreateEventInput } from '../schema';
import { createEvent } from '../handlers/create_event';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateEventInput = {
  title: 'Spring Concert',
  description: 'Annual spring concert featuring the school choir and band',
  event_date: new Date('2024-05-15'),
  event_time: '7:00 PM',
  location: 'School Auditorium'
};

// Test input with null optional fields
const minimalTestInput: CreateEventInput = {
  title: 'Staff Meeting',
  description: 'Weekly staff meeting',
  event_date: new Date('2024-03-20'),
  event_time: null,
  location: null
};

describe('createEvent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an event with all fields', async () => {
    const result = await createEvent(testInput);

    // Basic field validation
    expect(result.title).toEqual('Spring Concert');
    expect(result.description).toEqual('Annual spring concert featuring the school choir and band');
    expect(result.event_date).toEqual(new Date('2024-05-15'));
    expect(result.event_time).toEqual('7:00 PM');
    expect(result.location).toEqual('School Auditorium');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an event with null optional fields', async () => {
    const result = await createEvent(minimalTestInput);

    // Basic field validation
    expect(result.title).toEqual('Staff Meeting');
    expect(result.description).toEqual('Weekly staff meeting');
    expect(result.event_date).toEqual(new Date('2024-03-20'));
    expect(result.event_time).toBeNull();
    expect(result.location).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save event to database', async () => {
    const result = await createEvent(testInput);

    // Query using proper drizzle syntax
    const events = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, result.id))
      .execute();

    expect(events).toHaveLength(1);
    expect(events[0].title).toEqual('Spring Concert');
    expect(events[0].description).toEqual(testInput.description);
    expect(events[0].event_date).toEqual(testInput.event_date);
    expect(events[0].event_time).toEqual('7:00 PM');
    expect(events[0].location).toEqual('School Auditorium');
    expect(events[0].created_at).toBeInstanceOf(Date);
    expect(events[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle future dates correctly', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const futureEventInput: CreateEventInput = {
      title: 'Graduation Ceremony',
      description: 'Annual graduation ceremony for seniors',
      event_date: futureDate,
      event_time: '10:00 AM',
      location: 'Main Gymnasium'
    };

    const result = await createEvent(futureEventInput);

    expect(result.event_date).toEqual(futureDate);
    expect(result.event_date.getTime()).toBeGreaterThan(new Date().getTime());
  });

  it('should generate unique IDs for multiple events', async () => {
    const event1 = await createEvent({
      title: 'Event 1',
      description: 'First event',
      event_date: new Date('2024-04-01'),
      event_time: '9:00 AM',
      location: 'Room 101'
    });

    const event2 = await createEvent({
      title: 'Event 2',
      description: 'Second event',
      event_date: new Date('2024-04-02'),
      event_time: '2:00 PM',
      location: 'Room 102'
    });

    expect(event1.id).toBeDefined();
    expect(event2.id).toBeDefined();
    expect(event1.id).not.toEqual(event2.id);

    // Verify both events exist in database
    const allEvents = await db.select().from(eventsTable).execute();
    expect(allEvents).toHaveLength(2);
  });

  it('should preserve timestamps correctly', async () => {
    const beforeCreation = new Date();
    
    const result = await createEvent(testInput);
    
    const afterCreation = new Date();

    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});