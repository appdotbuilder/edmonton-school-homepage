import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type UpdateEventInput } from '../schema';
import { updateEvent } from '../handlers/update_event';
import { eq } from 'drizzle-orm';

// Test event data for setup
const testEvent = {
  title: 'Original Event',
  description: 'Original description',
  event_date: new Date('2024-06-15'),
  event_time: '10:00 AM',
  location: 'Original Location'
};

describe('updateEvent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an event with all fields', async () => {
    // Create a test event first
    const createdEvent = await db.insert(eventsTable)
      .values(testEvent)
      .returning()
      .execute();

    const eventId = createdEvent[0].id;

    const updateInput: UpdateEventInput = {
      id: eventId,
      title: 'Updated Event Title',
      description: 'Updated description',
      event_date: new Date('2024-07-20'),
      event_time: '2:00 PM',
      location: 'Updated Location'
    };

    const result = await updateEvent(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(eventId);
    expect(result.title).toEqual('Updated Event Title');
    expect(result.description).toEqual('Updated description');
    expect(result.event_date).toEqual(new Date('2024-07-20'));
    expect(result.event_time).toEqual('2:00 PM');
    expect(result.location).toEqual('Updated Location');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create a test event first
    const createdEvent = await db.insert(eventsTable)
      .values(testEvent)
      .returning()
      .execute();

    const eventId = createdEvent[0].id;

    const updateInput: UpdateEventInput = {
      id: eventId,
      title: 'Partially Updated Title',
      event_time: '3:00 PM'
    };

    const result = await updateEvent(updateInput);

    // Verify only specified fields were updated
    expect(result.id).toEqual(eventId);
    expect(result.title).toEqual('Partially Updated Title');
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.event_date).toEqual(new Date('2024-06-15')); // Should remain unchanged
    expect(result.event_time).toEqual('3:00 PM');
    expect(result.location).toEqual('Original Location'); // Should remain unchanged
  });

  it('should update nullable fields to null', async () => {
    // Create a test event first
    const createdEvent = await db.insert(eventsTable)
      .values(testEvent)
      .returning()
      .execute();

    const eventId = createdEvent[0].id;

    const updateInput: UpdateEventInput = {
      id: eventId,
      event_time: null,
      location: null
    };

    const result = await updateEvent(updateInput);

    // Verify nullable fields were set to null
    expect(result.id).toEqual(eventId);
    expect(result.title).toEqual('Original Event'); // Should remain unchanged
    expect(result.description).toEqual('Original description'); // Should remain unchanged
    expect(result.event_date).toEqual(new Date('2024-06-15')); // Should remain unchanged
    expect(result.event_time).toBeNull();
    expect(result.location).toBeNull();
  });

  it('should save updated event to database', async () => {
    // Create a test event first
    const createdEvent = await db.insert(eventsTable)
      .values(testEvent)
      .returning()
      .execute();

    const eventId = createdEvent[0].id;

    const updateInput: UpdateEventInput = {
      id: eventId,
      title: 'Database Update Test',
      description: 'Updated for database verification'
    };

    await updateEvent(updateInput);

    // Query database to verify update
    const updatedEvent = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .execute();

    expect(updatedEvent).toHaveLength(1);
    expect(updatedEvent[0].title).toEqual('Database Update Test');
    expect(updatedEvent[0].description).toEqual('Updated for database verification');
    expect(updatedEvent[0].event_date).toEqual(new Date('2024-06-15')); // Should remain unchanged
    expect(updatedEvent[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update the updated_at timestamp', async () => {
    // Create a test event first
    const createdEvent = await db.insert(eventsTable)
      .values(testEvent)
      .returning()
      .execute();

    const eventId = createdEvent[0].id;
    const originalUpdatedAt = createdEvent[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateEventInput = {
      id: eventId,
      title: 'Timestamp Test'
    };

    const result = await updateEvent(updateInput);

    // Verify updated_at was changed
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error when event does not exist', async () => {
    const updateInput: UpdateEventInput = {
      id: 99999, // Non-existent ID
      title: 'This Should Fail'
    };

    await expect(updateEvent(updateInput)).rejects.toThrow(/Event with id 99999 not found/i);
  });

  it('should handle date objects correctly', async () => {
    // Create a test event first
    const createdEvent = await db.insert(eventsTable)
      .values(testEvent)
      .returning()
      .execute();

    const eventId = createdEvent[0].id;

    const newDate = new Date('2024-12-25T15:30:00Z');
    const updateInput: UpdateEventInput = {
      id: eventId,
      event_date: newDate
    };

    const result = await updateEvent(updateInput);

    // Verify date handling
    expect(result.event_date).toBeInstanceOf(Date);
    expect(result.event_date.getTime()).toEqual(newDate.getTime());

    // Verify in database
    const dbEvent = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .execute();

    expect(dbEvent[0].event_date).toBeInstanceOf(Date);
    expect(dbEvent[0].event_date.getTime()).toEqual(newDate.getTime());
  });
});