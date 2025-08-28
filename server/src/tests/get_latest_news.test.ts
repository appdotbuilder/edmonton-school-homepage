import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { getLatestNews } from '../handlers/get_latest_news';

describe('getLatestNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no articles exist', async () => {
    const result = await getLatestNews();
    expect(result).toEqual([]);
  });

  it('should return latest news articles ordered by published_at DESC', async () => {
    // Create test articles with different publish dates
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    await db.insert(newsArticlesTable).values([
      {
        title: 'Article 1',
        content: 'Content 1',
        summary: 'Summary 1',
        author: 'Author 1',
        published_at: twoDaysAgo
      },
      {
        title: 'Article 2',
        content: 'Content 2',
        summary: 'Summary 2',
        author: 'Author 2',
        published_at: now
      },
      {
        title: 'Article 3',
        content: 'Content 3',
        summary: 'Summary 3',
        author: 'Author 3',
        published_at: yesterday
      }
    ]).execute();

    const result = await getLatestNews();

    expect(result).toHaveLength(3);
    // Should be ordered by published_at DESC (newest first)
    expect(result[0].title).toBe('Article 2'); // Most recent
    expect(result[1].title).toBe('Article 3'); // Middle
    expect(result[2].title).toBe('Article 1'); // Oldest
  });

  it('should respect the limit parameter', async () => {
    // Create 7 test articles
    const baseDate = new Date();
    const articles = [];
    
    for (let i = 0; i < 7; i++) {
      const publishDate = new Date(baseDate.getTime() - i * 60 * 60 * 1000); // Each hour earlier
      articles.push({
        title: `Article ${i + 1}`,
        content: `Content ${i + 1}`,
        summary: `Summary ${i + 1}`,
        author: `Author ${i + 1}`,
        published_at: publishDate
      });
    }

    await db.insert(newsArticlesTable).values(articles).execute();

    // Test default limit (5)
    const defaultResult = await getLatestNews();
    expect(defaultResult).toHaveLength(5);

    // Test custom limit
    const customResult = await getLatestNews(3);
    expect(customResult).toHaveLength(3);

    // Test limit larger than available articles
    const largeResult = await getLatestNews(10);
    expect(largeResult).toHaveLength(7);
  });

  it('should return complete article data', async () => {
    const testDate = new Date('2023-12-01T10:00:00Z');
    
    await db.insert(newsArticlesTable).values({
      title: 'Test Article',
      content: 'This is test content for the article',
      summary: 'Test summary',
      author: 'Test Author',
      published_at: testDate
    }).execute();

    const result = await getLatestNews(1);

    expect(result).toHaveLength(1);
    const article = result[0];
    
    // Verify all fields are present and correct
    expect(article.id).toBeDefined();
    expect(article.title).toBe('Test Article');
    expect(article.content).toBe('This is test content for the article');
    expect(article.summary).toBe('Test summary');
    expect(article.author).toBe('Test Author');
    expect(article.published_at).toBeInstanceOf(Date);
    expect(article.published_at.toISOString()).toBe(testDate.toISOString());
    expect(article.created_at).toBeInstanceOf(Date);
    expect(article.updated_at).toBeInstanceOf(Date);
  });

  it('should handle articles with null summary', async () => {
    await db.insert(newsArticlesTable).values({
      title: 'Article without summary',
      content: 'Content without summary',
      summary: null,
      author: 'Author',
      published_at: new Date()
    }).execute();

    const result = await getLatestNews();

    expect(result).toHaveLength(1);
    expect(result[0].summary).toBeNull();
    expect(result[0].title).toBe('Article without summary');
  });

  it('should handle limit of zero', async () => {
    // Create a test article
    await db.insert(newsArticlesTable).values({
      title: 'Test Article',
      content: 'Test Content',
      summary: 'Test Summary',
      author: 'Test Author',
      published_at: new Date()
    }).execute();

    const result = await getLatestNews(0);
    expect(result).toHaveLength(0);
  });

  it('should maintain date precision in ordering', async () => {
    const baseTime = new Date('2023-12-01T10:00:00Z').getTime();
    
    // Create articles with very close timestamps (1 second apart)
    await db.insert(newsArticlesTable).values([
      {
        title: 'Article A',
        content: 'Content A',
        summary: 'Summary A',
        author: 'Author A',
        published_at: new Date(baseTime)
      },
      {
        title: 'Article B',
        content: 'Content B',
        summary: 'Summary B',
        author: 'Author B',
        published_at: new Date(baseTime + 1000) // 1 second later
      },
      {
        title: 'Article C',
        content: 'Content C',
        summary: 'Summary C',
        author: 'Author C',
        published_at: new Date(baseTime + 2000) // 2 seconds later
      }
    ]).execute();

    const result = await getLatestNews();

    expect(result).toHaveLength(3);
    // Should be in correct chronological order (newest first)
    expect(result[0].title).toBe('Article C');
    expect(result[1].title).toBe('Article B');
    expect(result[2].title).toBe('Article A');
  });
});