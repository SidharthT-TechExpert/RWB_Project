# QuickBite Buildathon – Technical Guidelines

**Document Type:** Technical Guidelines  
**Project:** QuickBite – Phase 1 MVP  
**Applies To:** Admin Portal, Restaurant B2B Portal, Table QR Digital Menu, Backend & Database  
**Status:** Mandatory for all teams  

---

## 1. Purpose

This document defines the technical implementation standards that teams must follow while building the QuickBite platform during the Buildathon.

The PRD defines **what the product must do**. These Technical Guidelines define the minimum standards for **how the product should be built, structured, documented, and submitted**.

Teams are free to choose suitable technologies where this document does not specify a mandatory choice.

The implementation must remain strictly aligned with the PRD and the official Buildathon Guidelines.

---

# 2. Mandatory Technical Requirements

The following requirements are mandatory.

### 2.1 Backend Architecture

The backend **must use a Modular Monolithic Architecture**.

The backend should be developed as one deployable application while maintaining clear internal modules based on business domains.

Do not implement the backend as a collection of independently deployed microservices for this Buildathon unless explicitly approved by the organizers.

### 2.2 Database

The primary application database **must be SQL-based**.

Acceptable examples include:
- PostgreSQL (Recommended)
- MySQL
- Microsoft SQL Server
- SQLite
- Oracle
- Other suitable relational SQL databases

NoSQL databases such as MongoDB, DynamoDB, Cassandra, or CouchDB must not be used as the primary application database.

Supporting technologies such as Redis may be used for appropriate purposes such as caching, WebSockets pub/sub, queues, or temporary session data.

### 2.3 Database Design Submission

The database design must be prepared and submitted **within the first 2 days of the Buildathon**.

The database documentation must include, where applicable:
- Entities
- Tables
- Columns
- Data types
- Primary keys
- Foreign keys
- Relationships
- Constraints
- Cardinality
- Indexes
- Normalization decisions
- ER Diagram
- Important database design decisions

### 2.4 Application Surfaces

