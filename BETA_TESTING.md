# OTTOKO beta launch

## Recommended launch order

1. **Web beta first:** deploy the Next.js application to a public HTTPS origin and invite a small group to validate the complete workflow.
2. **Android internal build:** share the EAS preview install link with Android testers.
3. **iOS internal build:** register tester devices and create an ad hoc preview build.
4. **Store testing:** move stable builds into TestFlight and Google Play testing tracks after the core feedback round.

## Owner setup required

### Web

- Create or connect the Git repository to Vercel or Netlify.
- Add the production variables from `.env.example` to the host.
- Set `NEXT_PUBLIC_SITE_URL` to the exact HTTPS origin.
- Add the production `/auth/callback` URL in Supabase Authentication URL Configuration.
- Add the production origin to the Google Maps browser-key restrictions.
- Configure custom SMTP in Supabase before inviting more than a few testers.
- Run the two-user RLS verification described in `DEPLOYMENT_CHECKLIST.md`.

### Mobile

- Create or choose an Expo account/project and link `apps/mobile` to it.
- Add the Supabase URL and publishable key to the EAS `preview` environment.
- Add `ottoko://reset-password` to Supabase Auth redirect URLs.
- For iOS internal distribution, use a paid Apple Developer account and register every tester device before the build.
- For later store testing, create the app records in App Store Connect and Google Play Console.

## Tester script

Ask every tester to complete these tasks with a test vehicle:

1. Create and confirm an account.
2. Add a vehicle with its current mileage.
3. Add a vehicle photo.
4. Log one symptom and confirm it appears in history.
5. Add a maintenance record and confirm mileage/history update.
6. Add a service reminder.
7. Find and save a repair shop on the web.
8. Start a repair journey, add an estimate, and approve it on the web.
9. Upload, open, and delete a receipt.
10. Log out, recover the password, and sign in again.

## Feedback to collect

- The task the tester was trying to complete.
- Where they hesitated or became unsure.
- Anything they expected to exist but could not find.
- Any error message, including a screenshot and approximate time.
- Device, operating system, and browser/app build.
- Whether they would trust OTTOKO with their real vehicle history and why.

## Current beta boundaries

- Web provides the complete repair-case, estimate, document, shop-map, reminder, and gallery workflows.
- Mobile provides authentication, onboarding, vehicle history, maintenance entry, symptom logging, photo onboarding, and saved shops.
- Native repair-case controls, general document upload, reminder creation, and full photo-gallery management are the next parity milestone.
- AI/OCR, payments, OBD-II, messaging, towing, and public vehicle passports remain intentionally out of scope.
