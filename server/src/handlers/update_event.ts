import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type UpdateEventInput, type Event } from '../schema';
import { eq } from 'drizzle-orm';

export const updateEvent = async (input: UpdateEventInput): Promise<Event> => {
  try {
    // First, check if the event exists
    const existingEvent = await db.select()
      .from(eventsTable)
      .where(eq(eventsTable.id, input.id))
      .execute();

    if (existingEvent.length === 0) {
      throw new Error(`Event with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof eventsTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.event_date !== undefined) {
      updateData.event_date = input.event_date;
    }
    if (input.event_time !== undefined) {
      updateData.event_time = input.event_time;
    }
    if (input.location !== undefined) {
      updateData.location = input.location;
    }

    // Update the event
    const result = await db.update(eventsTable)
      .set(updateData)
      .where(eq(eventsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Event update failed:', error);
    throw error;
  }
};