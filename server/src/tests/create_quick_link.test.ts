import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quickLinksTable } from '../db/schema';
import { type CreateQuickLinkInput } from '../schema';
import { createQuickLink } from '../handlers/create_quick_link';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreateQuickLinkInput = {
  title: 'Test Quick Link',
  description: 'A test quick link for navigation',
  url: 'https://example.com',
  display_order: 5,
  is_active: true
};

describe('createQuickLink', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a quick link with all fields', async () => {
    const result = await createQuickLink(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Quick Link');
    expect(result.description).toEqual('A test quick link for navigation');
    expect(result.url).toEqual('https://example.com');
    expect(result.display_order).toEqual(5);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toEqual('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save quick link to database', async () => {
    const result = await createQuickLink(testInput);

    // Query using proper drizzle syntax
    const quickLinks = await db.select()
      .from(quickLinksTable)
      .where(eq(quickLinksTable.id, result.id))
      .execute();

    expect(quickLinks).toHaveLength(1);
    expect(quickLinks[0].title).toEqual('Test Quick Link');
    expect(quickLinks[0].description).toEqual('A test quick link for navigation');
    expect(quickLinks[0].url).toEqual('https://example.com');
    expect(quickLinks[0].display_order).toEqual(5);
    expect(quickLinks[0].is_active).toEqual(true);
    expect(quickLinks[0].created_at).toBeInstanceOf(Date);
    expect(quickLinks[0].updated_at).toBeInstanceOf(Date);
  });

  it('should apply default values for optional fields', async () => {
    const minimalInput: CreateQuickLinkInput = {
      title: 'Minimal Link',
      description: null,
      url: 'https://minimal.com'
      // display_order and is_active not provided
    };

    const result = await createQuickLink(minimalInput);

    expect(result.title).toEqual('Minimal Link');
    expect(result.description).toBeNull();
    expect(result.url).toEqual('https://minimal.com');
    expect(result.display_order).toEqual(0); // Default value
    expect(result.is_active).toEqual(true); // Default value
  });

  it('should handle null description correctly', async () => {
    const inputWithNullDescription: CreateQuickLinkInput = {
      title: 'Link without description',
      description: null,
      url: 'https://nodesc.com',
      display_order: 1,
      is_active: false
    };

    const result = await createQuickLink(inputWithNullDescription);

    expect(result.title).toEqual('Link without description');
    expect(result.description).toBeNull();
    expect(result.url).toEqual('https://nodesc.com');
    expect(result.display_order).toEqual(1);
    expect(result.is_active).toEqual(false);

    // Verify in database
    const quickLinks = await db.select()
      .from(quickLinksTable)
      .where(eq(quickLinksTable.id, result.id))
      .execute();

    expect(quickLinks[0].description).toBeNull();
    expect(quickLinks[0].is_active).toEqual(false);
  });

  it('should handle different display orders', async () => {
    const inputs = [
      { ...testInput, title: 'First Link', display_order: 0 },
      { ...testInput, title: 'Second Link', display_order: 10 },
      { ...testInput, title: 'Third Link', display_order: -1 }
    ];

    const results = await Promise.all(
      inputs.map(input => createQuickLink(input))
    );

    expect(results[0].display_order).toEqual(0);
    expect(results[1].display_order).toEqual(10);
    expect(results[2].display_order).toEqual(-1);

    // Verify all were saved correctly
    const allLinks = await db.select()
      .from(quickLinksTable)
      .execute();

    expect(allLinks).toHaveLength(3);
    expect(allLinks.map(link => link.display_order).sort()).toEqual([-1, 0, 10]);
  });

  it('should create multiple quick links independently', async () => {
    const input1: CreateQuickLinkInput = {
      title: 'Link One',
      description: 'First link',
      url: 'https://one.com',
      display_order: 1,
      is_active: true
    };

    const input2: CreateQuickLinkInput = {
      title: 'Link Two',
      description: 'Second link',
      url: 'https://two.com',
      display_order: 2,
      is_active: false
    };

    const result1 = await createQuickLink(input1);
    const result2 = await createQuickLink(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.title).toEqual('Link One');
    expect(result2.title).toEqual('Link Two');
    expect(result1.is_active).toEqual(true);
    expect(result2.is_active).toEqual(false);

    // Verify both exist in database
    const allLinks = await db.select()
      .from(quickLinksTable)
      .execute();

    expect(allLinks).toHaveLength(2);
    const titles = allLinks.map(link => link.title).sort();
    expect(titles).toEqual(['Link One', 'Link Two']);
  });
});