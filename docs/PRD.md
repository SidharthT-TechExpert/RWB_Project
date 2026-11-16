# QuickBite – Product Requirements Document (PRD)

---

## 1. Product Overview

- **Product Name:** QuickBite
- **Product Type:** Restaurant Operations B2B SaaS & Dining Platform
- **Base Currency:** Indian Rupee (INR / ₹). All menu dish prices, customer pre-booking fees, in-venue dining bills, and partner bank payouts are strictly transacted and displayed in Indian Rupees (₹).
- **Summary:** QuickBite is a dual-sided dining platform. For restaurants, it provides an all-in-one B2B SaaS operating system to manage tables, operating calendars, live menus, staff order punching, and kitchen rush operations. For diners, it provides a **Single Unified Customer Application** seamlessly combining both **Food and Table Pre-Booking** (advance reservations from home/office) and **In-Venue Spot QR Ordering** (scanning physical table QR codes while seated) to eliminate waiting times for tables, menus, waiters, and food preparation.

---

## 2. Problem Statement

Dining out during peak rush hours (lunch and dinner) creates severe delays for diners and operational chaos for restaurants:
- **Table Waiting:** Diners (especially families with children and busy professionals having meetings) wait 20 to 45+ minutes just to get an available table.
- **Waiter & Menu Delays:** Once seated, diners wait 10 to 15 minutes for a busy waiter to clean the table and bring physical menus.
- **Order-Taking Downtime:** Waiting for waiters to take orders, finding out dishes are sold out mid-order, and manual order punching creates frustration.
- **Kitchen Preparation Lag:** Kitchens start cooking only after these long delays, stretching total meal arrival to 45–60+ minutes from arrival.
- **Restaurant Inefficiencies:** Restaurants lack an internal digital system to coordinate floor table occupancy, live kitchen rush tickets, instant sold-out inventory, and shift schedules—causing slow table turnaround and lost dining revenue.

---

## 3. Goals & Objectives

1. **Eliminate Dining Wait Times:** Allow diners to pre-book tables and pre-order meals in advance so they are seated and served immediately upon arrival.
2. **Streamline Walk-in Dining:** Provide frictionless spot ordering via physical table QR codes so seated diners can browse live menus and order directly on their phones without waiting for waiters.
3. **Digitize Restaurant Operations:** Equip restaurants with a B2B SaaS portal to manage dining zones, physical tables, operating calendars, live menus with instant 86'd sold-out toggles, manual order punching, and a real-time Kitchen Live Rush Board.
4. **Accelerate Table Turnover:** Increase peak-hour table turnover by 25–35% through faster order placement and synchronized kitchen dispatch.
5. **Ensure Platform Compliance:** Provide platform admins with a 4-document legal compliance verification gate before any restaurant can go live.

---

## 4. Target Users

| User Persona | Role | Core Need |
|---|---|---|
| **Meeting Diners (Business)** | Consumer | Needs guaranteed seating at a precise time and meals served promptly to conduct meetings on schedule. |
| **Family Diners (Groups)** | Consumer | Needs advance table reservations with party size selection and pre-ordered meals to avoid waiting with kids or elders. |
| **Walk-in Diners (Spot)** | Consumer | Seated at an open table, wants to scan a QR code and order immediately without waiting for waitstaff. |
| **Restaurant Owner / Manager** | B2B Partner | Needs complete control over floor layout, tables, shift calendars, menu items, gross sales, and monthly payouts. |
| **Floor & Kitchen Staff** | B2B Partner | Needs a real-time Kitchen Live Rush Board, instant 86'd stock toggle, and tools to punch manual walk-in/phone orders. |
| **Super Admin** | Platform Operator | Needs to onboard restaurant partners, verify mandatory legal documents (Activation Gate), and process monthly payouts. |

---

## 5. User Stories

### Diners
- *As a business diner,* I want to reserve a table and pre-order food ahead of time, so my meeting lunch starts immediately when we arrive.
- *As a family planner,* I want to reserve a specific table size and pre-select dishes with dietary notes, so my family is served without delay.
- *As a walk-in diner,* I want to scan a table QR code and order from my phone, so I don't have to wait for a waiter to bring menus.

