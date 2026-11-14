# QuickBite 🍽️

> **Next-Generation Restaurant B2B Operations & Table QR SaaS Platform**  
> Streamlining table turns, eliminating order-taking friction, and empowering restaurant operators with real-time rush intelligence.

---

## 📌 Executive Summary

**QuickBite** is an enterprise-grade B2B SaaS platform designed for modern hospitality businesses. In traditional dining environments, customers spend significant time waiting for waitstaff to bring physical menus, take manual orders, and process bills during peak dining rushes. This friction overwhelms floor staff, leads to dining bottlenecks, and reduces daily table turnaround rates.

**QuickBite solves this challenge** by providing:
1. **Frictionless On-Table QR Ordering**: Diners scan an HMAC-secured physical table QR code to view live, dynamic digital menus and place orders directly to the kitchen from their mobile browser—**with zero app downloads required**.
2. **Restaurant B2B Portal**: A comprehensive operational web suite for restaurant owners and floor staff to configure table floor plans, build categorized menus with instant sold-out (86'd) stock toggles, manage operating calendars, punch manual orders, and manage live orders via a real-time **Live Rush Board**.
3. **Super Admin SaaS Operations**: A platform-wide command center for onboarding restaurant partners, enforcing legal compliance via an automated **Activation Gate**, configuring commercial split rates, and generating monthly billing settlements.

---

## 🎯 Core Capabilities

- **Super Admin SaaS Operations**: Restaurant partner onboarding, 4-document legal compliance verification (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`), commercial split profile reference, and automated monthly gross sales billing consolidation.
- **Restaurant B2B SaaS Operations**: Floor zones, table inventory setup, printable high-resolution table QR generation, slot availability engine, operating calendar overrides, live food menu builder with instant sold-out (86'd) toggle, staff manual order punching, walk-in reservations, and real-time Kitchen Live Rush Board.
- **Customer Mobile App (Food & Table Pre-Booking)**: Cross-platform mobile application for diners to discover partner venues, reserve time slots, select party sizes, and pre-order meals in advance to eliminate all waiting upon arrival.
- **Spot Food Booking (Table QR Menu)**: Frictionless on-table digital menu accessible via smartphone cameras with zero app downloads or logins, securely bound to the table ID, featuring instant kitchen ticket dispatch.

---

## 🛠️ Technology Stack

QuickBite utilizes a modern, typed, and resilient tech stack optimized for performance, low-latency WebSocket sync, and high security:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND SURFACES                                      │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Web Portals (Admin & B2B)      │ React (TypeScript, Tailwind CSS)                      │
│ Customer Mobile App (Diners)   │ React Native (Cross-Platform iOS & Android)           │
│ On-Table Digital Menu (Spot)   │ React (Lightweight Responsive Web, Zero App Download) │
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
├── admin-portal/        # React Web Application (Super Admin Operations)
│   ├── src/
│   │   ├── components/  # Shared layouts, data tables, modal dialogs
│   │   ├── features/    # Restaurant onboarding, KYC verification, settlements
│   │   ├── stores/      # Zustand client stores (auth, UI)
│   │   ├── hooks/       # TanStack Query custom hooks
│   │   └── schemas/     # Zod form validation schemas
│   ├── package.json
│   └── README.md
│
├── b2b-portal/          # React Web Application (Restaurant Management)
│   ├── src/
│   │   ├── components/  # Layouts, table grids, menu cards
│   │   ├── features/    # Zones, tables, menu builder, rush board, order punching
│   │   ├── stores/      # Zustand client stores
│   │   ├── hooks/       # TanStack Query hooks & WebSocket listeners
│   │   └── schemas/     # Zod validation schemas
│   ├── package.json
│   └── README.md
│
├── table-qr-menu/       # React Mobile Web (In-Venue On-Table Digital Menu)
│   ├── src/
│   │   ├── components/  # Sticky category nav, dish cards, cart bottom drawer
│   │   ├── stores/      # Zustand cart & session store
│   │   ├── hooks/       # TanStack Query menu fetching & order mutation
│   │   └── schemas/     # Zod order submission schemas
│   ├── package.json
│   └── README.md
│
├── customer-app/        # React Native Mobile App (Food & Table Pre-Booking)
│   ├── src/
│   │   ├── screens/     # Venue discovery, slot booking, meal pre-order, booking passes
│   │   ├── components/  # Time slot picker, party size selector, dish cards
│   │   ├── stores/      # Zustand booking & pre-order store
│   │   ├── hooks/       # TanStack Query hooks & booking mutations
│   │   └── schemas/     # Zod reservation schemas
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
