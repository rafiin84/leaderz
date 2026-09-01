import type { Post } from '@/types/content'

/**
 * Real posts from Sridhar Vembu's X account (@svembu, https://x.com/svembu).
 *
 * The `text`, `createdAt` and `sourceUrl` of every entry below are genuine —
 * text is quoted verbatim from the public post, and the date is decoded from
 * the tweet's snowflake id. Engagement figures (reactions, comments, shares,
 * views) are NOT real: X does not expose them without an API key, so they are
 * illustrative placeholders like the rest of the mock data in this folder.
 */

const AVATAR = '/sridhar.avif'

function engagement(like: number, heart: number, insightful: number, support: number) {
  return [
    { type: 'like' as const, count: like, userReacted: false },
    { type: 'heart' as const, count: heart, userReacted: false },
    { type: 'insightful' as const, count: insightful, userReacted: false },
    { type: 'support' as const, count: support, userReacted: false },
  ]
}

const base = {
  tenantId: 'tenant-sridhar',
  authorId: 'leader-sridhar',
  authorName: 'Sridhar Vembu',
  authorTitle: 'Founder & Chief Scientist, Zoho Corporation',
  authorAvatar: AVATAR,
  type: 'text' as const,
  media: [],
  comments: [],
  isPinned: false,
  isFollowerPost: false,
}

export const SVEMBU_POSTS: Post[] = [
  {
    ...base,
    id: 'x-1975871598617125138',
    sourceUrl: 'https://x.com/svembu/status/1975871598617125138',
    text: 'Thank you Sir, for your faith in us🙏 I dedicate this moment to our hard working engineers who have toiled hard in Zoho for over 20 years. They all stayed in India and worked all these years because they believed. Their faith is vindicated. Jai Hind, Jai Bharat🙏',
    isPinned: true,
    location: 'Tenkasi, Tamil Nadu',
    stateName: 'Tamil Nadu',
    reactions: engagement(41200, 15800, 6400, 9100),
    commentCount: 1840,
    shareCount: 7300,
    viewCount: 2140000,
    createdAt: '2025-10-08T00:00:00Z',
    updatedAt: '2025-10-08T00:00:00Z',
  },
  {
    ...base,
    id: 'x-1974387092441739320',
    sourceUrl: 'https://x.com/svembu/status/1974387092441739320',
    text: 'I was in a meeting in our Tenkasi office with our Arattai engineers, working out refinements to the app and a team member showed this tweet. Thank you @anandmahindra this gives us even more determination 🙏',
    location: 'Tenkasi, Tamil Nadu',
    stateName: 'Tamil Nadu',
    topicName: 'Rural Engineering',
    reactions: engagement(28400, 9600, 3800, 5200),
    commentCount: 962,
    shareCount: 4100,
    viewCount: 1380000,
    createdAt: '2025-10-04T00:00:00Z',
    updatedAt: '2025-10-04T00:00:00Z',
  },
  {
    ...base,
    id: 'x-1894508835534164006',
    sourceUrl: 'https://x.com/svembu/status/1894508835534164006',
    text: 'As Zoho grows rapidly in India, we have rural engineers in Tamil Nadu working closely with customers in Mumbai and Delhi - so much of our business is driven form these cities and from Gujarat. Rural jobs in Tamil Nadu depend on us serving those customers well.',
    location: 'Tamil Nadu',
    stateName: 'Tamil Nadu',
    topicName: 'Rural Jobs',
    reactions: engagement(12600, 3900, 2700, 2100),
    commentCount: 540,
    shareCount: 1900,
    viewCount: 684000,
    createdAt: '2025-02-25T00:00:00Z',
    updatedAt: '2025-02-25T00:00:00Z',
  },
  {
    ...base,
    id: 'x-1887283456620613838',
    sourceUrl: 'https://x.com/svembu/status/1887283456620613838',
    text: 'R&D and RD (rural development) the Zoho way! Nice video below 👇',
    topicName: 'Rural Development',
    reactions: engagement(9800, 3100, 1900, 1600),
    commentCount: 312,
    shareCount: 1450,
    viewCount: 421000,
    createdAt: '2025-02-05T00:00:00Z',
    updatedAt: '2025-02-05T00:00:00Z',
  },
  {
    ...base,
    id: 'x-1883816347475517506',
    sourceUrl: 'https://x.com/svembu/status/1883816347475517506',
    text: 'A new chapter begins today. In view of the various challenges and opportunities facing us, including recent major developments in AI, it has been decided that it is best that I should focus full time on R&D initiatives, along with pursuing my personal rural development mission.',
    topicName: 'Rural Development',
    reactions: engagement(52400, 18900, 8700, 11200),
    commentCount: 2380,
    shareCount: 9600,
    viewCount: 3120000,
    createdAt: '2025-01-27T00:00:00Z',
    updatedAt: '2025-01-27T00:00:00Z',
  },
  {
    ...base,
    id: 'x-1267685600779362304',
    sourceUrl: 'https://x.com/svembu/status/1267685600779362304',
    text: '5/ Jobs go where job creators go. When Zoho started our office in Tenkasi, there was an apprehension "Can we find talent? Would people want to work in a small town/village setting?" 8 years and 500 people later, no one worries about that anymore. We have a lot of applicants.',
    location: 'Tenkasi, Tamil Nadu',
    stateName: 'Tamil Nadu',
    topicName: 'Rural Jobs',
    reactions: engagement(16700, 5400, 4100, 2900),
    commentCount: 703,
    shareCount: 3800,
    viewCount: 912000,
    createdAt: '2020-06-02T00:00:00Z',
    updatedAt: '2020-06-02T00:00:00Z',
  },
  {
    ...base,
    id: 'x-1218277230951849984',
    sourceUrl: 'https://x.com/svembu/status/1218277230951849984',
    text: 'I will offer an example. We have an office in Pleasanton CA and a rural office near Tenkasi. I spend most of my time in Tenkasi now. Entirely different economic worlds and local GDP yet Tenkasi area quite livable in terms of amenities, with far lower ecological footprint.',
    location: 'Tenkasi, Tamil Nadu',
    stateName: 'Tamil Nadu',
    topicName: 'Rural Development',
    reactions: engagement(8400, 2600, 2200, 1400),
    commentCount: 289,
    shareCount: 1120,
    viewCount: 357000,
    createdAt: '2020-01-17T00:00:00Z',
    updatedAt: '2020-01-17T00:00:00Z',
  },
]
