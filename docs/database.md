# QuickBite Relational Database Architecture

This document specifies the relational database schema, data dictionaries, integrity constraints, and indexing strategies for the **QuickBite** hospitality operating platform.

---

## 1. Architecture Overview

- **Database Engine:** PostgreSQL (Version 15+)
- **Primary Keys:** UUID v4 (`gen_random_uuid()`) across all tables.
- **Currency & Financial Precision:** All monetary amounts are strictly denominated in **Indian Rupees (INR / ₹)** using `DECIMAL(10, 2)` (with 2 decimal digits representing Paise). Floating-point data types (`FLOAT`, `DOUBLE`) are strictly forbidden.
- **Audit Columns:** Every table includes `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()` and `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`.
- **Multi-Tenancy:** Strict tenant isolation is enforced at the application and query layer via `restaurant_id`.

---

## 2. Entity Relationship Summary

```text
users (Super Admins, Owners, Managers, Staff)
  │
restaurants
  ├── compliance_documents (FSSAI, GST, Bank Proof, KYC ID)
  ├── dining_zones
  │     └── restaurant_tables
  │           └── table_orders ── order_items
  ├── kitchen_printers
  ├── menu_categories (assigned_printer_id -> kitchen_printers)
  │     └── food_items
  ├── calendar_overrides (Holidays & Half-Days)
  ├── table_reservations (Pre-bookings with fee split snapshot)
  ├── daily_settlement_batches (T+X day payout batches with UTR & invoice)
  └── monthly_settlements (Monthly fee split reconciliations)
```

---

## 3. Detailed Data Dictionaries

### 3.1 `users`
Multi-tenant user credentials, role-based access, and session management.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique user identifier |
| `restaurant_id` | `UUID` | `NULLABLE, REFERENCES restaurants(id) ON DELETE CASCADE` | Associated restaurant (`NULL` for Super Admin) |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Normalized lowercase email address |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Cryptographic hash (`bcrypt` work factor $\ge 10$) |
| `role` | `VARCHAR(32)` | `NOT NULL` | `SUPER_ADMIN`, `RESTAURANT_OWNER`, `RESTAURANT_MANAGER`, `STAFF`, `CUSTOMER` |
| `full_name` | `VARCHAR(128)` | `NOT NULL` | User full legal name |
| `phone_number` | `VARCHAR(20)` | `NULLABLE, UNIQUE` | Contact/login phone number |
| `must_reset_password` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Set to `TRUE` for auto-generated brand passwords |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Active account status flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record last modification timestamp |

---

### 3.2 `restaurants`
Core tenant record capturing business profiles, onboarding status, and financial terms.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique restaurant identifier |
| `legal_name` | `VARCHAR(255)` | `NOT NULL` | Registered legal business entity name |
| `brand_name` | `VARCHAR(255)` | `NOT NULL` | Public customer-facing brand name |
| `slug` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | URL-safe slug for web menus and routing |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Primary operations contact phone |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Registered business contact email |
| `address_line1` | `VARCHAR(255)` | `NOT NULL` | Street address line 1 |
| `address_line2` | `VARCHAR(255)` | `NULLABLE` | Street address line 2 |
| `city` | `VARCHAR(100)` | `NOT NULL` | City name |
| `state` | `VARCHAR(100)` | `NOT NULL` | State or Union Territory |
| `postal_code` | `VARCHAR(20)` | `NOT NULL` | Postal PIN code |
| `status` | `VARCHAR(32)` | `NOT NULL DEFAULT 'ONBOARDING'` | `ONBOARDING`, `ACTIVE`, `SUSPENDED` |
| `prebooking_split_percentage` | `DECIMAL(5, 2)` | `NOT NULL DEFAULT 20.00` | Agreed platform split % strictly on pre-booking fees |
| `payout_delay_days` | `INT` | `NOT NULL DEFAULT 2` | Holding delay period ($X$ days) post-completion |
| `opening_time` | `TIME` | `NOT NULL DEFAULT '09:00:00'` | Default venue daily opening time |
| `closing_time` | `TIME` | `NOT NULL DEFAULT '23:00:00'` | Default venue daily closing time |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Record last modification timestamp |

---

