import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quickLinksTable } from '../db/schema';
import { type UpdateQuickLinkInput, type CreateQuickLinkInput } from '../schema';
import { updateQuickLink } from '../handlers/update_quick_link';
import { eq } from 'drizzle-orm';

// Helper to create a test quick link
const createTestQuickLink = async (): Promise<number> => {
  const testQuickLink: CreateQuickLinkInput = {
    title: 'Original Title',
    description: 'Original description',
    url: 'https://example.com',
    display_order: 1,
    is_active: true
  };

  const result = await db.insert(quickLinksTable)
    .values({
      ...testQuickLink,
      display_order: testQuickLink.display_order || 0,
      is_active: testQuickLink.is_active ?? true
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateQuickLink', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a quick link', async () => {
    const quickLinkId = await createTestQuickLink();

    const updateInput: UpdateQuickLinkInput = {
      id: quickLinkId,
      title: 'Updated Title',
      description: 'Updated description',
      url: 'https://updated-example.com',
      display_order: 5,
      is_active: false
    };

    const result = await updateQuickLink(updateInput);

    // Verify returned data
    expect(result.id).toEqual(quickLinkId);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Updated description');
    expect(result.url).toEqual('https://updated-example.com');
    expect(result.display_order).toEqual(5);
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const quickLinkId = await createTestQuickLink();

    const updateInput: UpdateQuickLinkInput = {
      id: quickLinkId,
      title: 'Only Title Updated',
      is_active: false
    };

    const result = await updateQuickLink(updateInput);

    // Verify only specified fields were updated
    expect(result.title).toEqual('Only Title Updated');
    expect(result.is_active).toEqual(false);
    // Original values should remain
    expect(result.description).toEqual('Original description');
    expect(result.url).toEqual('https://example.com');
    expect(result.display_order).toEqual(1);
  });

  it('should handle null values correctly', async () => {
    const quickLinkId = await createTestQuickLink();

    const updateInput: UpdateQuickLinkInput = {
      id: quickLinkId,
      description: null
    };

    const result = await updateQuickLink(updateInput);

    expect(result.description).toBeNull();
    // Other fields should remain unchanged
    expect(result.title).toEqual('Original Title');
    expect(result.url).toEqual('https://example.com');
  });

  it('should save changes to database', async () => {
    const quickLinkId = await createTestQuickLink();

    const updateInput: UpdateQuickLinkInput = {
      id: quickLinkId,
      title: 'Database Test Title',
      display_order: 10
    };

    await updateQuickLink(updateInput);

    // Verify changes were saved to database
    const quickLinks = await db.select()
      .from(quickLinksTable)
      .where(eq(quickLinksTable.id, quickLinkId))
      .execute();

    expect(quickLinks).toHaveLength(1);
    expect(quickLinks[0].title).toEqual('Database Test Title');
    expect(quickLinks[0].display_order).toEqual(10);
    expect(quickLinks[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update the updated_at timestamp', async () => {
    const quickLinkId = await createTestQuickLink();

    // Get original timestamp
    const originalQuickLinks = await db.select()
      .from(quickLinksTable)
      .where(eq(quickLinksTable.id, quickLinkId))
      .execute();
    const originalUpdatedAt = originalQuickLinks[0].updated_at;

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateQuickLinkInput = {
      id: quickLinkId,
      title: 'Timestamp Test'
    };

    const result = await updateQuickLink(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error when quick link does not exist', async () => {
    const updateInput: UpdateQuickLinkInput = {
      id: 99999, // Non-existent ID
      title: 'This should fail'
    };

    expect(updateQuickLink(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle zero display_order correctly', async () => {
    const quickLinkId = await createTestQuickLink();

    const updateInput: UpdateQuickLinkInput = {
      id: quickLinkId,
      display_order: 0
    };

    const result = await updateQuickLink(updateInput);

    expect(result.display_order).toEqual(0);
  });
});