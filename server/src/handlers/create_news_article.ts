import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type CreateNewsArticleInput, type NewsArticle } from '../schema';

export const createNewsArticle = async (input: CreateNewsArticleInput): Promise<NewsArticle> => {
  try {
    // Set published_at to current time if not provided
    const publishedAt = input.published_at || new Date();

    // Insert news article record
    const result = await db.insert(newsArticlesTable)
      .values({
        title: input.title,
        content: input.content,
        summary: input.summary,
        author: input.author,
        published_at: publishedAt
      })
      .returning()
      .execute();

    // Return the created article
    const article = result[0];
    return article;
  } catch (error) {
    console.error('News article creation failed:', error);
    throw error;
  }
};