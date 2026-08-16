# GarageBook mobile

GarageBook mobile is the native Expo/React Native client for iOS and Android. It uses the same Supabase Auth, PostgreSQL data, private storage, and Row Level Security policies as the Next.js application.

## Available tester flows

- Create an account, recover a password, and keep a persistent session.
- Add a vehicle and its current mileage.
- Upload a private vehicle photo during onboarding.
- Review the garage dashboard and saved repair shops.
- Open a vehicle to review its status, reminders, and chronological history.
- Add maintenance or repair work with mileage evidence.
- Log a symptom, which opens the connected repair-case workflow through the database trigger.

## Local setup

Copy `.env.example` to `.env.local` and use the same Supabase URL and publishable key as the web app.

```bash
npm install
npm run start
```

Use Node.js 22.13 or newer. Press `i` for the iOS Simulator or `a` for an Android emulator.

## Internal tester build

The `preview` profile in `eas.json` creates an internal distribution build. Before the first build:

1. Sign in to an Expo account with EAS CLI.
2. Link this directory to an Expo project.
3. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the EAS `preview` environment.
4. Register iOS tester devices before creating an iOS ad hoc build.

Then build one or both platforms:

```bash
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

The Android result is directly installable. The iOS preview is limited to devices included in its provisioning profile. App-store testing should use the `production` profile and EAS Submit after the internal beta is stable.
