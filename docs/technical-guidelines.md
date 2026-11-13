# QuickBite – Technical Guidelines

**Document Type:** Technical Guidelines  
**Project:** QuickBite – Phase 1 MVP  
**Stack Overview:** Frontend (React, React Native), Backend (NestJS & TypeScript), Database (Relational SQL)  
**Applies To:** Admin Portal, Restaurant B2B Portal, Table QR Digital Menu, Mobile Application, Backend & Database  

---

## 1. Purpose

This document defines the technical implementation standards for building and scaling the QuickBite platform.

The PRD defines **what the product must do**. These Technical Guidelines define the standards for **how the product must be built, structured, secured, and documented**.

The implementation must remain strictly aligned with the PRD and the architectural standards detailed below.

---

# 2. Mandatory Technical Requirements

The following requirements are mandatory across the entire codebase.

### 2.1 Backend Architecture

The backend **must use a Modular Monolithic Architecture built with NestJS and TypeScript**.

- The backend is developed and deployed as a unified application while enforcing strict internal domain boundaries using NestJS modules (`@Module()`).
- Each business domain must encapsulate its controllers, services, repositories, DTOs, and entities.
- Inter-module communication must happen via exported NestJS service interfaces or internal event emitters, maintaining clean dependency injection.
- Do not implement the backend as a collection of independently deployed microservices; a modular monolith maximizes development velocity, eliminates distributed transaction overhead, and provides clear domain isolation.

### 2.2 Database

The primary application database **must be SQL-based (Relational Database)**.

Acceptable choices:
- **PostgreSQL** (Recommended)
- **MySQL**
- **Microsoft SQL Server**
- **SQLite** (for local development/testing only)

**Rules:**
- NoSQL databases (such as MongoDB, DynamoDB, Cassandra, or CouchDB) must **not** be used as the primary application database.
- Relational integrity, ACID transactions, and strict foreign keys are mandatory for financial orders, table allocations, and compliance documents.
- Supporting technologies such as **Redis** may be used for caching, WebSockets pub/sub (real-time Live Rush Board), rate limiting, and temporary session data.

### 2.3 Database Design

The database documentation and schema must include:
- Entities & Tables
- Columns & Data Types (`NUMERIC`/`DECIMAL` for financial amounts; `UUID`/`CUID` for primary keys)
- Primary Keys & Foreign Keys
- Relationships & Cardinality (1:1, 1:N, N:M)
- Table Constraints (`NOT NULL`, `UNIQUE`, `CHECK`)
- Performance Indexes
- Normalization Decisions (Target 3NF for transactional tables)
- Visual Entity-Relationship Diagram (ERD in Mermaid)

### 2.4 Application Surfaces & Tech Stack

| Surface | Target Audience | Technology | Deployment / Environment |
|---|---|---|---|
| **Admin Portal** | Super Admins & Platform Ops | **React** (TypeScript, Tailwind CSS) | Web (Desktop/Tablet) |
| **B2B Portal** | Restaurant Owners & Floor Managers | **React** (TypeScript, Tailwind CSS) | Web (Desktop/Tablet/POS) |
| **Table QR Digital Menu** | In-Venue Diners | **React** (Lightweight Responsive Web) | Mobile Browsers (Zero App Download) |
| **Mobile Application** | Restaurant Staff / Operations | **React Native** (TypeScript) | iOS & Android |
| **Backend API** | All Surfaces | **NestJS & TypeScript** | Node.js Runtime (Modular Monolith) |
| **Database** | Core Data Store | **SQL (PostgreSQL / Relational)** | Relational Database Engine |

---

# 3. UI / Brand Guidelines

## 3.1 Design Standard

The platform must maintain a clean, high-craft, professional aesthetic suitable for modern hospitality and B2B SaaS operations:
- **Admin & B2B Portals:** High-density desktop and tablet layouts with responsive dashboards, data tables, intuitive filter controls, and modal workflows.
- **Table QR Digital Menu:** Ultra-lightweight, mobile-first, thumb-friendly layout optimized for sub-second loading on cellular connections without requiring diner authentication or app downloads.
- **Mobile Application (React Native):** Native gestures, fast touch response ($\ge 44\text{px}$ touch targets), high-contrast badges for kitchen rush visibility.

