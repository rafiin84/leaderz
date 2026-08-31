'use client'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X, TextT, Image, Article, CalendarBlank, Briefcase, Lightning,
  Globe, Lock, Users, CaretDown, PaperPlaneTilt, Spinner
} from '@phosphor-icons/react'
import { useUIStore } from '@/stores/uiStore'
import { useAppStore } from '@/stores/appStore'
import { useLeader, useMission, useProjects } from '@/queries'
import { Avatar } from '@/components/common/Avatar'
import type { ContentType } from '@/types/content'

const POST_TYPES: { type: ContentType; icon: React.ElementType; label: string }[] = [
  { type: 'text', icon: TextT, label: 'Text' },
  { type: 'image', icon: Image, label: 'Photo' },
  { type: 'article', icon: Article, label: 'Article' },
  { type: 'event_update', icon: CalendarBlank, label: 'Event' },
  { type: 'project_update', icon: Briefcase, label: 'Project' },
  { type: 'initiative_update', icon: Lightning, label: 'Initiative' },
]

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe, color: 'text-emerald-600' },
  { value: 'team', label: 'Team only', icon: Users, color: 'text-blue-600' },
  { value: 'private', label: 'Private', icon: Lock, color: 'text-muted-foreground' },
]

export function PostComposer() {
  const { postComposerOpen, setPostComposerOpen } = useUIStore()
  const { activeTenantId } = useAppStore()
  const { data: leader } = useLeader(activeTenantId)
  const { data: mission } = useMission(activeTenantId)
  const { data: projects } = useProjects(activeTenantId)

  const [postType, setPostType] = useState<ContentType>('text')
  const [text, setText] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'team' | 'private'>('public')
  const [linkedTopicId, setLinkedTopicId] = useState<string>('')
  const [linkedProjectId, setLinkedProjectId] = useState<string>('')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (postComposerOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
    if (!postComposerOpen) {
      setText('')
      setPostType('text')
      setPrivacy('public')
      setLinkedTopicId('')
      setLinkedProjectId('')
      setPublishing(false)
      setPublished(false)
    }
  }, [postComposerOpen])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 320) + 'px'
  }

  async function handlePublish() {
    if (!text.trim()) return
    setPublishing(true)
    await new Promise(r => setTimeout(r, 1200))
    setPublishing(false)
    setPublished(true)
    await new Promise(r => setTimeout(r, 800))
    setPostComposerOpen(false)
  }

  const selectedPrivacy = PRIVACY_OPTIONS.find(p => p.value === privacy)!
  const PrivacyIcon = selectedPrivacy.icon
  const charCount = text.length
  const maxChars = 2000
  const canPublish = text.trim().length > 0 && !publishing

  return (
    <AnimatePresence>
      {postComposerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setPostComposerOpen(false)}
          />

          {/* Sheet — slides up from bottom on mobile, centered on md+ */}
          <motion.div
            key="composer"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] bg-card rounded-t-3xl md:rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90dvh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <button
                onClick={() => setPostComposerOpen(false)}
                className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <h2 className="text-sm font-semibold text-foreground">New post</h2>
              <button
                onClick={handlePublish}
                disabled={!canPublish}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity hover:bg-primary/90"
              >
                {publishing ? (
                  <Spinner size={16} className="animate-spin" />
                ) : published ? (
                  'Posted!'
                ) : (
                  <>
                    <PaperPlaneTilt size={16} weight="fill" />
                    Publish
                  </>
                )}
              </button>
            </div>

            {/* Post type tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto shrink-0">
              {POST_TYPES.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                    postType === type
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={14} weight={postType === type ? 'fill' : 'regular'} />
                  {label}
                </button>
              ))}
            </div>

            {/* Author row */}
            <div className="flex items-center gap-3 px-4 py-2 shrink-0">
              <Avatar src={leader?.avatarUrl} name={leader?.name ?? 'L'} size="md" verified />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{leader?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{leader?.title}</p>
              </div>

              {/* Privacy selector */}
              <div className="relative">
                <select
                  value={privacy}
                  onChange={e => setPrivacy(e.target.value as typeof privacy)}
                  className="appearance-none flex items-center gap-1.5 pl-2 pr-6 py-1 rounded-lg border border-border text-xs font-medium text-foreground bg-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Post visibility"
                >
                  {PRIVACY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <CaretDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Text area */}
            <div className="flex-1 overflow-y-auto px-4 pb-2">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => { setText(e.target.value); autoResize() }}
                placeholder={getPlaceholder(postType)}
                className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm leading-relaxed focus:outline-none min-h-[120px]"
                maxLength={maxChars}
                style={{ height: '120px' }}
              />

              {/* Link to mission topic */}
              {mission?.topics && mission.topics.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {mission.topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setLinkedTopicId(linkedTopicId === topic.id ? '' : topic.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                        linkedTopicId === topic.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                      style={linkedTopicId === topic.id ? { borderColor: topic.color, color: topic.color, backgroundColor: topic.color + '18' } : {}}
                    >
                      #{topic.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Link to project (for project_update type) */}
              {postType === 'project_update' && projects && projects.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Link to project</p>
                  <div className="flex gap-2 flex-wrap">
                    {projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => setLinkedProjectId(linkedProjectId === project.id ? '' : project.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                          linkedProjectId === project.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {project.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer: char count + toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-t shrink-0">
              <div className="flex gap-1">
                <button className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground" aria-label="Add image">
                  <Image size={18} />
                </button>
                <button className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground" aria-label="Add location">
                  <Globe size={18} />
                </button>
              </div>
              <span className={`text-xs font-medium tabular-nums ${charCount > maxChars * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {charCount}/{maxChars}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function getPlaceholder(type: ContentType): string {
  switch (type) {
    case 'text': return "Share what's on your mind..."
    case 'image': return 'Add a caption for your photo...'
    case 'article': return 'Write your article or insight...'
    case 'event_update': return 'Share an update from your event...'
    case 'project_update': return 'How is the project progressing?'
    case 'initiative_update': return "What's new in this initiative?"
    default: return 'Share an update...'
  }
}
