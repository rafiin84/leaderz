@AGENTS.md

# LeaderZ — Project Context for Claude

## What this is

LeaderZ is a personal operating system for public leaders (politicians, founders, social figures). It combines a public follower CRM, private contacts, mission tracking, and AI briefing into one minimalist app. Primary reference tenant: **Sridhar Vembu** (Zoho founder, rural Tamil Nadu).

Live URL: `https://leaderz-flapakye.onslate.in`
GitHub: `flamehooves/leaderz` (push with `git push origin main`)
Dev server: `npm run dev` → `http://localhost:3020`

## Design System

**Philosophy:** X/Twitter-inspired minimalism. Monochrome-first. No gratuitous color. Action over analytics.

**Layout:**
- Sidebar (`w-56`, `sticky top-0`) + content wrapped in `max-w-[960px] mx-auto flex` — both centered as one unit on wide viewports
- Content area: `flex-1 min-w-0`
- Mobile: bottom nav replaces sidebar

**Typography:**
- `html { font-size: 19px }` — all rem units scale from this
- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`

**Color:** Tailwind v4 with oklch color space. Tokens in `src/app/globals.css` (`:root` + `.dark`). Key tokens: `--background`, `--foreground`, `--card`, `--muted`, `--border`.

**Icons:** `@phosphor-icons/react` — use `weight="fill"` for active/highlighted states, `weight="regular"` for inactive. Sizes: 22px nav, 28px attention cards, 16–20px inline.

**Animation:**
- Framer Motion for enter animations (`initial/animate` with staggered `delay`)
- CSS keyframes for perpetual effects (see `float-icon` in globals.css)
- Attention card icons: single 0.5s pop on hover (NOT infinite loop)
- `.card-hover` class for subtle lift on interactive cards (do NOT apply to attention cards — causes clip)

**Cards:**
- Attention strip cards: `w-[220px] h-[72px]` fixed size, `bg-white rounded-2xl shadow-sm`, no border
- Scroll container needs `pt-3 pb-4` to prevent shadow clip from `overflow-x-auto`

**Do not:**
- Use colored backgrounds (gradients, pastels, tints) on cards or sections
- Use horizontal scroll on tag/chip lists — wrap instead (`flex flex-wrap`)
- Use `position: fixed` for the sidebar (breaks centered layout)

## Key Files

| File | Purpose |
|---|---|
| `src/app/globals.css` | All CSS tokens, keyframes, utility classes |
| `src/app/leader/layout.tsx` | Root layout: centered flex wrapper, sidebar, bottom nav |
| `src/components/navigation/DesktopSidebar.tsx` | Sticky sidebar with nav items, Post button, profile |
| `src/components/home/AttentionStrip.tsx` | NEEDS ATTENTION cards (birthday, follow-up, AI alert) |
| `src/components/home/MissionPulse.tsx` | Mission card with cover image, topic tags, stats |
| `src/components/ai/AISuggestionCard.tsx` | AI briefing card |
| `src/app/leader/followers/page.tsx` | Followers page with India SVG map, engagement sort, call links |
| `src/app/leader/contacts/page.tsx` | Private contacts with privacy banner and filter pills |
| `src/components/contacts/ContactCard.tsx` | Contact card with call (tel:) and WhatsApp (wa.me) buttons |
| `src/data/mock/leaders.ts` | Mock tenant/leader data — `avatarUrl: '/sridhar.avif'` |

## Data & State

- Mock data in `src/data/mock/` — no real backend
- React Query hooks in `src/queries/` (e.g. `useLeader`, `useNotifications`, `useFollowers`)
- Zustand stores: `useAppStore` (active tenant, user role), `useUIStore` (modal state)
- Active tenant ID: `tenant-sridhar`

## Deployment

```bash
# Build
npm run build

# Deploy to Catalyst Slate
catalyst deploy slate leaderz -p 43319000000142001

# Commit + push
git add <files>
git commit -m "..."
git push origin main
```

Always commit and push after every meaningful change.

## WhatsApp Deep Links

Format: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
Message is context-aware: birthday → "Happy Birthday", follow-up → contextual note, default → thank-you.

## Follower Count Formatting

`formatCount(n)`: numbers ≥ 1000 → "X.XK", ≥ 1,000,000 → "X.XM". Used on followers page header.