The project must contain:
1. **Admin Portal:** Web application for Super Admins to manage onboarding, documents, split settings, global orders, and monthly settlements.
2. **B2B Portal:** Web application for Restaurant Owners to manage floor zones, tables, table QR codes, menus, instant stock (86'd) toggles, availability calendars, manual order punching, and live rush boards.
3. **Table QR Digital Menu:** Responsive mobile web interface for in-venue diners scanning physical table QR codes (zero customer app download required).
4. **Backend:** Dedicated server-side modular monolith with relational SQL database access.

---

# 3. UI / Brand Guidelines

## 3.1 Design Reference

The portals must maintain a clean, high-craft, professional aesthetic suitable for modern hospitality and B2B SaaS operations.

**Design Standard:**
- Responsive desktop and tablet optimization for Admin and B2B Portals.
- Mobile-first, thumb-friendly, sub-second responsive layout for the Table QR Digital Menu.
- High contrast, dark/light theme cohesion, accessible touch targets ($\ge 44\text{px}$ on mobile), and clear visual status indicators.

## 3.2 Theme Consistency

The same visual language must be followed across:
- Admin Portal
- Restaurant B2B Portal
- Table QR Digital Menu

Teams must maintain consistency in:
- Primary colour
- Secondary colour
- Background colours
- Text colours
- Button styles
- Input styles
- Status indicators (e.g., `Draft` = Amber, `Active` = Green, `Suspended` = Red)
- Cards
- Navigation
- Typography
- Border radius
- Spacing
- Icons
- Error/success states

The B2B Portal and Table QR Menu should feel like parts of the same cohesive hospitality ecosystem.

## 3.3 Logo

The official QuickBite logo and brand assets must be used consistently across all three surfaces.

Do not modify the logo's proportions, shape, or visual identity without approval.

---

# 4. Repository Structure

The root repository **must follow this structure**:

```text
project-root/
│
├── admin-portal/
│
├── b2b-portal/
│
├── table-qr-menu/
│
├── backend/
│
├── docs/
│
└── README.md
```

Each application must remain independently understandable, runnable, and maintainable.

## 4.1 Admin Portal

```text
admin-portal/
├── src/
├── public/
├── tests/
├── package.json
└── README.md
```

## 4.2 B2B Portal

```text
b2b-portal/
├── src/
├── public/
├── tests/
├── package.json
└── README.md
```

## 4.3 Table QR Digital Menu (Customer Surface)

```text
table-qr-menu/
├── src/
├── public/
├── tests/
├── package.json
└── README.md
```

## 4.4 Backend

```text
backend/
├── src/
├── tests/
├── migrations/
├── seed/
├── package.json
└── README.md
```

---

# 5. Backend Architecture – Modular Monolith

## 5.1 Mandatory Architecture

The backend must follow a **Modular Monolithic Architecture**.

A recommended structure is:

```text
backend/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── restaurants/
    │   ├── documents/
    │   ├── tables/
    │   ├── zones/
    │   ├── menu/
    │   ├── calendar/
    │   ├── orders/
    │   ├── rush-board/
    │   ├── settlements/
    │   └── reports/
    │
    ├── shared/
    │   ├── database/
    │   ├── middleware/
    │   ├── errors/
    │   ├── utils/
    │   ├── constants/
    │   └── types/
    │
    ├── config/
    ├── routes/
    └── app.*
```

The exact module names may be adjusted based on the final implementation, but business domains must remain clearly separated.

## 5.2 Module Independence

Each module should ideally contain its own:

```text
module/
├── controller/
├── service/
├── repository/
├── model/
├── routes/
├── validation/
└── types/
```

Not every module must contain every directory. Only introduce layers that are actually required.

## 5.3 Recommended Request Flow

A typical API request should follow a predictable flow:

```text
Client
  ↓
Route
  ↓
Authentication / Authorization
  ↓
Validation (e.g. Zod / Joi)
  ↓
Controller
  ↓
Service / Business Logic
  ↓
Repository / Data Access (ORM / Query Builder)
  ↓
SQL Database (PostgreSQL)
```

- Business rules should not be placed directly inside route handlers.
- Controllers should remain thin and delegate business logic to services.
- Database queries should not be scattered throughout controllers.

---

# 6. Business Module Boundaries

Based on the PRD, the following domains should be considered when designing the backend:

| Module | Responsibility |
|---|---|
| **Auth** | Login, authentication, token/session handling, password hashing |
| **Users / Admins** | Super admin accounts and restaurant owner user profiles |
| **Restaurants** | Restaurant profile onboarding, address, settings, commercial split ratio configuration |
| **Documents** | Compliance document uploads, metadata tracking, and admin approval/rejection |
| **Tables & Zones** | Floor zones, physical tables, seating capacity, cryptographic QR token binding |
| **Menu** | Categories, dish items, pricing, photos, dietary tags, live 86'd stock toggle |
| **Calendar** | Operating hours, base full-day schedule, half-day shifts, and holiday overrides |
| **Orders** | Table orders placed via QR scan or manually created/punched by restaurant staff |
| **Rush Board** | Real-time active orders and reservation board, status transitions (`Confirmed` → `Preparing` → `Served` → `Completed`) |
| **Settlements** | Month-end gross sales consolidation, billing statements, and admin payout reference tracking |
| **Reports** | Admin platform analytics and restaurant owner operational reports |

The final module boundaries must be documented in `docs/architecture.md`.

---

# 7. API Guidelines

## 7.1 API Style

The backend should expose a consistent HTTP RESTful API.

Example:

```text
GET    /api/v1/restaurants
POST   /api/v1/restaurants
GET    /api/v1/restaurants/:id/tables
POST   /api/v1/restaurants/:id/tables
GET    /api/v1/restaurants/:id/menu
PATCH  /api/v1/menu/items/:id/stock
POST   /api/v1/orders
GET    /api/v1/orders/live
PATCH  /api/v1/orders/:id/status
POST   /api/v1/settlements/monthly
```

## 7.2 API Versioning

Use API versioning across all endpoints:

```text
/api/v1/...
```

## 7.3 Consistent Response Format

Successful responses should follow a consistent structure:

```json
{
  "success": true,
  "data": {},
  "message": "Resource fetched successfully"
}
```

Error responses should also be consistent:

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_MANDATORY_MISSING",
    "message": "Cannot activate restaurant: mandatory compliance documents are missing or rejected."
  }
}
```

## 7.4 HTTP Status Codes

Use appropriate HTTP status codes:
- `200` – Successful request
- `201` – Resource created
- `204` – Successful request with no response body
- `400` – Bad / invalid request
- `401` – Unauthenticated
- `403` – Unauthorized
- `404` – Resource not found
- `409` – Conflict (e.g., table slot already booked)
- `422` – Validation failure
- `500` – Internal server error

## 7.5 API Documentation

All implemented APIs must be documented.

The documentation should include:
- Endpoint
- HTTP method
- Authentication requirement
- Request parameters
- Request body
- Response body
- Status codes
- Validation rules
- Example request & response

Swagger / OpenAPI documentation is strongly recommended.

---

# 8. Database Guidelines

## 8.1 Relational Design

The database should be designed around the business entities defined in the PRD:
- `companies_restaurants`
- `compliance_documents`
- `dining_zones`
- `restaurant_tables`
- `calendar_overrides`
- `menu_categories`
- `food_items`
- `table_orders`
- `order_items`
- `monthly_settlements`

## 8.2 Primary Keys

Every table should have a clearly defined primary key.

Use one consistent ID strategy across the project:
- Recommended: UUID (v4 / v7) or CUID or BIGINT auto-increment.
- Document the selected strategy in `docs/database.md`.

## 8.3 Foreign Keys

Relationships between entities must use proper foreign-key constraints with appropriate cascading / restrict policies.

Do not rely only on application-level assumptions for critical relationships.

## 8.4 Indexing

Indexes should be created for frequently queried columns:
- `restaurant_id` on all child tables
- `table_id` on orders
- `order_status` on orders
- `category_id` on food items
- `is_available` on food items
- `document_type` and `status` on compliance documents
- `override_date` on calendar overrides
- `billing_month` on monthly settlements

Do not create indexes blindly. Document important indexing decisions.

## 8.5 Data Integrity

Use database constraints where appropriate:
- `NOT NULL`
- `UNIQUE` (e.g., table number per restaurant, unique slug)
- `CHECK` constraints (e.g., `price >= 0`, `capacity > 0`)
- Appropriate defaults

Critical financial values (order amounts, food prices) must use suitable `NUMERIC` / `DECIMAL(10,2)` types rather than floating-point numbers.

---

# 9. Order Processing and Table Locking Rules

When diners submit an order via QR or staff punch an order manually, the operation must be treated with atomic integrity:

```text
Submit Table Order
   ↓
