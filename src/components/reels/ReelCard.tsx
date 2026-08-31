'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ChatCircle, Share, SpeakerHigh, SpeakerSlash, Play, Pause, MapPin, X } from '@phosphor-icons/react'
import type { Reel } from '@/types/content'
import { Avatar } from '@/components/common/Avatar'
import { formatNumber, formatDuration } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  reel: Reel
  isActive: boolean
}

export function ReelCard({ reel, isActive }: Props) {
  const [liked, setLiked] = useState(false)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return
    if (isActive) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }, [isActive])

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      videoRef.current.play().then(() => setPlaying(true))
    }
    setShowControls(true)
    setTimeout(() => setShowControls(false), 2000)
  }

  const totalReactions = reel.reactions.reduce((a, r) => a + r.count, 0)

  return (
    <div className="relative w-full h-full bg-black select-none">
      {/* Video / Poster */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.posterUrl}
        loop
        playsInline
        muted={muted}
        className="absolute inset-0 w-full h-full object-cover"
        onClick={togglePlay}
        aria-label={`Reel by ${reel.authorName}`}
      />

      {/* Play/pause overlay */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Play size={28} className="text-white ml-1" weight="fill" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      {/* Top actions */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <button
          onClick={() => setMuted(m => !m)}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <SpeakerSlash size={18} weight="fill" /> : <SpeakerHigh size={18} weight="fill" />}
        </button>
      </div>

      {/* Right actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <button
          onClick={() => setLiked(l => !l)}
          className="flex flex-col items-center gap-1"
          aria-label={liked ? 'Unlike' : 'Like'}
          aria-pressed={liked}
        >
          <motion.div whileTap={{ scale: 1.3 }} className={cn('p-2.5 rounded-full bg-black/40 backdrop-blur-sm', liked && 'bg-rose-500/80')}>
            <Heart size={22} weight={liked ? 'fill' : 'regular'} className="text-white" />
          </motion.div>
          <span className="text-white text-xs font-medium">{formatNumber(totalReactions + (liked ? 1 : 0))}</span>
        </button>

        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1"
          aria-label="Comments"
        >
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
            <ChatCircle size={22} className="text-white" />
          </div>
          <span className="text-white text-xs font-medium">{formatNumber(reel.commentCount)}</span>
        </button>

        <button className="flex flex-col items-center gap-1" aria-label="Share">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
            <Share size={22} className="text-white" />
          </div>
          <span className="text-white text-xs font-medium">{formatNumber(reel.shareCount)}</span>
        </button>

        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
          {reel.authorAvatar ? (
            <img src={reel.authorAvatar} alt={reel.authorName} className="w-full h-full object-cover" />
          ) : (
            <Avatar src={reel.authorAvatar} name={reel.authorName} size="sm" />
          )}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <Avatar src={reel.authorAvatar} name={reel.authorName} size="sm" />
          <div>
            <p className="text-white text-sm font-semibold">{reel.authorName}</p>
            {reel.authorTitle && <p className="text-white/70 text-xs">{reel.authorTitle}</p>}
          </div>
          <button className="ml-2 px-3 py-1 rounded-full border border-white/50 text-white text-xs font-medium hover:bg-white/20 transition-colors">
            Follow
          </button>
        </div>

        {reel.caption && (
          <p className="text-white text-sm leading-relaxed line-clamp-3 mb-2">{reel.caption}</p>
        )}

        {/* Context chips */}
        <div className="flex flex-wrap gap-1.5">
          {reel.missionTitle && (
            <Link href="/leader/mission" className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
              {reel.missionTitle}
            </Link>
          )}
          {reel.topicName && (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white">
              {reel.topicName}
            </span>
          )}
          {reel.location && (
            <span className="inline-flex items-center gap-1 text-xs text-white/70">
              <MapPin size={11} weight="fill" />
              {reel.location}
            </span>
          )}
        </div>
      </div>

      {/* Comments sheet */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowComments(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[60vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-base font-semibold">Comments ({formatNumber(reel.commentCount)})</h3>
                <button onClick={() => setShowComments(false)} className="p-1 rounded-xl hover:bg-muted transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {reel.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar src={comment.authorAvatar} name={comment.authorName} size="sm" />
                    <div className="flex-1 bg-muted rounded-2xl px-3 py-2">
                      <p className="text-xs font-semibold mb-1">{comment.authorName}</p>
                      <p className="text-sm text-foreground">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {reel.comments.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No comments yet.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
