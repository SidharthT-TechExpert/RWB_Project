# QuickBite – Technical Guidelines

**Document Type:** Technical Guidelines  
**Project:** QuickBite – Restaurant Operations B2B SaaS Platform  
**Stack Overview:**
- **Frontend:** React (Web & Table QR Web), React Native (Customer Mobile App), Zod (Validation), Zustand (Client State), TanStack Query (Server State & Caching)
- **Backend:** NestJS & TypeScript (Modular Monolith), DTO Validation (`class-validator` / `ValidationPipe`), Centralized Response & Exception Handling, Hardened Security Measurements
- **Primary Database:** Relational SQL (PostgreSQL Recommended)  
**Applies To:** Admin Portal, Restaurant B2B Portal, Customer Mobile App, Table QR Digital Menu, Backend API & Database  

---

## 1. Purpose

This document defines the strict technical standards and architectural mandates for building, scaling, and maintaining the QuickBite platform.

The PRD defines **what the product must do**. These Technical Guidelines define **how every layer must be implemented, validated, secured, cached, and unified across web environments**.

---

# 2. Mandatory Tech Stack & Architecture Standards

The tech stack is fixed across all development tracks:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND SURFACES                                      │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Portals (Admin & B2B PWA)      │ React PWA (Vite, vite-plugin-pwa, Standalone Mode)    │
│ Unified Customer App (Diners)  │ React Native (Cross-Platform iOS & Android Mobile App)│
│ Form & Input Validation        │ Zod (Strict schema validation across forms)           │
│ Client State Management        │ Zustand (Lightweight modular client stores)           │
│ Server State & Caching         │ TanStack Query v5 (Data fetching, caching & sync)     │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
                                           │
                      REST APIs (HTTPS) & WebSockets (WSS)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND & DATA LAYER                                      │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Backend Framework              │ NestJS & TypeScript (Modular Monolith)                │
│ Request / DTO Validation       │ NestJS ValidationPipe (class-validator / Zod DTOs)    │
│ Response Architecture          │ Centralized Response Interceptor & Status Codes       │
│ Exception Architecture         │ Centralized Global HttpExceptionFilter                │
│ Message Management             │ Centralized Message Dictionary (constants)            │
│ Security Measurements          │ Helmet, Throttler, Bcrypt, JWT, HMAC QR Guard, CORS   │
│ Primary Database               │ Relational SQL (PostgreSQL recommended)               │
│ In-Memory Store                │ Redis (WebSocket Pub/Sub, Throttling & Fast Caching)  │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

# 3. Frontend Architecture Standards (React & React Native)

## 3.1 Form & Schema Validation (Zod)

All form inputs, user mutations, and query parameters on React and React Native surfaces must be validated using **Zod** schemas:
- **Schema Single Source of Truth:** Form validation schemas reside in dedicated `*.schema.ts` files (e.g. `restaurant.schema.ts`, `menu-item.schema.ts`, `table-order.schema.ts`).
- **Hook Form Integration:** React forms must use `@hookform/resolvers/zod` with `react-hook-form` to ensure zero uncontrolled re-renders and client-side error feedback before sending HTTP payloads.
- **Type Inference:** TypeScript types must be inferred directly from Zod schemas (`export type MenuItemFormData = z.infer<typeof MenuItemSchema>;`).

## 3.2 Client State Management (Zustand)

Global client-only UI state must be managed with **Zustand** stores:
- **Separation of Concerns:** Keep client UI state completely separate from server data cache.
- **Store Granularity:** Stores must be modular and scoped:
  - `useAuthStore`: User identity, JWT access tokens, active role, current `restaurantId`.
  - `useUiStore`: Sidebar collapse, active modals, dark/light theme, notification toasts.
  - `useCartStore` *(Table QR Menu)*: Diners' selected dishes, quantities, dietary notes (persisted in `sessionStorage`).
  - `useFilterStore`: Rush board status filters, date range pickers, category search terms.
- **No Boilerplate:** Zero actions/reducers boilerplate; update state directly via concise store actions.

## 3.3 Server State, Data Fetching & Caching (TanStack Query v5)

All server interactions, caching, background synchronization, and mutations must use **TanStack Query**:
- **Query Key Factories:** All queries must use structured, predictable query keys:
  ```ts
  export const restaurantKeys = {
    all: ['restaurants'] as const,
    detail: (id: string) => [...restaurantKeys.all, id] as const,
    menu: (id: string) => [...restaurantKeys.all, id, 'menu'] as const,
    tables: (id: string) => [...restaurantKeys.all, id, 'tables'] as const,
  };
  export const orderKeys = {
    all: ['orders'] as const,
    live: (restaurantId: string) => [...orderKeys.all, 'live', restaurantId] as const,
    detail: (id: string) => [...orderKeys.all, id] as const,
  };
  ```
