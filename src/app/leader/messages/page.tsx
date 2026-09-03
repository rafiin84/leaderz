'use client'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlass, ChatCircleDots, ArrowLeft, PaperPlaneTilt, Plus,
  Image as ImageIcon, Smiley, CheckCircle, X,
} from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useConversations } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { formatRelativeTime } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/message'

/** Compact age for the list: 3d, 6w, 2y. */
function shortAge(iso: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
  if (days < 1) return 'today'
  if (days < 7) return `${days}d`
  if (days < 365) return `${Math.floor(days / 7)}w`
  return `${Math.floor(days / 365)}y`
}

function preview(c: Conversation): string {
  const last = c.messages.at(-1)
  if (!last) return 'No messages yet'
  return `${last.fromMe ? 'You: ' : ''}${last.body}`
}

export default function MessagesPage() {
  const activeTenantId = useAppStore(s => s.activeTenantId)
  const { data: conversations, isLoading } = useConversations(activeTenantId)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  /** Messages typed this session, keyed by conversation. No backend to post to. */
  const [sent, setSent] = useState<Record<string, string[]>>({})

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = conversations ?? []
    if (!q) return all
    return all.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.messages.some(m => m.body.toLowerCase().includes(q))
    )
  }, [conversations, query])

  /** Default to the newest thread on desktop; mobile starts on the list. */
  const active = useMemo(
    () => list.find(c => c.id === activeId) ?? null,
    [list, activeId]
  )

  const totalUnread = (conversations ?? []).reduce((n, c) => n + c.unread, 0)

  function send() {
    if (!draft.trim() || !active) return
    setSent(prev => ({ ...prev, [active.id]: [...(prev[active.id] ?? []), draft.trim()] }))
    setDraft('')
  }

  return (
    <div className="flex h-[calc(100dvh-1px)] md:h-screen">
      {/* Conversation list — full width on mobile until a thread is chosen */}
      <div
        className={cn(
          'flex-col border-r min-w-0',
          'w-full md:w-[340px] md:shrink-0',
          active ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="px-4 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-xl font-bold tracking-tight flex-1">Messages</h1>
            {totalUnread > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-foreground text-background tabular-nums">
                {totalUnread}
              </span>
            )}
            <button
              aria-label="New message"
              className="p-2 rounded-full border hover:bg-muted transition-colors"
            >
              <Plus size={15} weight="bold" />
            </button>
          </div>

          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search messages…"
              aria-label="Search messages"
              className="w-full pl-10 pr-9 py-2.5 rounded-full bg-muted/60 text-sm placeholder:text-foreground/40 focus:outline-none border border-transparent focus:border-foreground/20 focus:bg-transparent transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={13} weight="bold" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : list.length === 0 ? (
            <div className="px-4 py-10">
              <EmptyState
                icon={<ChatCircleDots size={40} />}
                title={query ? 'No matches' : 'No messages yet'}
                description={query ? 'Try a different search.' : 'Conversations will appear here.'}
              />
            </div>
          ) : (
            list.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                aria-current={active?.id === c.id}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left border-b transition-colors',
                  active?.id === c.id ? 'bg-muted/60' : 'hover:bg-muted/40'
                )}
              >
                <Avatar src={c.avatarUrl} name={c.name} size="md" />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground truncate">{c.name}</span>
                    {c.isVerified && <CheckCircle size={12} weight="fill" className="shrink-0 text-primary" />}
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {shortAge(c.updatedAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className={cn('block text-xs truncate', c.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                      {preview(c)}
                    </span>
                    {c.unread > 0 && (
                      <span className="shrink-0 w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center tabular-nums">
                        {c.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className={cn('flex-1 min-w-0 flex-col', active ? 'flex' : 'hidden md:flex')}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-xs">
              <ChatCircleDots size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground">Select a conversation</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick a thread on the left to read it and reply.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
              <button
                onClick={() => setActiveId(null)}
                aria-label="Back to messages"
                className="md:hidden p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar src={active.avatarUrl} name={active.name} size="sm" />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground truncate">
                  {active.name}
                  {active.isVerified && <CheckCircle size={12} weight="fill" className="shrink-0 text-primary" />}
                </p>
                {active.subtitle && (
                  <p className="text-[11px] text-muted-foreground truncate">{active.subtitle}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {active.messages.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', m.fromMe ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[78%] rounded-2xl px-3.5 py-2.5',
                      m.fromMe ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{m.body}</p>
                    {m.mediaUrls?.length ? (
                      <div className={cn('mt-2 grid gap-1.5', m.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
                        {m.mediaUrls.map(url => (
                          <img key={url} src={url} alt="" className="w-full rounded-lg object-cover max-h-48" />
                        ))}
                      </div>
                    ) : null}
                    <p className={cn('mt-1 text-[10px]', m.fromMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {formatRelativeTime(m.sentAt)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {(sent[active.id] ?? []).map((body, i) => (
                <motion.div key={`sent-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                  <div className="max-w-[78%] rounded-2xl px-3.5 py-2.5 bg-primary text-primary-foreground">
                    <p className="text-sm leading-relaxed whitespace-pre-line">{body}</p>
                    <p className="mt-1 text-[10px] text-primary-foreground/70">Just now</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Composer */}
            <div
              className="shrink-0 border-t px-3 py-3"
              style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
            >
              <div className="flex items-end gap-2">
                <button aria-label="Add image" className="p-2 rounded-full text-foreground/50 hover:text-foreground hover:bg-muted transition-colors">
                  <ImageIcon size={18} />
                </button>
                <button aria-label="Add emoji" className="p-2 rounded-full text-foreground/50 hover:text-foreground hover:bg-muted transition-colors">
                  <Smiley size={18} />
                </button>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                  }}
                  rows={1}
                  placeholder="Write a message…"
                  aria-label="Message"
                  className="flex-1 min-w-0 resize-none rounded-2xl bg-muted/60 px-3.5 py-2.5 text-sm placeholder:text-foreground/40 focus:outline-none border border-transparent focus:border-foreground/20 focus:bg-transparent transition-colors max-h-32"
                />
                <button
                  onClick={send}
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  className="p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 disabled:hover:bg-primary transition-colors"
                >
                  <PaperPlaneTilt size={16} weight="fill" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