### Restaurant Operators
- *As a restaurant owner,* I want to set up my floor zones, tables, and generate printable QR codes, so my venue is digitally organized.
- *As a restaurant owner,* I want to configure operating hours, half-day shifts, and holiday closures, so customers only book when we are open.
- *As a kitchen chef,* I want to see incoming pre-bookings and table QR orders on a Live Rush Board, so I can prepare food on schedule.
- *As a kitchen chef,* I want a one-click sold-out toggle, so diners cannot order dishes that are out of stock.
- *As floor staff,* I want to punch manual orders and append extra dishes to active tables, so walk-in and phone orders are tracked in one place.

### Platform Operators
- *As a Super Admin,* I want to review uploaded compliance documents and approve/reject them, so only verified restaurants can activate.
- *As a Super Admin,* I want delayed payout statements generated automatically (X days after order completion), so I can transfer pre-booked food amounts to restaurant accounts with bank UTR references.

---

## 6. Functional Requirements

### 6.1 Super Admin Portal (PWA)
- **ADM-01 Partner Onboarding:** Admin creates restaurant profiles (legal name, brand name, contact, address, cuisine, logos).
- **ADM-02 Account Provisioning & Email Delivery:** System automatically generates owner login credentials upon restaurant onboarding and securely sends the temporary password to the partner's registered email address. The generated password must be strong (combining uppercase, lowercase, numbers, and special characters) using the sanitized restaurant name as the starter prefix (e.g. `BrandName@9xK#4vL2!`).
- **ADM-03 Document Compliance Upload:** Admin uploads partner legal documents (FSSAI License, GST Certificate, Bank Proof, Owner ID).
- **ADM-04 Document Verification & Email Notification:** Admin reviews and marks uploaded documents as `Approved` or `Rejected` (with mandatory rejection reason). The system automatically dispatches an email notification to the partner's registered email address detailing the verification outcome (including specific rejection reasons and correction steps if rejected).
- **ADM-05 Activation Gate:** System strictly prohibits setting restaurant status to `Active` unless all 4 mandatory documents are `Approved`.
- **ADM-06 Emergency Toggle:** Admin can switch restaurant status between `Active` and `Suspended` to immediately halt live ordering.
- **ADM-07 Pre-Booking Commercial Split Ratio:** Admin records the agreed split percentage on the restaurant profile during onboarding. This split ratio applies **strictly and exclusively to customer Pre-Booking charges** (food or table pre-booking amount collected upfront). It does **not** apply to spot QR orders, walk-ins, or general dining bills. Admin can update the split ratio at any time; changes apply only to future pre-bookings and never alter past pre-booking split records.
- **ADM-08 Global Audit Ledger & Anti-Fraud Inspector:** Filterable log of all orders, pre-bookings, and transactions across all venues. Displays full anti-fraud diagnostic information—including customer verified name, mobile phone number, physical table number, and client IP address—exclusively to Super Admin for fraud detection, prank order mitigation, and dispute auditing.
- **ADM-09 Dual Settlement Engine & Invoice Generation:** 
  - **Daily Settlement Tab (T+X Days Post-Dining):** Dedicated dashboard tab tracking daily rolling batches of pre-booked food orders. The delay window begins strictly after the customer finishes dining and the order is marked `Completed` (`completed_at + X days delay`). Once matured, batches enter the Admin Daily Settlement window prioritized by a **First-In, First-Out (FIFO) sorting algorithm** (oldest completed and matured batches presented first for disbursement). Includes multi-criteria filters (by restaurant, settlement status, completion/maturity date range, payout amount range in ₹, and keyword search for UTR/Invoice/Restaurant). Displays batch volume metrics (pre-bookings created vs completed, gross food total, and net payout in ₹). Admin executes bank transfer to partner account and logs the Bank UTR reference.
  - **Monthly Settlement Tab:** Monthly consolidation of platform fee shares from pre-booking charges.
  - **Automated Partner Invoice Generation:** Upon Admin recording the bank payment UTR number, the system automatically generates an official downloadable Tax Invoice / Settlement Receipt and pushes it to the partner's portal.

