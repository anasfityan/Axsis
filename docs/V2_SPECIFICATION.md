# Axsis V2 — Product and Technical Specification

Status: Draft baseline
Branch: `agent/v2-specification`

## 1. Product vision

Axsis V2 is a stable, offline-first student productivity application for managing university courses, schedules, exams, grades, study files, and reminders across phone and desktop.

The product must be suitable for public release, future app-store distribution, and long-term feature development without requiring major rewrites for every new request.

## 2. Primary users

- University students managing multiple courses and semesters.
- Students who use more than one device.
- Students with unreliable internet access.
- Arabic, Turkish, and English users.

## 3. V2 goals

1. Preserve the useful capabilities of the current application.
2. Replace the single-file architecture with modular, testable code.
3. Use one responsive interface instead of separate mobile and desktop rendering systems.
4. Make local data reliable and available offline.
5. Make synchronization safe across multiple devices.
6. Provide one coherent design system with dark and light modes.
7. Support migration from the existing `mw2_*` localStorage data.
8. Prepare the project for future Android and iOS packaging.

## 4. Non-goals for the first V2 release

- Social networking between students.
- University administration or teacher dashboards.
- AI-generated study content.
- Payments or subscriptions.
- Public file sharing.

These may be evaluated after the stable core is released.

## 5. Core modules

### 5.1 Dashboard

- Total active courses.
- Upcoming exams and assignments.
- Today’s classes.
- Recent files.
- Sync and offline status.

### 5.2 Courses

Each course should support:

- Name.
- Course code.
- Instructor.
- Department or major.
- Room.
- Color token.
- Notes.
- Semester.
- One or more weekly sessions.
- Archived state.

### 5.3 Schedule

- Weekly timetable.
- Multiple sessions per course.
- Overlapping-session layout.
- Today and week views.
- Responsive layout using the same components on all devices.

### 5.4 Exams

- Course relation.
- Exam title and type.
- Date and time.
- Room.
- Notes.
- Reminder configuration.
- Countdown and status.

### 5.5 Grades

- Course relation.
- Assessment name and type.
- Score, maximum score, and weight.
- Optional grade target.
- Calculated course progress.

Grades must be included in local storage, cloud sync, export, import, and migration.

### 5.6 Files

- Course relation.
- Name.
- Type.
- Folder.
- Note.
- URL or cloud file reference.
- Created and updated timestamps.
- Optional Drive upload.

Google Drive is a file and backup service, not the primary application database.

### 5.7 Notifications

- Upcoming exam reminders.
- Class reminders.
- Sync failures.
- Storage or migration warnings.

### 5.8 Settings

- Language.
- Direction derived from language.
- Dark or light appearance.
- Time format.
- First day of week.
- Notification preferences.
- Sync status and device information.
- Export, import, and account deletion.

## 6. Navigation

Initial navigation:

1. Dashboard
2. Courses
3. Schedule
4. Exams
5. Grades
6. Files
7. Settings

On desktop, use a fixed sidebar. On mobile, use a compact bottom navigation or navigation drawer. Both surfaces must invoke the same routes and components.

## 7. Technical architecture

Recommended stack:

- React.
- Vite.
- TypeScript.
- React Router.
- Firebase Authentication.
- Cloud Firestore.
- IndexedDB through a typed wrapper.
- PWA service worker.
- CSS variables and reusable UI components.

The application should be organized by feature rather than by one global script.

```text
src/
  app/
  components/
    ui/
    layout/
    feedback/
  features/
    courses/
    schedule/
    exams/
    grades/
    files/
    notifications/
    settings/
  services/
    auth/
    firestore/
    drive/
    sync/
  database/
  design-system/
  i18n/
  types/
  utils/
```

## 8. Data model

All synchronized records must contain:

```ts
interface SyncRecord {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
  deviceId: string;
}
```

### 8.1 UserProfile

- id
- displayName
- email
- locale
- createdAt
- updatedAt

### 8.2 Semester

