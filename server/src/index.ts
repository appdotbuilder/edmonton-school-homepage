import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createNewsArticleInputSchema, 
  updateNewsArticleInputSchema,
  createEventInputSchema,
  updateEventInputSchema,
  createQuickLinkInputSchema,
  updateQuickLinkInputSchema,
  updateContactInfoInputSchema
} from './schema';

// Import handlers
import { createNewsArticle } from './handlers/create_news_article';
import { getLatestNews } from './handlers/get_latest_news';
import { updateNewsArticle } from './handlers/update_news_article';
import { createEvent } from './handlers/create_event';
import { getUpcomingEvents } from './handlers/get_upcoming_events';
import { updateEvent } from './handlers/update_event';
import { createQuickLink } from './handlers/create_quick_link';
import { getQuickLinks } from './handlers/get_quick_links';
import { updateQuickLink } from './handlers/update_quick_link';
import { getContactInfo } from './handlers/get_contact_info';
import { updateContactInfo } from './handlers/update_contact_info';
import { getHomePageData } from './handlers/get_home_page_data';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Home page data endpoint (aggregated)
  getHomePageData: publicProcedure
    .query(() => getHomePageData()),

  // News article endpoints
  createNewsArticle: publicProcedure
    .input(createNewsArticleInputSchema)
    .mutation(({ input }) => createNewsArticle(input)),
  
  getLatestNews: publicProcedure
    .input(z.number().int().positive().optional())
    .query(({ input }) => getLatestNews(input)),
  
  updateNewsArticle: publicProcedure
    .input(updateNewsArticleInputSchema)
    .mutation(({ input }) => updateNewsArticle(input)),

  // Event endpoints
  createEvent: publicProcedure
    .input(createEventInputSchema)
    .mutation(({ input }) => createEvent(input)),
  
  getUpcomingEvents: publicProcedure
    .input(z.number().int().positive().optional())
    .query(({ input }) => getUpcomingEvents(input)),
  
  updateEvent: publicProcedure
    .input(updateEventInputSchema)
    .mutation(({ input }) => updateEvent(input)),

  // Quick links endpoints
  createQuickLink: publicProcedure
    .input(createQuickLinkInputSchema)
    .mutation(({ input }) => createQuickLink(input)),
  
  getQuickLinks: publicProcedure
    .query(() => getQuickLinks()),
  
  updateQuickLink: publicProcedure
    .input(updateQuickLinkInputSchema)
    .mutation(({ input }) => updateQuickLink(input)),

  // Contact info endpoints
  getContactInfo: publicProcedure
    .query(() => getContactInfo()),
  
  updateContactInfo: publicProcedure
    .input(updateContactInfoInputSchema)
    .mutation(({ input }) => updateContactInfo(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();