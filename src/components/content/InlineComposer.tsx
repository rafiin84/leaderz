'use client'
import { useRef, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Image as ImageIcon, Gif, Smiley, MapPin, Flag, X, Spinner } from '@phosphor-icons/react'
import { useAppStore } from '@/stores/appStore'
import { useLeader, useMission } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/lib/utils'
import type { Post } from '@/types/content'
import type { MediaItem } from '@/types/common'

const EMOJI = ['🙏', '👏', '🚀', '🌱', '💡', '🔥', '❤️', '😊', '🇮🇳', '✨', '🙌', '💪']

let seq = 0
const nextId = () => `local-${Date.now()}-${seq++}`

export function InlineComposer() {
  const { activeTenantId } = useAppStore()
  const { data: leader } = useLeader(activeTenantId)
  const { data: mission } = useMission(activeTenantId)
  const queryClient = useQueryClient()

  const [text, setText] = useState('')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [location, setLocation] = useState('')
  const [showLocation, setShowLocation] = useState(false)
  const [topicId, setTopicId] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [posted, setPosted] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const gifRef = useRef<HTMLInputElement>(null)
  // Object URLs created for previews, revoked only when the draft is discarded.
  const urlsRef = useRef<string[]>([])

  useEffect(() => () => { urlsRef.current.forEach(URL.revokeObjectURL) }, [])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 320) + 'px'
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return
    const added: MediaItem[] = Array.from(files)
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map(f => {
        const url = URL.createObjectURL(f)
        urlsRef.current.push(url)
        return {
          id: nextId(),
          type: f.type.startsWith('video/') ? ('video' as const) : ('image' as const),
          url,
          caption: f.name,
        }
      })
    if (added.length) setMedia(m => [...m, ...added].slice(0, 4))
  }

  function removeMedia(id: string) {
    setMedia(m => {
      const gone = m.find(x => x.id === id)
      if (gone) {
        URL.revokeObjectURL(gone.url)
        urlsRef.current = urlsRef.current.filter(u => u !== gone.url)
      }
      return m.filter(x => x.id !== id)
    })
  }

  function insertEmoji(e: string) {
    const el = textareaRef.current
    if (!el) { setText(t => t + e); return }
    const start = el.selectionStart ?? text.length
    const end = el.selectionEnd ?? text.length
    const next = text.slice(0, start) + e + text.slice(end)
    setText(next)
    setShowEmoji(false)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + e.length, start + e.length)
      autoResize()
    })
  }

  function reset() {
    // Posted media keeps its object URLs alive so the new card can render them.
    urlsRef.current = []
    setText('')
    setMedia([])
    setLocation('')
    setShowLocation(false)
    setTopicId('')
    setShowEmoji(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const canPost = (text.trim().length > 0 || media.length > 0) && !publishing

  async function handlePost() {
    if (!canPost || !leader) return
    setPublishing(true)
    const topic = mission?.topics.find(t => t.id === topicId)
    const now = new Date().toISOString()
    const post: Post = {
      id: nextId(),
      tenantId: activeTenantId,
      authorId: leader.id,
      authorName: leader.name,
      authorTitle: `${leader.title}, ${leader.organization}`,
      authorAvatar: leader.avatarUrl,
      type: media.length ? (media[0].type === 'video' ? 'video' : 'image') : 'text',
      text: text.trim() || undefined,
      media,
      topicId: topic?.id,
      topicName: topic?.name,
      location: location.trim() || undefined,
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

    await new Promise(r => setTimeout(r, 500))
    queryClient.setQueryData<Post[]>(['posts', activeTenantId], old => [post, ...(old ?? [])])
    setPublishing(false)
    setPosted(true)
    reset()
    setTimeout(() => setPosted(false), 1800)
  }

  const iconBtn = 'p-2 rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors'

  return (
    <section className="mx-4 mt-2 rounded-2xl bg-muted px-4 py-3" aria-label="Create a post">
      <div className="flex gap-3">
        <Avatar src={leader?.avatarUrl} name={leader?.name ?? 'You'} size="md" />

        <div className="flex-1 min-w-0">
          {/* Type directly here — no modal. The sidebar Post button still opens one. */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); autoResize() }}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handlePost() }
            }}
            rows={1}
            maxLength={2000}
            placeholder="What’s happening?"
            aria-label="Post text"
            className="w-full resize-none bg-transparent text-xl text-foreground placeholder:text-muted-foreground py-2 outline-none"
          />

          {/* Attachment previews */}
          {media.length > 0 && (
            <div className={cn('grid gap-2 mb-2', media.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
              {media.map(m => (
                <div key={m.id} className="relative rounded-2xl overflow-hidden border">
                  {m.type === 'video'
                    ? <video src={m.url} className="w-full h-40 object-cover" muted />
                    : <img src={m.url} alt={m.caption ?? ''} className="w-full h-40 object-cover" />
                  }
                  <button
                    onClick={() => removeMedia(m.id)}
                    aria-label={`Remove ${m.caption ?? 'attachment'}`}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={13} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Location + topic */}
          {showLocation && (
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Add location"
              aria-label="Location"
              className="w-full mb-2 text-sm bg-transparent border rounded-xl px-3 py-2 outline-none focus:border-ring"
            />
          )}
          {mission && mission.topics.length > 0 && topicId && (
            <div className="mb-2">
              <select
                value={topicId}
                onChange={e => setTopicId(e.target.value)}
                aria-label="Link to mission topic"
                className="text-xs font-medium bg-muted rounded-full px-3 py-1.5 outline-none"
              >
                <option value="">No topic</option>
                {mission.topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          {/* Emoji picker */}
          {showEmoji && (
            <div className="flex flex-wrap gap-1 mb-2 p-2 border rounded-xl bg-card">
              {EMOJI.map(e => (
                <button key={e} onClick={() => insertEmoji(e)} className="text-lg p-1 rounded-lg hover:bg-muted transition-colors" aria-label={`Insert ${e}`}>
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Hidden file inputs drive the photo/GIF buttons */}
          <input ref={photoRef} type="file" accept="image/*,video/*" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
          <input ref={gifRef} type="file" accept="image/gif" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = '' }} />

          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center -ml-2 min-w-0">
              <button type="button" onClick={() => photoRef.current?.click()} title="Add photo or video" aria-label="Add photo or video" className={iconBtn}>
                <ImageIcon size={19} />
              </button>
              <button type="button" onClick={() => gifRef.current?.click()} title="Add GIF" aria-label="Add GIF" className={iconBtn}>
                <Gif size={19} />
              </button>
              <button type="button" onClick={() => setShowEmoji(v => !v)} title="Add emoji" aria-label="Add emoji" className={cn(iconBtn, showEmoji && 'text-foreground bg-foreground/5')}>
                <Smiley size={19} />
              </button>
              <button type="button" onClick={() => setShowLocation(v => !v)} title="Tag location" aria-label="Tag location" className={cn(iconBtn, showLocation && 'text-foreground bg-foreground/5')}>
                <MapPin size={19} />
              </button>
              {mission && mission.topics.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTopicId(id => id ? '' : mission.topics[0].id)}
                  title="Link to mission topic"
                  aria-label="Link to mission topic"
                  className={cn(iconBtn, topicId && 'text-foreground bg-foreground/5')}
                >
                  <Flag size={19} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {posted && <span className="text-xs font-medium text-primary">Posted</span>}
              {text.length > 1800 && (
                <span className={cn('text-xs', text.length >= 2000 ? 'text-destructive' : 'text-muted-foreground')}>
                  {2000 - text.length}
                </span>
              )}
              <button
                type="button"
                onClick={handlePost}
                disabled={!canPost}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-foreground text-background text-sm font-bold disabled:opacity-40 hover:opacity-90 disabled:hover:opacity-40 transition-opacity"
              >
                {publishing && <Spinner size={14} className="animate-spin" />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
