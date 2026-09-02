import type { Contact } from '@/types/contact'

/**
 * Context-aware WhatsApp opener: a birthday greeting when one is on file, a
 * follow-up nudge when one is scheduled, otherwise a plain thank-you.
 */
export function buildWhatsAppMessage(contact: Contact): string {
  const first = contact.name.split(' ')[0]
  const hasBirthday = contact.importantDates.some(d => d.type === 'birthday')
  if (hasBirthday) return `Happy Birthday ${first}! Wishing you a wonderful year ahead.`
  if (contact.nextFollowUpDate) return `Hi ${first}, following up on our last conversation. Would love to connect soon!`
  return `Hi ${first}, thank you for your time and support. Hope you're doing well!`
}

/** Digits only — what wa.me expects. */
export function whatsAppNumber(phone?: string): string | undefined {
  const digits = phone?.replace(/[\s+()-]/g, '')
  return digits || undefined
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}

export function whatsAppHref(contact: Contact): string | undefined {
  const number = whatsAppNumber(contact.phone)
  if (!number) return undefined
  return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppMessage(contact))}`
}
