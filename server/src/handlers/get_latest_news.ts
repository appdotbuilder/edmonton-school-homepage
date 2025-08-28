import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type NewsArticle } from '../schema';
import { desc } from 'drizzle-orm';

export const getLatestNews = async (limit: number = 5): Promise<NewsArticle[]> => {
  try {
    const results = await db.select()
      .from(newsArticlesTable)
      .orderBy(desc(newsArticlesTable.published_at))
      .limit(limit)
      .execute();

    // Return the results - no numeric conversions needed for this table
    return results;
  } catch (error) {
    console.error('Failed to fetch latest news:', error);
    throw error;
  }
};