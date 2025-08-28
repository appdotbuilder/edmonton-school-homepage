import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactInfoTable } from '../db/schema';
import { type UpdateContactInfoInput } from '../schema';
import { updateContactInfo } from '../handlers/update_contact_info';
import { eq } from 'drizzle-orm';

describe('updateContactInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create initial contact info
  const createInitialContactInfo = async () => {
    const result = await db.insert(contactInfoTable)
      .values({
        school_name: 'Test School',
        address: '123 Test Street, Test City, AB T1A 1A1',
        phone: '(780) 111-1111',
        email: 'test@testschool.ca',
        website: 'https://www.testschool.ca',
        office_hours: 'Monday - Friday: 9:00 AM - 5:00 PM'
      })
      .returning()
      .execute();
    
    return result[0];
  };

  it('should update contact info with all fields', async () => {
    const initialContact = await createInitialContactInfo();
    
    const updateInput: UpdateContactInfoInput = {
      id: initialContact.id,
      school_name: 'Updated School Name',
      address: '456 New Address, New City, AB T2B 2B2',
      phone: '(780) 222-2222',
      email: 'updated@school.ca',
      website: 'https://www.updatedschool.ca',
      office_hours: 'Monday - Friday: 8:00 AM - 6:00 PM'
    };

    const result = await updateContactInfo(updateInput);

    expect(result.id).toEqual(initialContact.id);
    expect(result.school_name).toEqual('Updated School Name');
    expect(result.address).toEqual('456 New Address, New City, AB T2B 2B2');
    expect(result.phone).toEqual('(780) 222-2222');
    expect(result.email).toEqual('updated@school.ca');
    expect(result.website).toEqual('https://www.updatedschool.ca');
    expect(result.office_hours).toEqual('Monday - Friday: 8:00 AM - 6:00 PM');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > initialContact.updated_at).toBe(true);
  });

  it('should update only specified fields', async () => {
    const initialContact = await createInitialContactInfo();
    
    const updateInput: UpdateContactInfoInput = {
      id: initialContact.id,
      school_name: 'Partially Updated School',
      email: 'partial@update.ca'
    };

    const result = await updateContactInfo(updateInput);

    // Updated fields
    expect(result.school_name).toEqual('Partially Updated School');
    expect(result.email).toEqual('partial@update.ca');

    // Unchanged fields
    expect(result.address).toEqual(initialContact.address);
    expect(result.phone).toEqual(initialContact.phone);
    expect(result.website).toEqual(initialContact.website);
    expect(result.office_hours).toEqual(initialContact.office_hours);

    // Timestamps
    expect(result.created_at).toEqual(initialContact.created_at);
    expect(result.updated_at > initialContact.updated_at).toBe(true);
  });

  it('should update nullable fields to null', async () => {
    const initialContact = await createInitialContactInfo();
    
    const updateInput: UpdateContactInfoInput = {
      id: initialContact.id,
      website: null,
      office_hours: null
    };

    const result = await updateContactInfo(updateInput);

    expect(result.website).toBeNull();
    expect(result.office_hours).toBeNull();
    
    // Other fields should remain unchanged
    expect(result.school_name).toEqual(initialContact.school_name);
    expect(result.address).toEqual(initialContact.address);
    expect(result.phone).toEqual(initialContact.phone);
    expect(result.email).toEqual(initialContact.email);
  });

  it('should save updated contact info to database', async () => {
    const initialContact = await createInitialContactInfo();
    
    const updateInput: UpdateContactInfoInput = {
      id: initialContact.id,
      school_name: 'Database Test School',
      phone: '(780) 333-3333'
    };

    await updateContactInfo(updateInput);

    // Verify changes in database
    const updatedRecord = await db.select()
      .from(contactInfoTable)
      .where(eq(contactInfoTable.id, initialContact.id))
      .execute();

    expect(updatedRecord).toHaveLength(1);
    expect(updatedRecord[0].school_name).toEqual('Database Test School');
    expect(updatedRecord[0].phone).toEqual('(780) 333-3333');
    expect(updatedRecord[0].address).toEqual(initialContact.address); // Unchanged
    expect(updatedRecord[0].updated_at > initialContact.updated_at).toBe(true);
  });

  it('should throw error when contact info does not exist', async () => {
    const updateInput: UpdateContactInfoInput = {
      id: 999, // Non-existent ID
      school_name: 'Should Not Work'
    };

    await expect(updateContactInfo(updateInput)).rejects.toThrow(/Contact info with id 999 not found/);
  });

  it('should update with minimal data', async () => {
    const initialContact = await createInitialContactInfo();
    
    const updateInput: UpdateContactInfoInput = {
      id: initialContact.id,
      school_name: 'Minimal Update'
    };

    const result = await updateContactInfo(updateInput);

    expect(result.school_name).toEqual('Minimal Update');
    expect(result.address).toEqual(initialContact.address);
    expect(result.phone).toEqual(initialContact.phone);
    expect(result.email).toEqual(initialContact.email);
    expect(result.website).toEqual(initialContact.website);
    expect(result.office_hours).toEqual(initialContact.office_hours);
  });

  it('should handle website field correctly', async () => {
    const initialContact = await createInitialContactInfo();
    
    // Update website to a new value
    const updateInput1: UpdateContactInfoInput = {
      id: initialContact.id,
      website: 'https://www.newwebsite.com'
    };

    const result1 = await updateContactInfo(updateInput1);
    expect(result1.website).toEqual('https://www.newwebsite.com');

    // Update website to null
    const updateInput2: UpdateContactInfoInput = {
      id: initialContact.id,
      website: null
    };

    const result2 = await updateContactInfo(updateInput2);
    expect(result2.website).toBeNull();
  });
});