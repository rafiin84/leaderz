#!/usr/bin/env node
/**
 * Import a full X (Twitter) timeline into src/data/mock/svembu.ts.
 *
 * X does not allow scraping the public profile page — an unauthenticated fetch
 * of https://x.com/svembu returns HTTP 402 — so a complete timeline can only
 * come from one of the two sources below.
 *
 *   1. X API v2 (needs a Bearer token; user-timeline reads are a paid tier)
 *
 *        X_BEARER_TOKEN=xxx node scripts/import-x-posts.mjs --user svembu
 *        X_BEARER_TOKEN=xxx node scripts/import-x-posts.mjs --user svembu --max 3200
 *
 *   2. An X account data export (Settings -> Your account -> Download an
 *      archive). Point at the tweets.js inside it. Only the account owner can
 *      export their own archive.
 *
 *        node scripts/import-x-posts.mjs --archive ~/x-archive/data/tweets.js
 *
 * Flags
 *   --user <handle>     Handle to read via the API (default: svembu)
 *   --archive <path>    Import from an archive tweets.js instead of the API
 *   --out <path>        Output file (default: src/data/mock/svembu.ts)
 *   --max <n>           Stop after roughly n posts (default: all available)
 *   --include-replies   Keep replies (default: skipped)
 *   --include-retweets  Keep retweets (default: skipped)
 *
 * Media: photos map to { type: 'image' }, videos and animated GIFs map to
 * { type: 'video' } with the highest-bitrate MP4 variant as `url` and
 * preview_image_url as `thumbnailUrl`. PostCard renders both.
 *
 * The URLs point at X's CDN rather than being downloaded. Pass --download to
 * also save the files into public/x-media/ and rewrite the URLs to local paths.
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const argv = process.argv.slice(2)
const flag = (name, fallback = undefined) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : (argv[i + 1]?.startsWith('--') ? true : argv[i + 1])
}
const has = name => argv.includes(`--${name}`)

const USER = flag('user', 'svembu')
const ARCHIVE = flag('archive')
const OUT = flag('out', 'src/data/mock/svembu.ts')
const MAX = Number(flag('max', 0)) || Infinity
const KEEP_REPLIES = has('include-replies')
const KEEP_RETWEETS = has('include-retweets')
const DOWNLOAD = has('download')

const TENANT = 'tenant-sridhar'
const AUTHOR_ID = 'leader-sridhar'
const AUTHOR_NAME = 'Sridhar Vembu'
const AUTHOR_TITLE = 'Founder & Chief Scientist, Zoho Corporation'
const AUTHOR_AVATAR = '/sridhar.avif'

function die(msg) {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

/** Snowflake id -> ISO date, so archive rows without created_at still get one. */
function idToDate(id) {
  const ms = (BigInt(id) >> 22n) + 1288834974657n
  return new Date(Number(ms)).toISOString()
}

function bestVideoVariant(variants = []) {
  return variants
    .filter(v => v.content_type === 'video/mp4' && v.url)
    .sort((a, b) => (b.bit_rate ?? 0) - (a.bit_rate ?? 0))[0]?.url
}

/** X API v2 media object -> our MediaItem */
function mapMedia(m, i) {
  const id = m.media_key ?? `m-${i}`
  if (m.type === 'photo') {
    return { id, type: 'image', url: m.url, caption: m.alt_text }
  }
  // video | animated_gif
  const url = bestVideoVariant(m.variants) ?? m.preview_image_url
  if (!url) return null
  const isVideo = Boolean(bestVideoVariant(m.variants))
  return {
    id,
    type: isVideo ? 'video' : 'image',
    url,
    thumbnailUrl: m.preview_image_url,
    caption: m.alt_text,
  }
}