### 6.2 Restaurant B2B Operations SaaS Portal (PWA)
- **B2B-01 Secure Multi-Tenant Login:** Isolated access to own restaurant data only.
- **B2B-02 Floor Zones:** Create and manage dining sections (Main Hall, AC Lounge, Terrace).
- **B2B-03 Table Inventory:** Add tables with table numbers, seat capacity (2, 4, 6, 8+ pax), and assigned zone.
- **B2B-04 Table QR Generator:** Generate and download unique, printable, high-resolution QR codes tied to each physical table.
- **B2B-05 Availability Slot Engine:** Configure daily operating hours and reservation slot duration blocks (60, 90, 120 mins).
- **B2B-06 Operating Calendar:** Base Full Day hours apply automatically to all dates.
- **B2B-07 Half-Day Shift Override:** Restrict availability to specific shift windows (e.g. lunch only or dinner only).
- **B2B-08 Holiday Closure Override:** Mark specific dates closed; halts all bookings and orders with one-click reset.
- **B2B-09 Menu Categories & Printer Assignment:** Create, reorder, and edit food categories (Starters, Mains, Drinks, Desserts). When creating or editing any category, managers can easily choose its designated station printer from a simple dropdown (e.g., Shawarma Station, Beverage Bar, Main Kitchen) with 1-click editing anytime.
- **B2B-10 Food Menu Items:** Manage dish name, description, price, photo, dietary tags (`Veg`, `Non-Veg`, `Vegan`, `Jain`), and prep time.
- **B2B-11 Instant 86'd Stock Toggle:** One-click toggle (`In Stock` / `Sold Out`) instantly disables unavailable dishes across customer menus.
- **B2B-12 Kitchen Live Rush Board:** Real-time operational dashboard displaying active tables, incoming orders, and pre-booked arrivals.
- **B2B-13 Walk-in Table Reservation:** Manually enter walk-in or phone reservations, locking the table slot.
- **B2B-14 Manual Order Punching ("Create Order"):** Create orders directly for walk-in or phone diners without requiring customer QR scanning.
- **B2B-15 Active Order Management:** Open active seated tables, append extra food rounds, and track running totals.
- **B2B-16 Order Status Progression:** One-click order lifecycle updates: `Confirmed` → `Preparing` → `Served` → `Completed`.
- **B2B-17 Daily Revenue Dashboard:** View daily gross sales, order volume, peak hours, and table turnover rates.
- **B2B-18 Settlements, Invoices & Pre-Booking Dashboard:**
  - **Daily Settlement Tab (T+X Days):** Partner owners and managers can track daily rolling food payouts across states: *Holding (X-day delay)*, *Disbursable*, and *Settled*.
  - **Pre-Booking Volume Statistics:** Displays total pre-bookings created vs completed for every daily settlement cycle.
  - **Invoices Section:** Once Admin marks a payout completed with UTR, partners can view and download official payment invoices showing itemized order breakdown, gross food sales, and bank UTR transaction references.
  - **Monthly Settlement Tab:** View and download monthly pre-booking fee split statements.
- **B2B-19 Manager KOT System & Station Routing:** Managers have an intuitive KOT dashboard to register thermal printers (IP, Bluetooth, USB) and manage station routing. When an order is placed, the system automatically splits items by category and fires Kitchen Order Tickets (KOTs) directly to the assigned station printer with dish names, quantities, and cooking notes without manual clicks.

