import { db } from '../db';
import { quickLinksTable } from '../db/schema';
import { type UpdateQuickLinkInput, type QuickLink } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateQuickLink(input: UpdateQuickLinkInput): Promise<QuickLink> {
  try {
    // First verify the quick link exists
    const existingQuickLinks = await db.select()
      .from(quickLinksTable)
      .where(eq(quickLinksTable.id, input.id))
      .execute();

    if (existingQuickLinks.length === 0) {
      throw new Error(`Quick link with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData['title'] = input.title;
    }
    
    if (input.description !== undefined) {
      updateData['description'] = input.description;
    }
    
    if (input.url !== undefined) {
      updateData['url'] = input.url;
    }
    
    if (input.display_order !== undefined) {
      updateData['display_order'] = input.display_order;
    }
    
    if (input.is_active !== undefined) {
      updateData['is_active'] = input.is_active;
    }

    // Update the quick link
    const result = await db.update(quickLinksTable)
      .set(updateData)
      .where(eq(quickLinksTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Quick link update failed:', error);
    throw error;
  }
}