Validate Table ID & Cryptographic Signature
   ↓
Verify Dishes Are In Stock (is_available = true)
   ↓
Verify Restaurant is Open (Operating Hours & Calendar Check)
   ↓
Create Order & Line Items (Inside DB Transaction)
   ↓
Update Table Status: Available -> Seated / Active Order
   ↓
Emit Real-Time Event to Restaurant Live Rush Board (WebSocket)
```

- If an item in the cart was marked `Sold Out` right before submission, the transaction must roll back and inform the diner.
- Manual order creation from the B2B portal must follow the identical validation and status transition pipeline.

---

# 10. Naming Conventions

Every team must follow documented naming conventions throughout the project.

Create:
```text
docs/naming-conventions.md
```

## 10.1 Standards

### Folders
Use `kebab-case`:
```text
admin-portal/
b2b-portal/
table-qr-menu/
user-management/
```

### TypeScript Variables & Functions
Use `camelCase`:
```ts
const restaurantId = "rest_01";
const grossAmount = 450.00;

function createTableOrder() {}
function toggleItemStock() {}
function verifyComplianceDocument() {}
```

### Classes & Types / Interfaces
Use `PascalCase`:
```ts
class OrderService {}
interface RestaurantTable {}
type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
```

### Database Tables & Columns
Use `snake_case`:
```sql
CREATE TABLE restaurant_tables (
    id VARCHAR(36) PRIMARY KEY,
    restaurant_id VARCHAR(36) NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Routes
Use `kebab-case`:
```text
/api/v1/compliance-documents
/api/v1/calendar-overrides
/api/v1/live-rush-board
```

---

# 11. Function and Code Quality Guidelines

## 11.1 Single Responsibility

Functions should perform one clear responsibility.

Avoid:
```text
One controller function → parse request → validate compliance → run SQL query → generate QR code → send email
```

Prefer separating responsibilities into appropriate services and utilities.

## 11.2 Function Naming

Function names should clearly communicate the action:
- `activateRestaurantIfCompliant()`
- `generateTableQrCodes()`
- `consolidateMonthlySettlement()`
- `toggleDishAvailability()`

Avoid vague names like `process()`, `handleData()`, or `doAction()`.

## 11.3 Avoid Overengineering

The project should be maintainable without unnecessary abstractions.

Do not introduce:
- Premature microservices
- Excessive enterprise patterns where a simple service suffices
- Unused dependencies
- Complex abstractions without a direct PRD requirement

---

# 12. Authentication and Authorization

Authentication must be implemented for all protected application areas.

### Super Admin
- Full platform management authority over all companies, documents, commercial split configurations, and settlements.

### Restaurant Owner (B2B Partner)
- Access strictly restricted to data belonging to the owner's assigned restaurant.
- An owner must never be able to view, query, or mutate another restaurant's tables, orders, menus, or financial records.

### Table QR Diner Session
- Zero-login, frictionless access.
- Authenticated via cryptographically signed URL parameter (`?table=:tableId&sig=:hmac`) validating that the request originates from an authentic physical table QR code.

---

# 13. Security Guidelines

Security must be considered throughout development:
- Secure password hashing using `bcrypt` (work factor $\ge 10$) or `argon2`.
- Strict input validation using schemas (e.g. Zod / Joi) on all API endpoints.
- SQL injection prevention via parameterized queries or a recognized ORM / query builder (e.g., Prisma, Drizzle, TypeORM, Kysely).
- JWT token expiration and secure HTTP-only cookies where applicable.
- Rate limiting on authentication routes to prevent brute-force attacks.
- Strict CORS policies restricting B2B and Admin APIs to authorized origins.

## 13.1 Secrets Management

Never commit:
- `.env`
- `.env.local`
- API keys, database passwords, JWT secrets, cloud credentials

Always provide:
```text
.env.example
```
with placeholder values in each application folder.

---

# 14. File Upload Security

The Admin Portal handles legal compliance documents (FSSAI, GST, Bank Proof, Owner ID), and the B2B Portal handles food imagery.

Security requirements:
- Strict MIME-type inspection (allow only `application/pdf`, `image/jpeg`, `image/png`, `image/webp`).
- Max file size limits enforced on server (e.g., 10MB for documents, 5MB for food images).
- Stored in secure cloud object storage (AWS S3 / Cloudinary).
- Private access control for legal/KYC compliance documents (accessed only via short-lived signed URLs generated for authenticated Admins).

---

# 15. Error Handling & Logging

## 15.1 Error Handling
- Never return raw database stack traces or database relation names to the client.
- Return structured error JSON with standard HTTP status codes and actionable error messages.

## 15.2 Logging
Implement structured application logging (e.g., Winston, Pino).

Log:
- Authentication failures
- Order placement events and status transitions
- Document approval and rejection actions
- Unexpected server exceptions

Do not log passwords, authentication tokens, or sensitive personal data.

---

# 16. Audit Logging

The PRD explicitly requires auditing for sensitive operations:
- Restaurant profile modifications
- Commercial split percentage changes
- Document verification approvals and rejections (recording admin user, timestamp, decision, and rejection reason)
- Restaurant activation gate events (`Draft` → `Active`, `Active` → `Suspended`)
- Monthly settlement payout reference recordings (recording UTR number, admin ID, timestamp)

---

# 17. Testing Guidelines

## 17.1 Backend Testing
At minimum, write unit/integration tests for critical business logic:
- Authentication & authorization boundary tests
- Mandatory document activation gate logic
- Table reservation slot generation and overlap prevention
- Instant 86'd stock toggle preventing order submission
- Order placement and status progression
- Monthly settlement aggregation calculations

## 17.2 Frontend Testing
Test core user journeys:
- **Admin Journey:** Login → Onboard Restaurant → Upload 4 Mandatory Docs → Approve Docs → Activate Restaurant → View Settlement.
- **B2B Owner Journey:** Login → Create Zones & Tables → Download QR Codes → Build Menu → Toggle Dish Stock → Receive Live QR Order → Progress Order Status.
- **Diner Journey:** Open Table QR Menu URL → Browse Categories → Add Items → Place Order → Receive Table Order Confirmation.

---

# 18. Documentation Structure

The root `docs/` directory must contain the project's technical documentation:

```text
docs/
├── PRD.md
├── technical-guidelines.md
├── architecture.md
├── api-documentation.md
├── database.md
├── er-diagram.md
├── naming-conventions.md
├── environment.md
├── installation.md
├── deployment.md
├── technical-decisions.md
├── security.md
├── testing.md
├── known-issues.md
└── workflows.md
```

---

# 19. Required Documentation Details

Every team must provide the following documentation files in `docs/`:

1. **`architecture.md`**: Overall system architecture, modular monolith breakdown, module communication, request flow, and deployment diagram.
2. **`api-documentation.md`**: Complete REST API specifications with endpoints, methods, parameters, request/response bodies, and status codes.
3. **`database.md`**: Schema breakdown, tables, columns, constraints, foreign keys, indexes, and normalization decisions.
4. **`er-diagram.md`**: Complete ER diagram (Mermaid / image) reflecting the actual implemented SQL database.
5. **`naming-conventions.md`**: Documented naming standards for folders, variables, functions, tables, and API routes.
6. **`environment.md`**: Complete inventory of all environment variables across backend and frontend applications.
7. **`installation.md`**: Step-by-step instructions for a new developer to clone, install dependencies, run migrations, seed data, and launch all services locally.
8. **`deployment.md`**: Production build commands, cloud hosting instructions, database migrations in production, and health checks.
9. **`technical-decisions.md`**: Architecture decision records (ADRs) explaining *Why PostgreSQL?*, *Why Modular Monolith?*, *Why Next.js?*, trade-offs, and alternatives considered.
10. **`security.md`**: Documentation on authentication, tenant isolation, activation gate enforcement, file upload security, and secrets protection.
11. **`testing.md`**: Test strategy, unit/integration test execution instructions, and manual test pass records.
12. **`known-issues.md`**: Transparent documentation of known limitations, edge cases, or pending enhancements.
13. **`workflows.md`**: Detailed step-by-step operational workflows matching the PRD.

---

# 20. PRD Compliance & Activation Gate Enforcement

The implementation must strictly respect the business rules defined in the PRD:
1. **Activation Gate:** The backend API must reject any request to set a restaurant's status to `Active` unless all 4 mandatory compliance documents (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`) are in `Approved` state.
2. **Split Ratio Scope:** The commercial split ratio is an Admin profile configuration setting only. It must **not** execute automated order deductions or alter customer bill totals in Phase 1 or Phase 2.
3. **Instant Stock (86'd) Guard:** Dishes marked `is_available = false` must be immediately rejected if submitted in an order.
4. **Calendar Override Hierarchy:** `Holiday` overrides block all bookings/orders for the date; `Half Day` overrides clamp active slots to the shift window; unmodified days inherit `Full Day` default operating hours.

---

# 21. Final Technical Review Checklist

Before final submission, teams must verify:

## Architecture
- [ ] Backend follows Modular Monolithic Architecture with domain separation
- [ ] Primary database is relational SQL (e.g. PostgreSQL)
- [ ] Controllers are thin; business logic is encapsulated in services
- [ ] Database access is isolated in repositories / ORM layers

## Applications
- [ ] Super Admin Portal operational
- [ ] Restaurant Owner B2B Portal operational
- [ ] Table QR Digital Menu loads instantly on mobile browsers without app download
- [ ] Real-time Live Rush Board reflects new table orders and status changes
- [ ] Consistent UI theme and official logo used across all portals

## Business Rules & Security
- [ ] Activation gate blocks unverified restaurants from activating
- [ ] Tenant data isolation strictly enforced per restaurant
- [ ] Passwords hashed with bcrypt / argon2
- [ ] `.env.example` provided for every application; no secrets committed to Git
- [ ] Compliance documents stored securely with private access controls

## Documentation
- [ ] Root `README.md` complete with setup and run instructions
- [ ] All 13 technical documents in `docs/` complete and accurate
- [ ] ER diagram matches the actual production database schema
- [ ] API documentation complete with example requests and responses

---

# 22. Core Principle

The Buildathon should be approached as a real-world software engineering project.

The expected engineering process is:

```text
Understand PRD
      ↓
Design Database (SQL)
      ↓
Define Architecture (Modular Monolith)
      ↓
Implement Backend APIs
      ↓
Implement Web Applications (Admin, B2B, Table QR)
      ↓
Integrate & Real-Time Sync
      ↓
Test & Secure
      ↓
Document
      ↓
Deploy & Demonstrate
```

The goal is not only to make the application work. Teams must be able to explain:
- Why the architecture was chosen
- How the database was normalized and indexed
- How multi-tenancy and data isolation are secured
- How the activation gate protects the platform
- How the system handles peak dining rushes and instant stock updates
- How the applications can be maintained, scaled, and deployed in production