async function fetchFromApi() {
  const token = process.env.X_BEARER_TOKEN
  if (!token) {
    die('X_BEARER_TOKEN is not set.\n\n  Create an app at https://developer.x.com, then:\n    export X_BEARER_TOKEN=...\n\n  Reading another account\'s timeline requires a paid API tier.\n  If you own the account, --archive needs no token at all.')
  }
  const auth = { headers: { Authorization: `Bearer ${token}` } }

  const uRes = await fetch(`https://api.x.com/2/users/by/username/${USER}`, auth)
  if (!uRes.ok) die(`Lookup of @${USER} failed: HTTP ${uRes.status} ${await uRes.text()}`)
  const userId = (await uRes.json()).data?.id
  if (!userId) die(`No such user: @${USER}`)

  const params = new URLSearchParams({
    max_results: '100',
    'tweet.fields': 'created_at,public_metrics,attachments,entities,referenced_tweets',
    expansions: 'attachments.media_keys',
    'media.fields': 'type,url,preview_image_url,variants,alt_text',
  })
  if (!KEEP_REPLIES || !KEEP_RETWEETS) {
    const excl = [!KEEP_REPLIES && 'replies', !KEEP_RETWEETS && 'retweets'].filter(Boolean)
    params.set('exclude', excl.join(','))
  }

  const posts = []
  let token_ = undefined
  let page = 0
  while (posts.length < MAX) {
    if (token_) params.set('pagination_token', token_); else params.delete('pagination_token')
    const res = await fetch(`https://api.x.com/2/users/${userId}/tweets?${params}`, auth)
    if (res.status === 429) die('Rate limited (HTTP 429). Wait and re-run — the script is resumable via --max.')
    if (!res.ok) die(`Timeline read failed: HTTP ${res.status} ${await res.text()}`)
    const json = await res.json()
    const mediaByKey = new Map((json.includes?.media ?? []).map(m => [m.media_key, m]))
    for (const t of json.data ?? []) {
      const media = (t.attachments?.media_keys ?? [])
        .map((k, i) => mediaByKey.get(k) && mapMedia(mediaByKey.get(k), i))
        .filter(Boolean)
      posts.push({
        id: t.id,
        text: t.text,
        createdAt: t.created_at ?? idToDate(t.id),
        media,
        metrics: t.public_metrics,
      })
    }
    page++
    process.stderr.write(`\r  page ${page} — ${posts.length} posts`)
    token_ = json.meta?.next_token
    if (!token_) break
  }
  process.stderr.write('\n')
  return posts.slice(0, MAX === Infinity ? undefined : MAX)
}

async function fetchFromArchive() {
  const raw = await readFile(ARCHIVE, 'utf8')
  // tweets.js is `window.YTD.tweets.part0 = [ ... ]`
  const start = raw.indexOf('[')
  if (start === -1) die(`${ARCHIVE} does not look like an X archive tweets.js`)
  let rows
  try {
    rows = JSON.parse(raw.slice(start))
  } catch (e) {
    die(`Could not parse ${ARCHIVE}: ${e.message}`)
  }
  const posts = []
  for (const row of rows) {
    const t = row.tweet ?? row
    if (!KEEP_RETWEETS && /^RT @/.test(t.full_text ?? '')) continue
    if (!KEEP_REPLIES && t.in_reply_to_status_id_str) continue
    const media = (t.extended_entities?.media ?? []).map((m, i) => {
      if (m.type === 'photo') return { id: m.id_str ?? `m-${i}`, type: 'image', url: m.media_url_https }
      const url = bestVideoVariant(m.video_info?.variants)
      return url
        ? { id: m.id_str ?? `m-${i}`, type: 'video', url, thumbnailUrl: m.media_url_https }
        : { id: m.id_str ?? `m-${i}`, type: 'image', url: m.media_url_https }
    })
    posts.push({
      id: t.id_str,
      text: t.full_text ?? t.text ?? '',
      createdAt: t.created_at ? new Date(t.created_at).toISOString() : idToDate(t.id_str),
      media,
      metrics: {
        like_count: Number(t.favorite_count ?? 0),
        retweet_count: Number(t.retweet_count ?? 0),
        reply_count: 0,
        impression_count: 0,
      },
    })
    if (posts.length >= MAX) break
  }
  return posts
}