- **Caching Strategy:**
  - Static or low-frequency data (Menu categories, Floor Zones): `staleTime: 5 * 60 * 1000` (5 minutes).
  - High-frequency data (Live Rush Board active orders): `staleTime: 0` (always revalidate on focus, backed by WebSocket push).
- **Optimistic Updates:** Immediate UI reflection for instant 86'd stock toggles and status progression (`CONFIRMED` → `PREPARING` → `SERVED`), with rollback on network failure.
- **WebSocket Synchronization:** When WebSocket events arrive from the NestJS `RushBoardGateway`, TanStack Query keys are automatically invalidated (`queryClient.invalidateQueries({ queryKey: orderKeys.live(restaurantId) })`).

## 3.4 Progressive Web App (PWA) Standards (Admin & B2B Portals)

Both the **Super Admin Portal** (`admin-portal/`) and **Restaurant B2B Portal** (`b2b-portal/`) are built as installable **Progressive Web Apps (PWAs)** powered by `vite-plugin-pwa`:
- **Installation & Display Configuration:**
  - `display: 'standalone'` ensures fullscreen execution on touch POS terminals, iPads, Android tablets, and desktop workstations without browser address bars.
  - Manifest definitions: Custom app icons (`192x192`, `512x512`, `maskable`), application title, and brand theme colors.
- **Service Worker & Workbox Caching:**
  - Pre-caches application bundles, CSS stylesheets, fonts, and static assets for instant load times even under spotty restaurant kitchen Wi-Fi.
  - Background asset updates with clean prompt triggers (`autoUpdate` / prompt update).
- **Kitchen & Hardware Integrations:**
  - **Web Push API & Audio Alerts:** Receives background order notifications and triggers instant audible chimes on the Kitchen Live Rush Board whenever a pre-booking or on-table QR order arrives.
  - **Screen Wake Lock API:** Prevents kitchen tablet screens from dimming or sleeping during active dining service shifts.

## 3.5 Automated Kitchen Thermal Printing & Station KOT Routing (ESC/POS)

To handle physical preparation stations (e.g. Shawarma station, Tandoor / Grill counter, Beverage bar, Main kitchen), the platform incorporates an automated **Category-Based Thermal Printing Engine**:
- **Automatic Print Trigger:** Order placement (`CONFIRMED` via QR menu, mobile app pre-booking, or staff order punch) immediately triggers automated printing without requiring manual button clicks.
- **Category Decomposition & Station Routing:**
  - The system inspects each dish's `category_id` and maps it to assigned station printers.
  - Decomposes multi-category orders and dispatches distinct Kitchen Order Tickets (KOTs) directly to the relevant printer:
    - *Example:* An order with 2 Shawarmas, 1 Tandoori Roti, and 2 Mint Lime Juices splits automatically:
      1. **Shawarma Station Printer:** Prints only the 2 Shawarmas with cooking notes.
      2. **Tandoor Station Printer:** Prints only the 1 Tandoori Roti.
      3. **Beverage Bar Printer:** Prints only the 2 Mint Lime Juices.
      4. **Master Printer (Optional):** Prints the complete consolidated order at cashier/pass.
- **Thermal Protocol & Network Connectivity:**
  - Supports standard 80mm / 58mm thermal receipt printers using ESC/POS protocol.
  - Connectivity via Network TCP Socket (`IP:9100` LAN printers) or PWA Web Print / Bluetooth API.
- **Manager Category-to-Printer Assignment UI:**
  - Managers manage KOT routing directly from the B2B SaaS portal:
    - **Category Modal:** The `CategoryForm` includes an intuitive `printer_id` dropdown populated dynamically from configured active printers.
    - **Instant Live Update:** Selecting a new printer on a category mutates `menu_categories.assigned_printer_id` and takes effect immediately on subsequent orders without requiring server or hardware reboots.
- **Standardized KOT Ticket Layout:**
  - **Header:** Table Number (or Pre-Booking Ref), Order Number, Server/Source, Timestamp.
  - **Body:** Item Name, Quantity, Dietary Badge (`Veg` / `Non-Veg`).
  - **Cooking Notes:** Bold, high-contrast instructions (e.g. `*** NOTE: Extra Garlic Paste, Less Spicy ***`).

## 3.6 Custom Billing Machine Architecture (Single Integrated Unit)

To streamline front-of-house table operations and eliminate counter bottlenecks:
- **Unified Single-Unit Custom Machine:**
  - The **Customer Mini Screen**, the **Card Ingestion Slot**, and the **High-Speed Thermal Receipt Printer** are engineered directly into **ONE single custom-designed physical machine** (not two separate external devices).
  - It connects to the cashier's computer/tablet (running the QuickBite B2B Portal) via USB or Local Network.
- **Card Reader Interface Protocols:**
  - Machine supports physical dining session cards via contact chip slot (ISO 7816) or contactless RFID/NFC reader slot with microswitch insertion auto-detection.