- id
- userId
- name
- startDate
- endDate
- isActive
- timestamps and sync metadata

### 8.3 Course

- id
- userId
- semesterId
- name
- code
- instructor
- department
- room
- colorToken
- notes
- archivedAt
- timestamps and sync metadata

### 8.4 CourseSession

- id
- userId
- courseId
- weekday
- startTime
- endTime
- room
- recurrence rules
- timestamps and sync metadata

### 8.5 Exam

- id
- userId
- courseId
- title
- type
- date
- startTime
- room
- notes
- reminderMinutes
- timestamps and sync metadata

### 8.6 GradeItem

- id
- userId
- courseId
- title
- type
- score
- maximumScore
- weight
- date
- notes
- timestamps and sync metadata

### 8.7 StudyFile

- id
- userId
- courseId
- name
- fileType
- folder
- note
- source
- url
- driveFileId
- size
- mimeType
- timestamps and sync metadata

### 8.8 UserSettings

- userId
- locale
- appearance
- timeFormat
- weekStartsOn
- notification preferences
- updatedAt

## 9. Local database

IndexedDB is the primary local data store.

Requirements:

- Typed tables for each entity.
- Schema versions and migrations.
- Transactions for related writes.
- Local operation queue for offline changes.
- Persistent device identifier.
- Backup before destructive migration or import.

`localStorage` should only hold lightweight preferences or bootstrap values. It must not remain the primary database.

## 10. Synchronization model

The application is offline-first.

### 10.1 Source responsibilities

- IndexedDB: immediate local source used by the interface.
- Firestore: primary cloud synchronization source.
- Google Drive: optional file storage and backup/export destination.

### 10.2 Sync rules

- Synchronize records individually, not as one full application JSON document.
- Every record carries `updatedAt`, `version`, `deviceId`, and optional `deletedAt`.
- Deletions use tombstones until all devices acknowledge them.
- Failed operations remain in a retry queue.
- Firestore failure must not block local editing.
- Drive failure must not block Firestore synchronization.
- The interface must show separate statuses for local save, Firestore sync, and Drive backup.

### 10.3 Conflict policy

Default policy:

- Non-overlapping changes merge automatically.
- If the same field changed on two devices, preserve both revisions and request user confirmation when automatic resolution is unsafe.
- Never silently overwrite an entire device dataset with another device dataset.

### 10.4 Import safety

Before importing:

1. Validate file format and schema version.
2. Create a local recovery snapshot.
3. Show a summary of records to add, update, skip, or conflict.
4. Require explicit confirmation for destructive replacement.
5. Keep a rollback record.

## 11. Legacy migration

V2 must detect these keys:

- `mw2_courses`
- `mw2_exams`
- `mw2_files`
- `mw2_grades`
- `mw2_nid`
- `mw2_fid`
- `mw2_lang`
- `mw2_theme`
- `mw2_view`
- `mw2_sz`
- `mw2_last_save`

Migration process:

1. Read and validate legacy values.
2. Convert numeric IDs to stable string IDs.
3. Convert one course day/time pair into a CourseSession record.
4. Convert exam objects into Exam records.
5. Convert file maps into StudyFile records.
6. Convert grades into GradeItem records.
7. Store migration metadata and source checksum.
8. Keep legacy data untouched until migration validation succeeds.
9. Offer a downloadable backup before cleanup.

## 12. Design system

V2 uses one visual identity with two appearances:

- Dark.
- Light.

No independent Apple, Material, Glass, or Deep Space themes.

### 12.1 Design principles

- Calm and readable.
- Clear hierarchy.
- Limited accent usage.
- Consistent spacing.
- Accessible contrast.
- Minimal decorative gradients.
- No emoji as primary interface icons.

### 12.2 Initial dark tokens

```css
--background: #0b0f17;
--surface-1: #111622;
--surface-2: #151b27;
--surface-3: #1a2230;
--border: rgba(255, 255, 255, 0.07);
--text-primary: #f3f4f6;
--text-secondary: #9ca3af;
--text-muted: #667085;
--accent: #f4b942;
--success: #22c55e;
--danger: #ef4444;
--info: #3b82f6;
```