## 3.2 Theme Consistency

The same visual language must be followed across all React and React Native surfaces:
- **Primary Color:** Deep Slate / Indigo Navy (professional, clean)
- **Secondary / Accent Color:** Vibrant Emerald Green (active, confirmed, online)
- **Warning / Alert Colors:** Amber Orange (pending, preparing), Crimson Red (rejected, 86'd sold-out, cancelled)
- **Backgrounds:** Clean neutral light/dark canvas (`#F8FAFC` light / `#0F172A` dark)
- **Typography:** Modern clean sans-serif (`Inter`, `system-ui`)
- **Status Indicators:**
  - `Draft` = Muted Amber
  - `Active` / `Approved` = Emerald Green
  - `Suspended` / `Rejected` = Crimson Red
  - `Confirmed` = Blue
  - `Preparing` = Amber
  - `Served` = Violet
  - `Completed` = Emerald

---

# 4. Repository Structure

The repository must follow a clean multi-project structure:

```text
project-root/
│
├── admin-portal/        # React Web Application (Super Admin)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── b2b-portal/          # React Web Application (Restaurant Management)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── table-qr-menu/       # React Mobile Web (On-Table Digital Menu & Ordering)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── mobile-app/          # React Native Cross-Platform Mobile Application
│   ├── src/
│   ├── assets/
│   ├── package.json
│   └── README.md
│
├── backend/             # NestJS & TypeScript Modular Monolith
│   ├── src/
│   │   ├── modules/
│   │   ├── shared/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── prisma/ or ormconfig/
│   ├── package.json
│   └── README.md
│
├── docs/                # Project Engineering Documentation
│   ├── PRD.md
│   ├── technical-guidelines.md
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── database.md
│   └── er-diagram.md
│
└── README.md
```

Each surface must be independently runnable, with its own dedicated scripts, linting, and environment configurations.

---

# 5. Backend Architecture – NestJS Modular Monolith

## 5.1 Architecture Standard

The backend utilizes **NestJS**, leveraging TypeScript decorators, dependency injection, and modular encapsulation to enforce domain separation.

```text
backend/src/
├── modules/
│   ├── auth/                    # Authentication, JWT, Passport, Guards
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   └── strategies/
│   │
│   ├── users/                   # Super Admins & Restaurant Owner credentials
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │
│   ├── restaurants/             # Restaurant profiles, split setting, activation gate
│   │   ├── restaurants.module.ts
│   │   ├── restaurants.controller.ts
│   │   ├── restaurants.service.ts
│   │   └── dto/
│   │
│   ├── documents/               # Legal compliance docs (FSSAI, GST, Bank, KYC)
│   │   ├── documents.module.ts
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   └── dto/
│   │
│   ├── tables/                  # Dining tables, seating capacity, QR codes
│   │   ├── tables.module.ts
│   │   ├── tables.controller.ts
│   │   ├── tables.service.ts
│   │   └── dto/
│   │
│   ├── zones/                   # Dining floor zones (Indoor, Rooftop, Patio)
│   │   ├── zones.module.ts
│   │   ├── zones.controller.ts
│   │   ├── zones.service.ts
│   │   └── dto/
│   │
│   ├── menu/                    # Categories, food items, 86'd sold-out toggle
│   │   ├── menu.module.ts
│   │   ├── menu.controller.ts
│   │   ├── menu.service.ts
│   │   └── dto/
│   │
│   ├── calendar/                # Operating hours, holiday overrides, half-day shifts
│   │   ├── calendar.module.ts
│   │   ├── calendar.controller.ts
│   │   ├── calendar.service.ts
│   │   └── dto/
│   │
│   ├── orders/                  # Table orders (QR scanned & restaurant staff punched)
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── dto/
│   │
│   ├── rush-board/              # Real-time WebSocket gateway & active order tracking
│   │   ├── rush-board.module.ts
│   │   ├── rush-board.gateway.ts
│   │   └── rush-board.service.ts
│   │
│   ├── settlements/             # Monthly financial consolidation & payout reference records
│   │   ├── settlements.module.ts
│   │   ├── settlements.controller.ts
│   │   ├── settlements.service.ts
│   │   └── dto/
│   │
│   └── reports/                 # Administrative & restaurant operational analytics
│       ├── reports.module.ts
│       ├── reports.controller.ts
│       └── reports.service.ts
│
├── shared/
│   ├── database/                # Relational SQL ORM configuration & migrations
│   ├── filters/                 # Global HTTP exception filters
│   ├── interceptors/            # Transform response & logging interceptors
│   ├── guards/                  # RolesGuard, JwtAuthGuard, QrSignatureGuard
│   ├── decorators/              # Custom decorators (@CurrentUser, @Roles)
│   ├── constants/               # Global enums, error codes
│   └── utils/                   # Crypto HMAC utilities, math helpers
│
├── app.module.ts                # Root module assembling all domain modules
└── main.ts                      # Bootstrap entry point (CORS, Pipes, Swagger)
```

## 5.2 NestJS Request Pipeline

Every incoming API request passes through a strictly typed, standard NestJS lifecycle:

```text
HTTP Request (React / React Native / QR Web)
  ↓
Global Middleware (CORS, Helmet, Rate Limiter)
  ↓
Guards (JwtAuthGuard, RolesGuard, QrSignatureGuard)
  ↓
Interceptors (LoggingInterceptor, TimeoutInterceptor)
  ↓
Pipes (ValidationPipe via class-validator / Zod)
  ↓
Controller (@Controller routes - receives validated DTO)
  ↓
Service (@Injectable - business logic, activation checks, stock validations)
  ↓
Repository / Data Access Layer (SQL queries via Prisma / TypeORM)
  ↓
SQL Database (PostgreSQL)
  ↓
Response Transform Interceptor ({ success: true, data: ... })
  ↓
HTTP Response
```

- **Controllers** remain thin: they only extract request parameters/body, invoke services, and return responses.
- **Services** encapsulate all domain rules (e.g., verifying compliance document status before allowing activation, checking item stock before placing orders).
- Direct raw database queries must never be written inside controllers.

---

# 6. Business Domain Module Boundaries

| Module | Core Responsibility | Key Invariants |
|---|---|---|
| **Auth** | Login, JWT generation, password verification | Passwords hashed with bcrypt (salt factor $\ge 10$); tokens carry `userId`, `role`, `restaurantId`. |
| **Users** | Account management for Admins and Restaurant Owners | Email uniqueness enforced by database constraint. |
| **Restaurants** | Profile data, commercial split percentage configuration, status | Activation Gate: Status cannot change to `ACTIVE` unless all 4 mandatory docs are `APPROVED`. |
| **Documents** | FSSAI, GST, Bank Proof, KYC ID uploads & approvals | Private file storage; approval/rejection logged with admin ID and timestamp. |
| **Tables & Zones** | Floor layout, table capacities, QR token generation | Cryptographic HMAC binding each QR URL to a valid physical table. |
| **Menu** | Categories, dishes, prices, photos, dietary tags, stock status | Instant 86'd sold-out toggle updates status; orders containing sold-out items are rejected. |
| **Calendar** | Operating hours, half-day shift limits, holiday overrides | Holiday overrides completely block dining orders; half-day overrides clamp active hours. |
| **Orders** | QR-placed and manual staff-punched dining orders | Atomic SQL transaction; gross order amount recorded; order items snapshot food name & unit price. |
| **Rush Board** | Real-time Kanban board for kitchen and floor staff | WebSocket events broadcast status updates (`Confirmed` → `Preparing` → `Served` → `Completed`). |
| **Settlements** | Monthly gross billing consolidation and UTR payout recording | Commercial split ratio used for reporting; bank payout reference tracked with admin audit log. |
| **Reports** | Operational metrics, gross sales summaries, popular dishes | Read-only aggregation queries optimized with database indexes. |

---

# 7. API Guidelines

## 7.1 Style and Versioning

The backend exposes a standardized RESTful HTTP API with version prefix `/api/v1/`:

```text
POST   /api/v1/auth/login
GET    /api/v1/restaurants
POST   /api/v1/restaurants
GET    /api/v1/restaurants/:id/documents
PATCH  /api/v1/documents/:id/status
GET    /api/v1/restaurants/:id/tables
POST   /api/v1/restaurants/:id/tables
GET    /api/v1/menu/items
PATCH  /api/v1/menu/items/:id/stock
POST   /api/v1/orders
GET    /api/v1/orders/live
PATCH  /api/v1/orders/:id/status
POST   /api/v1/settlements/monthly
```

## 7.2 Standard Response Format

Successful responses must be wrapped consistently (via a NestJS `TransformInterceptor`):

```json
{
  "success": true,
  "data": {
    "orderId": "ord_88291a",
    "orderNumber": "QB-1042",
    "tableNumber": "T-12",
    "status": "CONFIRMED",
    "totalAmount": 1250.00
  },
  "message": "Order placed successfully",
  "timestamp": "2026-11-13T18:50:00.000Z"
}
```

Error responses must be captured via a global `HttpExceptionFilter`:

```json
{
  "success": false,
  "error": {
    "code": "ACTIVATION_GATE_BLOCKED",
    "message": "Restaurant cannot be activated: mandatory compliance documents are missing or pending approval.",
    "details": {
      "missingOrUnapproved": ["DOC_FSSAI", "DOC_BANK"]
    }
  },
  "timestamp": "2026-11-13T18:50:00.000Z"
}
```

## 7.3 HTTP Status Codes

- `200 OK` – Successful GET, PATCH, or PUT
- `201 Created` – Successful resource creation (POST)
- `204 No Content` – Successful request with empty response
- `400 Bad Request` – Malformed payload or validation error
- `401 Unauthorized` – Missing or invalid authentication token
- `403 Forbidden` – Insufficient role permissions or cross-tenant access violation
- `404 Not Found` – Resource does not exist
- `409 Conflict` – Resource conflict (e.g. duplicate email, table overlap)
- `422 Unprocessable Entity` – Business rule violation (e.g. activating without approved docs)
- `500 Internal Server Error` – Unhandled server exception (sanitized in production)

---

# 8. Database & Data Modeling Guidelines

## 8.1 Primary Database Standards

The database **must be relational SQL** (PostgreSQL recommended).

- **Primary Keys:** Use `UUIDv4` or `CUID` strings for distributed safety and unguessable IDs.
- **Foreign Keys:** Enforce referential integrity at the database level with explicit `ON DELETE RESTRICT` or `ON DELETE CASCADE` rules.
- **Financial Fields:** Store all prices, item rates, gross amounts, and split totals using `DECIMAL(10, 2)` or `NUMERIC(10, 2)`. **Never use floating-point types (`FLOAT`, `DOUBLE`) for currency.**
- **Timestamps:** Every table must include `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()` and `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`.

## 8.2 Indexing Strategy

Ensure compound or single-column indexes on high-throughput query columns:
- `restaurants(status)`
- `compliance_documents(restaurant_id, document_type)`
- `restaurant_tables(restaurant_id, zone_id)`
- `menu_categories(restaurant_id, display_order)`
- `food_items(restaurant_id, category_id, is_available)`
- `table_orders(restaurant_id, status, created_at)`
- `table_orders(table_id, status)`
- `calendar_overrides(restaurant_id, override_date)`
- `monthly_settlements(restaurant_id, billing_month)`

---

# 9. Order Lifecycle & Real-Time Sync

## 9.1 Atomic Order Submission Pipeline

When a diner submits an order via the React Table QR Web client or restaurant staff punches an order in the React B2B Portal, the backend executes an atomic SQL transaction:

```text
1. Validate Table ID & Cryptographic HMAC Signature
   ↓
2. Verify Restaurant is Open (Operating Hours & Calendar Holiday Check)
   ↓
3. Validate Dishes:
   - Verify every item exists and belongs to the restaurant
   - Verify is_available = true (reject immediately if any dish is 86'd / sold out)
   ↓
4. Calculate Totals (Gross Item Amounts, Taxes)
   ↓
5. Insert table_orders record (Status: CONFIRMED)
   ↓
6. Insert order_items records (Snapshot item_name, unit_price, quantity)
   ↓
7. Update Table State: Mark Table Occupied
   ↓
8. Commit SQL Transaction
   ↓
9. Emit WebSocket Event to RushBoardGateway
   (Instantly alerts Restaurant B2B Portal & Mobile App)
```

## 9.2 Real-Time Rush Board Updates

- **NestJS Gateway:** A dedicated `RushBoardGateway` using `@nestjs/websockets` (Socket.io) handles room-based pub/sub isolated by `restaurantId`.
- **Status Transitions:** As kitchen or waitstaff move an order from `CONFIRMED` → `PREPARING` → `SERVED` → `COMPLETED`, events are pushed to connected clients in $\le 500\text{ms}$.
- **Instant 86'd Stock Toggle:** When a dish is toggled sold-out on the B2B portal or staff mobile app, an event notifies all active Table QR diner menus to grey out the item immediately.

---

# 10. Naming Conventions

### Files & Folders
- Folders: `kebab-case` (e.g. `admin-portal`, `b2b-portal`, `table-qr-menu`, `mobile-app`, `rush-board`)
- NestJS files: Standard NestJS naming:
  - `[name].module.ts`
  - `[name].controller.ts`
  - `[name].service.ts`
  - `[name].entity.ts` / `[name].model.ts`
  - `[name].gateway.ts`
  - `create-[name].dto.ts`
  - `update-[name].dto.ts`
- React / React Native components: `PascalCase` (e.g. `RushBoard.tsx`, `TableGrid.tsx`, `MenuCategoryCard.tsx`)
- Hooks: `camelCase` with `use` prefix (e.g. `useTableOrders.ts`, `useLiveMenu.ts`)

### Code Conventions (TypeScript)
- Variables & Functions: `camelCase` (e.g. `restaurantId`, `calculateTotalGross()`, `toggleItemAvailability()`)
- Classes, Types & Interfaces: `PascalCase` (e.g. `RestaurantService`, `TableOrder`, `OrderStatus`)
- Constants & Enums: `UPPER_SNAKE_CASE` (e.g. `MAX_FILE_SIZE_BYTES`, `ORDER_STATUS_CONFIRMED`)

### Database (SQL)
- Tables: Plural `snake_case` (e.g. `companies_restaurants`, `compliance_documents`, `food_items`, `table_orders`)
- Columns: `snake_case` (e.g. `restaurant_id`, `unit_price`, `is_available`, `created_at`)

---

# 11. Authentication & Security Guidelines

## 11.1 Authentication Surfaces

1. **Super Admin (React Admin Portal):**
   - Authenticated via secure email/password and JWT Bearer tokens.
   - Authorized with `@Roles('SUPER_ADMIN')` Guard.
2. **Restaurant Owner (React B2B Portal & React Native Mobile App):**
   - Authenticated via email/password and JWT Bearer tokens containing `restaurantId`.
   - Authorized with `@Roles('RESTAURANT_OWNER')` Guard.
   - **Tenant Isolation:** Every service query strictly filters by `restaurantId` from the authenticated user context. An owner can never query or mutate another restaurant's data.
3. **Table QR Diner (React Mobile Web):**
   - Zero-login, frictionless ordering.
   - Authenticated via signed URL parameters: `?table=:tableId&sig=:hmac`.
   - `QrSignatureGuard` validates HMAC signature against a secret restaurant key to prevent URL tampering.

## 11.2 Security Standards

- **Password Hashing:** `bcrypt` with salt rounds $\ge 10$, or `argon2`.
- **SQL Injection Prevention:** All queries use parameterized statements or a type-safe ORM (Prisma / TypeORM). No string concatenation in SQL queries.
- **XSS & Headers:** NestJS `helmet` enabled for security headers; input validation pipes stripping unwhitelisted properties (`whitelist: true, forbidNonWhitelisted: true`).
- **Secrets Management:** Environment variables managed via `@nestjs/config`. Never commit `.env` files. Always provide `.env.example`.
- **CORS:** Restricted to verified origins (Admin web URL, B2B web URL, Table QR web URL).
- **Document Storage:** Private cloud storage (AWS S3) with pre-signed URLs (valid for 15 minutes) generated exclusively for authenticated Admin document reviews.

---

# 12. Testing Guidelines

## 12.1 Backend Testing (NestJS)
- **Unit Tests (`*.spec.ts`):** Test individual services using Jest with mocked repositories and external dependencies.
- **Integration & E2E Tests (`test/*.e2e-spec.ts`):** Use Supertest against the NestJS testing module to test end-to-end API flows:
  - Activation gate enforcement (blocking activation without approved documents).
  - Instant stock 86'd check (order rejection on sold-out dishes).
  - Table order placement and status progression.
  - Multi-tenant data isolation.

## 12.2 Frontend Testing (React & React Native)
- **Component Tests:** Test critical UI components (menu cart, order status badges, sold-out toggles) using React Testing Library.
- **Key Journeys:**
  - *Admin Flow:* Login → Approve Compliance Docs → Activate Restaurant.
  - *Restaurant Owner Flow:* Login → Create Zones/Tables → Build Menu → Receive Live Rush Order → Change Status.
  - *Diner Flow:* Scan Table QR → View Menu → Place Order → Live Confirmation.

---

# 13. Documentation Requirements

The root `docs/` folder contains the project's technical documentation:

```text
docs/
├── PRD.md                     # Product Requirements Document
├── technical-guidelines.md    # Technical standards, stack, and architecture
├── architecture.md            # Modular Monolith design, NestJS modules & request flow
├── api-documentation.md       # REST endpoints, schemas, and example payloads
├── database.md                # Relational SQL schema, tables, types, and constraints
├── er-diagram.md              # Entity-Relationship diagram (Mermaid)
├── naming-conventions.md      # Code, database, and API naming rules
├── environment.md             # Inventory of required environment variables
├── installation.md            # Local setup, DB migrations, seed scripts, and run steps
├── deployment.md              # Build instructions, production environment setup
├── technical-decisions.md     # Architecture Decision Records (ADRs)
├── security.md                # Auth, tenant isolation, and document protection
├── testing.md                 # Test strategy, execution guides, and sample runs
├── known-issues.md            # Transparent limitations and pending enhancements
└── workflows.md               # End-to-end operational workflows
```

---

# 14. PRD Compliance & Activation Gate Enforcement

The backend API and UI workflows must strictly enforce the following rules from the PRD:

1. **Activation Gate:** The backend API must reject any request to set a restaurant's status to `Active` unless all 4 mandatory compliance documents (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`) are in `Approved` state.
2. **Split Ratio Scope:** The commercial split ratio is an Admin profile configuration setting only. It must **not** execute automated order deductions or alter customer bill totals in Phase 1 or Phase 2.
3. **Instant Stock (86'd) Guard:** Dishes marked `is_available = false` must be immediately rejected if submitted in an order.
4. **Calendar Override Hierarchy:** `Holiday` overrides block all bookings/orders for the date; `Half Day` overrides clamp active slots to the shift window; unmodified days inherit `Full Day` default operating hours.
5. **Restaurant Order Punching:** B2B Portal and staff mobile app must allow restaurant staff to manually create and manage active table orders without requiring customer QR scanning.

---

# 15. Technical Review Checklist

Before releasing each phase, verify:

### Architecture & Backend
- [ ] Backend is structured as a NestJS Modular Monolith with TypeScript.
- [ ] Primary database is Relational SQL (PostgreSQL).
- [ ] NestJS Controllers are thin; business logic is encapsulated in `@Injectable()` services.
- [ ] Database queries are parameterized and handled via ORM / repositories.

### Frontend Applications
- [ ] Admin Portal built with React.
- [ ] Restaurant B2B Portal built with React.
- [ ] Table QR Digital Menu built with React (lightweight mobile web).
- [ ] Mobile Application built with React Native.
- [ ] Live Rush Board reflects real-time order updates via WebSockets.

### Security & Compliance
- [ ] Activation gate blocks unverified restaurants from activating.
- [ ] Tenant data isolation strictly enforced per restaurant.
- [ ] Passwords hashed with bcrypt / argon2.
- [ ] `.env.example` provided for every project surface; no secrets committed to Git.
- [ ] Compliance documents stored securely with private access controls.
