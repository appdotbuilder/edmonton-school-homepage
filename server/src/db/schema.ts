import { serial, text, pgTable, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// News articles table
export const newsArticlesTable = pgTable('news_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'), // Nullable by default, matches Zod schema
  author: text('author').notNull(),
  published_at: timestamp('published_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Events table
export const eventsTable = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  event_date: timestamp('event_date').notNull(),
  event_time: text('event_time'), // Nullable string for time (e.g., "10:00 AM")
  location: text('location'), // Nullable location
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Quick links table
export const quickLinksTable = pgTable('quick_links', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'), // Nullable description
  url: text('url').notNull(),
  display_order: integer('display_order').notNull().default(0), // For ordering links
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Contact information table
export const contactInfoTable = pgTable('contact_info', {
  id: serial('id').primaryKey(),
  school_name: text('school_name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  website: text('website'), // Nullable website URL
  office_hours: text('office_hours'), // Nullable office hours
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type NewsArticle = typeof newsArticlesTable.$inferSelect; // For SELECT operations
export type NewNewsArticle = typeof newsArticlesTable.$inferInsert; // For INSERT operations

export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;

export type QuickLink = typeof quickLinksTable.$inferSelect;
export type NewQuickLink = typeof quickLinksTable.$inferInsert;

export type ContactInfo = typeof contactInfoTable.$inferSelect;
export type NewContactInfo = typeof contactInfoTable.$inferInsert;

// Important: Export all tables and relations for proper query building
export const tables = {
  newsArticles: newsArticlesTable,
  events: eventsTable,
  quickLinks: quickLinksTable,
  contactInfo: contactInfoTable
};