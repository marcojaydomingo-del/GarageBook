# GarageBook

GarageBook is a vehicle maintenance and repair history application. This first MVP establishes a production-quality Next.js front-end foundation and an owner-scoped Supabase schema while remaining fully previewable with sample data.

## Included in this phase

- Marketing home, login, and signup screens
- Garage dashboard and responsive application shell
- Add-vehicle, maintenance-record, and symptom forms with Zod + React Hook Form validation
- Vehicle detail and extensible chronological timeline
- Repair-shop records
- Loading, empty, and error-state components
- Supabase migration for profiles, vehicles, maintenance, symptoms, repair cases, shops, visits, documents, and reminders
- Row Level Security policies and a private storage bucket policy

## Project structure

```text
app/                    App Router pages and route-level states
components/             Small reusable UI and form components
lib/                    Domain types, formatting, and sample data
supabase/migrations/    Versioned PostgreSQL schema and RLS policies
public/                 Static assets
```

## Local setup

Requirements: Node.js 22.13 or newer.

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env.local` only when connecting Supabase.
3. Run `npm run dev` and open the printed local URL.
4. Run `npm run lint` and `npm run build` before committing.

The front-end does not require Supabase credentials. Authentication and form submissions are prototype interactions until a client is connected.

## Supabase setup

1. Create a Supabase project.
2. Apply `supabase/migrations/202608080001_initial_schema.sql` in the SQL editor or with the Supabase CLI.
3. Add the project URL and anon key to `.env.local`; never commit that file.
4. When wiring auth, create a `profiles` row for every new `auth.users` row (typically with a database trigger or post-signup server action).
5. Upload vehicle files beneath `<user-id>/<vehicle-id>/...` in the private `vehicle-documents` bucket so the included storage policies apply.

All user-owned tables carry `owner_id` (profiles use their auth user ID directly), have RLS enabled, and restrict reads/writes to `auth.uid()`.

## Deliberately out of scope

AI, maps, subscriptions, payments, mobile apps, microservices, GraphQL, and live Supabase integration are not included in Phase 1.