### 6.3 Unified Customer Application (Advance Pre-Booking & In-Venue Spot QR Ordering)
- **CUST-01 Unified Account & Auth:** Customer registration and login using verified Full Name and Mobile Phone Number (SMS OTP verification). Manages customer profile, saved preferences, and unified dining history across both advance reservations and in-venue spot dining.
- **CUST-02 Venue Discovery & Search:** Search and browse partner restaurants, cuisines, ambiance photos, live operating hours, dietary filters, and ratings.
- **CUST-03 Table & Slot Reservation (Advance Pre-Booking):** Select future dining date, guest party size (2, 4, 6, 8+ pax), preferred dining zone, and available time slot.
- **CUST-04 Advance Meal Pre-Ordering:** Browse live menu catalog and pre-select dishes attached to the reservation with INR (₹) pricing to ensure meals are served promptly upon arrival.
- **CUST-05 Built-in QR Scanner & On-Table Binding (In-Venue Spot Mode):** Seated diners can scan physical table QR codes using the app's integrated camera scanner (or open the table link directly). Securely binds to the physical table ID (displays "Seated at Table 04 at [Restaurant Name]").
- **CUST-06 In-Venue Digital Menu & Category Navigation:** Rapid category jumping, dietary filtering (`Veg`, `Non-Veg`, `Vegan`, `Jain`), dish photos, descriptions, and `+ Add` button.
- **CUST-07 Real-Time Sold-Out (86'd) Guard:** Real-time stock validation prevents adding sold-out dishes across advance pre-bookings and spot orders.
- **CUST-08 Special Cooking & Arrival Instructions:** Add arrival notes for pre-bookings (e.g. "Meeting lunch, serve appetizers at 1:15 PM sharp") and dish-level cooking notes for spot orders.
- **CUST-09 Floating Cart Drawer:** Item counts, running subtotal in INR (₹), cooking instructions, and one-tap checkout.
- **CUST-10 Pre-Booking Checkout & Pass:** Customer pays the pre-booked food order amount and pre-booking fee upfront in Indian Rupees (₹); system locks the slot, snapshots the active split ratio, and generates confirmation pass with booking reference, table zone, and order summary.
- **CUST-11 Instant Spot Order Submission:** One-tap authenticated submission pushes ticket directly to the restaurant's Kitchen Live Rush Board and triggers category-routed KOT thermal printing.
- **CUST-12 Anti-Fraud Verification & Identification:** Every spot order placed permanently records the customer's verified Name, Mobile Phone Number, physical Table Number, and complete Order details to hold diners accountable and prevent fraudulent or prank bookings.
- **CUST-13 Anti-Fraud Client IP Auditing & Role Privacy Isolation:** At the time of order creation, the system automatically records the customer's client IP address and device footprint.
  - **Super Admin Only:** The client IP address is visible exclusively to Super Admin in the Super Admin Portal (Audit Ledger / Order Details) for fraud investigations and abuse prevention.
  - **Restaurant Privacy Protection:** The client IP address is strictly hidden and omitted from the Restaurant B2B Portal (restaurant staff see the customer name, phone number, table number, order items, and cooking notes only).
- **CUST-14 Dual-Mode Live Status Tracking & History:**
  - For Pre-Bookings: `Confirmed` → `Preparing` → `Ready for Seating` → `Completed`.
  - For Spot Table Orders: `Confirmed` → `Preparing` → `Served` → `Completed`.
  - Consolidated dining history displaying all past reservations, digital passes, and in-venue dining receipts.

---

## 7. Non-Functional Requirements

- **Sub-Second Performance:** On-table QR web menu loads in under `1.5 seconds` on mobile connections; order tickets push to Live Rush Board in $\le 500\text{ms}$.
- **Frictionless Mobile Web Access:** Walk-in diners access menus directly in mobile web browsers without installing native apps; lightweight phone OTP authentication guarantees order legitimacy without bulky signup friction.
- **Reliability & Concurrency:** System supports high concurrent dining rushes without dropped tickets or double-booked tables.
- **Multi-Tenant Data Isolation & Privacy:** Complete data separation between restaurant venues. Furthermore, sensitive audit metadata like customer IP addresses are isolated strictly to Super Admin and never leaked to restaurant tenants.
- **Audit Logging:** Immutable audit logs for all administrative actions (document approvals/rejections, restaurant status changes, payout records).
- **Progressive Web App (PWA) Architecture:** Both the Super Admin Portal and Restaurant B2B Operations Portal are installable Progressive Web Apps (PWAs). They feature standalone full-screen display modes (eliminating browser URL bars on POS tablets and iPads), service worker asset caching for instant launch, and Web Push notifications for incoming orders and kitchen chimes.
- **Responsive Multi-Surface Support:** Portals optimized for desktop/tablet; Unified Customer Application optimized for smartphones and mobile web browsers (supporting pre-booking discovery and seamless on-table QR camera scanning).

---

## 8. User Flow

### Flow 1: Customer Food & Table Pre-Booking
```text
Open App → Select Restaurant → Choose Date, Time Slot & Party Size →
Pre-Select Food from Live Menu → Add Special Notes →
Pay Pre-Booking Charge (Platform/Partner Split Snapshot Captured) → Digital Pass Generated →
Arrive at Restaurant → Seated at Reserved Table → Food Served Fresh with Zero Wait!
```

### Flow 2: In-Venue Table QR Ordering (Spot Booking & Anti-Fraud Capture)
```text
Diner Seated at Table → Scans Table QR Code → Live Menu Opens on Phone (Zero App Download) →
Customer Quick Sign Up / Login (Name & Mobile OTP Verification) →
Selects Dishes & Adds Notes → Taps "Place Order" →
System Records Order Details with Customer Name, Phone, Physical Table #, and Client IP →
Ticket Pushes to Kitchen Live Rush Board & Station Printers Auto-Print (Shawarma Station, Drinks Bar, etc.) →
(Staff sees Customer Name, Phone, and Table #; Client IP visible exclusively to Super Admin) →
Kitchen Prepares → Waiter Serves → Settle Bill with Cashier → Table Slot Freed.
```

### Flow 3: Restaurant Staff Order Punching
```text
Customer Orders via Phone or Walk-in → Staff Opens "Punch Order" in B2B Portal →
Selects Table & Menu Dishes → Submits Order →
Ticket Dispatches to Kitchen Rush Board & Category Station Printers Auto-Print → Staff Appends Extra Rounds Anytime.
```

### Flow 4: Restaurant Onboarding & Activation Gate
```text
Admin Creates Restaurant Profile → System Automatically Generates & Emails Owner Login Password →
Admin Uploads 4 Mandatory Documents (FSSAI, GST, Bank Proof, Owner ID) →
Admin Reviews Documents → System Emails Partner Approval/Rejection Notice (with Rejection Reason) →
When All 4 Documents Are Approved → Activation Gate Unlocked → Status Changed from "Draft" to "Active".
(If any doc is missing/rejected, status remains locked in "Draft").
```

### Flow 5: Daily Delayed Food Payout & Partner Invoice Generation (T+X Days Post-Dining)
```text
Customer Pre-Pays Food & Booking Online → Diners Arrive & Enjoy Meal →
Staff Marks Order "Completed" (completed_at timestamp recorded) → 
Holding Clock Starts Strictly From completed_at (X Days Delay for Dispute Clearance) →
Delay Window Matures (NOW >= completed_at + X days) → 
Batches Surface in Admin Daily Settlement Window Prioritized by FIFO (Oldest Matured Batches First) →
Admin Applies Optional Filters (Restaurant, Status, Date Range, ₹ Amount) & Reviews Volume Metrics →
Admin Transfers Food Total to Partner Account via Bank Transfer & Logs Bank UTR Reference →
System Automatically Generates Official PDF Tax Invoice / Settlement Receipt →
Partner (Owner/Manager) Views Settlement Stats & Downloads Invoice in B2B Invoices Section.
```

---

## 9. UI/UX Requirements

### 9.1 Design Principles
- **Hospitality-First Theme:** Clean, high-contrast, modern dining visual language.
- **Mobile Usability:** Large, accessible touch targets ($\ge 44\text{px}$) designed for one-handed mobile browsing.
- **Kitchen Rush Visuals:** Color-coded status badges on the Kitchen Live Rush Board:
  - `Confirmed` = Blue
  - `Preparing` = Amber
  - `Served` = Violet
  - `Completed` = Emerald Green
- **Menu Clarity:** High-visibility dietary badges (`Veg`, `Non-Veg`, `Vegan`, `Jain`) and prominent "Sold Out" overlays for unavailable dishes.
- **PWA Full-Screen Display Mode:** Borderless standalone execution optimized for counter POS touchscreens, kitchen wall-mounted displays, and mobile devices without browser interface distractions.

### 9.2 Key Screens & Views Needed
1. **Super Admin Portal:**
   - Restaurant Onboarding & Partner List
   - Document Verification Modal (Approve / Reject with reason notes)
   - Daily Settlement Tab (T+X Daily Batches, FIFO Queue Sorting, Multi-Criteria Filters, Created vs Completed Bookings, UTR Entry & Invoice Trigger)
   - Monthly Settlement Tab (Platform Pre-Booking Split Fees)
2. **Restaurant B2B SaaS Portal:**
   - Floor & Table Layout Manager (with printable QR generator)
   - Operating Hours & Shift Calendar Overrides
   - Digital Menu & Category Manager (Category Create/Edit with Station Printer Selector, instant 86'd toggle)
   - Kitchen Live Rush Board (real-time order tickets & status progression)
   - Manual Order Punching Modal
   - Kitchen Thermal Printers & KOT System Management (Register printers, test print, category routing)
   - Daily Settlements Tab (T+X Payout Tracker, Created vs Completed Booking Volume Stats)
   - Invoices & Statements Section (View & Download Official Invoices with UTR references)
   - Monthly Settlements Tab (Pre-Booking Split Statements)
3. **Unified Customer Application:**
   - Auth & Profile Screen (Name & Phone Number OTP verification)
   - Venue Discovery & Search (Filter by cuisines, dietary tags, ratings, opening hours)
   - Table Reservation & Slot Selector (Party size, zones, calendar dates, time blocks)
   - Advance Menu Pre-Ordering View (Browse dishes, add to reservation, dietary badges)
   - Integrated QR Scanner & Table Binding Screen ("Seated at Table 04 at [Venue]")
   - In-Venue Live Category Menu & Dietary Filters (`Veg`, `Non-Veg`, `Vegan`, `Jain`)
   - Dish Details Modal with custom cooking notes
   - Floating Cart Drawer with running subtotal in INR (₹)
   - Digital Reservation Pass & Live Status Tracker (`Confirmed` → `Preparing` → `Served/Seated` → `Completed`)
   - Consolidated Dining History (Past pre-bookings and spot dining receipts)

---

## 10. Acceptance Criteria

### Partner Onboarding & Account Provisioning
- When a restaurant profile is created by Super Admin, the system automatically provisions owner account credentials.
- The temporary password is automatically generated starting with the sanitized restaurant name prefix followed by secure random alphanumeric and special characters, strictly meeting strong password standards (uppercase, lowercase, numbers, and symbols).
- The system automatically sends the temporary login password and portal login link to the partner's registered email address.

### Unified Customer Application (Advance Pre-Booking & On-Table Spot QR Ordering)
- Customer can register and log in quickly with verified Full Name and Mobile Phone Number (SMS OTP verification).
- Customer can browse partner venues, cuisines, live operating hours, and search restaurants.
- **Advance Pre-Booking Mode:**
  - User can select an available date, time slot, and guest party size.
  - User can add in-stock dishes to the pre-order with special arrival notes.
  - Booking cannot be placed for closed dates or slots that exceed available table capacity.
  - Pre-booking confirmation locks slot, snapshots active split ratio, and generates digital reservation pass.
- **In-Venue Spot QR Ordering Mode:**
  - Scanning a physical table QR opens the app bound directly to that physical table.
  - User must be authenticated with Name and Phone Number prior to order submission.
  - When an order is placed, the system permanently records the customer's verified Name, Mobile Phone Number, physical Table Number, and complete Order details to prevent fake or fraudulent bookings.
  - Order creation service automatically captures customer client IP address and device footprint.
  - **Role-Based Privacy Enforcement:** Customer client IP is visible exclusively to Super Admin in the Global Audit Ledger; it is strictly excluded from restaurant staff view.
  - Sold-out dishes cannot be added to cart.
  - Submitting an order dispatches the ticket directly to the Kitchen Live Rush Board and station thermal printers.
- **Order Tracking & Unified History:**
  - Live progression tracker for both advance bookings and seated dining tickets.
  - Consolidated dining history displaying past reservations, digital passes, and in-venue spot dining receipts.

### Kitchen Live Rush Board
- Newly placed orders (pre-booking, QR spot, or staff punch) appear on the board within $\le 1\text{ second}$.
- Staff can update order status: `Confirmed` → `Preparing` → `Served` → `Completed`.

### Automated Category-Based Kitchen Printing (KOT Routing)
- Multi-category orders are automatically decomposed by menu category upon order placement.
- Kitchen thermal printers assigned to specific categories automatically print station KOTs without manual staff intervention.
- Station ticket prints with Table / Pre-Booking reference, Order #, Timestamp, Dish Name, Quantity, and Special Cooking Notes for that station's dishes only (e.g., Shawarma printer prints Shawarma items only; Beverage printer prints drinks only).
- If no dedicated station printer is configured for a category, items route automatically to the Main Kitchen master printer.
- Managers can select and reassign a category's printing tool directly within the Category creation/editing modal via a simple dropdown.
- Category printer assignment updates take effect immediately for all future incoming orders without restarting printers.

### Instant Sold-Out Toggle
- Toggling an item to `Sold Out` in the B2B portal reflects on customer screens within $\le 1\text{ second}$.
- Sold-out items cannot be ordered across any customer surface.

### Table Slot Locking
- Reserving a table slot locks capacity for that time window, preventing duplicate bookings.

### Document Verification & Activation Gate
- Admin can review and mark each uploaded document as `Approved` or `Rejected` (with mandatory rejection reason).
- System immediately sends an automated verification email to the partner's registered email address upon approval or rejection (including rejection reasons and re-upload instructions).
- System strictly blocks setting a restaurant status to `Active` if any mandatory document (FSSAI, GST, Bank Proof, Owner ID) is missing or `Rejected`.
- Status can only transition to `Active` when all 4 documents are `Approved`.

### Pre-Booking Commercial Split Ratio & Immutability
- Admin sets the commercial split ratio during restaurant onboarding and can update it at any time.
- Split ratio applies strictly and exclusively to customer Pre-Booking charges (food or table pre-booking amount collected upfront).
- In-venue spot QR orders, walk-in orders, and seated dining bills are 100% exempt from split deductions.
- When a customer confirms a pre-booking, the system permanently snapshots the active split ratio and calculated share amounts (platform fee vs partner fee) onto the reservation record.
- Modifying a restaurant's split ratio in the Admin Portal applies only to subsequent pre-bookings and never retroactively modifies past pre-bookings or historical accounting statements.

### Daily Delayed Food Payouts (T+X Days Post-Dining), FIFO Queue & Partner Invoices
- Pre-booked ordered food amounts collected upfront in INR (₹) enter the delayed holding window strictly after the customer finishes eating and the order is marked `Completed` (`completed_at`).
- The X-day holding countdown is strictly anchored to `completed_at` (i.e. `holding_matures_at = completed_at + X days delay`), preventing premature disbursement before food is consumed and dispute periods clear.
- Payout funds cannot be marked for disbursement before the designated X-day maturity window elapses.
- Once X days elapse from order completion, the system automatically transitions funds from `Holding` to `Disbursable`.
- **First-In, First-Out (FIFO) Sorting Algorithm:** When Super Admin opens the Daily Settlement window, disbursable settlement batches and records are prioritized strictly by FIFO order (`holding_matures_at ASC` / `completed_at ASC`), ensuring that the oldest completed and matured dining batches appear at the very top of the queue for immediate settlement.
- **Multi-Criteria Window Filtering:** In addition to the default FIFO algorithm, Admin can apply granular filters to narrow down the queue:
  - Filter by Restaurant (venue dropdown / search selector)
  - Filter by Settlement Status (`Holding`, `Disbursable`, `Settled`)
  - Filter by Date Range (Completion Date or Maturity Date range)
  - Filter by Payout Amount Range (Minimum ₹ to Maximum ₹)
  - Search by Restaurant Name, Batch ID, Bank UTR, or Tax Invoice Number
  - Toggle sort algorithms (FIFO - Oldest Matured First [Default], LIFO - Newest Matured First, Highest ₹ Amount, Lowest ₹ Amount).
- Admin Portal displays total pre-bookings created vs completed, gross food total, and net payout in ₹ for every daily batch.
- B2B Partner owners and managers have full visibility in their Daily Settlements tab into batch progress, booking metrics (created vs completed), and payout statuses.
- Super Admin transfers the matured food amount in Indian Rupees (₹) to the restaurant's registered bank account and logs the bank UTR transaction reference.
- Immediately upon Admin submitting the bank UTR, the system marks the batch `Settled` and automatically generates an official downloadable Tax Invoice / Settlement Receipt in the partner's Invoices section.
- Partner owners and managers can view and download official invoices with full order breakdown, gross food sales, fee deductions, and bank UTR references.

---

## 11. Constraints & Dependencies

- **Platform Currency Standard:** The platform strictly operates in **Indian National Rupees (INR / ₹)**. All dish menu prices, advance pre-booking charges, food bills, and bank transfers (NEFT / RTGS / IMPS) are transacted exclusively in ₹. Foreign currencies (such as USD / $) are not supported.
- **Pre-Booking Fee Split vs In-Venue Settlement:** Platform commercial split applies strictly to upfront pre-booking charges collected via the customer app. In-venue dining bills (QR orders and extra rounds) are settled directly with the venue (cash, card, or POS) with zero platform fee deductions.
- **Connectivity:** Diners require active mobile data or venue Wi-Fi to load digital QR menus.
- **Compliance Validity:** Restaurant activation depends on valid partner legal licenses (FSSAI, GST).

---

## 12. Success Metrics

| Metric | Target |
|---|---|
| **Average Seating-to-Order Time** | Reduced from 15 minutes to $< 3$ minutes via on-table QR |
| **Peak-Hour Table Turnover** | 25–35% faster table turnaround |
| **Out-of-Stock Ordering Complaints** | Reduced to 0 (via instant 86'd stock toggle) |
| **Active Compliant Restaurants** | 100% verified with mandatory compliance documents |
| **Payout Disbursement Timeliness** | 100% of pre-booked food payouts disbursed within designated T+X day cycle with logged UTR |
