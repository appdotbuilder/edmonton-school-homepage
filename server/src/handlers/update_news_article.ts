import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type UpdateNewsArticleInput, type NewsArticle } from '../schema';
import { eq } from 'drizzle-orm';

export const updateNewsArticle = async (input: UpdateNewsArticleInput): Promise<NewsArticle> => {
  try {
    // First check if the article exists
    const existingArticle = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, input.id))
      .execute();

    if (existingArticle.length === 0) {
      throw new Error(`News article with id ${input.id} not found`);
    }

    // Build the update object with only the fields that are provided
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData['title'] = input.title;
    }
    if (input.content !== undefined) {
      updateData['content'] = input.content;
    }
    if (input.summary !== undefined) {
      updateData['summary'] = input.summary;
    }
    if (input.author !== undefined) {
      updateData['author'] = input.author;
    }
    if (input.published_at !== undefined) {
      updateData['published_at'] = input.published_at;
    }

    // Update the article and return the updated record
    const result = await db.update(newsArticlesTable)
      .set(updateData)
      .where(eq(newsArticlesTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('News article update failed:', error);
    throw error;
  }
};