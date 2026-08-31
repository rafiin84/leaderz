import { delay } from './index'
import { MOCK_CONTACTS } from '@/data/mock/contacts'
import type { Contact } from '@/types/contact'
import type { UserRole } from '@/types/common'
import { canViewContact } from '@/lib/permissions'

export async function fetchContacts(tenantId: string, role: UserRole): Promise<Contact[]> {
  const all = MOCK_CONTACTS[tenantId] ?? []
  const filtered = all.filter(c => canViewContact(role, c.privacyLevel))
  return delay(filtered)
}

export async function fetchContact(tenantId: string, contactId: string, role: UserRole): Promise<Contact | null> {
  const all = MOCK_CONTACTS[tenantId] ?? []
  const contact = all.find(c => c.id === contactId) ?? null
  if (!contact || !canViewContact(role, contact.privacyLevel)) return delay(null)
  return delay(contact)
}

export async function fetchFollowUps(tenantId: string, role: UserRole): Promise<Contact[]> {
  const all = MOCK_CONTACTS[tenantId] ?? []
  return delay(
    all.filter(c => c.nextFollowUpDate && canViewContact(role, c.privacyLevel))
  )
}

export async function fetchUpcomingBirthdays(tenantId: string, role: UserRole): Promise<Contact[]> {
  const all = MOCK_CONTACTS[tenantId] ?? []
  return delay(
    all.filter(c =>
      c.importantDates.some(d => d.type === 'birthday' && d.recurring) &&
      canViewContact(role, c.privacyLevel)
    )
  )
}
