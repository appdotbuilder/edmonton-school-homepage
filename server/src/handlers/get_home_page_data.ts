import { db } from '../db';
import { newsArticlesTable, eventsTable, quickLinksTable, contactInfoTable } from '../db/schema';
import { type HomePageData } from '../schema';
import { desc, eq, gte } from 'drizzle-orm';

export const getHomePageData = async (): Promise<HomePageData> => {
  try {
    // Get current date for filtering upcoming events
    const currentDate = new Date();
    
    // Execute all queries in parallel for efficiency
    const [latestNewsResults, upcomingEventsResults, quickLinksResults, contactInfoResults] = await Promise.all([
      // Get latest 5 news articles, ordered by published_at descending
      db.select()
        .from(newsArticlesTable)
        .orderBy(desc(newsArticlesTable.published_at))
        .limit(5)
        .execute(),
      
      // Get next 8 upcoming events (from today onwards), ordered by event_date ascending
      db.select()
        .from(eventsTable)
        .where(gte(eventsTable.event_date, currentDate))
        .orderBy(eventsTable.event_date)
        .limit(8)
        .execute(),
      
      // Get all active quick links, ordered by display_order
      db.select()
        .from(quickLinksTable)
        .where(eq(quickLinksTable.is_active, true))
        .orderBy(quickLinksTable.display_order)
        .execute(),
      
      // Get contact information (should only be one record)
      db.select()
        .from(contactInfoTable)
        .limit(1)
        .execute()
    ]);

    // Provide default contact info if none exists
    const safeContactInfo = contactInfoResults[0] || {
      id: 1,
      school_name: 'Edmonton Excellence Academy',
      address: '123 Education Street, Edmonton, AB T5K 2P4',
      phone: '(780) 123-4567',
      email: 'info@edmontonexcellence.ca',
      website: 'https://www.edmontonexcellence.ca',
      office_hours: 'Monday - Friday: 8:00 AM - 4:00 PM',
      created_at: new Date(),
      updated_at: new Date()
    };

    return {
      latestNews: latestNewsResults,
      upcomingEvents: upcomingEventsResults,
      quickLinks: quickLinksResults,
      contactInfo: safeContactInfo
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    throw error;
  }
};