- **Card Hand-off & Dining Accumulation:**
  - When serving food, the waiter hands a physical dining session card (e.g. Card #07) to the seated customer.
  - Any additional spot dishes ordered during the meal dynamically accumulate under this card's linked table order.
- **Dual-Screen Auto-Display on Card Insertion:**
  - Diners present the card at the billing counter; staff inserts the card into the machine's slot.
  - Microswitch triggers instant lookup (`CARD_READ(card_uid)`):
    1. Looks up `dining_session_cards` where `card_uid = :uid` and `status = 'ACTIVE_BOUND'`.
    2. Retrieves active `table_orders` and itemized `order_items`.
    3. Renders the complete reconciled bill simultaneously on:
       - **Staff Main Screen:** Full operational breakdown (dishes, quantities, unit prices, GST taxes, advance paid online amount, and balance to collect).
       - **Customer Mini Screen:** Complete customer-facing **itemized food list** (dish names, quantities, line prices, subtotal), advance paid online amount, and net balance to pay.
- **Counter Item Management & Anti-Theft Audit Trail:**
  - Staff can void items, decrease quantities, or punch added items.
  - Changes instantly update the Customer Mini Screen in real-time.
  - Every modification creates an immutable entry in `order_item_audit_logs` recording user ID, dish name, previous/new quantities, delta amount, and mandatory `reason_code` (`NOT_SERVED`, `CUSTOMER_REJECTED`, `KITCHEN_SPILLAGE`, `WRONGLY_PUNCHED`).
  - Items already printed on kitchen KOTs strictly require **Manager Authorization** to void.
- **Direct Restaurant Payment:**
  - Customer settles their bill directly with the restaurant (Cash, restaurant card POS, or restaurant's own Razorpay/UPI setup). In-venue food payments flow 100% directly to the restaurant; QuickBite does not intercept or hold in-venue dining collections.
- **Staff 1-Tap "Print Receipt" & Table Isolation:**
  - Staff taps 1 button: **"Print Receipt"**.
  - Built-in thermal printer prints the official itemized GST tax invoice and auto-cuts the paper.
  - Payment and order are immediately marked `COMPLETED`.
  - The table is atomically isolated and reset to `VACANT` for the next customer.
- **Color Card & Table QR Print Engine:**
  - The machine integrates a secondary internal 300 DPI dye-sublimation / thermal transfer color print head along the card transport path.
  - Allows venue managers to print edge-to-edge full-color PVC Dining Cards (with automatic RFID encoding) and Table QR acrylic standee inserts with QuickBite branding and restaurant logos directly from the B2B Portal.

---

# 4. Backend Architecture – NestJS Modular Monolith

## 4.1 Modular Monolith Layout

The backend is built with **NestJS**, encapsulating business domains in distinct modules with explicit dependency injection:

```text
backend/src/
├── modules/
│   ├── auth/                    # Login, JWT issuing, Passport strategies, Auth Guards
│   ├── users/                   # Super Admin & Restaurant Owner accounts
│   ├── restaurants/             # Profiles, split setting, activation gate logic
│   ├── documents/               # FSSAI, GST, Bank Proof, KYC ID uploads & approvals
│   ├── tables/                  # Physical tables, seating capacity, QR token binding
│   ├── zones/                   # Dining floor zones (Indoor, Rooftop, Patio)
│   ├── menu/                    # Categories, dishes, 86'd instant sold-out toggle
│   ├── calendar/                # Operating hours, holiday overrides, half-day shifts
│   ├── orders/                  # Dining orders (QR-placed & manual staff punched)
│   ├── rush-board/              # Real-time WebSocket Gateway & active orders
│   ├── printing/                # Kitchen thermal printer manager & category KOT routing
│   ├── settlements/             # Monthly billing consolidation & UTR payout logs
│   ├── mail/                    # Transactional email dispatches (owner credentials, notifications)
│   └── reports/                 # Administrative & restaurant analytics
│
├── shared/
│   ├── database/                # Relational SQL ORM configuration & migrations
│   ├── filters/                 # Global HttpExceptionFilter
│   ├── interceptors/            # Global ResponseInterceptor & LoggingInterceptor
│   ├── decorators/              # @ResponseMessage(), @CurrentUser(), @Roles()
│   ├── guards/                  # JwtAuthGuard, RolesGuard, QrSignatureGuard
│   ├── constants/               # Messages dictionary, Status codes, Error codes
│   └── utils/                   # Crypto HMAC utilities, math helpers
│
├── app.module.ts                # Assembles domain modules
└── main.ts                      # Bootstrap (Helmet, Throttler, Global Pipes/Filters)
```

## 4.2 Backend DTO Validation

All incoming HTTP request payloads must be strictly validated via **Data Transfer Objects (DTOs)**:
- **Global ValidationPipe:** Configured in `main.ts`:
  ```ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strips all properties not defined in the DTO
      forbidNonWhitelisted: true,  // Rejects requests containing extraneous properties
      transform: true,              // Automatically transforms payloads to DTO instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  ```
- **DTO Validation Rules:** DTO properties must be decorated with `class-validator` rules:
  - `@IsString()`, `@IsNotEmpty()`, `@IsUUID()`, `@IsEmail()`
  - `@IsNumber({ maxDecimalPlaces: 2 })`, `@Min(0)` for financial and currency values
  - `@IsEnum(OrderStatus)`, `@IsEnum(DocumentType)` for fixed state domains
  - `@ValidateNested()` with `@Type(() => OrderItemDto)` for nested arrays/relations.

---

# 5. Centralized Response Format & Status Codes

All API endpoints must return a predictable, standardized envelope. Controllers return pure domain data; a global NestJS **`ResponseInterceptor`** wraps every successful response.

## 5.1 Success Response Structure

Every successful response (`200 OK`, `201 Created`) adheres to the following JSON structure:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Resource fetched successfully",
  "data": {},
  "timestamp": "2026-11-13T19:00:00.000Z"
}
```

### Response Message Customization
A custom `@ResponseMessage()` decorator allows controllers to provide context-specific feedback messages cleanly:

```ts
@Post()
@ResponseMessage(MESSAGES.RESTAURANTS.CREATED)
async createRestaurant(@Body() dto: CreateRestaurantDto) {
  return this.restaurantService.create(dto);
}
```

## 5.2 Error Response Structure

All exceptions are caught by a centralized global **`HttpExceptionFilter`**, guaranteeing that no raw stack traces or database errors leak to clients:

```json
{
  "statusCode": 422,
  "success": false,
  "message": "Restaurant cannot be activated: mandatory compliance documents are missing or pending approval.",
  "error": "UNPROCESSABLE_ENTITY",
  "details": {
    "missingOrUnapproved": ["DOC_FSSAI", "DOC_BANK"]
  },
  "timestamp": "2026-11-13T19:00:00.000Z"
}
```

## 5.3 Centralized Message Dictionary (`messages.constant.ts`)

System messages must be centralized in `src/shared/constants/messages.constant.ts` rather than hardcoded in controllers:

```ts
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Authenticated successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    TOKEN_EXPIRED: 'Session expired, please login again',
  },
  RESTAURANTS: {
    CREATED: 'Restaurant onboarded successfully',
    UPDATED: 'Restaurant profile updated successfully',
    ACTIVATED: 'Restaurant successfully activated',
    ACTIVATION_BLOCKED: 'Restaurant cannot be activated: mandatory compliance documents are missing or pending approval',
    SUSPENDED: 'Restaurant has been suspended',
  },
  DOCUMENTS: {
    UPLOADED: 'Compliance document uploaded successfully',
    APPROVED: 'Document verified and approved',
    REJECTED: 'Document rejected with remarks',
  },
  MENU: {
    ITEM_CREATED: 'Menu item created successfully',
    STOCK_TOGGLED: 'Dish stock availability updated successfully',
  },
  ORDERS: {
    PLACED: 'Table order placed successfully',
    STATUS_UPDATED: 'Order status transitioned successfully',
    ITEM_SOLD_OUT: 'Order rejected: One or more selected items are sold out (86ed)',
    TABLE_OCCUPIED: 'Selected table currently has an active seated order',
  },
  SETTLEMENTS: {
    GENERATED: 'Monthly settlement statement generated successfully',
    PAYOUT_RECORDED: 'Payout transaction reference recorded successfully',
  },
} as const;
```

## 5.4 Standard HTTP Status Codes

- `200 OK` – Resource retrieved, updated, or action completed successfully.
- `201 Created` – Resource created successfully (e.g., placing an order, uploading a document).
- `204 No Content` – Action completed with no return body.
- `400 Bad Request` – DTO validation failure, malformed syntax.
- `401 Unauthorized` – Missing, invalid, or expired JWT token.
- `403 Forbidden` – Role mismatch (`@Roles`) or cross-tenant access violation.
- `404 Not Found` – Resource ID does not exist.
- `409 Conflict` – Unique constraint violation (duplicate email, duplicate table number).
- `422 Unprocessable Entity` – Business domain violation (e.g. activation gate blocked).
- `429 Too Many Requests` – Rate limit exceeded by Throttler.
- `500 Internal Server Error` – Sanitized server failure.

---

# 6. Backend Security Measurements

Security measurements must be implemented across all layers:

### 6.1 HTTP Security Headers
- NestJS `helmet` middleware enabled on the bootstrap root to protect against clickjacking, MIME sniffing, and cross-site scripting:
  ```ts
  app.use(helmet());
  ```

### 6.2 Rate Limiting & Abuse Prevention
- Implemented via `@nestjs/throttler` backed by Redis:
  - Auth routes (`/api/v1/auth/login`): 5 requests per minute.
  - Table QR order placement: 10 requests per minute per table IP.
  - General API routes: 100 requests per minute.

### 6.3 Password Hashing
- Cryptographic password hashing using `bcrypt` (work factor $\ge 10$) or `argon2`. Plaintext passwords must never be stored, logged, or serialized.

### 6.4 CORS Policy
- Explicit origin whitelisting:
  - Admin Portal origin (`https://admin.quickbite.com` or local dev)
  - B2B Portal origin (`https://partner.quickbite.com` or local dev)
  - Unified Customer App origin (`https://app.quickbite.com` or local dev)
  - Wildcards (`*`) are prohibited in production.

