# CareLink Clinician Dashboard

Clinician-facing hypertension RPM dashboard built with Next.js, Firebase, and App Router APIs.

> **Important**: This project is a demo/MVP for product validation. Do not use with real PHI/production clinical workflows without security and compliance hardening.

## Current Features

### 1) Clinician auth and app shell
- Login/logout flow with session persisted in `localStorage`
- Protected pages via `AuthProvider` + route redirect (`/login` vs app pages)
- Responsive shell (`Sidebar` + `Header`) for all authenticated pages
- Co-branded login screen with T-Mobile logo

Demo login:
- Email: `sarah.chen@carelink.health`
- Password: `carelink2025`

### 2) Patient overview dashboard (`/`)
- Risk-priority patient list with quick actions
- Latest BP shown in overview for real-time visibility
- Daily aggregate data support for multi-reading-per-day patients
- Add patient workflow via drawer

### 3) Patient details (`/patients/[id]`)
- BP history charts (daily average + individual readings)
- Recent individual readings table
- Current medication list from patient profile
- `Adjust Medication` drawer with editable meds
- Medication changes persisted through `PUT /api/patients/[id]`
- PDF report export (chart + stats + daily averages + medication summary)

### 4) Alert management and messaging
- Alert triage workflow and state updates
- Message entry points from overview/alerts/details pages
- Message page with patient-context routing

### 5) Send BP reminder (email/SMS demo)
- Reminder modal in patient details page
- Email delivery via `POST /api/reminders` using Resend API
- Editable recipient field and patient-aware message template
- SMS path currently returns demo success response (no provider wired yet)

## System Architecture

The app uses a standard App Router pattern with API routes colocated in `src/app/api`.

- **UI layer**: Next.js pages + reusable drawer/components
- **State/auth layer**: `AuthContext` for clinician session and access control
- **Server layer**: Route handlers under `src/app/api/*`
- **Data layer**: Firestore via Firebase Admin SDK (`src/lib/firebase-admin`)
- **Fallback mode**: demo data returned when Firebase admin config is missing

## Data Flow (High Level)

1. Clinician logs in on `/login`
2. Frontend fetches data from internal APIs (`/api/patients`, `/api/readings`, `/api/alerts`, etc.)
3. API routes read/write Firestore collections (`patients`, `readings`, `alerts`, `clinicianNotes`)
4. BP submissions through `/api/blood-pressure` are saved and may auto-create alerts
5. Reminder requests through `/api/reminders` call Resend for email delivery

## API Routes

Implemented routes in `src/app/api`:

- `GET /api/patients` - list patients (+ filter/search query params)
- `POST /api/patients` - create patient
- `GET /api/patients/[id]` - patient profile + recent readings + notes
- `PUT /api/patients/[id]` - update patient fields (including medications)
- `DELETE /api/patients/[id]` - delete patient
- `GET /api/readings` / `POST /api/readings` - reading retrieval/ingest
- `POST /api/blood-pressure` - iOS-compatible BP ingest alias
- `GET /api/alerts` / `PATCH /api/alerts` - alert list and state updates
- `GET /api/notes` / `POST /api/notes` / `DELETE /api/notes/[id]` - clinician notes APIs
- `POST /api/reminders` - email reminder (Resend) + SMS demo response

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript + React 19
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PDF Export**: `jspdf` + `html2canvas`
- **Data**: Firebase Firestore + Firebase Admin SDK
- **Email**: Resend REST API

## Local Setup

### 1) Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2) Environment variables

Copy `.env.example` to `.env.local` and fill Firebase keys.

For reminder email, also set:

```bash
RESEND_API_KEY=your_resend_api_key
```

Without Firebase admin config, the app runs in demo fallback mode for most read paths.

## Deployment Notes (Vercel)

- Production branch should be `main`
- Set all env vars in Vercel Project Settings
- Redeploy after env var changes
- If auto-deploy appears stale, trigger a manual redeploy from the latest `main` commit

## Project Structure

```text
src/
  app/
    login/page.tsx
    page.tsx
    alerts/page.tsx
    messages/page.tsx
    analytics/page.tsx
    patients/[id]/page.tsx
    api/
      patients/
      readings/
      alerts/
      blood-pressure/
      notes/
      reminders/
  components/
    Header.tsx
    Sidebar.tsx
    AppShell.tsx
    ui/Drawer.tsx
    drawers/TreatmentPlanDrawer.tsx
  contexts/AuthContext.tsx
  lib/firebase-admin.ts
```

## Security and Compliance Notes

- This repository currently includes demo-oriented auth/session behavior
- No HIPAA-grade audit trail or enterprise IAM integration yet
- Do not store real patient PHI until security controls are implemented

## License

MIT
