import { db } from '../db';
import { contactInfoTable } from '../db/schema';
import { type ContactInfo } from '../schema';

export const getContactInfo = async (): Promise<ContactInfo | null> => {
  try {
    // Query the first contact info record (typically there should only be one)
    const results = await db.select()
      .from(contactInfoTable)
      .limit(1)
      .execute();

    // Return null if no contact info found
    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to fetch contact info:', error);
    throw error;
  }
};