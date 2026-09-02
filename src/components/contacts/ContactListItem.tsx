'use client'
import Link from 'next/link'
import { Phone, WhatsappLogo, Lightning, Cake, Lock, CaretRight } from '@phosphor-icons/react'
import type { Contact } from '@/types/contact'
import { CONTACT_CATEGORY_LABELS } from '@/types/contact'
import { Avatar } from '@/components/common/Avatar'
import { telHref, whatsAppHref } from '@/lib/contactActions'
import { cn } from '@/lib/utils'

interface Props {
  contact: Contact
}

/**
 * Contact card for the directory.
 *
 * Call and WhatsApp are full labelled buttons rather than faint icons — they
 * are the two actions people actually come here for, and as bare icons they
 * did not read as clickable. The card body is a separate link so the buttons
 * are never nested inside it.
 */
export function ContactListItem({ contact }: Props) {
  const hasCake = contact.importantDates.some(d => d.type === 'birthday')
  const hasFollowUp = Boolean(contact.nextFollowUpDate)
  const isPrivate = contact.privacyLevel === 'leader_only'
  const wa = whatsAppHref(contact)

  return (
    <div className="group min-w-0 rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start gap-3">
        <Link href={`/leader/contacts/${contact.id}`} className="shrink-0" aria-label={`Open ${contact.name}`}>
          <Avatar src={contact.avatarUrl} name={contact.name} size="lg" verified={contact.isPersonallyVerified} />
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/leader/contacts/${contact.id}`} className="block min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold text-foreground truncate group-hover:underline">
                {contact.name}
              </span>
              {isPrivate && (
                <Lock size={12} weight="fill" className="shrink-0 text-foreground/35" aria-label="Private to you" />
              )}
            </span>
            {(contact.title || contact.organization) && (
              <span className="block text-[13px] text-muted-foreground truncate">
                {contact.title}
                {contact.title && contact.organization ? ' · ' : ''}
                {contact.organization}
              </span>
            )}
          </Link>

          {/* Signals + categories */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {hasFollowUp && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <Lightning size={10} weight="fill" />
                Follow up
              </span>
            )}
            {hasCake && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Cake size={10} weight="fill" />
                Birthday
              </span>
            )}
            {contact.categories.slice(0, 2).map(cat => (
              <span
                key={cat}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {CONTACT_CATEGORY_LABELS[cat]}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={`/leader/contacts/${contact.id}`}
          aria-label={`Open ${contact.name}`}
          className="shrink-0 p-1.5 -mr-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <CaretRight size={15} />
        </Link>
      </div>

      {/* Primary actions — labelled so they read as buttons */}
      {contact.phone && (
        <div className="flex items-center gap-2 mt-3">
          <a
            href={telHref(contact.phone)}
            aria-label={`Call ${contact.name}`}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full',
              'text-[13px] font-semibold border border-border',
              'text-foreground hover:bg-muted transition-colors'
            )}
          >
            <Phone size={15} weight="fill" />
            Call
          </a>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${contact.name}`}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full',
                'text-[13px] font-semibold',
                'bg-[#25D366]/12 text-[#128C4A] dark:text-[#25D366]',
                'hover:bg-[#25D366]/20 transition-colors'
              )}
            >
              <WhatsappLogo size={15} weight="fill" />
              WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  )
}
