'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ChatCircle, Share, MapPin, ArrowRight, DotsThree } from '@phosphor-icons/react'
import type { Post } from '@/types/content'
import { Avatar } from '@/components/common/Avatar'
import { formatRelativeTime, formatNumber } from '@/lib/formatting'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  post: Post
}

export function PostCard({ post }: Props) {
  const [liked, setLiked] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const mainReaction = post.reactions.find(r => r.type === 'like')
  const totalReactions = post.reactions.reduce((a, r) => a + r.count, 0)
  const textPreview = post.text ? (post.text.length > 200 && !expanded ? post.text.slice(0, 200) + '…' : post.text) : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-2xl overflow-hidden"
      aria-label={`Post by ${post.authorName}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{post.authorName}</p>
              {post.authorTitle && <p className="text-xs text-muted-foreground truncate">{post.authorTitle}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</p>
              <button className="p-1 rounded-lg hover:bg-muted transition-colors" aria-label="More options">
                <DotsThree size={16} />
              </button>
            </div>
          </div>
          {/* Context chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {post.missionTitle && (
              <Link href="/leader/mission" className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {post.missionTitle}
              </Link>
            )}
            {post.topicName && (
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {post.topicName}
              </span>
            )}
            {post.location && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin size={10} />
                {post.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Text */}
      {textPreview && (
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{textPreview}</p>
          {post.text && post.text.length > 200 && !expanded && (
            <button onClick={() => setExpanded(true)} className="text-xs text-primary font-medium mt-1 hover:underline">
              Read more
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media.length > 0 && (
        <div className={cn('overflow-hidden', post.media.length > 1 ? 'grid grid-cols-2 gap-0.5' : '')}>
          {post.media.slice(0, 4).map((m, i) => (
            <div key={m.id} className={cn('relative overflow-hidden', post.media.length === 1 ? 'h-64' : 'h-40')}>
              <img src={m.url} alt={m.caption ?? ''} className="w-full h-full object-cover" loading="lazy" />
              {i === 3 && post.media.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{post.media.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Project link */}
      {post.projectId && (
        <Link
          href={`/leader/projects/${post.projectId}`}
          className="mx-4 my-3 flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Featured Project</p>
            <p className="text-sm font-semibold text-foreground">View Project Profile</p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground" />
        </Link>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-3 border-t">
        <button
          onClick={() => setLiked(l => !l)}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors', liked ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' : 'hover:bg-muted text-muted-foreground')}
          aria-label={liked ? 'Unlike' : 'Like'}
          aria-pressed={liked}
        >
          <Heart size={16} weight={liked ? 'fill' : 'regular'} />
          {formatNumber(totalReactions + (liked ? 1 : 0))}
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
          <ChatCircle size={16} />
          {formatNumber(post.commentCount)}
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
          <Share size={16} />
          {formatNumber(post.shareCount)}
        </button>
      </div>
    </motion.article>
  )
}