### 6.5 Tenant Data Isolation
- Strict row-level multi-tenancy: Every query executed on behalf of a Restaurant Owner injects `restaurant_id = :authenticatedUserRestaurantId`.
- An owner can never query, update, or delete data belonging to another restaurant.

### 6.6 Cryptographic QR Table Binding (HMAC)
- Table QR URLs must be signed with a cryptographic HMAC token:
  `https://app.quickbite.com/table?id=table_uuid&sig=HMAC_SHA256(table_uuid, SECRET)`
- A `QrSignatureGuard` validates the signature before allowing any customer menu access or order placement, preventing URL manipulation.

### 6.7 Compliance Document Security & Verification Notifications
- Legal KYC documents (FSSAI, GST, Bank Proof, Owner ID) must be stored in a **private cloud storage bucket** (AWS S3).
- Direct public access is disabled.
- Authenticated Super Admins receive short-lived (15-minute) pre-signed download URLs generated on-demand during verification workflows.
- **Verification Notification Events:** Marking any document `Approved` or `Rejected` emits a domain event handled by `MailService`, sending transactional HTML emails to the partner's registered email with verification status and mandatory rejection feedback.

### 6.8 SQL Injection Immunity
- Direct string concatenation in SQL queries is strictly prohibited. All queries must utilize parameterized statements or type-safe ORM query builders (Prisma / TypeORM).

