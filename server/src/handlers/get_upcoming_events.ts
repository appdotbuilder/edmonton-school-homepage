import { db } from '../db';
import { eventsTable } from '../db/schema';
import { type Event } from '../schema';
import { gte, asc } from 'drizzle-orm';

export const getUpcomingEvents = async (limit: number = 10): Promise<Event[]> => {
  try {
    // Get current date at start of day for consistent filtering
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Query upcoming events
    const results = await db.select()
      .from(eventsTable)
      .where(gte(eventsTable.event_date, currentDate))
      .orderBy(asc(eventsTable.event_date))
      .limit(limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch upcoming events:', error);
    throw error;
  }
};