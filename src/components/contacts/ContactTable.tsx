'use client'
import Link from 'next/link'
import { Phone, WhatsappLogo, Lock, Lightning, Cake } from '@phosphor-icons/react'
import type { Contact } from '@/types/contact'
import { CONTACT_CATEGORY_LABELS } from '@/types/contact'
import { Avatar } from '@/components/common/Avatar'
import { telHref, whatsAppHref } from '@/lib/contactActions'
import { formatRelativeTime, formatShortDate } from '@/lib/formatting'

interface Props {
  contacts: Contact[]
}

/**
 * Dense table view of the directory.
 *
 * Trades the cards' breathing room for rows that fit far more contacts on one
 * screen, plus columns the cards have no space for — location, last contact
 * and next follow-up. Scrolls horizontally on narrow viewports rather than
 * crushing the columns.
 */
export function ContactTable({ contacts }: Props) {
  return (
    <div className="rounded-2xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm border-collapse">
          <thead>
            <tr className="bg-muted/60 text-left">
              {['Name', 'Role', 'Location', 'Categories', 'Last contact', 'Follow-up', ''].map((h, i) => (
                <th
                  key={h || `actions-${i}`}
                  scope="col"
                  className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/45 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => {
              const wa = whatsAppHref(c)
              const hasCake = c.importantDates.some(d => d.type === 'birthday')
              return (
                <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                  {/* Name */}
                  <td className="px-3 py-2.5">
                    <Link href={`/leader/contacts/${c.id}`} className="flex items-center gap-2.5 min-w-0 group">
                      <Avatar src={c.avatarUrl} name={c.name} size="sm" verified={c.isPersonallyVerified} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-foreground truncate group-hover:underline">{c.name}</span>
                          {c.privacyLevel === 'leader_only' && (
                            <Lock size={11} weight="fill" className="shrink-0 text-foreground/35" aria-label="Private to you" />
                          )}
                        </span>
                      </span>
                    </Link>
                  </td>

                  {/* Role */}
                  <td className="px-3 py-2.5 text-[13px] text-muted-foreground max-w-[220px]">
                    <span className="block truncate">
                      {c.title}
                      {c.title && c.organization ? ' · ' : ''}
                      {c.organization}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-3 py-2.5 text-[13px] text-muted-foreground whitespace-nowrap">
                    {c.location ?? '—'}
                  </td>

                  {/* Categories */}
                  <td className="px-3 py-2.5">
                    <span className="flex flex-wrap gap-1">
                      {c.categories.slice(0, 2).map(cat => (
                        <span
                          key={cat}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap"
                        >
                          {CONTACT_CATEGORY_LABELS[cat]}
                        </span>
                      ))}
                      {c.categories.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{c.categories.length - 2}</span>
                      )}
                    </span>
                  </td>

                  {/* Last contact */}
                  <td className="px-3 py-2.5 text-[13px] text-muted-foreground whitespace-nowrap">
                    {c.lastInteractionDate ? formatRelativeTime(c.lastInteractionDate) : '—'}
                  </td>

                  {/* Follow-up */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {c.nextFollowUpDate ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                        <Lightning size={10} weight="fill" />
                        {formatShortDate(c.nextFollowUpDate)}
                      </span>
                    ) : hasCake ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <Cake size={10} weight="fill" />
                        Birthday
                      </span>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <span className="flex items-center justify-end gap-1.5">
                      {c.phone && (
                        <a
                          href={telHref(c.phone)}
                          aria-label={`Call ${c.name}`}
                          title="Call"
                          className="p-2 rounded-full bg-foreground/[0.06] text-foreground hover:bg-foreground/12 transition-colors"
                        >
                          <Phone size={14} weight="fill" />
                        </a>
                      )}
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${c.name}`}
                          title="WhatsApp"
                          className="p-2 rounded-full bg-[#25D366]/15 text-[#128C4A] dark:text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
                        >
                          <WhatsappLogo size={14} weight="fill" />
                        </a>
                      )}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
