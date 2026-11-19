# QuickBite 🍽️

> **Dedicated Destination & Trending Food Pre-Booking Platform**  
> Eliminating long-distance travel uncertainty, guaranteeing signature food availability, and elevating hospitality at popular and trending destination eateries.

---

## 📌 Executive Summary

**QuickBite** is a specialized pre-booking platform designed for **popular, iconic, trending, and destination restaurants** (e.g. famous highway food stops, heritage thali houses, legendary biryani hubs, coastal seafood spots, and viral dining destinations).

### The Real-World Problem Solved
Foodies, families, and highway travelers often drive 50 to 150+ km specifically to visit famous destination restaurants. However:
- **The "Sold Out" Heartbreak:** Signature dishes are prepared in limited daily batches and frequently sell out early, leaving travelers who drove for hours hungry and disappointed.
- **Chaotic "Cattle Queues" & Poor Culture:** Trending venues suffer from overwhelming, hostile queues where travelers stand outside for 45 to 90 minutes with zero hospitality or dignity.
- **Hesitant Travel Demand:** Many potential customers avoid visiting these trending spots altogether due to the high risk of a ruined trip.

### The QuickBite Solution
1. **Guaranteed Signature Food:** Diners pre-book exact signature dishes with real-time remaining portion counters before strict cut-off windows.
2. **Elevated Dining Hospitality ("Good Dining Culture"):** Diners arrive, show their Digital VIP Pass, are seated immediately at reserved tables, and enjoy hot food served fresh with zero wait.
3. **Automated Kitchen Manifests:** The hotel kitchen receives consolidated portion prep sheets every evening at 7:00 PM, eliminating food waste and ensuring smooth kitchen throughput.

---

## 🎯 Core Capabilities

- **Unified Customer Application (Mobile Native / PWA)**:
  - Curated discovery of trending, iconic, and highway food destinations with distance and driving time estimates.
  - Guaranteed dish pre-ordering with real-time portion quota counters.
  - Slot & table selection (party size, arrival time windows).
  - Upfront pre-booking checkout transacted in Indian Rupees (₹).
  - Digital VIP Trip Pass with unique QR code, route navigation link, and live status progression (`Confirmed` → `Prepped` → `Arrived / Seated` → `Completed`).
- **Hotel Partner Operations Portal (Tablet / PC PWA)**:
  - Visual timeline of today's pre-bookings grouped by arrival slots.
  - Automated Kitchen Batch Prep Sheet generated at 7:00 PM the night before, detailing exact portions needed per slot.
  - 1-Tap Guest Arrival Check-in (QR scan or one-tap check-in on tablet) to escort guests immediately to reserved tables.
  - Signature dish daily quota manager and same-day 12:00 PM cut-off engine.
  - Settlements & Invoices tab tracking daily T+X delayed payouts and official tax invoices with bank UTR numbers.
