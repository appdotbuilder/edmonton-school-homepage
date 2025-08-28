import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable, eventsTable, quickLinksTable, contactInfoTable } from '../db/schema';
import { getHomePageData } from '../handlers/get_home_page_data';

describe('getHomePageData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return home page data with default contact info when no data exists', async () => {
    const result = await getHomePageData();

    expect(result.latestNews).toEqual([]);
    expect(result.upcomingEvents).toEqual([]);
    expect(result.quickLinks).toEqual([]);
    expect(result.contactInfo).toBeDefined();
    expect(result.contactInfo.school_name).toEqual('Edmonton Excellence Academy');
    expect(result.contactInfo.email).toEqual('info@edmontonexcellence.ca');
  });

  it('should return latest news articles ordered by published_at descending', async () => {
    // Create test news articles with different published dates
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    await db.insert(newsArticlesTable).values([
      {
        title: 'Oldest News',
        content: 'Old content',
        summary: 'Old summary',
        author: 'Author 1',
        published_at: weekAgo
      },
      {
        title: 'Latest News',
        content: 'Latest content',
        summary: 'Latest summary',
        author: 'Author 2',
        published_at: now
      },
      {
        title: 'Middle News',
        content: 'Middle content',
        summary: 'Middle summary',
        author: 'Author 3',
        published_at: yesterday
      }
    ]).execute();

    const result = await getHomePageData();

    expect(result.latestNews).toHaveLength(3);
    expect(result.latestNews[0].title).toEqual('Latest News');
    expect(result.latestNews[1].title).toEqual('Middle News');
    expect(result.latestNews[2].title).toEqual('Oldest News');
  });

  it('should limit news articles to 5 latest items', async () => {
    // Create 7 news articles
    const articles = Array.from({ length: 7 }, (_, i) => ({
      title: `News ${i + 1}`,
      content: `Content ${i + 1}`,
      summary: `Summary ${i + 1}`,
      author: `Author ${i + 1}`,
      published_at: new Date(Date.now() + i * 1000) // Each article 1 second apart
    }));

    await db.insert(newsArticlesTable).values(articles).execute();

    const result = await getHomePageData();

    expect(result.latestNews).toHaveLength(5);
    // Should get the 5 most recent (News 7, 6, 5, 4, 3)
    expect(result.latestNews[0].title).toEqual('News 7');
    expect(result.latestNews[4].title).toEqual('News 3');
  });

  it('should return upcoming events ordered by event_date ascending', async () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    await db.insert(eventsTable).values([
      {
        title: 'Past Event',
        description: 'This event already happened',
        event_date: yesterday,
        event_time: '10:00 AM',
        location: 'Gym'
      },
      {
        title: 'Next Week Event',
        description: 'Event next week',
        event_date: nextWeek,
        event_time: '2:00 PM',
        location: 'Auditorium'
      },
      {
        title: 'Tomorrow Event',
        description: 'Event tomorrow',
        event_date: tomorrow,
        event_time: '9:00 AM',
        location: 'Classroom'
      }
    ]).execute();

    const result = await getHomePageData();

    // Should only get upcoming events (not past events)
    expect(result.upcomingEvents).toHaveLength(2);
    expect(result.upcomingEvents[0].title).toEqual('Tomorrow Event');
    expect(result.upcomingEvents[1].title).toEqual('Next Week Event');
  });

  it('should limit upcoming events to 8 items', async () => {
    const now = new Date();
    // Create 10 future events
    const events = Array.from({ length: 10 }, (_, i) => {
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + i + 1);
      return {
        title: `Event ${i + 1}`,
        description: `Description ${i + 1}`,
        event_date: eventDate,
        event_time: '10:00 AM',
        location: 'Location'
      };
    });

    await db.insert(eventsTable).values(events).execute();

    const result = await getHomePageData();

    expect(result.upcomingEvents).toHaveLength(8);
    expect(result.upcomingEvents[0].title).toEqual('Event 1');
    expect(result.upcomingEvents[7].title).toEqual('Event 8');
  });

  it('should return only active quick links ordered by display_order', async () => {
    await db.insert(quickLinksTable).values([
      {
        title: 'Inactive Link',
        description: 'This should not appear',
        url: 'https://example.com/inactive',
        display_order: 1,
        is_active: false
      },
      {
        title: 'Third Link',
        description: 'Third in order',
        url: 'https://example.com/third',
        display_order: 3,
        is_active: true
      },
      {
        title: 'First Link',
        description: 'First in order',
        url: 'https://example.com/first',
        display_order: 1,
        is_active: true
      },
      {
        title: 'Second Link',
        description: 'Second in order',
        url: 'https://example.com/second',
        display_order: 2,
        is_active: true
      }
    ]).execute();

    const result = await getHomePageData();

    expect(result.quickLinks).toHaveLength(3);
    expect(result.quickLinks[0].title).toEqual('First Link');
    expect(result.quickLinks[1].title).toEqual('Second Link');
    expect(result.quickLinks[2].title).toEqual('Third Link');
    
    // Verify inactive link is not included
    const inactiveLinks = result.quickLinks.filter(link => !link.is_active);
    expect(inactiveLinks).toHaveLength(0);
  });

  it('should return contact information when it exists', async () => {
    await db.insert(contactInfoTable).values({
      school_name: 'Test School',
      address: '456 Test Street',
      phone: '(555) 123-4567',
      email: 'test@school.com',
      website: 'https://testschool.com',
      office_hours: 'Mon-Fri: 9-5'
    }).execute();

    const result = await getHomePageData();

    expect(result.contactInfo.school_name).toEqual('Test School');
    expect(result.contactInfo.address).toEqual('456 Test Street');
    expect(result.contactInfo.phone).toEqual('(555) 123-4567');
    expect(result.contactInfo.email).toEqual('test@school.com');
    expect(result.contactInfo.website).toEqual('https://testschool.com');
    expect(result.contactInfo.office_hours).toEqual('Mon-Fri: 9-5');
  });

  it('should handle parallel data fetching efficiently', async () => {
    // Create some test data
    await Promise.all([
      db.insert(newsArticlesTable).values({
        title: 'Test News',
        content: 'Test content',
        summary: 'Test summary',
        author: 'Test Author',
        published_at: new Date()
      }).execute(),
      
      db.insert(eventsTable).values({
        title: 'Test Event',
        description: 'Test description',
        event_date: new Date(Date.now() + 86400000), // Tomorrow
        event_time: '10:00 AM',
        location: 'Test Location'
      }).execute(),
      
      db.insert(quickLinksTable).values({
        title: 'Test Link',
        description: 'Test link description',
        url: 'https://example.com',
        display_order: 1,
        is_active: true
      }).execute(),
      
      db.insert(contactInfoTable).values({
        school_name: 'Test School',
        address: 'Test Address',
        phone: 'Test Phone',
        email: 'test@example.com',
        website: null,
        office_hours: null
      }).execute()
    ]);

    // Measure execution time (should be fast due to parallel execution)
    const startTime = Date.now();
    const result = await getHomePageData();
    const executionTime = Date.now() - startTime;

    // Verify all data is returned correctly
    expect(result.latestNews).toHaveLength(1);
    expect(result.upcomingEvents).toHaveLength(1);
    expect(result.quickLinks).toHaveLength(1);
    expect(result.contactInfo.school_name).toEqual('Test School');
    
    // Execution should be reasonably fast (less than 1 second for simple data)
    expect(executionTime).toBeLessThan(1000);
  });
});