Final colors will be validated in interface prototypes before implementation is locked.

### 12.3 Component requirements

Reusable components must include:

- Button variants.
- Input, select, textarea, date, and time fields.
- Card.
- Modal or sheet.
- Sidebar and mobile navigation.
- Empty state.
- Toast and inline error.
- Confirmation dialog.
- Status badge.
- Course color marker.
- File row.
- Schedule event.

Inline `style` attributes should not be used for normal component styling.

## 13. Responsive behavior

- One route and component tree for phone and desktop.
- CSS controls layout changes.
- JavaScript screen-size checks may be used only when behavior genuinely differs, not to maintain duplicate applications.
- Supported initial widths: 360 px and above.
- Keyboard, mouse, and touch interactions must all work.

## 14. Authentication and privacy

- Firebase Authentication for account identity.
- Minimum necessary OAuth scopes.
- User data isolated by `userId`.
- Firestore security rules deny cross-user access.
- Account deletion removes cloud data and explains Drive file handling.
- Privacy policy and data-export flow are required before public store release.

## 15. Reliability requirements

- No data loss when offline.
- Local writes complete before cloud sync is attempted.
- Failed sync operations retry safely.
- Service-worker updates must not leave incompatible cached application code.
- Migration and import operations must be reversible.
- User-facing errors must be understandable and must not expose raw stack traces.

## 16. Testing strategy

### Unit tests

- Data validation.
- Grade calculations.
- Schedule overlap calculations.
- Migration converters.
- Conflict-resolution rules.

### Integration tests

- IndexedDB repositories.
- Firestore synchronization.
- Offline queue and retry.
- Legacy import.
- Drive upload and backup independence.

### End-to-end tests

- Add and edit course.
- Add exam.
- Add grade.
- Add file.
- Work offline and reconnect.
- Use the same account on phone and desktop.
- Import legacy data.
- Update the installed PWA.

## 17. Delivery phases

### Phase 1 — Completed analysis

- Audit current application.
- Identify current features and risks.
- Define rebuild direction.

### Phase 2 — Specification

- Product vision.
- Architecture.
- Data model.
- Sync design.
- Design-system baseline.
- Migration plan.

### Phase 3 — Foundation

- Create the V2 React, Vite, and TypeScript application.
- Add routing and folder structure.
- Add design tokens and base components.
- Add linting, formatting, and tests.
- Do not remove or replace the legacy application.

### Phase 4 — Local core

- IndexedDB schema.
- Courses.
- Course sessions.
- Schedule.
- Exams.
- Grades.
- Files metadata.

### Phase 5 — Cloud and accounts

- Authentication.
- Firestore rules and repositories.
- Offline operation queue.
- Multi-device synchronization.

### Phase 6 — Legacy migration

- Import current Axsis data.
- Validation and rollback.
- Migration interface.

### Phase 7 — File and Drive services

- Drive file upload.
- Optional Drive backup/export.
- Independent error handling.

### Phase 8 — Stabilization

- Responsive verification.
- Accessibility.
- Performance.
- PWA update behavior.
- Security review.
- Release checklist.

## 18. Acceptance criteria for V2 core

The V2 core is acceptable when:

- Courses, schedule, exams, grades, and file metadata work offline.
- Refreshing or reopening the application does not lose data.
- Phone and desktop use the same functional components.
- Data created on two devices can synchronize without replacing the complete dataset.
- Legacy data can be imported with a preview and recovery backup.
- Dark and light appearances remain visually consistent.
- A failure in Google Drive does not stop Firestore sync.
- A failure in Firestore does not stop local work.
- Automated tests cover critical migration and synchronization behavior.

## 19. Deferred decisions

The following decisions are intentionally deferred:

- Final public product name.
- Final logo and store identity.
- Subscription or monetization model.
- AI features.
- Collaboration features.
- Exact Android and iOS packaging method.

They should not block construction of the stable core.
