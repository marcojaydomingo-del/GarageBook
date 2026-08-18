# GarageBook

GarageBook is a secure, data-backed vehicle maintenance and repair history foundation built with standard Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Architecture

```text
Next.js App Router
├── Server Components: authenticated reads and page composition
├── Server Actions: validated writes and private uploads
├── Client Components: forms and interactive feedback only
└── Supabase
    ├── Auth and cookie-backed sessions
    ├── PostgreSQL with RLS and same-owner composite foreign keys
    └── Private vehicle-documents storage bucket
```

The production target is **Next.js → Supabase → Vercel**. No Vinext, Cloudflare Worker, Drizzle, or secondary backend is required.

The repository also contains an Expo/React Native client in `apps/mobile`. It targets both iOS and Android and connects directly to the same Supabase Auth, database, storage, and RLS policies. Native screens share product rules and data contracts with the web application, but use native navigation and controls rather than attempting to render the Next.js interface inside a wrapper.

## Current functionality

- Email/password signup, confirmation, login, logout, password recovery, session refresh, and protected routes
- Optional, resumable first-run onboarding that creates a real vehicle and builds an honest current-state snapshot from mileage, photos, known symptoms, recent work, and upcoming service
- Automatic profile creation for new Supabase Auth users
- Persistent create and correction forms for vehicles, maintenance, symptoms, and private shop preferences
- Database-backed dashboard, vehicle detail, shops, spending, and activity
- Server-side timeline adapter combining maintenance, symptoms, shop visits, documents, and mileage entries
- Deterministic Maintenance Status based only on documented reminders, symptoms, and repair cases
- Date- and mileage-based service reminders with overdue, due-soon, complete, and dismiss states
- Private PDF/image uploads with ownership, MIME type, and 10 MB size validation
- Private per-vehicle photo gallery with secure full-size viewing, upload/delete controls, and the newest photo available as the dashboard backdrop
- Persistent light, dark, or system theme preference
- Shared shops plus private per-user shop preferences and notes
- Future-ready warranties, estimates, and estimate-item schema
- Public read-only sample garage at `/demo` using clearly labeled fictional records
- Public beta privacy, terms, and contact pages linked from the landing-page footer

Sample MINI data remains in `lib/sample-data.ts` only as an optional development/demo utility. Authenticated pages never mix it into persisted records.

## Mobile foundation

The initial native vertical slice includes:

- Email/password sign in and account creation
- Persistent Supabase sessions using Expo SQLite-backed storage
- Real vehicle onboarding with current mileage
- Private vehicle-photo upload from the device photo library
- Database-backed dashboard, garage, and repair-shop lists
- Supabase-backed vehicle detail with documented status, service reminders, and a combined maintenance, symptom, document, and mileage timeline
- Automatic light/dark appearance
- Native bottom navigation, safe-area handling, Android predictive back, and iPad support

To run it, copy `apps/mobile/.env.example` to `apps/mobile/.env.local`, enter the same Supabase URL and publishable key used by the web app, then run `npm run mobile`. Press `i` for the iOS Simulator or `a` for an Android emulator. Expo SDK 57 requires Node 22.13 or newer.

For native password recovery, add `garagebook://reset-password` to Supabase **Authentication → URL Configuration → Redirect URLs**. Production App Store and Play Store builds should later replace or supplement this custom scheme with verified universal/app links.

## Local setup

1. Use Node.js 22.13 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and enter your Supabase values.
4. Apply the SQL files in `supabase/migrations` in filename order. On an existing Phase 1 database, apply:
   - `202608120001_repair_case_workflow.sql` for automatic repair cases and stage transitions.
   - `202608120002_repair_case_evidence.sql` for authenticated repair-shop creation.
   - `202608130001_structured_estimates.sql` for itemized estimates, atomic approvals, and evidence-driven repair stages.
   - `202608150001_repair_completion.sql` for invoice metadata and repair-record completion gates.
   - `202608150004_shop_discovery.sql` for securely saving Google Places listings to a user's private shop collection.
   - `202608150005_dashboard_tour.sql` so dashboard-tour completion follows a user across devices.
5. In Supabase Auth URL configuration, set the site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` as a redirect URL.
6. Run `npm run dev`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-browser-restricted-maps-key
GOOGLE_PLACES_API_KEY=your-server-only-places-key
```

Restrict the browser key to your site origins and the Maps JavaScript API. Restrict the server key to Places API (New), never prefix it with `NEXT_PUBLIC_`, and never commit `.env.local`. Never expose or commit a Supabase service-role key.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm test
npm run test:rls
npm run verify
npm run start
npm run mobile
npm run mobile:ios
npm run mobile:android
npm run mobile:check
```

## Database security

RLS limits every user-owned table to `auth.uid()`. Composite foreign keys such as `(vehicle_id, owner_id) → vehicles(id, owner_id)` additionally prevent cross-owner references even through privileged application mistakes. Shared shop identity is stored in `shops`; user-specific metadata is stored in `user_shops`.

Private storage paths use `<owner-id>/<vehicle-id>/<generated-name>`. Storage policies verify both the authenticated owner path and ownership of the referenced vehicle.

## Deployment

For the web beta, connect the repository to Netlify. The committed `netlify.toml` runs an environment preflight and then uses Netlify’s automatically maintained Next.js adapter; do not add a legacy runtime plugin. Add the production environment variables in Netlify, then add the final production origin to Supabase Auth and the Google Maps browser-key restrictions. Follow `DEPLOYMENT_CHECKLIST.md` for the exact setup and production Auth, SMTP, RLS, storage, location, and tour checks. For the staged tester rollout, follow `BETA_TESTING.md`; the mobile project includes an EAS `preview` profile for internal Android and iOS builds.

## Deferred features

AI/OCR, payments, OBD-II, marketplaces, messaging, towing, social features, push notifications, and offline conflict resolution are intentionally out of scope.
