'use client'
import { useRef, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Sparkle, PaperPlaneTilt, CheckCircle, Copy, ArrowSquareOut } from '@phosphor-icons/react'
import Link from 'next/link'
import { useAppStore } from '@/stores/appStore'
import { useLeader } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/lib/utils'
import type { Post } from '@/types/content'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  posted?: boolean
}

const STARTERS = [
  'Draft a post about our rural engineering scholarship results',
  'Write something celebrating the Tuticorin team’s milestone',
  'Summarize this week’s mission activities for a post',
  'Draft a thank-you note to our volunteers',
]

let seq = 0
const nextId = () => `local-${Date.now()}-${seq++}`

/** No real model is wired up here — this is a small templated "drafting
 *  assistant" that turns a prompt into a postable paragraph, in keeping
 *  with the rest of the app's mock data rather than calling out to a
 *  real LLM. */
function generateDraft(prompt: string, firstName: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, ' ')
  const opener = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  return `${opener}.\n\nGrateful for everyone who made this possible — this is what happens when a community shows up for each other. Rural India has no shortage of talent, only a shortage of doors being opened. We're going to keep opening them. 🙏🇮🇳\n\n— ${firstName}`
}

export default function AIPage() {
  const { activeTenantId } = useAppStore()
  const { data: leader } = useLeader(activeTenantId)
  const queryClient = useQueryClient()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  async function send(prompt: string) {
    const trimmed = prompt.trim()
    if (!trimmed || thinking) return
    setMessages(m => [...m, { id: nextId(), role: 'user', content: trimmed }])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setThinking(true)
    await new Promise(r => setTimeout(r, 700))
    const draft = generateDraft(trimmed, leader?.name.split(' ')[0] ?? 'You')
    setMessages(m => [...m, { id: nextId(), role: 'assistant', content: draft }])
    setThinking(false)
  }

  function handlePostToFeed(message: ChatMessage) {
    if (!leader || message.posted) return
    const now = new Date().toISOString()
    const post: Post = {
      id: nextId(),
      tenantId: activeTenantId,
      authorId: leader.id,
      authorName: leader.name,
      authorTitle: `${leader.title}, ${leader.organization}`,
      authorAvatar: leader.avatarUrl,
      type: 'text',
      text: message.content,
      media: [],
      reactions: [
        { type: 'like', count: 0, userReacted: false },
        { type: 'heart', count: 0, userReacted: false },
        { type: 'insightful', count: 0, userReacted: false },
        { type: 'support', count: 0, userReacted: false },
      ],
      commentCount: 0,
      comments: [],
      shareCount: 0,
      viewCount: 0,
      isPinned: false,
      isFollowerPost: false,
      createdAt: now,
      updatedAt: now,
    }
    queryClient.setQueryData<Post[]>(['posts', activeTenantId], old => [post, ...(old ?? [])])
    setMessages(m => m.map(msg => (msg.id === message.id ? { ...msg, posted: true } : msg)))
  }

  function handleCopy(content: string) {
    navigator.clipboard?.writeText(content).catch(() => {})
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Sparkle size={20} className="text-primary" weight="fill" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Draft posts, brainstorm ideas, then publish to your feed</p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="max-w-md mx-auto text-center pt-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <Sparkle size={22} className="text-primary" weight="fill" />
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Ask me to draft a post, summarize an update, or brainstorm what to share next.
            </p>
            <div className="flex flex-col gap-2">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm px-4 py-2.5 rounded-2xl border border-border hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}>
            {message.role === 'assistant' ? (
              <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkle size={13} className="text-primary" weight="fill" />
              </span>
            ) : (
              <Avatar src={leader?.avatarUrl} name={leader?.name ?? 'You'} size="xs" className="shrink-0" />
            )}

            <div className={cn('max-w-[85%] min-w-0', message.role === 'user' && 'flex flex-col items-end')}>
              {message.role === 'user' ? (
                <div className="rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-2.5 text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              ) : (
                <div className="rounded-2xl rounded-tl-sm border border-border bg-card p-4">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    {message.posted ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        <CheckCircle size={14} weight="fill" />
                        Posted to your feed
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePostToFeed(message)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-foreground text-background px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                      >
                        <PaperPlaneTilt size={13} weight="fill" />
                        Post to Feed
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(message.content)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                    {message.posted && (
                      <Link
                        href="/leader/home"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline ml-auto"
                      >
                        View feed
                        <ArrowSquareOut size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkle size={13} className="text-primary" weight="fill" />
            </span>
            <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t p-3">
        <div className="flex items-end gap-2 rounded-2xl bg-muted/60 px-3 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
            }}
            rows={1}
            placeholder="Ask the AI to draft something…"
            aria-label="Message"
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground py-1.5 outline-none max-h-[200px]"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
            aria-label="Send"
            className="shrink-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            <PaperPlaneTilt size={14} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
