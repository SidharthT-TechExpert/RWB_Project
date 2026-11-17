# QuickBite 🍽️

> **Next-Generation Restaurant B2B Operations & Table QR SaaS Platform**  
> Streamlining table turns, eliminating order-taking friction, and empowering restaurant operators with real-time rush intelligence.

---

## 📌 Executive Summary

**QuickBite** is an enterprise-grade B2B SaaS platform designed for modern hospitality businesses. In traditional dining environments, customers spend significant time waiting for waitstaff to bring physical menus, take manual orders, and process bills during peak dining rushes. This friction overwhelms floor staff, leads to dining bottlenecks, and reduces daily table turnaround rates.

**QuickBite solves this challenge** by providing:
1. **Unified Customer Application (Pre-Booking & In-Venue QR Ordering)**: Diners discover venues, reserve slots, and pre-order meals ahead of time, or scan in-venue table QR codes via the Customer Application to place orders directly to the kitchen.
2. **Restaurant B2B Portal**: A comprehensive operational web suite for restaurant owners and floor staff to configure table floor plans, build categorized menus with instant sold-out (86'd) stock toggles, manage operating calendars, punch manual orders, and manage live orders via a real-time **Live Rush Board**.
3. **Super Admin SaaS Operations**: A platform-wide command center for onboarding restaurant partners, enforcing legal compliance via an automated **Activation Gate**, configuring commercial split rates, and generating monthly billing settlements.

---

## 🎯 Core Capabilities

- **Super Admin SaaS Operations**: Restaurant partner onboarding, 4-document legal compliance verification (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`), pre-booking split configuration, Daily Settlement Tab (T+X day food payouts, created vs completed pre-booking counts, bank UTR recording), and automated invoice generation.
- **Restaurant B2B SaaS Operations**: Floor zones, table inventory setup, printable table QR generation, slot availability engine, operating calendar overrides, live food menu builder with instant sold-out (86'd) toggle, staff order punching, walk-in reservations, Daily Settlements tab, Invoices section with downloadable receipts, automated category-routed kitchen thermal printing (KOT), and Kitchen Live Rush Board.
- **Unified Customer Application (Pre-Booking & In-Venue Spot QR Ordering)**: Single customer-facing application combining advance venue discovery, table/slot reservations, and pre-ordered meals (transacted in INR / ₹), alongside an integrated in-venue table QR camera scanner for instant spot food ordering, anti-fraud identification, and live kitchen progression tracking.

---

## 🛠️ Technology Stack

QuickBite utilizes a modern, typed, and resilient tech stack optimized for performance, low-latency WebSocket sync, and high security:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND SURFACES                                      │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Portals (Admin & B2B PWA)      │ React PWA (Vite, vite-plugin-pwa, Standalone Mode)    │
│ Unified Customer App (Diners)  │ React Native (Cross-Platform iOS & Android Mobile App)│
│ Form & Input Validation        │ Zod (Strict schema validation across all inputs)      │
│ Client State Management        │ Zustand (Lightweight modular client UI stores)        │
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
│ Message Management             │ Centralized Message Dictionary (`messages.constant`)  │
│ Security Measurements          │ Helmet, Throttler, Bcrypt, JWT, HMAC QR Guard, CORS   │
│ Primary Database               │ Relational SQL (PostgreSQL Recommended)               │
│ In-Memory Data Store           │ Redis (WebSocket Pub/Sub, Throttling & Fast Cache)    │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
Qickbite/
│
├── admin-portal/        # React PWA (Super Admin Platform Operations)
│   ├── src/
│   │   ├── components/  # Shared layouts, data tables, modal dialogs
│   │   ├── features/    # Restaurant onboarding, KYC verification, settlements
│   │   ├── stores/      # Zustand client stores (auth, UI)
│   │   ├── hooks/       # TanStack Query custom hooks
│   │   └── schemas/     # Zod form validation schemas
│   ├── package.json
│   └── README.md
│
├── b2b-portal/          # React PWA (Restaurant Operations & Kitchen Rush Board)
│   ├── src/
│   │   ├── components/  # Layouts, table grids, menu cards
│   │   ├── features/    # Zones, tables, menu builder, rush board, order punching, printers
│   │   ├── stores/      # Zustand client stores
│   │   ├── hooks/       # TanStack Query hooks & WebSocket listeners
│   │   └── schemas/     # Zod validation schemas
│   ├── package.json
│   └── README.md
│
├── customer-app/        # Unified Customer App (Food & Table Pre-Booking + In-Venue QR Ordering)
│   ├── src/
│   │   ├── screens/     # Discovery, pre-booking slots, advance pre-order, passes, table menu
│   │   ├── components/  # QR camera scanner, sticky category nav, dish cards, cart drawer
│   │   ├── features/    # auth (OTP), discovery, pre-booking, spot-ordering, history
│   │   ├── stores/      # Zustand unified cart, table session & booking store
│   │   ├── hooks/       # TanStack Query hooks & order mutations
│   │   └── schemas/     # Zod validation schemas
│   ├── package.json
│   └── README.md
│
├── backend/             # NestJS & TypeScript Modular Monolith
│   ├── src/
│   │   ├── modules/     # 12 domain modules (auth, users, restaurants, documents,
│   │   │                #  tables, zones, menu, calendar, orders, rush-board, settlements)
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
│   └── technical-guidelines.md    # Technical Guidelines & Architecture Rules
│
└── README.md
```

---

## 🔒 Core Business & Security Rules

1. **Compliance Activation Gate**:
   - A restaurant cannot transition to `ACTIVE` status until all 4 mandatory legal compliance documents (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`) are verified and approved by a Super Admin.
2. **Commercial Split Ratio**:
   - Configured by Super Admins as an administrative reference. It does **not** execute automated deductions or alter diner bill amounts. All orders record gross amounts.
3. **Instant 86'd Stock Protection**:
   - Marking a dish unavailable updates the status in $\le 500\text{ms}$. The backend order submission pipeline immediately rejects any incoming cart containing an 86'd item.
4. **Cryptographic QR Validation**:
   - On-table QR URLs are bound with an HMAC signature (`?table=:id&sig=:hmac`). The backend `QrSignatureGuard` validates this signature before rendering menus or accepting orders, preventing malicious spoofing.
5. **Multi-Tenant Isolation**:
   - Every database query executed on behalf of a restaurant operator strictly checks `restaurant_id`. Cross-tenant data leakage is strictly prohibited.
6. **Centralized Response Standard**:
   - All backend APIs return a consistent response envelope:
     ```json
     {
       "statusCode": 200,
       "success": true,
       "message": "Resource fetched successfully",
       "data": {},
       "timestamp": "2026-11-13T19:00:00.000Z"
     }
     ```

---

## 📖 Documentation Index

For in-depth architectural and functional specifications, refer to the `docs/` directory:
- [Product Requirements Document (PRD)](./docs/PRD.md) – Detailed user stories, business rules, and acceptance criteria.
- [Technical Guidelines](./docs/technical-guidelines.md) – Architectural design patterns, security rules, and code standards.

---

## 📄 License
This project is proprietary and confidential. Unauthorized copying, modification, or distribution is strictly prohibited.
