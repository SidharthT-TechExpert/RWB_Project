# QuickBite – Phase 1 MVP Product Requirements Document

| | |
|---|---|
| **Project** | QuickBite — Restaurant Operations B2B SaaS Platform |
| **Version** | 1.0 (Full Specification) |
| **Status** | Verified & Approved for Implementation |
| **Date** | 13 Nov 2026 |
| **Scope** | Phase 1 MVP (Admin Portal + Restaurant B2B Portal + On-Table QR Menu) |

---

## 1. Overview

### 1.1 Problem
During peak lunch and dinner hours, traditional dine-in restaurant operations face severe friction:
- **Long Waiter Wait Times:** Customers spend an average of 10 to 20 minutes waiting for waitstaff to notice them, hand over physical menus, take order notes, and manually punch them into legacy billing systems.
- **Table Turnaround Bottlenecks:** Delayed order-taking stretches table occupancy times, reducing seatings per shift, driving away walk-in diners, and causing direct revenue loss.
- **Kitchen Rush & Out-of-Stock Friction:** Waitstaff frequently take orders for dishes that are already sold out (86'd) in the kitchen during peak rushes, causing customer frustration and repeated visits to change orders.
- **Fragmented Management:** Restaurant owners lack a single reliable SaaS platform to manage table inventory, live digital menus, shift schedules, and commission payouts in one place.

### 1.2 Product Vision
QuickBite digitally empowers restaurants by moving table, menu, and order operations onto a unified B2B SaaS platform. Restaurant owners manage their tables, digital menus, rush orders, and settlements, while admins manage compliance, partner onboarding, and platform settings. Customers seated at tables simply scan a table QR code to view live digital menus and order food on the spot—eliminating waiter wait times without requiring any customer mobile app download.

### 1.3 Goals
1. Digitize the complete in-restaurant ordering flow: QR Scan → Instant Menu → On-the-Spot Order → Live Kitchen Rush Board.
2. Enable restaurant owners to manage tables, digital menus, availability calendars, and monthly settlements from a single B2B portal.
3. Streamline admin onboarding with formal document verification and a compliance activation gate.
4. Provide transparent order and dining revenue tracking for restaurant owners and platform administrators.

### 1.4 Success Metrics
| Metric | Target (Phase 1) |
|---|---|
| Time from seating to order placed | Reduced from 15 mins to < 3 mins via on-table QR |
| Peak-hour table turnaround time | 20–30% faster table turnover |
| Out-of-stock ordering complaints | 0 (eliminated via real-time 86'd stock toggle) |
| Active restaurants with verified mandatory compliance documents | 100% |
| Accurate order tracking and revenue reporting | 100% |

---

## 2. Users and Roles

| Role | Surface | Access |
|---|---|---|
| **Super Admin** | Web Admin Portal | Full visibility over all restaurants, partner onboarding, compliance document approval, split ratio setting, global sales audit, and monthly settlement execution. |
| **Restaurant Owner (B2B Partner)** | Web B2B Portal | Own restaurant data only: table layout, table QR code download, live digital food menu, holiday/availability calendar, live rush order board, manual bookings, and monthly payout statements. |
| **Diner (Customer)** | Mobile Browser (Table QR) | Read live menu and place on-the-spot food orders bound to table ID. Zero app download, zero customer account setup required. |

---

## 3. Scope

### 3.1 In Scope (Phase 1 MVP)
- **Super Admin Web Portal:** Partner onboarding, credentials provisioning, document compliance queue with approval/rejection, commercial split ratio configuration (profile setting), global order & booking audit log, monthly settlement statement generation and payout recording.
- **Restaurant Owner B2B Portal:** Login, table & zone configuration, high-resolution table QR generation and download, slot-based availability engine, holiday/half-day availability calendar overrides, category & food menu management with instant stock (86'd) toggle, live rush order/reservation board, direct manual order creation & live order management, manual walk-in booking creation, revenue dashboard, and monthly settlement view.
- **On-Table QR Digital Menu (Customer Surface):** Responsive mobile web interface accessed via physical table QR scan, category browsing, item search, dietary filters, instant cart, and direct on-the-spot order placement bound to the table ID.
- **Automation:** Instant ticket dispatch to restaurant Live Rush Board upon QR order submission; automated monthly settlement statement generation on the 1st of each month.

### 3.2 Out of Scope (Deferred to Future Phases)
- Standalone consumer mobile applications (iOS/Android native apps) — deliberately excluded from Phase 1.
- Public customer discovery marketplace / consumer restaurant directory.
- VIP / Premium customer loyalty tiers and club memberships.
- Role-based sub-accounts for restaurant staff (Branch Manager, Cashier, KDS Chef) — scheduled for Phase 2 RBMS.
- In-app digital payment gateway for diners (orders are recorded in-restaurant and settled via standard in-person/cashier billing in Phase 1).
- External POS hardware printer integration (scheduled for Phase 3).

---

## 4. End-to-End Flow

```
Admin onboards Restaurant & provisions Owner login
   ↓
Admin uploads & verifies mandatory compliance documents (FSSAI, GST, Bank Proof, Owner ID)
   ↓
All mandatory documents verified → Admin activates Restaurant (Draft → Active)
   ↓
Owner logs into B2B Portal: sets up tables & generates Table QR Codes
   ↓
Owner creates digital food menu (categories, dishes, prices, photos, dietary tags)
   ↓
Diner sits at physical table → scans Table QR Code via smartphone browser
   ↓
Live Digital Menu opens instantly (displays in-stock items & active shift menu)
   ↓
Diner adds food items to cart & taps "Place Order"
   ↓
Order ticket pushes instantly to Restaurant's Live Rush Board with Table ID
   ↓
Restaurant kitchen prepares food & floor staff serves order: Confirmed → Preparing → Served
   ↓
Table dining concludes: Owner marks order Completed & frees table slot
   ↓
Month-end: System consolidates closed orders into Monthly Settlement Statement
   ↓
Admin reviews statement, executes bank payout, and records UTR Reference Number
   ↓
Restaurant Owner views and downloads verified Settlement Statement in B2B Portal
```

### 4.1 Entity Statuses
| Entity | Statuses |
|---|---|
| Restaurant / Company | `Draft` → `Active` / `Suspended` |
| Compliance Document | `Pending Review` → `Approved` / `Rejected` |
| Restaurant Table | `Available` → `Reserved` → `Seated / Active Order` → `Needs Cleaning` |
| Table Order | `Confirmed` → `Preparing` → `Served` → `Completed` / `Cancelled` |
| Calendar Day | `Full Day` (Default) → `Half Day` / `Holiday (Closed)` |
| Monthly Settlement | `Accruing` → `Generated` → `Paid` |

---

## 5. Functional Requirements

Priority: **P0** = Must-have for Phase 1 launch, **P1** = Important operational feature, **P2** = Nice-to-have optimization.

### 5.1 Super Admin Web Portal

| ID | Requirement | Priority |
|---|---|---|
| A-01 | Admin logs in via secure authenticated credentials with session management and rate limiting. | P0 |
| A-02 | **Company Management:** Admin adds and edits restaurant partner profiles (legal entity name, brand display name, owner contact, phone, email, full address, cuisine tags, logo, banner). | P0 |
| A-03 | **Credentials Provisioning:** System automatically creates restaurant owner account with secure temporary password upon restaurant profile creation. | P0 |
| A-04 | **Document Compliance Upload:** Admin uploads partner legal documents (FSSAI license, GST registration, bank proof, owner ID) with document numbers and expiry dates. | P0 |
| A-05 | **Document Verification:** Admin marks each document as `Approved` or `Rejected` (with mandatory rejection reason). | P0 |
| A-06 | **Activation Gate:** System strictly prohibits changing restaurant status from `Draft` to `Active` unless all mandatory documents (FSSAI, GST, Bank Proof, Owner ID) are in `Approved` state. | P0 |
| A-07 | **Visibility Toggle:** Admin can toggle active partner between `Active` and `Suspended` (instantly halts customer QR ordering during disputes/maintenance). | P0 |
| A-08 | **Commercial Split Ratio Configuration:** Admin can configure and view the commercial split percentage on a restaurant's profile (e.g., Platform 15% / Partner 85%) for administrative record-keeping. (Note: Split ratio is a configuration setting only in Phase 1 and does not execute automatic order-level deductions). | P0 |
| A-09 | **Global Audit Ledger:** Filterable log of all orders and bookings across all restaurants with status, table ID, amounts, and timestamps. | P1 |
| A-10 | **Monthly Settlement Processing:** Auto-generated settlement statements on the 1st of each month summarizing monthly gross dining sales. Admin inputs payout UTR reference number and payment date to mark statement as `Paid`. | P0 |
| A-11 | **Admin Reports Dashboard:** Platform-wide metrics: total GMV, gross sales volume, and active venue counts. | P1 |

**Acceptance (A-06):** Given a restaurant in `Draft` status, when Admin attempts to activate it with any mandatory document missing or rejected, the system rejects the action with a clear error prompt and locks the status to `Draft`.

---

### 5.2 Restaurant Owner B2B Web Portal

| ID | Requirement | Priority |
|---|---|---|
| R-01 | Restaurant Owner logs in using Admin-provisioned credentials; accesses own venue data only. | P0 |
| R-02 | **Dining Zones:** Owner creates and organizes dining areas (e.g., Main Hall, AC Lounge, Terrace, Private Booth). | P1 |
| R-03 | **Table Management:** Owner adds tables with table numbers (e.g., T-01), guest capacity (2, 4, 6, 8+ pax), and assigned zone. | P0 |
| R-04 | **Table QR Generation:** System generates unique, high-resolution, printable QR codes tied to each physical table ID. Owner can download single or bulk printable sheets. | P0 |
| R-05 | **Slot-Based Availability Engine:** Owner configures daily operating hours and reservation slot duration blocks (e.g., 90 or 120 mins) to prevent overbooking. | P0 |
| R-06 | **Holiday & Availability Calendar (Full Day Default):** All calendar days default to standard full-day operating hours without requiring manual daily setup. | P0 |
| R-07 | **Half-Day Shift Override:** Owner can set specific dates to **Half Day** (Lunch shift only, Dinner shift only, or custom hours), automatically restricting available slots to that window. | P0 |
| R-08 | **Holiday / Closed Override:** Owner can mark specific dates as **Holiday (Full-Day Closed)** to halt table bookings and QR ordering for the day, with one-click reset to Full Day. | P0 |
| R-09 | **Menu Categories:** Owner creates, reorders, and edits food categories (e.g., Starters, Main Course, Chef Specials, Beverages, Desserts). | P0 |
| R-10 | **Food Menu Items:** Owner configures dish name, description, price, food photo, dietary tag (`Veg`, `Non-Veg`, `Egg`, `Vegan`, `Jain`), preparation time, and spice level. | P0 |
| R-11 | **Instant Stock Toggle (86'd Items):** One-click toggle (`In Stock` / `Sold Out`) instantly disables unavailable dishes on the on-table QR digital menu. | P0 |
| R-12 | **Live Rush Operations Board:** Real-time dashboard showing active floor table orders and reservations categorized by table number. | P0 |
| R-13 | **Manual Booking Entry ("Create Book Table"):** Owner can manually enter phone/walk-in reservations, instantly locking the selected table inventory slot. | P0 |
| R-14 | **Manual Order Creation ("Create Order / Punch Order"):** Restaurant side can create orders directly in the B2B portal (for walk-in or phone diners) by selecting a table, choosing dishes from the live menu, and placing the order without requiring a customer QR scan. | P0 |
| R-15 | **Active Order Management:** Restaurant side can manage all live orders: view item breakdown by table, append additional items/rounds of food to an active seated table, and track live order subtotals. | P0 |
| R-16 | **Order Status Actions:** Owner updates order progression with one click: `Confirmed` → `Preparing` → `Served` → `Completed` / `Cancelled`. | P0 |
| R-17 | **Revenue Dashboard:** Live view of daily and monthly gross sales, total order counts, and net dining revenue. | P0 |
| R-18 | **Monthly Settlement Statements:** View and download monthly statements showing complete transaction breakdown, settlement status, and Admin payment UTR references. | P0 |

**Acceptance (R-14):** Given an occupied table, when the restaurant staff opens "Create Order", selects the table and items from the menu, and clicks submit, the order is immediately created, displayed on the Live Rush Board, and bound to that table.

**Acceptance (R-11):** Given a dish marked `In Stock`, when the owner toggles it to `Sold Out` on the B2B portal, any customer viewing or scanning the table QR code sees the item as disabled with a "Sold Out" badge within 1 second.

---

### 5.3 On-Table QR Digital Menu (Customer Surface)

| ID | Requirement | Priority |
|---|---|---|
| T-01 | Diner scans physical table QR code on their smartphone camera; loads mobile web digital menu instantly with zero app download or login required. | P0 |
| T-02 | URL cryptographically binds the session to the specific restaurant and physical table ID (`/menu/:slug?table=:tableId&sig=:signature`). | P0 |
| T-03 | Displays restaurant branding, table number badge (e.g., "Table #04"), and operational shift status. | P0 |
| T-04 | Category navigation bar allows rapid jumping between food sections. | P0 |
| T-05 | Dish cards show photo, name, description, price, dietary tags, prep time, and `+ Add` button. | P0 |
| T-06 | Sold-out dishes display disabled with a prominent "Sold Out for Today" indicator and cannot be added to cart. | P0 |
| T-07 | Interactive floating order drawer shows live items count, subtotal, and allows adding special cooking instructions (e.g., "Less spicy"). | P0 |
| T-08 | Tapping "Place Order" generates an instant digital order receipt on the phone screen and pushes the order ticket directly to the restaurant's Live Rush Board under that table ID. | P0 |

**Acceptance (T-08):** Given a diner seated at Table 5, when they submit an order via QR web menu, an audible/visual order alert appears on the Restaurant B2B Live Rush Board labeled "Table 5" with the exact ordered items and timestamps.

---

### 5.4 Document Verification & Compliance Rules

```
Admin uploads Restaurant Documents (FSSAI, GST, Bank Proof, Owner ID)
   ↓
Admin verifies Document Number, Expiry Date, and Legibility
   ↓
Admin sets status: Approved or Rejected (with mandatory reason)
   ↓
System checks Mandatory Document Rule:
   • FSSAI License: Approved?
   • GST Certificate: Approved?
   • Bank Proof: Approved?
   • Owner KYC ID: Approved?
   ↓
All 4 Approved → Restaurant unlocked for Activation (Draft → Active)
Any Missing/Rejected → Activation locked; Admin notified of deficiency
```

#### Document Checklist Matrix
| Document Type | Code | Mandatory? | Required Metadata | Expiry Date Tracked? |
|---|---|:---:|---|:---:|
| **FSSAI / Food License** | `DOC_FSSAI` | **Yes** | 14-digit License Number | **Yes** |
| **GST Registration** | `DOC_GST` | **Yes** | 15-character GSTIN | No |
| **Bank Account Proof** | `DOC_BANK` | **Yes** | Bank Name, Account Number, IFSC, Account Holder Name | No |
| **Owner Government ID** | `DOC_KYC_ID` | **Yes** | ID Type (Aadhaar/Passport/PAN), ID Number | Optional |
| **Trade License** | `DOC_TRADE` | Optional | Permit / License Number | **Yes** |
| **Signed Partner Contract** | `DOC_AGREEMENT`| Optional | Agreement Signing Date, Version | Optional |

---

### 5.5 Commercial Split Setting & Monthly Settlement Rules

**Commercial Split Ratio (Configuration Only)**
- The commercial split percentage is recorded on the restaurant profile by the Super Admin during onboarding (e.g., Platform 15% / Partner 85%) as an agreed commercial reference.
- **Phase 1 & Phase 2 Scope Boundary:** In Phase 1 and Phase 2, the split ratio is an administrative configuration setting only. It is **not applied anywhere** in live order calculations, table ordering, customer totals, or automated revenue deductions. All orders record actual dining amounts.

**Monthly Settlement Lifecycle**
- On the 1st of every calendar month, the system consolidates all completed orders from the prior month for each restaurant.
- **Statement Data:** Restaurant legal details, billing period (`YYYY-MM`), total completed orders count, and total gross dining revenue.
- **Payout Settlement:** Admin executes the bank wire/NEFT transfer to the restaurant's verified bank account and inputs the payment UTR number and transfer date into the statement record.
- Once marked `Paid`, the statement is permanently locked and available for download by both Admin and Restaurant Owner.

---

### 5.6 Reports & Operational Analytics

| Report | Surface | Description |
|---|---|---|
| **Platform Revenue Report** | Admin | Monthly GMV, total commission revenue, and pending payout liabilities. |
| **Compliance Audit Report** | Admin | Onboarding pipeline, document approval statuses, and upcoming license expiry alerts. |
| **Partner Sales & Order Volume** | Admin | Gross sales volume, order counts, and cancellation rates per restaurant. |
| **Peak-Hour Rush Report** | Owner | Hourly order density and table turnover velocity to optimize floor staffing. |
| **Menu Item Velocity Report** | Owner | Top-selling dishes by volume and revenue contribution; frequency of out-of-stock toggles. |
| **Monthly Settlement Statement** | Owner & Admin | Formal tax-compliant statement with order-level itemization and bank UTR payment receipt. |

---

## 6. Data Model (High Level)

| Entity | Key Fields | Description |
|---|---|---|
| **CompanyRestaurant** | `id`, `legalName`, `displayName`, `slug`, `email`, `phone`, `address`, `platformSplitPct`, `status` (`DRAFT`/`ACTIVE`/`SUSPENDED`), `createdAt` | Core tenant entity representing a partner restaurant business. |
| **ComplianceDocument** | `id`, `restaurantId`, `documentType`, `documentNumber`, `fileUrl`, `expiryDate`, `status` (`PENDING`/`APPROVED`/`REJECTED`), `rejectionReason`, `verifiedAt` | Legal compliance and KYC documents uploaded and verified by Admin. |
| **DiningZone** | `id`, `restaurantId`, `name`, `description` | Physical dining section within the restaurant (e.g., Main Hall, Terrace). |
| **RestaurantTable** | `id`, `restaurantId`, `zoneId`, `tableNumber`, `capacity`, `qrCodeUrl`, `qrSecurityToken`, `currentStatus` | Physical table entity with bound seating capacity and cryptographic QR token. |
| **CalendarOverride** | `id`, `restaurantId`, `overrideDate`, `overrideType` (`FULL_DAY`/`HALF_DAY`/`HOLIDAY`), `activeStartTime`, `activeEndTime` | Date-specific shift and holiday overrides modifying base operating hours. |
| **MenuCategory** | `id`, `restaurantId`, `name`, `sortOrder`, `isActive` | Organizational menu categories. |
| **FoodItem** | `id`, `restaurantId`, `categoryId`, `name`, `description`, `price`, `photoUrl`, `dietaryTag`, `prepTimeMinutes`, `isAvailable` | Dish master record with live 86'd stock toggle (`isAvailable`). |
| **TableOrder** | `id`, `restaurantId`, `tableId`, `orderNumber`, `grossAmount`, `orderStatus`, `createdAt` | Dine-in order transaction record with table binding. |
| **OrderItem** | `id`, `orderId`, `foodItemId`, `itemName`, `unitPrice`, `quantity`, `specialInstructions` | Line items included in a specific table order. |
| **MonthlySettlement** | `id`, `restaurantId`, `billingMonth`, `totalGrossSales`, `completedOrdersCount`, `status` (`ACCRUING`/`GENERATED`/`PAID`), `payoutReferenceId`, `paidAt` | Consolidated month-end dining sales billing statement. |

### 6.1 Glossary

| Term | Meaning |
|---|---|
| **Company / Restaurant** | The B2B partner operating one or more dining establishments on the QuickBite platform. |
| **Platform** | QuickBite, the SaaS operating company providing the restaurant operations platform. |
| **On-Table QR** | Unique cryptographic QR code affixed to a dining table that loads the table's digital menu on diners' mobile web browsers. |
| **86 / Sold Out** | Industry term for an item that is temporarily out of stock in the kitchen; toggled on the portal to prevent customer orders. |
| **Activation Gate** | Strict business rule preventing a restaurant from being set to `Active` until all mandatory compliance documents are approved. |
| **Live Rush Board** | Real-time operational Kanban/board in the B2B portal displaying active table orders and reservation slots. |

---

## 7. Non-Functional Requirements

- **Security & Multi-Tenancy:** Strict tenant boundary enforcement at the database and API middleware layer. Restaurant owners and staff can never view or modify another venue's data.
- **Audit Logging:** Immutably log all modifications to restaurant profiles, document verification approvals/rejections, and monthly payout records (recording who, what, when, and IP).
- **Sub-Second Performance:** Table QR digital menu initial load time must be under `1.2 seconds` on 4G connections. Instant stock (86'd) toggles must propagate to customer screens in $\le 500\text{ ms}$.
- **Tamper-Resistant QR Codes:** Table URLs include an HMAC security token to prevent diners from manipulating table numbers in the URL bar.
- **Reliability:** Idempotent order processing ensuring no duplicate ticket creation; atomic reservation locking preventing overlapping table seatings.
- **Storage:** Secure cloud object storage (AWS S3 / Cloudinary) with signed, time-limited URLs for compliance documents and compressed WebP delivery for food imagery.
- **Responsive Design:** Super Admin and Restaurant B2B portals optimized for desktop and tablet screens; on-table QR digital menu fully responsive and thumb-friendly on mobile browsers.

---

## 8. Assumptions, Risks and Open Questions

### 8.1 Decisions and Assumptions
**Confirmed Decisions**
1. Phase 1 focuses exclusively on B2B SaaS (Super Admin Portal, Restaurant B2B Portal, and On-Table QR Menu). No consumer mobile app.
2. Restaurant activation is blocked until all 4 mandatory documents (FSSAI, GST, Bank Proof, Owner ID) are approved by Admin.
3. The commercial split ratio is an Admin profile configuration only; it does not calculate or execute automatic order deductions in Phase 1 or Phase 2.
4. Unmodified calendar days default to Full Day operating hours; owners override only when needed (Half Day or Holiday Closed).
5. In Phase 1, customer food payments are settled in-restaurant (cash, card, or venue UPI at the counter/table) and reconciled against platform monthly statements.

**Assumed (To be validated during implementation)**
1. Diners have access to basic 4G/5G mobile connectivity or restaurant guest Wi-Fi to load web menus.
2. Platform settlements are executed on the 1st of every month for the preceding calendar month.
3. Cashier/waitstaff review the digital order receipt on the diner's screen before completing the physical billing.

### 8.2 Risks and Mitigations
| Risk | Likelihood | Impact | Mitigation Strategy |
|---|:---:|:---:|---|
| **Weak Mobile Signal Inside Restaurant** | Medium | High | Lightweight mobile web bundle ($< 200\text{ KB}$ initial payload), aggressive local asset caching, and compact WebP images. |
| **Customer Scans Wrong Table QR Code** | Low | Medium | Prominent table identifier displayed in header (e.g., "You are ordering at Table 04"); diner can verify before placing order. |
| **Kitchen Overwhelmed During Rush** | Medium | Medium | Prominent one-click 86 stock toggle allows owner to immediately pause orders for high-prep dishes. |
| **Order Total Discrepancies** | Low | High | Line-item calculation and immutable order gross amounts logged at creation time. |

---

## 9. Release Readiness (Definition of Done)

Phase 1 MVP is ready for production deployment and partner onboarding when:
- [ ] Super Admin can onboard a restaurant, upload and approve all 4 mandatory compliance documents, and set the commercial split percentage.
- [ ] Activation gate verified: System strictly prevents changing restaurant status to `Active` when any mandatory document is missing or rejected.
- [ ] Restaurant Owner can log into the B2B portal, configure tables, generate and download high-resolution table QR codes.
- [ ] Restaurant Owner can create categories, add food items with photos and dietary tags, and toggle dishes between `In Stock` and `Sold Out`.
- [ ] Scanning a generated physical table QR code with a smartphone camera instantly opens the digital menu bound to that exact table ID without requiring app installation or login.
- [ ] Placing an order from the on-table QR menu pushes a ticket immediately to the restaurant's Live Rush Board displaying the correct table number and ordered items.
- [ ] Restaurant side can manually create orders from the B2B portal ("Create Order") and manage live orders (append items, update status).
- [ ] Owner can transition orders on the Live Rush Board through `Confirmed` → `Preparing` → `Served` → `Completed`.
- [ ] System accurately aggregates gross dining revenue on every order and generates an itemized month-end settlement statement.
- [ ] Admin can input payment UTR references and mark monthly settlement statements as `Paid`.
- [ ] All P0 functional requirements pass end-to-end acceptance tests.