### 6.9 Temporary Password Generation (Restaurant Name Starter)
- When Super Admin onboards a new restaurant, the backend generates a cryptographically secure temporary password.
- **Starter Pattern:** Takes the sanitized alphanumeric brand name as prefix (e.g. `SpicyGrill`), appended with `@`, followed by cryptographically random characters via `crypto.randomBytes`:
  - **Format:** `[SanitizedBrandName]@[RandomSecureString]` (e.g., `SpicyGrill@9mK#4vL2!`).
  - **Complexity Standard:** Guaranteed $\ge 14$ characters, containing uppercase, lowercase, digits, and special symbols.
- **Security Lifecycle:**
  - Password is sent via TLS email directly to the partner's verified email.
  - Stored in the database only as a `bcrypt` hash ($\ge 10$ rounds).
  - Flags account with `must_reset_password = true`, requiring the partner to change credentials upon first login.

### 6.10 Spot Order Anti-Fraud Authentication & Client IP Auditing
- **Customer Authentication on Table QR:**
  Walk-in customers scan the table QR code using the Customer Application to bind the active table session. Prior to punching or confirming a spot order, customers authenticate via a fast signup/login flow using their Name and Mobile Phone Number (SMS OTP verification).
- **Fraud Prevention & Data Capture:**
  Every spot order permanently records:
  - `customer_name`: Verified customer legal/display name.
  - `customer_phone`: Verified customer mobile number.
  - `table_id`: Physical table where order is placed.
  - `client_ip`: Remote IPv4/IPv6 address extracted safely from `X-Forwarded-For` or request socket connection.
  - `user_agent`: Browser and device footprint.
- **Strict Role-Based Privacy Isolation:**
  - **Super Admin Visibility:** `client_ip` is fully serialized and visible to Super Admin in `/api/v1/admin/orders` and `/api/v1/admin/audit-logs` for bot/prank order mitigation and cybersecurity incident response.
  - **Restaurant Privacy Protection:** The backend DTOs and serializers (`@Exclude()` in NestJS `ClassSerializerInterceptor`) strictly strip `client_ip` from all B2B restaurant endpoints (`/api/v1/b2b/orders`, Kitchen Rush Board WebSocket payloads). Restaurant staff have zero visibility into customer IP addresses.

---

# 7. Database & Data Modeling Guidelines (Relational SQL)

## 7.1 Relational Architecture

The primary database **must be SQL-based (PostgreSQL recommended)**:
- **Primary Keys:** `UUIDv4` or `CUID` across all entities.
- **Foreign Keys:** Enforced at database level with referential constraints.
- **Currency & Monetary Precision (INR / ₹):** All financial values (`unit_price`, `gross_amount`, `prebooking_amount`, `platform_fee_amount`, `partner_payout_amount`, `disbursed_amount`) are strictly denominated in **Indian Rupees (INR / ₹)** using `DECIMAL(10, 2)` or `NUMERIC(10, 2)`. The two decimal digits represent Paise (e.g. `350.50` = ₹350 and 50 paise). Floating point (`FLOAT`/`DOUBLE`) is strictly forbidden. Foreign currencies (USD / $) are not permitted.
- **Audit Columns:** Every table includes `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()` and `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`.

