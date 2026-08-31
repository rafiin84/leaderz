# LeaderZ

A personal operating system for leaders with a public following and a declared mission.

Live: **[leaderz-flapakye.onslate.in](https://leaderz-flapakye.onslate.in)**

---

## What it is

LeaderZ fuses three things no single tool provides together:

1. **Relationship intelligence** — surfaces which followers and contacts deserve attention right now (birthdays, follow-ups, engagement spikes) so the leader never misses a moment.
2. **Mission alignment** — every post, event, and project links back to the leader's stated mission; real impact is tracked across followers, districts, and activities.
3. **Private inner circle** — contacts are completely separated from the public follower graph and invisible to the platform and other tenants.

The design language is minimalist, monochrome-first, and X/Twitter-influenced: a sticky sidebar centered alongside the content column, no gratuitous color, action over analytics.

---

## Key features

### Home — Daily Briefing
- AI-generated daily briefing card with relationship actions, upcoming birthdays, content performance, and mission activity
- **NEEDS ATTENTION** strip: scrollable cards for upcoming birthdays, follow-ups, and high-priority AI suggestions with Phosphor icons that pop once on hover

### Followers
- Formatted follower count (284.7K style)
- India SVG map with proportional follower bubbles per state
- Followers sorted by engagement; top 3 get ranking badges
- One-tap phone call from the app (`tel:` links)

### Contacts — Private CRM
- Privacy banner: **"NO ONE IN THE SYSTEM CAN SEE THESE CONTACTS OTHER THAN YOU."**
- Call button (`tel:`) and WhatsApp button (`wa.me`) per contact
- WhatsApp messages are context-aware: birthday → "Happy Birthday", follow-up → contextual note, default → thank-you message
- Monochrome filter pills; no cross-tenant data exposure

### Mission
- Cover image with mission title and district/activity/project stats
- Topic tags wrap instead of scrolling horizontally

### Content
- Post composer, Reels module, Events, Projects, Opportunities
- Posts linked back to mission context

### Navigation
- Sticky sidebar (not fixed) — participates in the centered flex layout
- Sidebar + content wrapped in `max-w-[960px] mx-auto flex`, centering both as one unit on wide viewports
- Bottom nav on mobile

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, static export via `output: 'export'`) |
| Styling | Tailwind CSS v4 (oklch color space) |
| Icons | Phosphor Icons (`@phosphor-icons/react`) |
| Animation | Framer Motion + CSS keyframes |
| State | Zustand (`appStore`, `uiStore`) |
| Data | React Query over mock data (Zod-typed) |
| Deployment | Zoho Catalyst Slate |

---

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3020`. The app uses fully static mock data — no backend or env vars required.

```bash
npm run build   # production build
```

---

## Deployment

Deployed via Zoho Catalyst Slate. To redeploy:

```bash
catalyst deploy slate leaderz -p 43319000000142001
```

Build logs and the live URL are printed on completion.

---

## Design principles

1. **The leader should never feel behind.** Every session should feel like the leader is in command, not catching up.
2. **Private is private, absolutely.** No design that risks surfacing contact data — even by implication — is acceptable.
3. **Action over analytics.** Surface the right moment and the right person; let the leader act in one tap.
4. **Mission is the through-line.** Every module contributes to the leader's declared purpose.
5. **Confidence through restraint.** Minimalist, crisp, no decorative noise.

---

## Reference tenant

**Sridhar Vembu** (Zoho founder, rural Tamil Nadu) — primary design and data reference. Follower base: 284,729 across Tamil Nadu and surrounding Indian states.
