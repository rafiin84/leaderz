import type { Conversation } from '@/types/message'

/**
 * Mock direct-message threads. Written for the demo — the people and
 * organisations here are the same cast as the contacts and followers mocks so
 * the app reads consistently, and none of it is real correspondence.
 */
export const MOCK_CONVERSATIONS: Record<string, Conversation[]> = {
  'tenant-sridhar': [
    {
      id: 'conv-1',
      tenantId: 'tenant-sridhar',
      name: 'Geetha Selvam',
      subtitle: 'Propulsion Engineer — Stellar Dynamics',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      isVerified: true,
      unread: 2,
      messages: [
        { id: 'm-1-1', fromMe: false, body: 'Sir, we finished the pressure test on the second batch. All four units held at 210 bar.', sentAt: '2026-09-01T09:12:00Z' },
        { id: 'm-1-2', fromMe: true, body: 'That is excellent news. Please send the test log when you have it.', sentAt: '2026-09-01T09:40:00Z' },
        { id: 'm-1-3', fromMe: false, body: 'Attaching the bay photos. The new jig made a big difference to alignment.', sentAt: '2026-09-02T04:20:00Z', mediaUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop'] },
        { id: 'm-1-4', fromMe: false, body: 'Also — would you have 20 minutes this week? I would like your view on the ISRO pathway.', sentAt: '2026-09-02T04:22:00Z' },
      ],
      createdAt: '2026-06-10T00:00:00Z',
      updatedAt: '2026-09-02T04:22:00Z',
    },
    {
      id: 'conv-2',
      tenantId: 'tenant-sridhar',
      name: 'Greater Chennai Corporation',
      subtitle: 'Civic body',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop',
      isVerified: true,
      unread: 0,
      messages: [
        { id: 'm-2-1', fromMe: true, body: 'Sharing the Tuticorin workshop details for the skills programme discussion.', sentAt: '2026-08-28T06:00:00Z' },
        { id: 'm-2-2', fromMe: false, body: 'Received, thank you. We will revert after the review meeting on Thursday.', sentAt: '2026-08-28T11:30:00Z' },
      ],
      createdAt: '2026-08-28T00:00:00Z',
      updatedAt: '2026-08-28T11:30:00Z',
    },
    {
      id: 'conv-3',
      tenantId: 'tenant-sridhar',
      name: 'Senthil Murugan',
      subtitle: 'Founder — AgroMind AI',
      avatarUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=200&h=200&fit=crop',
      unread: 1,
      messages: [
        { id: 'm-3-1', fromMe: false, body: 'The paddy disease model is at 91% on the Dindigul field set now.', sentAt: '2026-08-30T05:15:00Z' },
        { id: 'm-3-2', fromMe: true, body: 'Strong result. How many farmers are on the pilot?', sentAt: '2026-08-30T07:02:00Z' },
        { id: 'm-3-3', fromMe: false, body: '340 as of this week. We are adding two more panchayats in October.', sentAt: '2026-09-01T03:45:00Z' },
      ],
      createdAt: '2025-08-20T00:00:00Z',
      updatedAt: '2026-09-01T03:45:00Z',
    },
    {
      id: 'conv-4',
      tenantId: 'tenant-sridhar',
      name: 'Dr. K. Vijayakar',
      subtitle: 'Director General — ISRO',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      isVerified: true,
      unread: 0,
      messages: [
        { id: 'm-4-1', fromMe: false, body: 'Happy to look at the shortlist. Send it across whenever ready.', sentAt: '2026-08-22T10:00:00Z' },
        { id: 'm-4-2', fromMe: true, body: 'Thank you. I will have it with you before the 15th.', sentAt: '2026-08-22T10:25:00Z' },
      ],
      createdAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-08-22T10:25:00Z',
    },
    {
      id: 'conv-5',
      tenantId: 'tenant-sridhar',
      name: 'Nithya Baskaran',
      subtitle: 'Student — IIT Madras',
      avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
      unread: 0,
      messages: [
        { id: 'm-5-1', fromMe: false, body: 'Sir, I got the scholarship result today. I have been selected.', sentAt: '2026-08-18T12:00:00Z' },
        { id: 'm-5-2', fromMe: true, body: 'Wonderful. Very well deserved — keep me posted on how the term goes.', sentAt: '2026-08-18T12:30:00Z' },
      ],
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-08-18T12:30:00Z',
    },
    {
      id: 'conv-6',
      tenantId: 'tenant-sridhar',
      name: 'Karthikeyan Murugesan',
      subtitle: 'Software Developer — Coimbatore',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
      unread: 0,
      messages: [
        { id: 'm-6-1', fromMe: false, body: 'Registered 62 people for the Rural Software Guild meetup in Coimbatore.', sentAt: '2026-08-15T08:00:00Z' },
        { id: 'm-6-2', fromMe: true, body: 'Good turnout. Do you need anything from our side for the venue?', sentAt: '2026-08-15T08:20:00Z' },
        { id: 'm-6-3', fromMe: false, body: 'All arranged, thank you. Will share photos after the event.', sentAt: '2026-08-15T08:35:00Z' },
      ],
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2026-08-15T08:35:00Z',
    },
  ],
  'tenant-anitha': [
    {
      id: 'conv-a1',
      tenantId: 'tenant-anitha',
      name: 'Barmer District Office',
      subtitle: 'Education administration',
      unread: 0,
      messages: [
        { id: 'm-a1-1', fromMe: false, body: 'FLN classroom readiness report for the district is attached.', sentAt: '2026-08-26T09:00:00Z' },
      ],
      createdAt: '2026-08-26T00:00:00Z',
      updatedAt: '2026-08-26T09:00:00Z',
    },
  ],
}