### 3.3 `compliance_documents`
Verification records for the 4 mandatory onboarding legal artifacts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique document record identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE CASCADE` | Parent restaurant tenant |
| `document_type` | `VARCHAR(32)` | `NOT NULL` | `DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID` |
| `file_s3_key` | `VARCHAR(512)` | `NOT NULL` | Private S3 bucket object storage key |
| `status` | `VARCHAR(32)` | `NOT NULL DEFAULT 'PENDING'` | `PENDING`, `APPROVED`, `REJECTED` |
| `rejection_reason` | `TEXT` | `NULLABLE` | Mandatory feedback note if status is `REJECTED` |
| `verified_by_user_id`| `UUID` | `NULLABLE, REFERENCES users(id)` | Super Admin who executed verification |
| `verified_at` | `TIMESTAMPTZ` | `NULLABLE` | Verification execution timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Upload timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last review timestamp |

---

### 3.4 `dining_zones`
Spatial architectural areas within a dining venue (e.g. AC Main Dining, Rooftop, Patio).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique zone identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE CASCADE` | Parent restaurant tenant |
| `name` | `VARCHAR(100)` | `NOT NULL` | Zone display name |
| `description` | `TEXT` | `NULLABLE` | Zone characteristics and notes |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Zone availability flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last update timestamp |

---

### 3.5 `restaurant_tables`
Physical tables mapped to dining zones, bound to cryptographic QR codes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique table identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE CASCADE` | Parent restaurant tenant |
| `zone_id` | `UUID` | `NOT NULL, REFERENCES dining_zones(id) ON DELETE RESTRICT` | Associated dining zone |
| `table_number` | `VARCHAR(20)` | `NOT NULL` | Physical table label/number (e.g. "T-01", "R-12") |
| `seating_capacity` | `INT` | `NOT NULL CHECK (seating_capacity > 0)` | Maximum guest capacity |
| `qr_secret_hash` | `VARCHAR(255)` | `NOT NULL` | Table-specific salt used for HMAC verification |
| `status` | `VARCHAR(32)` | `NOT NULL DEFAULT 'VACANT'` | `VACANT`, `OCCUPIED`, `RESERVED` |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Active table inventory flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last update timestamp |

---

### 3.6 `kitchen_printers`
Hardware thermal printers registered by venue managers for automated category KOT dispatch.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique printer identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE CASCADE` | Parent restaurant tenant |
| `name` | `VARCHAR(100)` | `NOT NULL` | Human-readable name (e.g. "Shawarma Station") |
| `ip_address` | `VARCHAR(45)` | `NOT NULL` | Local static LAN IP address (e.g. "192.168.1.150") |
| `port` | `INT` | `NOT NULL DEFAULT 9100` | Raw TCP socket port (Standard ESC/POS: 9100) |
| `paper_width_mm` | `INT` | `NOT NULL DEFAULT 80` | Thermal roll width (e.g. 80mm or 58mm) |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Operational health flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Hardware registration timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last update timestamp |

---

### 3.7 `menu_categories`
Catalog taxonomies for grouping food dishes and directing KOT thermal routing.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique category identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE CASCADE` | Parent restaurant tenant |
| `name` | `VARCHAR(100)` | `NOT NULL` | Category name (e.g. "Shawarma & Wraps") |
| `display_order` | `INT` | `NOT NULL DEFAULT 0` | Sort sequence on customer menus |
| `assigned_printer_id` | `UUID` | `NULLABLE, REFERENCES kitchen_printers(id) ON DELETE SET NULL` | Target thermal printer for automated KOTs |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Visibility flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last update timestamp |

---

### 3.8 `food_items`
Culinary offerings with pricing in Indian Rupees (₹) and 86'd stock controls.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique dish identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE CASCADE` | Parent restaurant tenant |
| `category_id` | `UUID` | `NOT NULL, REFERENCES menu_categories(id) ON DELETE RESTRICT` | Associated menu category |
| `name` | `VARCHAR(150)` | `NOT NULL` | Dish display name |
| `description` | `TEXT` | `NULLABLE` | Dish description, allergens, and dietary notes |
| `price` | `DECIMAL(10, 2)` | `NOT NULL CHECK (price >= 0.00)` | Base unit price in Indian Rupees (INR / ₹) |
| `is_veg` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Vegetarian classification flag |
| `is_available` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Live 86'd stock status (instant toggle) |
| `image_url` | `VARCHAR(512)` | `NULLABLE` | High-resolution dish presentation asset URL |
| `prep_time_minutes` | `INT` | `NOT NULL DEFAULT 15` | Estimated kitchen turnaround duration |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Dish creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Dish update timestamp |