async function downloadMedia(posts) {
  const dir = 'public/x-media'
  await mkdir(dir, { recursive: true })
  let n = 0
  for (const p of posts) {
    for (const m of p.media) {
      for (const key of ['url', 'thumbnailUrl']) {
        const src = m[key]
        if (!src || !/^https?:/.test(src)) continue
        const ext = path.extname(new URL(src).pathname) || (key === 'url' && m.type === 'video' ? '.mp4' : '.jpg')
        const name = `${p.id}-${m.id}${key === 'thumbnailUrl' ? '-thumb' : ''}${ext}`
        try {
          const res = await fetch(src)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          await writeFile(path.join(dir, name), Buffer.from(await res.arrayBuffer()))
          m[key] = `/x-media/${name}`
          n++
        } catch (e) {
          console.warn(`  ! could not download ${src}: ${e.message}`)
        }
      }
    }
  }
  console.log(`  downloaded ${n} media file(s) to ${dir}/`)
}

function render(posts) {
  const body = posts.map(p => {
    const m = p.metrics ?? {}
    const media = p.media.length
      ? `[\n${p.media.map(x => `      ${JSON.stringify(x)},`).join('\n')}\n    ]`
      : '[]'
    return `  {
    ...base,
    id: 'x-${p.id}',
    sourceUrl: 'https://x.com/${USER}/status/${p.id}',
    type: ${p.media.some(x => x.type === 'video') ? "'video'" : p.media.length ? "'image'" : "'text'"},
    text: ${JSON.stringify(p.text)},
    media: ${media},
    reactions: [
      { type: 'like', count: ${m.like_count ?? 0}, userReacted: false },
      { type: 'heart', count: 0, userReacted: false },
      { type: 'insightful', count: 0, userReacted: false },
      { type: 'support', count: 0, userReacted: false },
    ],
    commentCount: ${m.reply_count ?? 0},
    shareCount: ${m.retweet_count ?? 0},
    viewCount: ${m.impression_count ?? 0},
    createdAt: '${p.createdAt}',
    updatedAt: '${p.createdAt}',
  },`
  }).join('\n')

  return `import type { Post } from '@/types/content'

/**
 * GENERATED by scripts/import-x-posts.mjs on ${new Date().toISOString()}
 * Source: @${USER} (${ARCHIVE ? `archive ${path.basename(ARCHIVE)}` : 'X API v2'})
 * ${posts.length} posts. Do not edit by hand — re-run the importer instead.
 */

const base = {
  tenantId: '${TENANT}',
  authorId: '${AUTHOR_ID}',
  authorName: ${JSON.stringify(AUTHOR_NAME)},
  authorTitle: ${JSON.stringify(AUTHOR_TITLE)},
  authorAvatar: '${AUTHOR_AVATAR}',
  comments: [],
  isPinned: false,
  isFollowerPost: false,
}

export const SVEMBU_POSTS: Post[] = [
${body}
]
`
}

const posts = ARCHIVE ? await fetchFromArchive() : await fetchFromApi()
if (!posts.length) die('No posts returned.')
posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
if (DOWNLOAD) await downloadMedia(posts)
await writeFile(OUT, render(posts))

const withMedia = posts.filter(p => p.media.length).length
const withVideo = posts.filter(p => p.media.some(m => m.type === 'video')).length
console.log(`\n✓ wrote ${posts.length} posts to ${OUT}`)
console.log(`  ${withMedia} with media (${withVideo} with video)`)
console.log(`  newest ${posts[0].createdAt.slice(0, 10)} · oldest ${posts.at(-1).createdAt.slice(0, 10)}`)
console.log(`\nRun \`npx tsc --noEmit\` to check the result, then restart the dev server.`)
