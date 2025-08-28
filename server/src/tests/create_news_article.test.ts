import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type CreateNewsArticleInput } from '../schema';
import { createNewsArticle } from '../handlers/create_news_article';
import { eq, gte, between, and } from 'drizzle-orm';

// Simple test input
const testInput: CreateNewsArticleInput = {
  title: 'Test News Article',
  content: 'This is the content of our test news article with important information.',
  summary: 'A short summary of the test article',
  author: 'Test Author'
};

// Test input with null summary
const testInputNullSummary: CreateNewsArticleInput = {
  title: 'Article Without Summary',
  content: 'This article has no summary.',
  summary: null,
  author: 'Another Author'
};

// Test input with custom published date
const customDate = new Date('2024-01-15T10:00:00Z');
const testInputCustomDate: CreateNewsArticleInput = {
  title: 'Article with Custom Date',
  content: 'This article has a custom published date.',
  summary: 'Custom date summary',
  author: 'Date Author',
  published_at: customDate
};

describe('createNewsArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a news article', async () => {
    const result = await createNewsArticle(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test News Article');
    expect(result.content).toEqual(testInput.content);
    expect(result.summary).toEqual('A short summary of the test article');
    expect(result.author).toEqual('Test Author');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.published_at).toBeInstanceOf(Date);
  });

  it('should save news article to database', async () => {
    const result = await createNewsArticle(testInput);

    // Query using proper drizzle syntax
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, result.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toEqual('Test News Article');
    expect(articles[0].content).toEqual(testInput.content);
    expect(articles[0].summary).toEqual('A short summary of the test article');
    expect(articles[0].author).toEqual('Test Author');
    expect(articles[0].created_at).toBeInstanceOf(Date);
    expect(articles[0].updated_at).toBeInstanceOf(Date);
    expect(articles[0].published_at).toBeInstanceOf(Date);
  });

  it('should handle null summary', async () => {
    const result = await createNewsArticle(testInputNullSummary);

    expect(result.title).toEqual('Article Without Summary');
    expect(result.content).toEqual('This article has no summary.');
    expect(result.summary).toBeNull();
    expect(result.author).toEqual('Another Author');
    expect(result.id).toBeDefined();

    // Verify in database
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, result.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].summary).toBeNull();
  });

  it('should use custom published_at date when provided', async () => {
    const result = await createNewsArticle(testInputCustomDate);

    expect(result.title).toEqual('Article with Custom Date');
    expect(result.published_at).toEqual(customDate);

    // Verify in database
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, result.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].published_at).toEqual(customDate);
  });

  it('should set published_at to current time when not provided', async () => {
    const beforeCreate = new Date();
    const result = await createNewsArticle(testInput);
    const afterCreate = new Date();

    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.published_at >= beforeCreate).toBe(true);
    expect(result.published_at <= afterCreate).toBe(true);
  });

  it('should query articles by date range correctly', async () => {
    // Create test articles
    await createNewsArticle(testInput);
    await createNewsArticle(testInputCustomDate);

    // Test date filtering - demonstration of correct date handling
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Proper query building - articles created today should be found
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(
        and(
          gte(newsArticlesTable.published_at, yesterday),
          between(newsArticlesTable.published_at, yesterday, tomorrow)
        )
      )
      .execute();

    expect(articles.length).toBeGreaterThan(0);
    articles.forEach(article => {
      expect(article.published_at).toBeInstanceOf(Date);
      expect(article.published_at >= yesterday).toBe(true);
      expect(article.published_at <= tomorrow).toBe(true);
    });
  });

  it('should create multiple articles with different data', async () => {
    const article1 = await createNewsArticle(testInput);
    const article2 = await createNewsArticle(testInputNullSummary);
    const article3 = await createNewsArticle(testInputCustomDate);

    // All should have unique IDs
    expect(article1.id).not.toEqual(article2.id);
    expect(article2.id).not.toEqual(article3.id);
    expect(article1.id).not.toEqual(article3.id);

    // Verify all are in database
    const allArticles = await db.select()
      .from(newsArticlesTable)
      .execute();

    expect(allArticles).toHaveLength(3);

    // Check each article exists with correct data
    const titles = allArticles.map(a => a.title);
    expect(titles).toContain('Test News Article');
    expect(titles).toContain('Article Without Summary');
    expect(titles).toContain('Article with Custom Date');
  });
});