---

### 3.9 `calendar_overrides`
Operating exceptions overriding normal weekly operating hours.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique override record identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE CASCADE` | Parent restaurant tenant |
| `override_date` | `DATE` | `NOT NULL` | The specific calendar date impacted |
| `override_type` | `VARCHAR(32)` | `NOT NULL` | `HOLIDAY` (full closure) or `HALF_DAY` (custom shift) |
| `shift_start_time` | `TIME` | `NULLABLE` | Required if `HALF_DAY`, start of operating shift |
| `shift_end_time` | `TIME` | `NULLABLE` | Required if `HALF_DAY`, end of operating shift |
| `reason` | `VARCHAR(255)` | `NOT NULL` | Public description (e.g. "Diwali Festival Closure") |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last update timestamp |

---

### 3.10 `table_reservations`
Pre-bookings created via Customer App capturing party size, advance fees, and immutable split snapshots.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique pre-booking identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE RESTRICT` | Target venue |
| `table_id` | `UUID` | `NOT NULL, REFERENCES restaurant_tables(id) ON DELETE RESTRICT` | Reserved physical table |
| `customer_name` | `VARCHAR(128)` | `NOT NULL` | Customer primary contact name |
| `customer_phone` | `VARCHAR(20)` | `NOT NULL` | Customer phone number |
| `customer_email` | `VARCHAR(255)` | `NOT NULL` | Customer email address for booking pass |
| `reservation_date` | `DATE` | `NOT NULL` | Booking calendar date |
| `slot_time` | `TIME` | `NOT NULL` | Confirmed arrival time slot |
| `party_size` | `INT` | `NOT NULL CHECK (party_size > 0)` | Number of dining guests |
| `prebooking_amount`| `DECIMAL(10, 2)`| `NOT NULL DEFAULT 0.00` | Total upfront pre-booking amount in INR (₹) |
| `applied_split_ratio` | `DECIMAL(5, 2)`| `NOT NULL` | Snapshot of restaurant's split % at checkout |
| `platform_fee_amount` | `DECIMAL(10, 2)`| `NOT NULL DEFAULT 0.00` | Snapshot: Platform cut in INR (₹) |
| `partner_payout_amount`| `DECIMAL(10, 2)`| `NOT NULL DEFAULT 0.00` | Snapshot: Partner cut in INR (₹) |
| `status` | `VARCHAR(32)` | `NOT NULL DEFAULT 'CONFIRMED'` | `CONFIRMED`, `SEATED`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `daily_batch_id` | `UUID` | `NULLABLE, REFERENCES daily_settlement_batches(id)` | Associated daily settlement batch |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Reservation placement timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Status change timestamp |

---

