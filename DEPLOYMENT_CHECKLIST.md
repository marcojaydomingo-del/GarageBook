# GarageBook deployment checklist

## Netlify hosting

GarageBook includes `netlify.toml` for the build command, `.next` publish directory, and Node 22. Netlify supports the App Router, Server Actions, route handlers, and middleware automatically through its maintained OpenNext adapter; do not install or pin a legacy adapter.

Use a Git-connected deployment for GarageBook. A drag-and-drop static-folder deployment cannot run its Server Actions, authentication middleware, route handlers, or private document routes.

1. Push this repository to GitHub, GitLab, Bitbucket, or Azure DevOps.
2. In Netlify, choose **Add new project → Import an existing project** and select the repository.
3. Keep the detected base directory empty. Netlify reads the committed `netlify.toml`.
4. Add the environment variables below before the first production deploy.
5. Deploy, then copy the final `https://…netlify.app` origin for Supabase and Google configuration.

## Environment variables

Set these for production and preview deployments:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-browser-restricted-maps-key
GOOGLE_PLACES_API_KEY=your-server-only-places-key
```

Add these through **Project configuration → Environment variables** and make them available to production Builds and Functions. For the small beta, using the same values across all deploy contexts is acceptable. Only use the Supabase publishable/anonymous key. Never add a service-role key. `GOOGLE_PLACES_API_KEY` is server-only and must never use a `NEXT_PUBLIC_` prefix.

Keep the Google keys separate:

- Restrict `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to **Maps JavaScript API** and the production Netlify origin under Website restrictions.
- Restrict `GOOGLE_PLACES_API_KEY` to **Places API (New)**. Do not place it in browser code.

## Supabase Auth

In **Authentication → URL Configuration**:

1. Set **Site URL** to the exact HTTPS production origin.
2. Add `https://your-production-domain.example/auth/callback` as an allowed redirect.
3. Add `https://your-production-domain.example/reset-password` as an allowed redirect.
4. Keep `http://localhost:3000/auth/callback` and `http://localhost:3000/reset-password` for local development.
5. Add deploy-preview URL patterns only if testers must authenticate on preview deploys. Production should use the stable site URL.
6. Configure custom SMTP before a public launch; Supabase’s trial mailer is rate-limited and best-effort.

## Release checks

1. Apply every SQL migration in filename order.
2. Run `npm run netlify:check` and `npm run verify`.
3. Run `npm run test:rls` with two existing test accounts supplied through local-only environment variables.
4. Test signup confirmation, login, logout, password reset, and onboarding on the production origin.
5. Confirm PDF/image upload, view, and deletion against the private storage bucket.
6. Confirm no `.env.local`, test credentials, or service-role keys are present in the deployment bundle.
7. Test **Use my location** on `/shops`; the production permissions header allows same-origin geolocation while continuing to block camera and microphone access.
8. Confirm the dashboard tour appears for a fresh user, can be skipped, and can be replayed with **Take a tour**.

## After the first deploy

1. Set `NEXT_PUBLIC_SITE_URL` to the exact stable Netlify origin and redeploy if the initial value was temporary.
2. Update Supabase Auth URL Configuration with the same origin.
3. Add the origin to the Google Maps browser-key website restrictions, including `https://your-site.netlify.app/*`.
4. Run the tester script in `BETA_TESTING.md` once yourself before inviting testers.
