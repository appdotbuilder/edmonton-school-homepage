import { db } from '../db';
import { quickLinksTable } from '../db/schema';
import { type QuickLink } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getQuickLinks = async (): Promise<QuickLink[]> => {
  try {
    const results = await db.select()
      .from(quickLinksTable)
      .where(eq(quickLinksTable.is_active, true))
      .orderBy(asc(quickLinksTable.display_order))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch quick links:', error);
    throw error;
  }
};