### 3.11 `table_orders`
Active dining orders originating from Pre-Bookings, Table QR web, or manual staff punching. Spot orders have zero platform commission.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique order ticket identifier |
| `order_number` | `VARCHAR(32)` | `NOT NULL, UNIQUE` | Human-friendly alphanumeric identifier (e.g. "ORD-84920") |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE RESTRICT` | Tenant restaurant |
| `table_id` | `UUID` | `NOT NULL, REFERENCES restaurant_tables(id) ON DELETE RESTRICT` | Physical table where food is served |
| `reservation_id`| `UUID` | `NULLABLE, REFERENCES table_reservations(id)` | Linked pre-booking (if pre-ordered meal) |
| `order_type` | `VARCHAR(32)` | `NOT NULL` | `PRE_BOOKING`, `ON_TABLE_QR`, `STAFF_PUNCHED` |
| `status` | `VARCHAR(32)` | `NOT NULL DEFAULT 'CONFIRMED'` | `CONFIRMED`, `PREPARING`, `SERVED`, `COMPLETED`, `CANCELLED` |
| `gross_food_amount` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Subtotal of ordered items in INR (₹) |
| `tax_amount` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Calculated GST in INR (₹) |
| `total_bill_amount` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Final payable total in INR (₹) |
| `customer_id` | `UUID` | `NULLABLE, REFERENCES users(id)` | Authenticated diner account |
| `customer_name` | `VARCHAR(128)` | `NOT NULL` | Diner verified name captured during spot order |
| `customer_phone` | `VARCHAR(20)` | `NOT NULL` | Diner verified mobile phone number |
| `client_ip` | `VARCHAR(45)` | `NOT NULL` | Remote client IP address (Admin-only visibility, masked from restaurant) |
| `user_agent` | `VARCHAR(255)` | `NULLABLE` | Device and browser audit footprint |
| `customer_notes` | `TEXT` | `NULLABLE` | Guest dietary or preparation instructions |
| `completed_at` | `TIMESTAMPTZ` | `NULLABLE` | Timestamp when dining finished & order marked COMPLETED (anchors T+X delay clock) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Order placement timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Rush board status update timestamp |

---

### 3.12 `order_items`
Individual line items on an order, carrying category and printer snapshots for atomic KOT printing.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique line item identifier |
| `order_id` | `UUID` | `NOT NULL, REFERENCES table_orders(id) ON DELETE CASCADE` | Parent order ticket |
| `food_item_id` | `UUID` | `NOT NULL, REFERENCES food_items(id) ON DELETE RESTRICT` | Originating dish record |
| `item_name_snapshot` | `VARCHAR(150)` | `NOT NULL` | Immutable dish name snapshot |
| `unit_price_snapshot`| `DECIMAL(10, 2)`| `NOT NULL` | Immutable unit price in INR (₹) at order time |
| `quantity` | `INT` | `NOT NULL CHECK (quantity > 0)` | Quantity ordered |
| `category_id_snapshot` | `UUID` | `NOT NULL, REFERENCES menu_categories(id)` | Snapshotted menu category |
| `assigned_printer_id_snapshot` | `UUID` | `NULLABLE, REFERENCES kitchen_printers(id)` | Target printer routed for this dish |
| `kot_printed_at` | `TIMESTAMPTZ` | `NULLABLE` | Timestamp when thermal print dispatched |
| `special_instructions` | `TEXT` | `NULLABLE` | Line item cooking instructions (e.g. "extra spicy") |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Item addition timestamp |

---

### 3.13 `daily_settlement_batches`
Rolling daily settlement batches tracking delayed $T+X$ day pre-booked food payouts, booking metrics, bank UTR, and partner tax invoices.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique batch identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE RESTRICT` | Destination restaurant |
| `batch_date` | `DATE` | `NOT NULL` | Calendar date of dining orders settled |
| `holding_matures_at` | `TIMESTAMPTZ` | `NOT NULL` | Maturity timestamp (strictly completed_at + X days post dining) |
| `prebookings_created_count` | `INT` | `NOT NULL DEFAULT 0` | Total pre-bookings initiated for this batch date |
| `prebookings_completed_count`| `INT` | `NOT NULL DEFAULT 0` | Total pre-bookings fulfilled and completed |
| `gross_food_sales` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Total pre-booked food revenue in INR (₹) |
| `platform_fee_deduction` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Deducted platform split share in INR (₹) |
| `net_payout_amount` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Net payable amount transferred to partner in INR (₹) |
| `status` | `VARCHAR(32)` | `NOT NULL DEFAULT 'HOLDING_DELAY'` | `HOLDING_DELAY`, `DISBURSABLE`, `SETTLED` |
| `utr_number` | `VARCHAR(64)` | `NULLABLE` | Bank transfer Unique Transaction Reference (UTR) |
| `invoice_number` | `VARCHAR(64)` | `NULLABLE, UNIQUE` | Formal sequential Tax Invoice number |
| `invoice_pdf_url` | `VARCHAR(512)` | `NULLABLE` | Presigned URL to downloadable partner PDF invoice |
| `settled_at` | `TIMESTAMPTZ` | `NULLABLE` | Timestamp when Admin logged UTR disbursement |
| `settled_by_admin_id` | `UUID` | `NULLABLE, REFERENCES users(id)` | Super Admin who approved and disbursed funds |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Batch creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Batch status modification timestamp |

---

