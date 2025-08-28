import { db } from '../db';
import { quickLinksTable } from '../db/schema';
import { type CreateQuickLinkInput, type QuickLink } from '../schema';

export const createQuickLink = async (input: CreateQuickLinkInput): Promise<QuickLink> => {
  try {
    // Insert quick link record
    const result = await db.insert(quickLinksTable)
      .values({
        title: input.title,
        description: input.description,
        url: input.url,
        display_order: input.display_order ?? 0, // Use nullish coalescing for optional with default
        is_active: input.is_active ?? true // Use nullish coalescing for optional with default
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Quick link creation failed:', error);
    throw error;
  }
};