## 7.2 Core Entities Summary

```text
companies_restaurants ──< compliance_documents
companies_restaurants ──< dining_zones ──< restaurant_tables
companies_restaurants ──< menu_categories ──< food_items
menu_categories       >── kitchen_printers (Direct category printer mapping)
companies_restaurants ──< calendar_overrides
companies_restaurants ──< table_reservations (Pre-bookings with fee split snapshot)
companies_restaurants ──< restaurant_payouts (T+X delayed food & fee disbursement ledger)
companies_restaurants ──< kitchen_printers ──< printer_categories (Category KOT routing)
restaurant_tables      ──< table_orders ──< order_items (In-venue spot orders, zero split)
```

## 7.3 Performance Indexing Rules

Mandatory compound and single-column indexes:
- `restaurants(status)`
- `compliance_documents(restaurant_id, document_type)`
- `restaurant_tables(restaurant_id, zone_id)`
- `food_items(restaurant_id, category_id, is_available)`
- `table_orders(restaurant_id, status, created_at DESC)`
- `table_orders(table_id, status)`
- `table_reservations(restaurant_id, reservation_date, status)`
- `restaurant_payouts(restaurant_id, status, payout_mature_at)`
- `calendar_overrides(restaurant_id, override_date)`

## 7.4 Pre-Booking Split Immutability & Multi-Table Standards
- **Contract Split Ratio:** Stored in `restaurants.prebooking_split_percentage` (e.g., `20.00` representing 20% platform share).
- **Multi-Table Selection Support:** When booking, customers select date, time slot, party size, and one or more suitable physical tables matching party size and venue floor layout. The platform links tables via `reservation_tables (reservation_id, table_id)` and records `primary_table_id` on `table_reservations`.
- **Checkout Financial Composition:**
  $$\text{Total Paid at Checkout (INR ₹)} = \text{prebooking\_fee} + \text{preordered\_food\_amount}$$
- **Snapshot Requirements:** When an advance reservation is confirmed via the Customer App:
  - The system records `prebooking_fee` in INR (₹) (e.g., ₹500.00).
  - The system records `preordered_food_amount` in INR (₹) (e.g., ₹1,850.00).
  - The customer pays `total_paid_amount = prebooking_fee + preordered_food_amount` upfront in INR (₹) (e.g., ₹2,350.00).
  - Snapshots `applied_split_ratio = restaurants.prebooking_split_percentage`.
  - Snapshots `platform_fee_amount = prebooking_fee * (applied_split_ratio / 100)`.
  - Snapshots `partner_payout_amount = prebooking_fee - platform_fee_amount`.
- **Zero Retroactive Mutation:** Any subsequent change by Super Admin to `restaurants.prebooking_split_percentage` applies exclusively to future reservations. Existing records in `table_reservations` are permanently immutable.
- **Exclusion of Spot Orders:** `table_orders` (placed via table QR or punched by staff) have zero platform commission cuts. Diners pay the venue directly.

## 7.5 Delayed Payout Engine Architecture (T+X Days Post-Dining)
- **Holding Period Window Anchor (`completed_at`):**
  The holding delay countdown starts strictly when the customer finishes dining and the order status is updated to `COMPLETED` (`completed_at`). Each restaurant profile defines `payout_delay_days INT DEFAULT 2` (or platform default X days).
- **Maturity Calculation:**
  When a pre-booked dining order transitions to `COMPLETED`:
  - `holding_matures_at = completed_at + INTERVAL 'X days'`.
  - Batch / Payout record created with status `HOLDING_DELAY`.
  - Total disbursable amount = `prebooked_food_amount` + `partner_fee_share`.
- **Maturity Worker (NestJS Scheduler):**
  A scheduled cron job running every 10 minutes automatically promotes mature records:
  ```sql
  UPDATE daily_settlement_batches 
  SET status = 'DISBURSABLE' 
  WHERE status = 'HOLDING_DELAY' AND holding_matures_at <= NOW();
  ```
- **Admin Settlement Window Queue & FIFO Sorting Algorithm:**
  When Super Admin views the Daily Settlement window, records are sorted strictly by a **First-In, First-Out (FIFO)** queue (`ORDER BY holding_matures_at ASC, completed_at ASC`), guaranteeing that older dining events whose dispute clearance window has matured are prioritized and settled first.