### 3.14 `monthly_settlements`
Monthly financial statement consolidating platform pre-booking fee splits.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique statement record identifier |
| `restaurant_id` | `UUID` | `NOT NULL, REFERENCES restaurants(id) ON DELETE RESTRICT` | Partner venue |
| `period_month` | `VARCHAR(7)` | `NOT NULL` | Month period identifier (e.g. "2026-11") |
| `total_prebookings_count` | `INT` | `NOT NULL DEFAULT 0` | Monthly total pre-bookings transacted |
| `gross_prebooking_fees` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Total pre-booking upfront fees collected in INR (₹) |
| `platform_share_total` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Total platform revenue retained in INR (₹) |
| `partner_share_total` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Total partner share disbursed in INR (₹) |
| `statement_pdf_url` | `VARCHAR(512)` | `NULLABLE` | Downloadable monthly summary statement URL |
| `generated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Generation timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp |

---

## 4. Compound & Strategic Performance Indexes

| Index Name | Table | Columns | Purpose |
|---|---|---|---|
| `idx_users_email` | `users` | `(email)` | Instant credential lookup during login |
| `idx_users_restaurant_role` | `users` | `(restaurant_id, role)` | Multi-tenant team queries |
| `idx_restaurants_status` | `restaurants` | `(status)` | Super Admin directory filtering |
| `idx_compliance_docs_rest_type` | `compliance_documents` | `(restaurant_id, document_type)` | Activation gate validation checks |
| `idx_tables_restaurant_zone` | `restaurant_tables` | `(restaurant_id, zone_id)` | Floor map rendering |
| `idx_printers_restaurant_active` | `kitchen_printers` | `(restaurant_id, is_active)` | Hardware dispatch discovery |
| `idx_food_items_rest_cat_avail` | `food_items` | `(restaurant_id, category_id, is_available)` | High-speed menu ordering queries |
| `idx_calendar_overrides_lookup` | `calendar_overrides` | `(restaurant_id, override_date)` | Daily booking availability guards |
| `idx_reservations_rest_date` | `table_reservations` | `(restaurant_id, reservation_date, status)` | Pre-booking slot conflict checks |
| `idx_orders_rest_status_created`| `table_orders` | `(restaurant_id, status, created_at DESC)` | Real-time Kitchen Rush Board queries |
| `idx_orders_table_status` | `table_orders` | `(table_id, status)` | Active table order retrieval |
| `idx_order_items_order_printer` | `order_items` | `(order_id, assigned_printer_id_snapshot)` | Automated category KOT dispatch |
| `idx_daily_settlements_fifo` | `daily_settlement_batches` | `(status, holding_matures_at ASC)` | Admin Daily Settlement window FIFO sorting queue |
| `idx_daily_settlements_rest_date`| `daily_settlement_batches` | `(restaurant_id, status, batch_date DESC)` | Multi-criteria filtering & partner Settlements tab |
| `idx_monthly_settlements_lookup`| `monthly_settlements` | `(restaurant_id, period_month)` | Monthly partner statement tab |

---

## 5. Foreign Key & Integrity Constraints

1. **Activation Gate Enforcement:**
   - A database trigger or application transaction verifies that all 4 records in `compliance_documents` (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`) are `status = 'APPROVED'` before `restaurants.status` can transition to `ACTIVE`.
2. **Category Printer Reassignment (`ON DELETE SET NULL`):**
   - Deleting a physical printer record cleanly resets `menu_categories.assigned_printer_id` to `NULL` without breaking category menus or deleting food items. Unassigned items default to venue primary printer.
3. **Immutability of Pre-Booking Financials:**
   - Columns `applied_split_ratio`, `platform_fee_amount`, and `partner_payout_amount` on `table_reservations` are written upon reservation confirmation and cannot be modified by updates to `restaurants.prebooking_split_percentage`.
4. **Spot Orders Zero Split:**
   - Table QR and manual staff orders logged in `table_orders` have no platform commission cuts. Diners settle gross bills directly with the venue cashier.
5. **Anti-Fraud Attribution & IP Privacy Isolation:**
   - Every spot order recorded in `table_orders` requires verified `customer_name` and `customer_phone`.
   - `client_ip` is captured automatically during order creation. Backend serialization rules and database projection views strictly prohibit selecting or serializing `client_ip` to restaurant tenant users. Only Super Admin has access to customer IP address information in the Global Audit Ledger.
