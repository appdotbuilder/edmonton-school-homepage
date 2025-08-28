import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactInfoTable } from '../db/schema';
import { getContactInfo } from '../handlers/get_contact_info';

// Test contact info data
const testContactInfo = {
  school_name: 'Test Academy',
  address: '123 Test Street, Test City, TC T1T 1T1',
  phone: '(555) 123-4567',
  email: 'test@academy.com',
  website: 'https://www.testacademy.com',
  office_hours: 'Monday - Friday: 9:00 AM - 5:00 PM'
};

describe('getContactInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return contact info when it exists', async () => {
    // Insert test contact info
    const inserted = await db.insert(contactInfoTable)
      .values(testContactInfo)
      .returning()
      .execute();

    const result = await getContactInfo();

    expect(result).not.toBeNull();
    expect(result!.id).toBe(inserted[0].id);
    expect(result!.school_name).toBe('Test Academy');
    expect(result!.address).toBe('123 Test Street, Test City, TC T1T 1T1');
    expect(result!.phone).toBe('(555) 123-4567');
    expect(result!.email).toBe('test@academy.com');
    expect(result!.website).toBe('https://www.testacademy.com');
    expect(result!.office_hours).toBe('Monday - Friday: 9:00 AM - 5:00 PM');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when no contact info exists', async () => {
    const result = await getContactInfo();

    expect(result).toBeNull();
  });

  it('should return the first record when multiple exist', async () => {
    // Insert multiple contact info records
    const firstRecord = await db.insert(contactInfoTable)
      .values({
        ...testContactInfo,
        school_name: 'First Academy'
      })
      .returning()
      .execute();

    await db.insert(contactInfoTable)
      .values({
        ...testContactInfo,
        school_name: 'Second Academy'
      })
      .returning()
      .execute();

    const result = await getContactInfo();

    expect(result).not.toBeNull();
    expect(result!.id).toBe(firstRecord[0].id);
    expect(result!.school_name).toBe('First Academy');
  });

  it('should handle nullable fields correctly', async () => {
    // Insert contact info with null values for optional fields
    await db.insert(contactInfoTable)
      .values({
        school_name: 'Minimal Academy',
        address: '456 Simple Street',
        phone: '(555) 987-6543',
        email: 'minimal@academy.com',
        website: null, // Explicitly null
        office_hours: null // Explicitly null
      })
      .returning()
      .execute();

    const result = await getContactInfo();

    expect(result).not.toBeNull();
    expect(result!.school_name).toBe('Minimal Academy');
    expect(result!.address).toBe('456 Simple Street');
    expect(result!.phone).toBe('(555) 987-6543');
    expect(result!.email).toBe('minimal@academy.com');
    expect(result!.website).toBeNull();
    expect(result!.office_hours).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});