- **Multi-Criteria Filter Parameters:**
  The settlement query endpoint (`GET /api/v1/settlements/daily`) supports comprehensive filtering:
  - `restaurantId?: UUID` - Scope to specific partner venue.
  - `status?: 'HOLDING_DELAY' | 'DISBURSABLE' | 'SETTLED'` - Filter by batch state.
  - `startDate?: string` / `endDate?: string` - Date range on batch date or completion date.
  - `minAmount?: number` / `maxAmount?: number` - Net payout threshold in Indian Rupees (₹).
  - `search?: string` - Case-insensitive text search matching restaurant name, UTR number, or invoice number.
  - `sortBy?: 'FIFO' | 'LIFO' | 'AMOUNT_DESC' | 'AMOUNT_ASC'` - Sorting algorithm (defaults to `FIFO`).
  - `page?: number`, `limit?: number` - Standard paginated retrieval.
- **Disbursement, UTR Logging & Automated Invoice Generation:**
  Super Admin executes bank transfer and calls `POST /api/v1/settlements/daily/:id/disburse` with `{ utrNumber }`.
  - Sets batch status to `SETTLED`, records `disbursed_at = NOW()`, logs `utr_number`.
  - Automatically synthesizes a formal PDF Tax Invoice / Settlement Receipt (`invoice_number`, `invoice_pdf_url`) capturing created vs completed pre-booking counts, gross food sales, fee deductions, net payout in ₹, and bank UTR reference.
  - Emits `PayoutDisbursedEvent` notifying partner owners and managers via email and populating their B2B portal Invoices section for immediate download.

## 7.6 Countertop Machine Settlement, 1-Tap Print & Strict Table Isolation

The countertop billing machine executes a deterministic financial display and table isolation transaction:

1. **Dual-Screen Bill Breakdown:**
   $$\text{gross\_food\_amount} = \sum (\text{unit\_price\_snapshot}_i \times \text{quantity}_i)$$
   $$\text{tax\_amount} = \text{gross\_food\_amount} \times (\text{gst\_rate} / 100)$$
   $$\text{total\_bill\_amount} = \text{gross\_food\_amount} + \text{tax\_amount}$$
   $$\text{advance\_paid\_amount} = \text{table\_reservations.preordered\_food\_amount (or ₹0.00 if walk-in)}$$
   $$\text{balance\_due\_amount} = \max(0.00, \text{total\_bill\_amount} - \text{advance\_paid\_amount})$$

2. **In-Venue Restaurant Payment:**
   - The diner settles any remaining balance (`balance_due_amount`) directly with the restaurant via the venue's existing payment setup (Cash, card machine, or restaurant's own Razorpay/UPI setup).
   - In-venue payments flow directly to the restaurant partner. QuickBite never intercepts, delays, or takes commission on in-venue table collections.

3. **Staff 1-Tap "Print Receipt":**
   Staff taps 1 button: **"Print Receipt"**. The system executes an atomic transaction:
   - Sets `table_orders.status = 'COMPLETED'` and records `completed_at = NOW()` (which initiates the $T+X$ delayed daily settlement clock for any online pre-booked food).
   - Sets `table_orders.payment_status = 'FULLY_PAID'`.
   - Dispatches ESC/POS binary command to the built-in thermal printer: prints official itemized tax invoice receipt and triggers auto-cut.
   - Clears physical dining card association: `dining_session_cards.status = 'AVAILABLE'`, unlinking it for reuse in the card tray.

4. **Strict Table Isolation Guarantee for Next Customer:**
   - Immediately upon order completion, `restaurant_tables.status` resets to `VACANT`.
   - The completed order is permanently sealed and archived in PostgreSQL (read-only).
   - When the next customer is seated at this table and scans the QR code or orders:
     - The backend creates a completely new, isolated `table_orders` record with a unique `order_number`.
     - The previous customer's order history, line items, and financial records are 100% isolated. Under zero circumstances can previous items or amounts bleed into or affect the new customer's dining session.

---

# 8. Order Processing & Real-Time Sync

## 8.1 Atomic Order Submission

Whether placed via diner QR or punched manually by restaurant staff, orders must execute within an atomic SQL transaction:

```text
1. Validate Table ID & Cryptographic HMAC Signature
   ↓
2. Authenticate Customer (Verified Name & Phone Number via OTP Session)
   ↓
3. Extract Client IP & User Agent (Admin-Only Audit Payload)
   ↓
4. Verify Operating Hours & Calendar Overrides (Reject if Holiday)
   ↓
5. Validate Dishes:
   - Verify items belong to restaurant
   - Verify is_available = true (Reject if 86'd / sold out)
   ↓
6. Calculate Gross Totals & Taxes
   ↓
7. Insert table_orders (Status: CONFIRMED, Customer Name, Phone, Client IP, User Agent)
   ↓
8. Insert order_items (Snapshot dish name, unit_price, quantity, category, printer)
   ↓
9. Update Table State: Mark Occupied
   ↓
10. Commit SQL Transaction
   ↓
11. Broadcast WebSocket Event (RushBoardGateway - Client IP omitted from payload)
```

## 8.2 Real-Time Rush Board Sync

