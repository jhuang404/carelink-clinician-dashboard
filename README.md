# CareLink Clinician Dashboard

A clinician-facing dashboard for remote patient monitoring (RPM) of hypertension patients.

> **Note**: This is an MVP demo with synthetic data. Not intended for production use with real patient data.

## Features

### Patient Overview Dashboard
- Triage view with priority-based patient list (Critical / Moderate / Follow-up / Stable)
- Row-level actions: Edit Plan, Message, Call
- Click patient row to navigate to Patient Details
- Search and sort functionality

### Treatment Plan Drawer
- Quick edit prescriptions without leaving the dashboard
- Right-side drawer maintains list context
- Medications, monitoring schedule, lifestyle recommendations

### Alert Management
- Clear alert states: New → Acknowledged → Resolved
- Primary action buttons with unambiguous outcomes
- Secondary actions (Call/Message) do not change alert state

### Secure Messaging
- 2-column layout: conversation list + chat thread
- Patient and caregiver conversations
- Role-based message alignment (Patient / Caregiver / Clinician)
- Unread badges and mark-as-read behavior

### Analytics Dashboard
- Admin preview (not for clinical decision-making)
- Population health trends, adherence metrics, risk stratification
- Drill-down links to patient-level views
- Aggregated synthetic data

### Patient Details
- Blood pressure history chart (Recharts)
- Current medications with adherence tracking
- Recent readings table
- Quick actions: Adjust Medication, Schedule Follow-up

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Patient Overview Dashboard
│   ├── alerts/page.tsx       # Alert Management
│   ├── messages/page.tsx     # Secure Messaging
│   ├── analytics/page.tsx    # Analytics Dashboard
│   ├── patients/[id]/page.tsx # Patient Details
│   └── layout.tsx            # Root layout
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ui/Drawer.tsx         # Reusable drawer component
│   └── drawers/
│       └── TreatmentPlanDrawer.tsx
├── data/
│   ├── demoPatients.ts       # Synthetic patient data
│   └── demoMessages.ts       # Synthetic conversation data
├── types/
│   ├── index.ts              # Patient, TreatmentPlan types
│   └── messages.ts           # Conversation, Message types
└── lib/
    └── utils.ts              # Utility functions (cn)
```

## Demo Data

The dashboard uses synthetic data representing clinical scenarios:

| Patient | Priority | Scenario |
|---------|----------|----------|
| Maria Rodriguez | Critical | High BP (185/110), low adherence |
| James Wilson | Moderate | Rising trend, needs attention |
| Sarah Johnson | Stable | Well-controlled, high adherence |
| Michael Chen | Follow-up | Quarterly review due |
| ... | ... | ... |

## Design Principles

1. **Operations Console, Not Reporting Dashboard**: Patient list = task list
2. **Row-Level Actions > Global Navigation**: Edit plans without context switching
3. **Unambiguous Click Semantics**: Row click = details; Edit Plan = drawer
4. **Clear State Transitions**: Every action has a predictable outcome
5. **Honest Demo**: Clearly labeled as synthetic/demo data

## TODO (Backend Integration)

- [ ] `GET /api/patients` - Fetch patient list
- [ ] `GET /api/patients/:id` - Fetch patient details
- [ ] `PATCH /api/patients/:id/treatment-plan` - Update treatment plan
- [ ] `GET /api/alerts` - Fetch alerts
- [ ] `PATCH /api/alerts/:id` - Update alert status
- [ ] `GET /api/messages/conversations` - Fetch conversations
- [ ] `POST /api/messages/:conversationId` - Send message
- [ ] Audit logging for HIPAA compliance

## License

MIT
