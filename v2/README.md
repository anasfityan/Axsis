# Axsis V2

Axsis V2 is an offline-first university study manager built with React, TypeScript, Vite, IndexedDB, Firebase Authentication, Firestore synchronization, and optional Google Drive backups.

## Requirements

- Node.js 22 or newer
- npm
- A modern browser with IndexedDB and Service Worker support

## Run locally

```bash
cd v2
npm ci
npm run dev
```

Open the local URL printed by Vite. The application can be used without Firebase by choosing the local session option.

## Production verification

```bash
cd v2
npm ci
npm run lint
npm run test
npm run build
```

The build command also verifies the JavaScript bundle budget and required PWA output files.

## Preview the production build

```bash
cd v2
npm run preview
```

## Optional cloud configuration

Copy `.env.example` to `.env.local` and fill the Firebase public configuration values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_OAUTH_CLIENT_ID=
```

Without these values, the application remains fully usable in local mode. Firebase enables cloud accounts and Firestore synchronization. The Google OAuth client ID enables optional Google Drive backups.

## Firestore rules

Deploy `firestore.rules` before enabling cloud synchronization for real users:

```bash
firebase deploy --only firestore:rules
```

## Data safety

- Primary data is stored in IndexedDB.
- Changes are queued for synchronization when a cloud account is active.
- Local JSON backups are checksummed before restore.
- Google Drive backup is optional.
- Deleting a course also tombstones its related sessions, exams, grades, and study files.
