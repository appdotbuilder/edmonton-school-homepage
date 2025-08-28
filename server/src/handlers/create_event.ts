import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type CreateEventInput, type Event } from '../schema';

export const createEvent = async (input: CreateEventInput): Promise<Event> => {
  try {
    // Insert event record
    const result = await db.insert(eventsTable)
      .values({
        title: input.title,
        description: input.description,
        event_date: input.event_date,
        event_time: input.event_time,
        location: input.location
      })
      .returning()
      .execute();

    // Return the created event
    return result[0];
  } catch (error) {
    console.error('Event creation failed:', error);
    throw error;
  }
};