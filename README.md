# PostFlow AI

**LinkedIn AI Post Generation & Team Publishing Platform**

PostFlow AI is a full-stack SaaS built with Next.js 14 App Router, TypeScript, and Tailwind CSS. It helps B2B teams go from raw idea → AI-generated draft → team review → one-click email approval → auto-published LinkedIn post — inside one tool.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Clerk (email, Google, GitHub OAuth) |
| AI | OpenAI GPT-4o |
| LinkedIn | LinkedIn REST API v2 + OAuth 2.0 |
| Payments | **RevenueCat** (stubbed — activate with `REVENUECAT_API_KEY`) |
| Email | SendGrid |
| Cron | Vercel Cron Jobs |
| Deployment | Vercel |

---

## Core Workflow

```
Generate → Review Queue → Approve → Calendar → Auto-Publish
```

1. **Generate** — GPT-4o creates 3 post variations from topic + voice profile
2. **Review Queue** — Kanban board: draft → in review → approved/changes requested
3. **Approve** — One-click email approval links (signed JWT, no login required)
4. **Calendar** — Visual monthly scheduling
5. **Auto-Publish** — Vercel Cron publishes to LinkedIn every 15 minutes

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Supabase](https://supabase.com) project
- [Clerk](https://clerk.com) app (enable Google + GitHub OAuth)
- [OpenAI](https://platform.openai.com) API key
- [SendGrid](https://sendgrid.com) account (for approval emails)
- [LinkedIn Developer App](https://www.linkedin.com/developers/) (OAuth 2.0, `w_member_social` scope)

### 1. Clone and install

```bash
git clone https://github.com/Ekroff/PostFlow-Ai.git
cd PostFlow-Ai
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in all values — see .env.example for descriptions
```

### 3. Database setup

1. Open your Supabase project → **SQL Editor**
2. Paste and run the contents of `supabase/schema.sql`
3. This creates all tables, indexes, and RLS policies

### 4. Clerk configuration

In your Clerk dashboard:
- **After sign-in URL** → `/app/dashboard`
- **After sign-up URL** → `/onboarding`

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
postflow-ai/
├── app/
│   ├── (auth)/                  # Clerk-rendered auth pages
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── app/                     # Protected routes — require Clerk auth
│   │   ├── layout.tsx           # Auth guard + sidebar layout
│   │   ├── dashboard/           # /app/dashboard
│   │   ├── generate/            # /app/generate
│   │   ├── queue/               # /app/queue
│   │   ├── calendar/            # /app/calendar
│   │   ├── settings/            # /app/settings
│   ├── onboarding/              # /onboarding  ← standalone new-user setup (no sidebar)
│   ├── api/
│   │   ├── auth/                # Clerk sync, LinkedIn OAuth
│   │   ├── posts/               # CRUD, approve, schedule, comments, bulk
│   │   ├── generate/            # GPT-4o generation endpoint
│   │   ├── voice/               # Voice analysis + feedback
│   │   ├── cron/                # Auto-publish + weekly digest
│   │   ├── approve/             # Email approval (public, JWT-validated)
│   │   ├── webhooks/status/     # Supabase DB webhook → sends approval emails
│   │   ├── usage/               # Usage vs plan limit
│   │   └── payments/            # RevenueCat plan stub
│   ├── approve/
│   │   ├── success/             # /approve/success
│   │   └── reject/              # /approve/reject (comment form)
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout (Clerk provider, fonts)
│   ├── not-found.tsx            # Custom 404
│   └── error.tsx                # Global error boundary
├── components/
│   ├── AppSidebar.tsx           # Sidebar with active nav + Clerk UserButton
│   ├── KanbanBoard.tsx          # 4-column review queue
│   └── ContentCalendar.tsx      # Monthly calendar with post scheduling
├── lib/
│   ├── supabase/client.ts       # Browser Supabase client
│   ├── supabase/server.ts       # Server Supabase client (with cookies)
│   ├── openai.ts                # Lazy GPT-4o client + prompt builders
│   ├── linkedin.ts              # LinkedIn publish + token refresh
│   ├── revenuecat.ts            # Plan limits / RevenueCat stub
│   ├── sendgrid.ts              # Email sending + approval email HTML
│   └── jwt.ts                   # Signed JWT for email approval links
├── types/
│   └── database.ts              # TypeScript types for all Supabase tables
├── supabase/
│   └── schema.sql               # Full PostgreSQL schema with RLS + triggers
├── middleware.ts                 # Clerk auth middleware (protects /app/*)
├── vercel.json                  # Cron job schedule (publish every 15 min)
└── .env.example                 # All required environment variable names
```

---

## Payments — RevenueCat

Payments are **not yet active**. The codebase is wired and ready:

- Plan limits defined in `lib/revenuecat.ts`
- `users.subscription_tier` column in Supabase tracks the plan
- Usage enforced in `/api/generate` (monthly count vs tier limit)
- To activate: add `REVENUECAT_API_KEY` to `.env.local` and implement a RevenueCat webhook at `/api/payments/webhook` that updates `users.subscription_tier`

### Pricing Tiers

| Tier | Price | Seats | AI Posts/month |
|------|-------|-------|----------------|
| Free | $0 | 1 | 5 |
| Starter | $29/mo | 1 | 30 |
| Growth | $79/mo | 5 | 150 |
| Pro | $149/mo | 15 | 500 |
| Agency | $299+/mo | 50 | Unlimited |

---

## Database Schema

See `supabase/schema.sql`. Key tables:

| Table | Description |
|-------|-------------|
| `users` | Clerk-synced users with workspace, role, LinkedIn tokens, subscription tier |
| `workspaces` | Team workspaces |
| `brand_profiles` | Per-user voice profiles (tone score, emoji usage, signature phrases) |
| `posts` | Posts with full status lifecycle |
| `post_versions` | Edit history |
| `post_comments` | Review thread comments |
| `usage_tracking` | Monthly AI generation counts per user |

---

## API Reference

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/sync` | POST | Clerk | Sync Clerk user → Supabase on sign-up |
| `/api/auth/linkedin` | GET | Clerk | Start LinkedIn OAuth flow |
| `/api/auth/linkedin/callback` | GET | Public | OAuth callback, store tokens |
| `/api/brand-profile` | GET, POST | Clerk | Voice/brand profile |
| `/api/generate` | POST | Clerk | GPT-4o post generation (3 variations) |
| `/api/voice/analyse` | POST | Clerk | Analyse writing samples → voice profile |
| `/api/voice/feedback` | POST | Clerk | Post-publish style feedback |
| `/api/posts` | GET, POST | Clerk | List / create posts |
| `/api/posts/[id]` | GET, PUT, DELETE | Clerk | Single post CRUD |
| `/api/posts/[id]/approve` | POST | Editor+ | Approve or request changes |
| `/api/posts/[id]/schedule` | PATCH | Editor+ | Set scheduled publish time |
| `/api/posts/[id]/comments` | GET, POST | Clerk | Review comments |
| `/api/posts/bulk-approve` | POST | Editor+ | Bulk approve |
| `/api/posts/optimal-times` | GET | Clerk | Suggested posting times |
| `/api/approve` | GET, POST | JWT token | Email one-click approval (no login) |
| `/api/webhooks/status` | POST | Supabase | DB webhook → approval emails |
| `/api/cron/publish` | GET | CRON_SECRET | Auto-publish to LinkedIn |
| `/api/cron/digest` | GET | CRON_SECRET | Weekly content digest email |
| `/api/usage` | GET | Clerk | Usage vs plan limits |
| `/api/payments` | GET | Clerk | Plan info (RevenueCat stub) |

---

## Deployment

```bash
npm i -g vercel
vercel --prod
```

Set all environment variables in the Vercel dashboard. Cron jobs in `vercel.json` run automatically on Vercel Pro/Enterprise.

---

*PostFlow AI — PRD v2.0 — Next.js 14, Supabase, Clerk, OpenAI GPT-4o, RevenueCat*
