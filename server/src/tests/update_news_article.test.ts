import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type UpdateNewsArticleInput, type CreateNewsArticleInput } from '../schema';
import { updateNewsArticle } from '../handlers/update_news_article';
import { eq } from 'drizzle-orm';

// Create a test article first
const createTestArticle = async () => {
  const testArticle = {
    title: 'Original Title',
    content: 'Original content for testing',
    summary: 'Original summary',
    author: 'Original Author',
    published_at: new Date('2024-01-01T10:00:00Z')
  };

  const result = await db.insert(newsArticlesTable)
    .values(testArticle)
    .returning()
    .execute();

  return result[0];
};

describe('updateNewsArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a news article with all fields', async () => {
    const testArticle = await createTestArticle();
    
    const updateInput: UpdateNewsArticleInput = {
      id: testArticle.id,
      title: 'Updated Title',
      content: 'Updated content for testing',
      summary: 'Updated summary',
      author: 'Updated Author',
      published_at: new Date('2024-02-01T15:30:00Z')
    };

    const result = await updateNewsArticle(updateInput);

    expect(result.id).toEqual(testArticle.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.content).toEqual('Updated content for testing');
    expect(result.summary).toEqual('Updated summary');
    expect(result.author).toEqual('Updated Author');
    expect(result.published_at).toEqual(new Date('2024-02-01T15:30:00Z'));
    expect(result.created_at).toEqual(testArticle.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(testArticle.updated_at.getTime());
  });

  it('should update only provided fields', async () => {
    const testArticle = await createTestArticle();
    
    const updateInput: UpdateNewsArticleInput = {
      id: testArticle.id,
      title: 'Only Title Updated'
    };

    const result = await updateNewsArticle(updateInput);

    expect(result.id).toEqual(testArticle.id);
    expect(result.title).toEqual('Only Title Updated');
    expect(result.content).toEqual(testArticle.content); // Unchanged
    expect(result.summary).toEqual(testArticle.summary); // Unchanged
    expect(result.author).toEqual(testArticle.author); // Unchanged
    expect(result.published_at).toEqual(testArticle.published_at); // Unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(testArticle.updated_at.getTime());
  });

  it('should update summary to null', async () => {
    const testArticle = await createTestArticle();
    
    const updateInput: UpdateNewsArticleInput = {
      id: testArticle.id,
      summary: null
    };

    const result = await updateNewsArticle(updateInput);

    expect(result.id).toEqual(testArticle.id);
    expect(result.summary).toBeNull();
    expect(result.title).toEqual(testArticle.title); // Unchanged
    expect(result.content).toEqual(testArticle.content); // Unchanged
  });

  it('should persist changes to database', async () => {
    const testArticle = await createTestArticle();
    
    const updateInput: UpdateNewsArticleInput = {
      id: testArticle.id,
      title: 'Persisted Title',
      content: 'Persisted content'
    };

    await updateNewsArticle(updateInput);

    // Verify changes are persisted in database
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, testArticle.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toEqual('Persisted Title');
    expect(articles[0].content).toEqual('Persisted content');
    expect(articles[0].summary).toEqual(testArticle.summary); // Unchanged
    expect(articles[0].author).toEqual(testArticle.author); // Unchanged
    expect(articles[0].updated_at).toBeInstanceOf(Date);
    expect(articles[0].updated_at.getTime()).toBeGreaterThan(testArticle.updated_at.getTime());
  });

  it('should update published_at date correctly', async () => {
    const testArticle = await createTestArticle();
    const newPublishedDate = new Date('2024-12-25T12:00:00Z');
    
    const updateInput: UpdateNewsArticleInput = {
      id: testArticle.id,
      published_at: newPublishedDate
    };

    const result = await updateNewsArticle(updateInput);

    expect(result.published_at).toEqual(newPublishedDate);
    expect(result.published_at).toBeInstanceOf(Date);
    
    // Verify in database
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, testArticle.id))
      .execute();

    expect(articles[0].published_at).toEqual(newPublishedDate);
  });

  it('should throw error when article does not exist', async () => {
    const updateInput: UpdateNewsArticleInput = {
      id: 99999, // Non-existent ID
      title: 'This should fail'
    };

    await expect(updateNewsArticle(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle multiple partial updates sequentially', async () => {
    const testArticle = await createTestArticle();
    
    // First update - title only
    const firstUpdate: UpdateNewsArticleInput = {
      id: testArticle.id,
      title: 'First Update'
    };

    const firstResult = await updateNewsArticle(firstUpdate);
    expect(firstResult.title).toEqual('First Update');
    expect(firstResult.content).toEqual(testArticle.content);

    // Second update - content only
    const secondUpdate: UpdateNewsArticleInput = {
      id: testArticle.id,
      content: 'Second Update Content'
    };

    const secondResult = await updateNewsArticle(secondUpdate);
    expect(secondResult.title).toEqual('First Update'); // From previous update
    expect(secondResult.content).toEqual('Second Update Content');
    expect(secondResult.updated_at.getTime()).toBeGreaterThan(firstResult.updated_at.getTime());
  });
});