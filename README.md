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

## 🚀 Phased Roadmap

| Phase | Strategic Scope | Status |
|---|---|---|
| **Phase 1 (MVP)** | **B2B SaaS Core Operations & On-Table QR Ordering**<br>• Super Admin Portal (onboarding, 4-document legal compliance gate, commercial split profile setting, monthly sales consolidation).<br>• Restaurant B2B Portal (zones, tables, QR generation, instant 86'd menu toggle, calendar overrides, staff order punching, Live Rush Board).<br>• Table QR Digital Menu (responsive mobile web, HMAC security, zero app download). | **Active Development** |
| **Phase 2** | **Role-Based Management System (RBMS)**<br>• Admin RBMS (`Super Admin`, `Support Agent`, `Finance Auditor`).<br>• Restaurant RBMS (`Owner`, `Branch Manager`, `Captain/Cashier`, `Kitchen/KDS Staff`). | Planned |
| **Phase 3** | **Enterprise Scale & Hardware Integrations**<br>• Multi-branch consolidated operations, central commissary inventory management, thermal ESC/POS cloud printing, payment gateway webhooks. | Planned |

---

## 🛠️ Technology Stack

QuickBite utilizes a modern, typed, and resilient tech stack optimized for performance, low-latency WebSocket sync, and high security:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND SURFACES                                      │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Web Portals (Admin & B2B)      │ React (TypeScript, Tailwind CSS)                      │
│ On-Table Digital Menu (Diners) │ React (Lightweight Responsive Web, Zero App Download) │
│ Form & Input Validation        │ Zod (Strict schema validation across all inputs)      │
│ Client State Management        │ Zustand (Lightweight modular client UI stores)        │
│ Server State & Data Caching    │ TanStack Query v5 (Data fetching, caching & sync)     │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
                                           │
                                  HTTP REST / WebSockets
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
   - Configured by Super Admins as an administrative reference. It does **not** execute automated deductions or alter diner bill amounts in Phase 1 or 2. All orders record gross amounts.
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

## ⚡ Getting Started

### Prerequisites
- **Runtime Environment**: Node.js (`v20.x` or higher)
- **Backend Framework**: NestJS (`v10.x` / `@nestjs/cli`)
- **Package Manager**: `npm` or `pnpm`
- **Primary Database**: PostgreSQL (`v15+` or any standard SQL engine)
- **In-Memory Store**: Redis (`v7+` for WebSockets pub/sub and rate limiting)

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SidharthT-TechExpert/Qickbite.git
   cd Qickbite
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npm run start:dev
   ```

3. **Frontend Setup**:
   ```bash
   # In separate terminal windows:
   cd admin-portal && npm install && npm run dev
   cd b2b-portal && npm install && npm run dev
   cd table-qr-menu && npm install && npm run dev
   ```

---

## 📖 Documentation Index

For in-depth architectural and functional specifications, refer to the `docs/` directory:
- [Product Requirements Document (PRD)](./docs/PRD.md) – Detailed user stories, business rules, and acceptance criteria.
- [Technical Guidelines](./docs/technical-guidelines.md) – Architectural design patterns, security rules, and code standards.

---

## 📄 License
This project is proprietary and confidential. Unauthorized copying, modification, or distribution is strictly prohibited.
