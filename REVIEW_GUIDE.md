# Phase 2 review guide

Review the current source as a standard Next.js → Supabase → Vercel application.

Priority areas:

1. `supabase/migrations/202608080001_initial_schema.sql`: RLS, composite same-owner foreign keys, shared-shop architecture, profile/mileage triggers, and private storage policies.
2. `lib/supabase/`: browser/server clients and session-refresh proxy.
3. `app/auth/`, `proxy.ts`, and `components/auth-card.tsx`: authentication and route protection.
4. `app/actions.ts` and `lib/validation.ts`: server-side validation, persistent writes, uploads, and error handling.
5. `lib/data/garage.ts` and `lib/data/timeline-adapter.ts`: authenticated reads and separation of data logic from presentation.
6. `lib/domain/maintenance-status.ts`: transparent, deterministic documented-status logic.

Known limitations:

- Supabase/RLS integration tests require a configured disposable Supabase project and are not included in the default local test run.
- Vehicle creation and its initial mileage-entry insert, and maintenance creation and its derived mileage-entry insert, are sequential operations. The primary record remains valid if the secondary mileage insert fails; a future database RPC could make these fully atomic.
- Shared shops must currently be seeded administratively; shop creation/search UI is deferred until the Google Places phase.
- Documents can be uploaded and listed in timeline metadata, but secure download/preview UI is not yet implemented.
- Email confirmation behavior depends on Supabase Auth URL and email-template configuration.
