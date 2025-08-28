import { db } from '../db';
import { contactInfoTable } from '../db/schema';
import { type UpdateContactInfoInput, type ContactInfo } from '../schema';
import { eq } from 'drizzle-orm';

export const updateContactInfo = async (input: UpdateContactInfoInput): Promise<ContactInfo> => {
  try {
    // Check if the contact info record exists
    const existingRecord = await db.select()
      .from(contactInfoTable)
      .where(eq(contactInfoTable.id, input.id))
      .execute();

    if (existingRecord.length === 0) {
      throw new Error(`Contact info with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.school_name !== undefined) {
      updateData.school_name = input.school_name;
    }
    if (input.address !== undefined) {
      updateData.address = input.address;
    }
    if (input.phone !== undefined) {
      updateData.phone = input.phone;
    }
    if (input.email !== undefined) {
      updateData.email = input.email;
    }
    if (input.website !== undefined) {
      updateData.website = input.website;
    }
    if (input.office_hours !== undefined) {
      updateData.office_hours = input.office_hours;
    }

    // Update the contact info record
    const result = await db.update(contactInfoTable)
      .set(updateData)
      .where(eq(contactInfoTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Contact info update failed:', error);
    throw error;
  }
};