'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, EnvelopeSimple, Note, Lightning, Cake, Clock, Users, Lock, MapPin, PaperPlaneTilt, Star, DotsThree, CheckCircle } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useContact } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { PrivacyBadge } from '@/components/common/PrivacyBadge'
import { Skeleton } from '@/components/common/Skeleton'
import { LogInteractionSheet } from '@/components/contacts/LogInteractionSheet'
import { CommunicationComposer } from '@/components/contacts/CommunicationComposer'
import { CONTACT_CATEGORY_LABELS } from '@/types/contact'
import { formatDate, formatRelativeTime } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import type { ContactInteraction } from '@/types/contact'

export default function ContactDetailClient() {
  const params = useParams()
  const router = useRouter()
  const { activeTenantId, userRole } = useAppStore()
  const contactId = params.id as string
  const { data: contact, isLoading } = useContact(activeTenantId, contactId, userRole)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetType, setSheetType] = useState<ContactInteraction['type']>('note')
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerContext, setComposerContext] = useState<'birthday' | 'followup' | 'thankyou' | 'custom'>('custom')

  function openLog(type: ContactInteraction['type']) {
    setSheetType(type)
    setSheetOpen(true)
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Lock size={48} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Contact not accessible</h2>
        <p className="text-sm text-muted-foreground mb-4">This contact is restricted to a higher access level.</p>
        <button onClick={() => router.back()} className="text-primary text-sm font-medium">Go back</button>
      </div>
    )
  }

  const isLeaderOnly = contact.privacyLevel === 'leader_only'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold flex-1 truncate">{contact.name}</h1>
          <PrivacyBadge level={contact.privacyLevel} />
          <button className="p-2 rounded-xl hover:bg-muted transition-colors" aria-label="More options">
            <DotsThree size={20} />
          </button>
        </div>
      </header>

      {/* Leader-only banner */}
      {isLeaderOnly && (
        <div className="mx-4 mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          <Lock size={16} weight="fill" />
          <p className="text-xs font-medium">Leader Only — this contact and all notes are visible only to you.</p>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Profile */}
        <div className="flex items-start gap-4">
          <Avatar src={contact.avatarUrl} name={contact.name} size="xl" verified={contact.isPersonallyVerified} />
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-foreground">{contact.name}</h2>
                {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
                {contact.organization && <p className="text-sm font-medium text-foreground/80">{contact.organization}</p>}
              </div>
            </div>
            {contact.isPersonallyVerified && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle size={13} className="text-primary" weight="fill" />
                <p className="text-xs text-primary font-medium">Personally Verified</p>
              </div>
            )}
            {contact.location && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin size={12} />
                {contact.location}
              </p>
            )}
          </div>
        </div>

        {/* Categories */}
        {contact.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {contact.categories.map(cat => (
              <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                {CONTACT_CATEGORY_LABELS[cat]}
              </span>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Phone, label: 'Call', color: 'text-emerald-600', type: 'call' as const, composer: false },
            { icon: PaperPlaneTilt, label: 'Message', color: 'text-blue-600', type: 'message' as const, composer: true },
            { icon: Note, label: 'Note', color: 'text-amber-600', type: 'note' as const, composer: false },
            { icon: Lightning, label: 'Follow up', color: 'text-orange-600', type: 'meeting' as const, composer: false },
          ].map(({ icon: Icon, label, color, type, composer }) => (
            <button
              key={label}
              onClick={() => composer ? (setComposerContext('custom'), setComposerOpen(true)) : openLog(type)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted hover:bg-muted/80 transition-colors"
              aria-label={label}
            >
              <Icon size={20} className={color} />
              <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* Relationship summary */}
        {contact.relationshipSummary && (
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Relationship</h3>
            <p className="text-sm text-foreground leading-relaxed">{contact.relationshipSummary}</p>
            {contact.howWeKnow && (
              <p className="text-xs text-muted-foreground mt-2">{contact.howWeKnow}</p>
            )}
          </div>
        )}

        {/* Key dates */}
        {(contact.lastInteractionDate || contact.nextFollowUpDate || contact.importantDates.length > 0) && (
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Key dates</h3>
            <div className="space-y-3">
              {contact.lastInteractionDate && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">Last interaction</span>
                  <span className="text-xs font-medium ml-auto">{formatRelativeTime(contact.lastInteractionDate)}</span>
                </div>
              )}
              {contact.nextFollowUpDate && (
                <div className="flex items-start gap-2">
                  <Lightning size={14} className="text-amber-500 shrink-0 mt-0.5" weight="fill" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Follow up</p>
                    {contact.nextFollowUpNote && <p className="text-xs text-foreground mt-0.5">{contact.nextFollowUpNote}</p>}
                  </div>
                  <span className="text-xs font-medium text-amber-600">{formatDate(contact.nextFollowUpDate)}</span>
                </div>
              )}
              {contact.importantDates.map(d => (
                <div key={d.id} className="flex items-center gap-2">
                  <Cake size={14} className="text-rose-400 shrink-0" weight="fill" />
                  <span className="text-xs text-muted-foreground">{d.label}</span>
                  <span className="text-xs font-medium ml-auto">{formatShortDate(d.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes.length > 0 && (
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</h3>
              <button onClick={() => openLog('note')} className="text-xs text-primary font-medium">+ Add note</button>
            </div>
            <div className="space-y-3">
              {contact.notes.map(note => (
                <div key={note.id} className={cn('rounded-xl p-3 text-sm text-foreground leading-relaxed border', note.privacyLevel === 'leader_only' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-muted border-transparent')}>
                  {note.privacyLevel === 'leader_only' && (
                    <div className="flex items-center gap-1 mb-1.5">
                      <Lock size={11} className="text-red-500" weight="fill" />
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">Leader Only</span>
                    </div>
                  )}
                  {note.content}
                  <p className="text-[10px] text-muted-foreground mt-2">{formatRelativeTime(note.updatedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interaction timeline */}
        {contact.interactions.length > 0 && (
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">History</h3>
            <div className="space-y-3">
              {contact.interactions.map((interaction, i) => (
                <div key={interaction.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', interaction.sentiment === 'positive' ? 'bg-emerald-500' : interaction.sentiment === 'negative' ? 'bg-red-400' : 'bg-muted-foreground')} />
                    {i < contact.interactions.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-foreground capitalize">{interaction.type}</p>
                      <p className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(interaction.date)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{interaction.summary}</p>
                    {interaction.followUpRequired && interaction.followUpNote && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <Lightning size={11} />
                        {interaction.followUpNote}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LogInteractionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        contactName={contact.name}
        defaultType={sheetType}
      />
      <CommunicationComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        recipientName={contact.name}
        context={composerContext}
      />
    </div>
  )
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
