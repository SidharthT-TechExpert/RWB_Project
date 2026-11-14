# QuickBite – Product Requirements Document (PRD)

| Document Metadata | Details |
|---|---|
| **Product Name** | QuickBite — Restaurant Operations B2B SaaS & Dining Platform |
| **Document Type** | Product Requirements Document (PRD) |
| **Document Purpose** | Defines **WHAT** the product does, **WHY** it exists, user personas, problem statements, and functional acceptance criteria (strictly non-technical). |
| **Target Release** | QuickBite Platform (Admin Portal + Restaurant B2B SaaS + Customer Pre-Booking Mobile App + Spot Table QR Menu) |
| **Status** | Approved Specification |

---

## 1. Executive Summary & Problem Statement

### 1.1 The Core Problem
When families plan dining out or corporate professionals schedule business lunch meetings, they face significant, frustrating delays across every stage of the dining experience:

1. **Unpredictable Table & Seat Waiting:** Diners arrive at busy restaurants during peak lunch or dinner hours only to find all tables occupied, forcing them to wait 20 to 45+ minutes in waiting areas or queues.
2. **Waiter & Menu Bottlenecks:** Once finally seated, diners often wait 10 to 15 minutes just for an overworked waiter to notice them, clean the table, and bring physical menus.
3. **Repeated Order-Taking Delays:** Waiting for the waiter to return, explain unavailable items, note down orders by hand, and physically punch tickets creates avoidable downtime.
4. **Kitchen Preparation Lag During Peak Rushes:** Food preparation starts only after this prolonged delay, resulting in meals arriving 45 to 60+ minutes after arrival. For a business lunch, this disrupts meeting schedules; for families with young children, it creates acute restlessness.
5. **Restaurant Operational Bottlenecks:** Restaurant operators struggle during peak rushes because they lack an integrated digital operations system. Managing table occupancy with paper registers, taking manual orders, dealing with sold-out kitchen items mid-service, and coordinating between floor and kitchen leads to chaotic table turns and lost revenue.

### 1.2 The Solution
QuickBite eliminates dining delays through a unified dual-solution:
1. **Food and Seats Pre-Booking (Customer Mobile App):** Diners use the mobile app to reserve their table in advance and pre-select their food order, ensuring that when they arrive for a business meeting or family dinner, their table is waiting and their food is served promptly.
2. **On-the-Spot Food Booking (Table QR Menu):** Walk-in and seated diners scan a physical table QR code with their mobile device to instantly browse the live digital menu and send orders directly to the kitchen without waiting for a waiter.