- **WebSocket Gateway:** `@nestjs/websockets` handles room-isolated events by `restaurantId`.
- **Status Progression:** Updates (`CONFIRMED` → `PREPARING` → `SERVED` → `COMPLETED`) push immediately to connected B2B clients ($\le 500\text{ms}$).
- **Instant Stock Sync:** Sold-out toggles immediately notify active Table QR diner sessions to disable the dish.

---

# 9. Repository Structure

```text
project-root/
│
├── admin-portal/        # React PWA (Super Admin Platform Operations)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── features/    # Domain features (restaurants, documents, settlements)
│   │   ├── stores/      # Zustand client stores
│   │   ├── hooks/       # TanStack Query custom hooks
│   │   ├── schemas/     # Zod form schemas
│   │   └── api/         # Axios / Fetch client
│   ├── package.json
│   └── README.md
│
├── b2b-portal/          # React PWA (Restaurant Operations & Kitchen Rush Board)
│   ├── src/
│   │   ├── components/  # Layouts, data tables, modals
│   │   ├── features/    # Zones, tables, menu, rush-board, calendar, orders, printers
│   │   ├── stores/      # Zustand client stores
│   │   ├── hooks/       # TanStack Query hooks & WebSocket listeners
│   │   ├── schemas/     # Zod validation schemas
│   │   └── api/
│   ├── package.json
│   └── README.md
│
├── customer-app/        # Unified Customer Application (Pre-Booking & In-Venue QR Ordering)
│   ├── src/
│   │   ├── screens/     # Discovery, pre-booking slots, advance pre-order, passes, on-table menu
│   │   ├── components/  # QR camera scanner, sticky category nav, dish cards, cart drawer
│   │   ├── features/    # auth (OTP), discovery, pre-booking, spot-ordering, history
│   │   ├── stores/      # Zustand unified cart, table session & booking store
│   │   ├── hooks/       # TanStack Query hooks & order mutations
│   │   ├── schemas/     # Zod validation schemas
│   │   └── api/
│   ├── package.json
│   └── README.md
│
├── backend/             # NestJS & TypeScript Modular Monolith
│   ├── src/
│   │   ├── modules/     # 12 domain business modules
│   │   ├── shared/      # Database, Filters, Interceptors, Guards, Constants
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── prisma/ or migrations/
│   ├── package.json
│   └── README.md
│
├── docs/                # Project Engineering Documentation
│   ├── PRD.md                     # Product Requirements Document
│   ├── technical-guidelines.md    # Technical standards & architecture rules
│   ├── database.md                # SQL schema & data dictionary
│   └── er-diagram.md              # Visual Mermaid ER architecture
│
└── README.md
```

---

# 10. PRD Compliance & Activation Gate Enforcement

The backend API and UI workflows must strictly enforce the core business rules from the PRD:

1. **Activation Gate:** The backend API must reject any request to set a restaurant's status to `Active` unless all 4 mandatory compliance documents (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`) are in `Approved` state.
2. **Split Ratio Scope:** The commercial split ratio is an Admin profile configuration setting only. It must **not** execute automated order deductions or alter customer bill totals. All table orders record gross dining totals.
3. **Instant Stock (86'd) Guard:** Dishes marked `is_available = false` must be immediately rejected if submitted in an order.
4. **Calendar Override Hierarchy:** `Holiday` overrides block all bookings/orders for the date; `Half Day` overrides clamp active slots to the shift window; unmodified days inherit `Full Day` default operating hours.
5. **Restaurant Order Punching:** B2B Portal allows restaurant staff to manually create and manage active table orders without requiring customer QR scanning.

---

# 11. Final Engineering Checklist

Before production deployment, verify:

### Frontend (React)
- [ ] All forms and user inputs validated with **Zod** schemas.
- [ ] Client UI state managed cleanly with **Zustand** stores.
- [ ] Server data fetching, caching, and cache invalidation handled via **TanStack Query v5**.
- [ ] Real-time WebSocket events trigger immediate TanStack Query cache invalidations.

### Backend (NestJS & TypeScript)
- [ ] Modular Monolith structure strictly enforced with `@Module()` boundaries.
- [ ] Every API endpoint validates payloads via **DTOs** and global `ValidationPipe` (whitelist + forbidNonWhitelisted).
- [ ] Controllers return clean domain data, wrapped by a global **ResponseInterceptor** (`statusCode`, `success`, `message`, `data`, `timestamp`).
- [ ] All exceptions handled by a centralized **HttpExceptionFilter** with standard status codes.
- [ ] Messages referenced from centralized `MESSAGES` constant dictionary.

### Database & Security
- [ ] Primary database is Relational SQL (PostgreSQL) with strict foreign keys and `DECIMAL(10, 2)` monetary values.
- [ ] Helmet headers and Throttler rate limiting enabled.
- [ ] Passwords hashed with bcrypt / argon2.
- [ ] Tenant data isolation strictly enforced per restaurant.
- [ ] Legal compliance documents stored in private S3 bucket with short-lived presigned URLs.
- [ ] Activation gate strictly blocks unverified restaurants from activating.