- **Super Admin Platform Operations (PWA)**:
  - Curated destination partner onboarding with commercial split ratio configuration.
  - 4-Document Legal Compliance Gate (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`).
  - Daily Delayed Settlement Engine (T+X days post-dining) prioritizing matured batches via FIFO queue.
  - Bank disbursement execution with UTR logging and automatic PDF tax invoice generation.
  - Global audit ledger and anti-fraud inspector.

---

## ⏰ Pre-Booking Timing & Cut-Off Engine

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PRE-BOOKING TIMING & CUT-OFF RULES                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. SAME-DAY BOOKING CUT-OFF:                                                │
│    • Diners must book food & table BEFORE 12:00 PM (Noon) on the dining day.│
│    • Prevents same-day kitchen overbooking and guarantees fresh prep.       │
│                                                                             │
│ 2. DAY-BEFORE NOTIFICATION & PREP DISPATCH (7:00 PM):                       │
│    • At 7:00 PM (19:00) the evening before dining:                          │
│      - Kitchen receives the Consolidated Kitchen Batch Prep Sheet.          │
│      - Diners receive their finalized VIP Trip Pass & Travel Reminder.      │
│                                                                             │
│ 3. POST-7:00 PM NEXT-DAY BOOKINGS (30-MINUTE GRACE WINDOW):                 │
│    • Bookings placed between 7:00 PM and midnight for next-day slots        │
│      are processed within 30 minutes, dynamically updating the hotel sheet. │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND SURFACES                                      │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Hotel Partner Portal (Tablet)  │ React PWA (Vite, vite-plugin-pwa, Kiosk Standalone)   │
│ Super Admin Portal (Web PWA)   │ React PWA (TailwindCSS, TanStack Table & Forms)       │
│ Customer App (Diners)          │ React Native / PWA (Location Discovery & Digital Pass)│
│ Form & Input Validation        │ Zod (Strict schema validation across all inputs)      │
│ Client State Management        │ Zustand (Modular UI and booking state stores)         │
│ Server State & Data Caching    │ TanStack Query v5 (Data fetching, caching & sync)     │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
                                           │
                      REST APIs (HTTPS) & WebSockets (WSS)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND & DATA LAYER                                      │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Backend Framework              │ NestJS & TypeScript (Modular Monolith)                │
│ Request / DTO Validation       │ NestJS ValidationPipe (class-validator / strict DTOs) │
│ Response Architecture          │ Centralized Response Interceptor & Unified Status     │
│ Exception Handling             │ Centralized Global HttpExceptionFilter                │
│ Security Measurements          │ Helmet, Throttler, Bcrypt, JWT, Multi-Tenant Guard    │
│ Primary Database               │ PostgreSQL (ACID relational data & transactions)      │
│ In-Memory Data Store           │ Redis (WebSocket Pub/Sub, Throttling & Fast Cache)    │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
Qickbite/
│
├── admin-portal/        # React PWA (Super Admin Platform Operations & Settlements)
│   ├── src/
│   │   ├── components/  # Shared layouts, data tables, modal dialogs
│   │   ├── features/    # Partner onboarding, KYC verification, T+X payouts
│   │   ├── stores/      # Zustand client stores
│   │   ├── hooks/       # TanStack Query custom hooks
│   │   └── schemas/     # Zod form validation schemas
│   ├── package.json
│   └── README.md
│
├── hotel-portal/        # React PWA (Hotel Partner Operations & Kitchen Batch Prep)
│   ├── src/
│   │   ├── components/  # Timeline boards, prep sheets, check-in modals
│   │   ├── features/    # Today's slots, batch manifests, 1-tap check-in, quotas
│   │   ├── stores/      # Zustand client stores
│   │   ├── hooks/       # TanStack Query hooks & WebSocket listeners
│   │   └── schemas/     # Zod validation schemas
│   ├── package.json
│   └── README.md
│
├── customer-app/        # Unified Customer App (Destination Discovery & Pre-Booking)
│   ├── src/
│   │   ├── screens/     # Trending discovery, slot picker, menu pre-order, VIP pass
│   │   ├── components/  # Quota badges, dish cards, booking drawer, pass QR
│   │   ├── features/    # Auth (OTP), discovery, pre-booking, trip history
│   │   ├── stores/      # Zustand cart & pre-booking store
│   │   ├── hooks/       # TanStack Query hooks & booking mutations
│   │   └── schemas/     # Zod validation schemas
│   ├── package.json
│   └── README.md
│
├── backend/             # NestJS & TypeScript Modular Monolith
│   ├── src/
│   │   ├── modules/     # Domain modules (auth, restaurants, compliance, slots,
│   │   │                #  menu, pre-bookings, batch-manifests, settlements)
│   │   ├── shared/      # Database ORM, filters, interceptors, guards, constants
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/            # Unit & E2E integration test suites
│   ├── prisma/          # SQL schema migrations & seed scripts
│   ├── package.json
│   └── README.md
│
├── docs/                # Architecture, PRD, and Engineering Documentation
│   ├── PRD.md                     # Product Requirements Document
│   ├── technical-guidelines.md    # Technical Guidelines & Architecture Rules
│   ├── database.md                # PostgreSQL Schema & Data Dictionary
│   ├── er-diagram.md              # Mermaid Entity-Relationship Architecture
│   └── hardware-device.md         # Partner Terminal & Tablet Guidelines
│
└── README.md
```

---

## 🔒 Core Business & Security Rules

1. **Compliance Activation Gate**:
   - A restaurant cannot transition to `ACTIVE` status until all 4 mandatory legal compliance documents (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`) are verified and approved by a Super Admin.
2. **Pre-Booking Split Scope**:
   - The commercial split percentage applies strictly to upfront pre-booking charges. All food and booking transactions are strictly denominated in Indian Rupees (₹).
3. **Real-Time Signature Quota Guard**:
   - Signature dishes enforce strict daily preparation limits. The booking pipeline rejects any order exceeding available quota, preventing overbooking.
4. **Strict Cut-Off Enforcement**:
   - Same-day bookings past 12:00 PM (Noon) are rejected automatically to preserve kitchen prep integrity.
5. **Multi-Tenant Isolation**:
   - Every database query executed on behalf of a hotel operator strictly filters by `restaurant_id`. Cross-tenant data leakage is strictly prohibited.
6. **Centralized Response Standard**:
   - All backend APIs return a consistent response envelope:
     ```json
     {
       "statusCode": 200,
       "success": true,
       "message": "Resource fetched successfully",
       "data": {},
       "timestamp": "2026-11-19T19:00:00.000Z"
     }
     ```

---

## 📖 Documentation Index

For in-depth architectural and functional specifications, refer to the `docs/` directory:
- [Product Requirements Document (PRD)](./docs/PRD.md) – Detailed destination user stories, business rules, and acceptance criteria.
- [Technical Guidelines](./docs/technical-guidelines.md) – Architectural design patterns, security rules, and code standards.
- [Database Schema & Data Dictionary](./docs/database.md) – Complete PostgreSQL tables, foreign keys, and indexes.
- [ER Diagram](./docs/er-diagram.md) – Visual Mermaid entity relationships and sequence diagrams.
- [Hardware & Terminal Guidelines](./docs/hardware-device.md) – Tablet deployment and PWA kiosk guidelines.

---

## 📄 License
This project is proprietary and confidential. Unauthorized copying, modification, or distribution is strictly prohibited.
