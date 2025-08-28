import { z } from 'zod';

// News article schema
export const newsArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  summary: z.string().nullable(), // Short description for preview
  author: z.string(),
  published_at: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type NewsArticle = z.infer<typeof newsArticleSchema>;

// Input schema for creating news articles
export const createNewsArticleInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  summary: z.string().nullable(), // Can be explicitly null
  author: z.string().min(1, "Author is required"),
  published_at: z.coerce.date().optional() // If not provided, defaults to current time
});

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleInputSchema>;

// Input schema for updating news articles
export const updateNewsArticleInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  summary: z.string().nullable().optional(),
  author: z.string().min(1).optional(),
  published_at: z.coerce.date().optional()
});

export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleInputSchema>;

// Event schema
export const eventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  event_date: z.coerce.date(),
  event_time: z.string().nullable(), // Time as string (e.g., "10:00 AM")
  location: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Event = z.infer<typeof eventSchema>;

// Input schema for creating events
export const createEventInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  event_date: z.coerce.date(),
  event_time: z.string().nullable(),
  location: z.string().nullable()
});

export type CreateEventInput = z.infer<typeof createEventInputSchema>;

// Input schema for updating events
export const updateEventInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  event_date: z.coerce.date().optional(),
  event_time: z.string().nullable().optional(),
  location: z.string().nullable().optional()
});

export type UpdateEventInput = z.infer<typeof updateEventInputSchema>;

// Quick link schema
export const quickLinkSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  display_order: z.number().int(), // For ordering links
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type QuickLink = z.infer<typeof quickLinkSchema>;

// Input schema for creating quick links
export const createQuickLinkInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  url: z.string().url("Must be a valid URL"),
  display_order: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional()
});

export type CreateQuickLinkInput = z.infer<typeof createQuickLinkInputSchema>;

// Input schema for updating quick links
export const updateQuickLinkInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  url: z.string().url().optional(),
  display_order: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional()
});

export type UpdateQuickLinkInput = z.infer<typeof updateQuickLinkInputSchema>;

// Contact information schema
export const contactInfoSchema = z.object({
  id: z.number(),
  school_name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  website: z.string().nullable(),
  office_hours: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;

// Input schema for updating contact info
export const updateContactInfoInputSchema = z.object({
  id: z.number(),
  school_name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  website: z.string().url().nullable().optional(),
  office_hours: z.string().nullable().optional()
});

export type UpdateContactInfoInput = z.infer<typeof updateContactInfoInputSchema>;

// Home page data aggregation schema (for fetching all home page content at once)
export const homePageDataSchema = z.object({
  latestNews: z.array(newsArticleSchema),
  upcomingEvents: z.array(eventSchema),
  quickLinks: z.array(quickLinkSchema),
  contactInfo: contactInfoSchema
});

export type HomePageData = z.infer<typeof homePageDataSchema>;