import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quickLinksTable } from '../db/schema';
import { type CreateQuickLinkInput } from '../schema';
import { getQuickLinks } from '../handlers/get_quick_links';

// Test data for quick links
const testQuickLink1: CreateQuickLinkInput = {
  title: 'Student Portal',
  description: 'Access your grades and assignments',
  url: 'https://studentportal.school.edu',
  display_order: 1,
  is_active: true
};

const testQuickLink2: CreateQuickLinkInput = {
  title: 'School Calendar',
  description: 'View upcoming events and holidays',
  url: 'https://calendar.school.edu',
  display_order: 2,
  is_active: true
};

const testQuickLink3: CreateQuickLinkInput = {
  title: 'Library Resources',
  description: null,
  url: 'https://library.school.edu',
  display_order: 3,
  is_active: false // Inactive - should not appear in results
};

const testQuickLink4: CreateQuickLinkInput = {
  title: 'Lunch Menu',
  description: 'Today\'s cafeteria options',
  url: 'https://lunch.school.edu',
  display_order: 0, // Should appear first due to lower display_order
  is_active: true
};

describe('getQuickLinks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no quick links exist', async () => {
    const result = await getQuickLinks();
    expect(result).toEqual([]);
  });

  it('should return only active quick links', async () => {
    // Insert test data
    await db.insert(quickLinksTable)
      .values([
        {
          ...testQuickLink1,
          display_order: testQuickLink1.display_order!
        },
        {
          ...testQuickLink3,
          display_order: testQuickLink3.display_order!
        }
      ])
      .execute();

    const result = await getQuickLinks();

    // Should only return active quick link
    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Student Portal');
    expect(result[0].is_active).toBe(true);
  });

  it('should order quick links by display_order ascending', async () => {
    // Insert test data in random order
    await db.insert(quickLinksTable)
      .values([
        {
          ...testQuickLink2,
          display_order: testQuickLink2.display_order!
        },
        {
          ...testQuickLink4,
          display_order: testQuickLink4.display_order!
        },
        {
          ...testQuickLink1,
          display_order: testQuickLink1.display_order!
        }
      ])
      .execute();

    const result = await getQuickLinks();

    expect(result).toHaveLength(3);
    
    // Should be ordered by display_order (0, 1, 2)
    expect(result[0].title).toEqual('Lunch Menu'); // display_order: 0
    expect(result[0].display_order).toEqual(0);
    
    expect(result[1].title).toEqual('Student Portal'); // display_order: 1
    expect(result[1].display_order).toEqual(1);
    
    expect(result[2].title).toEqual('School Calendar'); // display_order: 2
    expect(result[2].display_order).toEqual(2);
  });

  it('should return all required fields correctly', async () => {
    await db.insert(quickLinksTable)
      .values({
        ...testQuickLink1,
        display_order: testQuickLink1.display_order!
      })
      .execute();

    const result = await getQuickLinks();

    expect(result).toHaveLength(1);
    
    const quickLink = result[0];
    expect(quickLink.id).toBeDefined();
    expect(quickLink.title).toEqual('Student Portal');
    expect(quickLink.description).toEqual('Access your grades and assignments');
    expect(quickLink.url).toEqual('https://studentportal.school.edu');
    expect(quickLink.display_order).toEqual(1);
    expect(quickLink.is_active).toBe(true);
    expect(quickLink.created_at).toBeInstanceOf(Date);
    expect(quickLink.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description correctly', async () => {
    await db.insert(quickLinksTable)
      .values({
        ...testQuickLink4,
        description: null, // Explicitly null description
        display_order: testQuickLink4.display_order!
      })
      .execute();

    const result = await getQuickLinks();

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
    expect(result[0].title).toEqual('Lunch Menu');
  });

  it('should filter out inactive links from mixed active/inactive dataset', async () => {
    // Insert mix of active and inactive links
    await db.insert(quickLinksTable)
      .values([
        {
          ...testQuickLink1,
          display_order: testQuickLink1.display_order!
        },
        {
          ...testQuickLink2,
          display_order: testQuickLink2.display_order!
        },
        {
          ...testQuickLink3, // inactive
          display_order: testQuickLink3.display_order!
        },
        {
          ...testQuickLink4,
          display_order: testQuickLink4.display_order!
        }
      ])
      .execute();

    const result = await getQuickLinks();

    // Should only return the 3 active links
    expect(result).toHaveLength(3);
    
    // Verify none of the returned links are inactive
    result.forEach(link => {
      expect(link.is_active).toBe(true);
    });
    
    // Verify inactive link is not present
    const titles = result.map(link => link.title);
    expect(titles).not.toContain('Library Resources');
  });
});