### 1.3 Why a Proper Restaurant B2B SaaS is the Mandatory Foundation
Food and seats pre-booking cannot work as a standalone consumer app without a **robust Restaurant Operations B2B SaaS product operating inside the restaurant**:
- If a restaurant does not have a live, real-time internal SaaS managing its **floor zones, table capacities, operating calendar shifts, kitchen rush tickets, and instant out-of-stock items**, any external pre-booking or spot ordering system will cause double-booked tables, delayed food, and operational chaos.
- **Therefore, QuickBite builds the restaurant's operational SaaS foundation first:**
  - Complete restaurant floor and table management.
  - Slot-based table availability engine and operating calendar overrides.
  - Live digital menu with instantaneous sold-out (86'd) stock toggles.
  - Real-time Kitchen Live Rush Board for active order tracking.
  - Restaurant staff manual order punching and walk-in reservation creation.
  - Super Admin operations with a 4-document legal compliance activation gate and monthly billing consolidation.

With this SaaS engine actively running the restaurant's daily operations, both **Food & Seat Pre-Booking** (via Customer Mobile App) and **Spot Food Ordering** (via Table QR) operate seamlessly with 100% real-time data integrity.

---

## 2. Product Architecture & System Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 QUICKBITE SYSTEM ECOSYSTEM                             │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ SUPER ADMIN SAAS PORTAL        │ • Partner Onboarding & Account Provisioning           │
│ (Platform Operations)          │ • 4-Document Compliance Verification & Activation Gate│
│                                │ • Commercial Split Setting & Monthly Gross Billing    │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ RESTAURANT B2B SAAS PORTAL     │ • Dining Floor Zones & Table Inventory Management     │
│ (Venue Operations & Kitchen)   │ • High-Resolution Table QR Generation & Downloads     │
│                                │ • Slot Availability Engine & Calendar Overrides       │
│                                │ • Live Food Menu Builder with Instant 86'd Toggle     │
│                                │ • Real-Time Kitchen Live Rush Board                   │
│                                │ • Staff Manual Order Punching & Walk-in Reservations  │
│                                │ • Daily Revenue Summaries & Monthly Settlement Archive│
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ CUSTOMER MOBILE APP            │ • Venue Discovery & Profile Browsing                  │
│ (Food & Table Pre-Booking)     │ • Interactive Date & Time Slot Reservation            │
│                                │ • Guest Party Size & Table Selection                  │
│                                │ • Advance Meal Pre-Ordering from Live Menu            │
│                                │ • Real-Time Booking Status & Digital Confirmation     │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ SPOT FOOD BOOKING (TABLE QR)   │ • Frictionless Mobile Web Digital Menu (Zero App DL)  │
│ (Customer In-Venue Surface)    │ • Automatic Table Session Binding                     │
│                                │ • Real-Time Sold-Out (86'd) Item Protection           │
│                                │ • Instant Kitchen Order Dispatch to Live Rush Board   │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 3. User Personas & Target Audiences

### 3.1 Diners (Consumers)
- **The Business Executive (Meeting Diners):** Opens the Customer Mobile App, reserves a quiet 4-seater table for 1:00 PM, pre-orders lunch courses, and arrives with clients knowing the table is secured and food will be served immediately without delay.
- **The Family Planner (Group Diners):** Plans a weekend family dinner, reserves a 6-person booth in the garden zone, pre-selects family favorites with dietary specifications (e.g., Jain / mild for kids), eliminating long waiting queues.
- **The Walk-in Spot Diner:** Arrives directly at the venue, sits at an open table, scans the table QR code on their phone, browses the menu, and places an order instantly without having to flag down a busy waiter.

### 3.2 Restaurant Operators (B2B Partners)
- **The Restaurant Owner / General Manager:** Wants full control over dining floor layout, table counts, shift calendars, live food menus, incoming pre-bookings, gross sales summaries, and monthly payouts.
- **The Floor Captain / Waitstaff:** Needs a clear view of which tables are occupied, upcoming pre-booking arrivals, tools to punch manual phone orders or walk-in reservations, and the ability to append extra rounds of food to active tables.
- **The Kitchen Chef / Line Cook:** Needs an organized, real-time board showing incoming order tickets (both pre-booked meals scheduled for arrival and live table orders), item modifications, and preparation timers, with the ability to mark ingredients sold out with one click.

### 3.3 Platform Operators (Super Admin)
- **The Platform Operations Manager:** Onboards new restaurant brands, inspects legal compliance and food safety licenses, enforces the Activation Gate, configures commercial split terms, and processes monthly payouts.

---

## 4. Product Scope

### 4.1 In Scope
- **Super Admin SaaS Operations Portal:**
  - Restaurant partner profile creation and account provisioning.
  - Legal compliance document repository with review, approval, and rejection tracking.
  - Strict Compliance Activation Gate (blocking unverified restaurants from going live).
  - Commercial split ratio profile setting (administrative reference only).
  - Global audit log of all orders, pre-bookings, and dining transactions.
  - Monthly consolidated gross sales statements with bank payout reference tracking.
- **Restaurant B2B Operations SaaS Portal:**
  - Dining floor zone configuration (e.g., Main Dining, AC Hall, Rooftop Terrace).
  - Table inventory management with seat capacity assignments.
  - Printable high-resolution table QR code generator.
  - Slot-based table availability engine (time-slot durations to prevent overbooking).
  - Operating calendar with base full-day hours, half-day shift limits, and holiday closures.
  - Live menu catalog with categories, dish details, pricing, photos, and dietary tags.
  - Instant 86'd stock toggle (one-click sold-out disablement).
  - Real-time Live Rush Board for active kitchen orders, pre-booked arrivals, and seated tables.
  - Manual order creation ("Punch Order") for walk-in and phone-in diners.
  - Active order management (appending extra food rounds and updating progress).
  - Walk-in and phone table reservation creation.
  - Daily and monthly dining revenue summaries and settlement statement archive.
- **Customer Mobile Application (Food & Table Pre-Booking):**
  - Cross-platform mobile app for diners to plan dining in advance.
  - Restaurant discovery, location details, dining photos, and operating status.
  - Interactive table & slot reservation engine (select date, party size, dining zone, and time slot).
  - Advance meal pre-ordering: select dishes from the live digital menu, add cooking notes, and attach to the reservation.
  - Digital pre-booking confirmation receipt with arrival time coordination.
  - Live reservation status tracking (`Confirmed`, `Preparing`, `Ready for Seating`, `Completed`).
- **Spot Food Ordering (On-Table QR Menu):**
  - Frictionless mobile web interface accessed by scanning table QR codes (no app download or customer sign-up required).
  - Secure session automatically bound to the specific physical table ID.
  - Category navigation, dietary filters (`Veg`, `Non-Veg`, `Vegan`, `Jain`), dish photos, and descriptions.
  - Real-time sold-out indicator preventing ordering of unavailable dishes.
  - Floating cart drawer with cooking instructions / notes.
  - Instant order dispatch to the restaurant's Live Rush Board upon submission.

### 4.2 Out of Scope
- Third-party home delivery logistics / delivery driver fleets (QuickBite is strictly focused on dine-in pre-booking and in-venue spot dining).
- Public consumer discount coupon trading or external promotional ad networks.
- Consumer VIP loyalty points, customer subscription tiers, or discount voucher clubs.
- Granular sub-staff role-based permission matrices.
- Integrated consumer in-app digital payment gateway (food bills are settled in-venue via cash, card, or venue POS and reconciled in monthly statements).
- Physical thermal kitchen printer hardware integration.

---

## 5. End-to-End Operational Workflows

### 5.1 Restaurant Onboarding & Compliance Activation Workflow
```
Super Admin registers Restaurant profile & provisions Owner credentials
   ↓
Super Admin uploads 4 Mandatory Compliance Documents (FSSAI, GST, Bank Proof, Owner ID)
   ↓
Super Admin verifies license numbers, validity dates, and authenticity
   ↓
System checks Activation Rule:
   • Are all 4 mandatory compliance documents in "Approved" status?
   ├── NO  → Activation blocked; Restaurant status locked to "Draft"
   └── YES → Super Admin activates Restaurant ("Draft" → "Active")
   ↓
Restaurant Owner logs into B2B SaaS Portal with provisioned credentials
```

### 5.2 Venue Setup & Operational Readiness Workflow
```
Owner defines Dining Zones (e.g., Indoor AC, Garden, Family Section)
   ↓
Owner adds Physical Tables with numbers and seating capacities (e.g., Table 1 - 4 seats)
   ↓
System generates unique printable Table QR Codes bound to each physical table ID
   ↓
Owner downloads and places printed QR codes on physical dining tables
   ↓
Owner builds Food Menu: creates categories, adds dishes, prices, photos, and dietary tags
   ↓
Owner confirms Operating Hours & Calendar Shifts (default: Full Day operating hours)
   ↓
Restaurant is open and ready for live dining operations!
```

### 5.3 Food and Table Pre-Booking Workflow (Customer Mobile App)
```
Diner opens Customer Mobile App to plan a business lunch or family dinner
   ↓
Diner browses partner restaurants, cuisine tags, and photos
   ↓
Diner selects Restaurant, party size (e.g., 4 guests), date, and time slot
   ↓
System checks live slot availability engine against Restaurant's calendar overrides
   ↓
Diner pre-selects food menu items from the live catalog (with instant 86'd stock check)
   ↓
Diner adds special requests ("Window table, keep food ready at 1:15 PM sharp")
   ↓
Diner confirms pre-booking → Reservation and meal pre-order ticket is generated
   ↓
Pre-booking pushes immediately to Restaurant's Live Rush Board and reservation schedule
   ↓
Diners arrive at scheduled time: Table is reserved, kitchen prepares food on schedule,
and fresh food is served promptly without table or menu wait times!
```

### 5.4 On-the-Spot Dining & Table QR Ordering Workflow
```
Walk-in diner arrives and is seated at physical Table 04
   ↓
Diner scans Table 04 QR code using smartphone camera
   ↓
Digital Menu loads instantly in mobile browser displaying "Seated at Table 04"
   ↓
Diner browses categories, selects items, adds custom notes ("Extra spicy")
   ↓
Diner taps "Place Order"
   ↓
Order ticket pushes instantly to Restaurant's Live Rush Board labeled "Table 04"
   ↓
Kitchen accepts ticket and transitions order: "Confirmed" → "Preparing"
   ↓
Food is freshly prepared; floor staff serves dishes: "Preparing" → "Served"
   ↓
Diners finish meal and settle bill with in-venue cashier
   ↓
Staff marks order "Completed" on Live Rush Board → Table slot becomes available
```

### 5.5 Restaurant Staff Manual Order Punching Workflow
```
Walk-in diner or phone customer places order directly with restaurant staff
   ↓
Staff member opens "Punch Order" in Restaurant B2B Portal
   ↓
Staff selects target Table Number and chooses items from live menu
   ↓
Staff clicks "Create Order" → Order is immediately bound to table
   ↓
Ticket immediately appears on Live Rush Board alongside QR orders
   ↓
Staff can reopen the active order at any time to append additional rounds of food
```

### 5.6 Month-End Settlement & Reconciliation Workflow
```
System automatically closes the monthly billing cycle on the 1st of every month
   ↓
System aggregates all "Completed" dining orders from the previous month for each venue
   ↓
System generates formal Monthly Settlement Statement showing:
   • Total completed order count
   • Gross dining sales revenue
   • Commercial split ratio reference
   ↓
Super Admin reviews statement and executes bank payout to partner bank account
   ↓
Super Admin inputs payment transaction reference (UTR Number) & marks statement "Paid"
   ↓
Restaurant Owner views and downloads verified Settlement Statement in B2B Portal
```

---

## 6. Functional Requirements

### 6.1 Super Admin SaaS Operations Portal

| Requirement ID | Feature | Functional Description | Priority |
|---|---|---|:---:|
| **ADM-01** | **Secure Access** | Super Admins log in securely with authenticated credentials and session timeout controls. | P0 |
| **ADM-02** | **Restaurant Management** | Admin can create, view, update, and search restaurant partner profiles including legal business name, brand display name, owner contact details, address, cuisine types, and branding logos. | P0 |
| **ADM-03** | **Account Provisioning** | When onboarding a restaurant, the system automatically provisions an owner account and temporary credentials. | P0 |
| **ADM-04** | **Compliance Upload** | Admin uploads partner compliance documents across four mandatory categories: FSSAI Food License, GST Registration, Bank Account Proof, and Owner Government ID. | P0 |
| **ADM-05** | **Document Verification** | Admin reviews uploaded files and marks each document as `Approved` or `Rejected`. Rejections require a mandatory explanatory reason. | P0 |
| **ADM-06** | **Activation Gate Enforcement** | The system strictly prevents transitioning any restaurant from `Draft` to `Active` unless all four mandatory documents (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`) are in `Approved` state. | P0 |
| **ADM-07** | **Emergency Venue Toggle** | Admin can toggle an active restaurant between `Active` and `Suspended` to immediately halt live ordering in case of disputes, compliance lapses, or emergency maintenance. | P0 |
| **ADM-08** | **Commercial Split Configuration** | Admin records the agreed commercial split percentage (e.g., Platform 15% / Partner 85%) on the restaurant profile for business reference. The split ratio is an administrative profile setting only and does not perform automated deductions from customer bills. | P0 |
| **ADM-09** | **Global Audit Ledger** | Admin can view a consolidated, filterable ledger of all dining transactions, pre-bookings, and orders across all partner restaurants. | P1 |
| **ADM-10** | **Monthly Settlement Processing** | On the 1st of each month, the system compiles previous month gross dining totals. Admin records the bank transfer UTR number and payment date to mark the statement as `Paid`. | P0 |
| **ADM-11** | **Platform Reporting** | High-level operational metrics showing active restaurant count, total gross dining sales, and compliance verification pipeline. | P1 |

---

### 6.2 Restaurant B2B Operations SaaS Portal

| Requirement ID | Feature | Functional Description | Priority |
|---|---|---|:---:|
| **B2B-01** | **Venue Login & Isolation** | Restaurant owners log in with provisioned credentials. Operators can only view and manage their own venue data; cross-venue data visibility is prohibited. | P0 |
| **B2B-02** | **Dining Floor Zones** | Owners can define and name physical dining areas (e.g., Main Dining Hall, AC Family Lounge, Outdoor Patio, Private Dining Room). | P1 |
| **B2B-03** | **Table Inventory** | Owners add tables with table identifiers (e.g., T-01, Table 12), guest capacity (2, 4, 6, 8+ seats), and assigned dining zone. | P0 |
| **B2B-04** | **Table QR Generation** | System generates unique, high-resolution, printable QR codes tied to each physical table. Owners can download individual table QR codes or a bulk printable sheet. | P0 |
| **B2B-05** | **Availability Slot Engine** | Owners configure operating hours and reservation slot blocks (e.g., 60, 90, or 120 minutes) to manage table turns and prevent overbooking. | P0 |
| **B2B-06** | **Default Full-Day Calendar** | All calendar dates automatically default to standard full-day operating hours without requiring repetitive daily setup. | P0 |
| **B2B-07** | **Half-Day Shift Overrides** | Owners can mark specific dates as **Half Day** (e.g., lunch-only or dinner-only shifts), automatically clamping table availability to the designated shift window. | P0 |
| **B2B-08** | **Holiday Closure Overrides** | Owners can mark specific dates as **Holiday (Closed)**, which halts all table bookings and ordering for that date, with a single-click reset to Full Day. | P0 |
| **B2B-09** | **Menu Categories** | Owners organize their digital menu into custom categories (e.g., Soups & Starters, Chef's Specials, Main Course, Beverages, Desserts). | P0 |
| **B2B-10** | **Food Menu Items** | Owners configure dish name, description, price, food image, dietary classifications (`Veg`, `Non-Veg`, `Egg`, `Vegan`, `Jain`), preparation time estimate, and spice level. | P0 |
| **B2B-11** | **Instant Sold-Out (86'd) Toggle** | A single-click toggle on each dish (`In Stock` / `Sold Out`) instantly updates the item status on customer-facing digital menus to prevent orders for unavailable items. | P0 |
| **B2B-12** | **Live Rush Board** | Real-time Kanban-style operational dashboard displaying all active seated tables, pending tickets, incoming pre-bookings, and completed orders categorized by table number. | P0 |
| **B2B-13** | **Walk-in Table Booking** | Staff can manually enter walk-in or phone reservations directly on the portal, reserving the table slot. | P0 |
| **B2B-14** | **Manual Order Punching ("Create Order")** | Staff can create orders directly in the portal for phone/walk-in diners by selecting a table, choosing dishes from the menu, and sending the order to the kitchen without requiring customer QR scanning. | P0 |
| **B2B-15** | **Active Order Management** | Staff can open any active seated table to view items, append additional rounds of dishes, add custom kitchen instructions, and monitor running order totals. | P0 |
| **B2B-16** | **Order Status Progression** | Staff updates kitchen and floor progress with one click: `Confirmed` → `Preparing` → `Served` → `Completed` (or `Cancelled`). | P0 |
| **B2B-17** | **Daily Revenue Dashboard** | Real-time visibility into daily gross sales, completed orders count, peak dining hours, and active table turnaround rate. | P0 |
| **B2B-18** | **Monthly Settlement Statements** | Owners view and download month-end statements detailing total completed orders, gross revenue, settlement status, and the admin bank transfer reference number. | P0 |

---

### 6.3 Customer Mobile Application (Food & Table Pre-Booking)

| Requirement ID | Feature | Functional Description | Priority |
|---|---|---|:---:|
| **PRE-01** | **Customer Account** | Diners can register and log in to manage their reservations and pre-order history. | P0 |
| **PRE-02** | **Venue Discovery** | Diners can search and browse partner restaurants, view location details, cuisine tags, ambiance photos, and live operating hours. | P0 |
| **PRE-03** | **Slot Reservation Engine** | Diners select their dining date, party size, preferred dining zone (e.g., AC Lounge, Terrace), and choose from available time slots based on the restaurant's live availability calendar. | P0 |
| **PRE-04** | **Advance Meal Pre-Ordering** | Diners can browse the restaurant's categorized menu, view dish descriptions, dietary tags, prices, and add dishes to their pre-order ticket. | P0 |
| **PRE-05** | **Sold-Out Prevention** | The app actively validates dish availability; items marked `Sold Out` by the restaurant kitchen cannot be added to a pre-booking ticket. | P0 |
| **PRE-06** | **Special Instructions** | Diners can include special notes (e.g., "High chair needed", "Serve appetizers at 1:15 PM sharp for meeting"). | P0 |
| **PRE-07** | **Digital Reservation Pass** | Upon confirmation, the app generates a digital reservation pass with a unique booking reference, reserved table zone, party size, pre-ordered meal summary, and arrival instructions. | P0 |
| **PRE-08** | **Live Booking Status** | Diners can view real-time reservation updates (`Confirmed`, `Preparing`, `Ready for Seating`, `Completed`). | P0 |

---

### 6.4 Spot Food Booking (On-Table QR Menu)

| Requirement ID | Feature | Functional Description | Priority |
|---|---|---|:---:|
| **SPO-01** | **Zero-Friction Access** | Diner scans physical table QR code using their smartphone camera. The digital menu opens immediately in their mobile web browser without requiring an app download or account creation. | P0 |
| **SPO-02** | **Table Binding Verification** | The session securely binds the diner's browser to the specific restaurant and physical table number, prominently displaying the venue name and table identifier (e.g., "Seated at Table 06"). | P0 |
| **SPO-03** | **Category Navigation & Search** | Fast category navigation allows diners to quickly jump between menu sections and filter by dietary tags (`Veg`, `Non-Veg`, `Vegan`, `Jain`). | P0 |
| **SPO-04** | **Dish Presentation** | Visual cards display food photography, dish name, description, exact price, dietary tags, estimated preparation time, and an `+ Add` button. | P0 |
| **SPO-05** | **Instant Sold-Out Guard** | Dishes marked `Sold Out` by the kitchen are prominently displayed as unavailable and disabled from being added to the diner's cart. | P0 |
| **SPO-06** | **Cart & Cooking Notes** | Floating cart drawer tracks selected items, quantities, running subtotal, and allows diners to enter special cooking instructions (e.g., "Make mild, no onion"). | P0 |
| **SPO-07** | **Instant Order Submission** | Tapping "Place Order" generates an instant digital order receipt on the diner's screen and immediately dispatches the order ticket to the restaurant's Live Rush Board under their table number. | P0 |

---

## 7. Business Rules & Compliance Invariants

### 7.1 Mandatory Document Compliance & Activation Gate
A restaurant cannot be activated until the following four compliance documents are uploaded and approved:

| Document Code | Document Name | Mandatory? | Required Information | Expiry Date Tracked? |
|---|---|:---:|---|:---:|
| `DOC_FSSAI` | **FSSAI Food Safety License** | **Yes** | 14-digit Food Safety License Number | **Yes** |
| `DOC_GST` | **GST Registration Certificate** | **Yes** | 15-character GSTIN | No |
| `DOC_BANK` | **Bank Account Proof (Cheque/Passbook)** | **Yes** | Bank Name, Account Number, IFSC Code, Account Name | No |
| `DOC_KYC_ID` | **Owner Government KYC ID** | **Yes** | ID Type (Aadhaar, Passport, PAN), ID Number | Optional |
| `DOC_TRADE` | **Municipal Trade License** | Optional | Municipal Permit Number | **Yes** |
| `DOC_AGREEMENT`| **Signed Partner Contract** | Optional | Agreement Version, Execution Date | Optional |

**Enforcement Rule:** If an Admin attempts to change a restaurant's status from `Draft` to `Active` while any of the four mandatory documents are missing or in `Rejected` / `Pending Review` status, the system rejects the activation request with a clear explanatory notice.

### 7.2 Commercial Split Setting Rule
- The commercial split ratio (e.g., Platform 15% / Partner 85%) is recorded on the restaurant profile by the Super Admin during onboarding.
- The split ratio is an administrative reference setting only. It **does not execute automated deductions** or alter customer bill totals on live orders. All table orders record gross dining totals.

### 7.3 Instant Sold-Out (86'd) Rule
- When kitchen staff marks an item `Sold Out` on the B2B portal, customer mobile apps and QR screens immediately reflect the change.
- Any order or pre-booking in progress that contains a sold-out item cannot be submitted, preventing customer disappointment and kitchen confusion.

### 7.4 Calendar Override Precedence
1. **Holiday Override:** Highest priority. Marks the restaurant fully closed for the selected date; halts all bookings and table orders.
2. **Half-Day Override:** Second priority. Restricts active table slots to the specified shift window (e.g., lunch-only 11:30 AM – 3:30 PM).
3. **Default Full Day:** Base operational schedule applied automatically to all standard calendar dates.

---

## 8. High-Level Domain Entities

| Entity Name | Business Purpose | Key Business Attributes |
|---|---|---|
| **Restaurant** | The dining business tenant operating on the platform. | Legal business name, brand display name, contact phone, email, full physical address, status (`Draft`, `Active`, `Suspended`), commercial split percentage. |
| **ComplianceDocument** | Official legal records verified by the platform. | Document type, registration number, document file reference, validity expiry date, status (`Pending Review`, `Approved`, `Rejected`), rejection remarks. |
| **DiningZone** | Physical layout section within the venue. | Zone name (e.g., Indoor AC, Terrace), description. |
| **RestaurantTable** | Physical seating unit on the dining floor. | Table identifier (e.g., Table 12), seating capacity, assigned zone, current operational status (`Available`, `Occupied`, `Reserved`). |
| **CalendarOverride** | Date-specific operational schedule adjustments. | Date, override type (`Full Day`, `Half Day`, `Holiday Closed`), active shift start and end times. |
| **TableReservation** | Advance table and meal pre-booking made by diners. | Reservation reference, customer identifier, restaurant reference, reservation date, time slot, party size, table reference, special arrival notes, reservation status (`Confirmed`, `Seated`, `Completed`, `Cancelled`). |
| **MenuCategory** | Organization structure for dishes. | Category name (e.g., Starters, Main Course), display order, active status. |
| **FoodItem** | Individual menu offering. | Dish name, description, price, food image reference, dietary tags, estimated prep time, live stock availability status (`In Stock`, `Sold Out`). |
| **TableOrder** | Complete dining order transaction tied to a table (spot QR or pre-booked). | Unique order reference, table reference, reservation reference (if pre-booked), gross order total, live order status (`Confirmed`, `Preparing`, `Served`, `Completed`, `Cancelled`), creation timestamp. |
| **OrderItem** | Specific dish line item within a dining order. | Food item reference, dish name snapshot, unit price snapshot, quantity, diner cooking instructions. |
| **MonthlySettlement** | Consolidated calendar-month billing statement. | Billing period (YYYY-MM), total completed order count, gross sales total, settlement status (`Accruing`, `Generated`, `Paid`), bank transfer reference (UTR). |

---

## 9. Non-Functional Product Standards

- **Zero-Friction Customer Experience:** Table QR digital menus must load in under `1.5 seconds` on standard mobile data connections without requiring customer application downloads, registrations, or passwords.
- **Fast Mobile App Performance:** Customer Mobile App must launch and display nearby restaurants with slot availability in under `2.0 seconds`.
- **Real-Time Operational Response:** Order placement, pre-booking ticket dispatch, status updates, and sold-out (86'd) toggles must reflect across restaurant kitchen boards and customer menus in $\le 500\text{ milliseconds}$.
- **Strict Tenant Privacy & Data Isolation:** Complete isolation between restaurants. No restaurant operator or staff member can view, query, or mutate another venue's orders, menus, tables, or financial reports.
- **Operational Reliability:** Table ordering, pre-booking reservations, and kitchen rush boards must handle peak dinner rush concurrency smoothly without dropped tickets or double-booked table slots.
- **Audit Traceability:** All administrative actions—including restaurant profile edits, document approvals or rejections, status changes, and monthly payout records—must be immutably logged with user, action, and timestamp.
- **Responsive Multi-Surface Usability:**
  - Super Admin and Restaurant B2B Portals are optimized for desktop and tablet displays (including restaurant POS tablets).
  - Customer Mobile App is optimized for iOS and Android with intuitive touch controls.
  - Spot On-Table QR digital menus are mobile-first, thumb-friendly, and optimized for smartphone browsers of all sizes.

---

## 10. Release Readiness Criteria (Definition of Done)

The product is certified ready for operational deployment when:
- [ ] Super Admin can onboard a new restaurant partner, upload all four mandatory compliance documents, verify them, and record the commercial split ratio.
- [ ] **Activation Gate Verified:** The system actively blocks activating any restaurant if any mandatory document is missing or rejected.
- [ ] Restaurant Owner can log into the B2B portal, create zones and tables, and generate printable high-resolution table QR codes.
- [ ] Restaurant Owner can configure categories, add menu items with photos and dietary tags, and toggle dishes between `In Stock` and `Sold Out`.
- [ ] Diners can use the **Customer Mobile App** to discover restaurants, select date/time slots, reserve tables, pre-order food, and receive confirmed digital reservation passes.
- [ ] Scanning a physical table QR code instantly opens the digital menu bound to that exact table number without requiring app downloads or logins.
- [ ] Submitting a table QR order or a pre-booked meal ticket immediately pushes to the restaurant's Live Rush Board displaying table number, items, notes, and arrival timestamps.
- [ ] Restaurant staff can manually punch orders in the B2B portal ("Create Order") and append items to active seated tables.
- [ ] Restaurant staff can transition orders across the Live Rush Board (`Confirmed` → `Preparing` → `Served` → `Completed`).
- [ ] System accurately records gross sales on all orders and automatically compiles monthly settlement statements on the 1st of each month.
- [ ] Super Admin can record bank transfer UTR references and mark monthly settlement statements as `Paid`.
- [ ] All P0 functional requirements pass end-to-end user acceptance testing.
