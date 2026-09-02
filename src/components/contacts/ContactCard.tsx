'use client'
import Link from 'next/link'
import { Phone, EnvelopeSimple, Lightning, Cake, WhatsappLogo } from '@phosphor-icons/react'
import type { Contact } from '@/types/contact'
import { Avatar } from '@/components/common/Avatar'
import { PrivacyBadge } from '@/components/common/PrivacyBadge'
import { CONTACT_CATEGORY_LABELS } from '@/types/contact'
import { formatRelativeTime } from '@/lib/formatting'
import { buildWhatsAppMessage } from '@/lib/contactActions'

interface Props {
  contact: Contact
  compact?: boolean
}

export function ContactCard({ contact, compact = false }: Props) {
  const hasCake = contact.importantDates.some(d => d.type === 'birthday')
  const hasFollowUp = !!contact.nextFollowUpDate
  const phone = contact.phone
  const waPhone = phone?.replace(/[\s+()-]/g, '')

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href={`/leader/contacts/${contact.id}`}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group flex-1 min-w-0"
          aria-label={`Open ${contact.name}`}
        >
          <Avatar src={contact.avatarUrl} name={contact.name} size="md" verified={contact.isPersonallyVerified} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground group-hover:underline truncate">{contact.name}</p>
            {contact.title && (
              <p className="text-xs text-foreground/50 truncate">
                {contact.title}{contact.organization ? ` · ${contact.organization}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {hasFollowUp && <Lightning size={13} className="text-amber-500" weight="fill" />}
            {hasCake && <Cake size={13} className="text-rose-400" weight="fill" />}
            <PrivacyBadge level={contact.privacyLevel} compact />
          </div>
        </Link>
        {phone && (
          <div className="flex items-center shrink-0">
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="p-2 rounded-full bg-foreground/[0.06] text-foreground hover:bg-foreground/12 transition-colors"
              aria-label={`Call ${contact.name}`}
            >
              <Phone size={15} weight="fill" />
            </a>
            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(buildWhatsAppMessage(contact))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#25D366]/15 text-[#128C4A] dark:text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
                aria-label={`WhatsApp ${contact.name}`}
              >
                <WhatsappLogo size={15} weight="fill" />
              </a>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={`/leader/contacts/${contact.id}`}
      className="flex items-start gap-3 p-4 rounded-2xl border bg-card hover:shadow-md transition-all"
      aria-label={`Open ${contact.name}`}
    >
      <Avatar src={contact.avatarUrl} name={contact.name} size="lg" verified={contact.isPersonallyVerified} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="text-sm font-semibold text-foreground">{contact.name}</p>
            {contact.title && <p className="text-xs text-foreground/50 truncate">{contact.title}</p>}
            {contact.organization && <p className="text-xs text-foreground/50 truncate">{contact.organization}</p>}
          </div>
          <PrivacyBadge level={contact.privacyLevel} />
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {contact.categories.slice(0, 2).map(cat => (
            <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground/50 font-medium">
              {CONTACT_CATEGORY_LABELS[cat]}
            </span>
          ))}
          {contact.categories.length > 2 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground/50">
              +{contact.categories.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-foreground/50">
          {contact.lastInteractionDate && (
            <span>Last: {formatRelativeTime(contact.lastInteractionDate)}</span>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            {hasFollowUp && <Lightning size={13} className="text-amber-500" weight="fill" />}
            {hasCake && <Cake size={13} className="text-rose-400" weight="fill" />}
            {contact.phone && <Phone size={13} />}
            {contact.email && <EnvelopeSimple size={13} />}
          </div>
        </div>
      </div>
    </Link>
  )
}
