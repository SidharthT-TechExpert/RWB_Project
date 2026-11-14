# QuickBite – Product Requirements Document (PRD)

---

## 1. Problem & Solution

### The Problem
Diners (families and business meetings) waste **45–60 minutes** dining out during rush hours:
- **Table Wait:** 20–45 min waiting for an open table.
- **Waiter & Menu Wait:** 10–15 min waiting for a waiter to bring menus.
- **Ordering Wait:** Delays taking manual orders and discovering items are sold out.
- **Kitchen Wait:** 20–30 min waiting for food to be prepared after ordering.
- **Restaurant Chaos:** Restaurants lose revenue from slow table turnover, paper order confusion, and peak rush bottlenecks.

### The Solution
1. **Food & Table Pre-Booking (Customer App):** Reserve a table and pre-order food in advance. Arrive, sit down, and food is served immediately.
2. **Spot Food Booking (Table QR Menu):** Walk-in diners scan table QR code, browse live menu, and order instantly on their phone (no waiter needed).
3. **Restaurant Operations SaaS (B2B Portal):** The internal engine that makes it possible: manages floor layout, live menu stock (86'd toggle), operating hours, manual order punching, and a real-time Kitchen Live Rush Board.
4. **Admin Portal:** Onboards restaurants, verifies 4 legal documents before activation, and manages monthly settlements.

---

## 2. Product Surfaces & Users

| Surface | Platform | Target User | Key Purpose |
|---|---|---|---|
| **Admin Portal** | Web Application | Super Admin | Partner onboarding, 4-document verification gate, commercial split setting, monthly payouts. |
| **B2B Portal** | Web Application | Restaurant Owner & Staff | Floor zones, tables, printable QR codes, live menu, 86'd stock toggle, manual order punching, Live Rush Board. |
| **Customer App** | Mobile Application | Diners (Families & Meetings) | Find restaurants, select date & time slot, book tables, pre-order meals ahead of arrival. |
| **Table QR Menu** | Responsive Mobile Web | In-Venue Diners | Instant on-table ordering via QR scan. Zero app download, zero login. |

---

## 3. End-to-End User Journeys

### Journey 1: Advance Pre-Booking (Customer Mobile App)
```text
Open App → Select Restaurant → Choose Date, Time Slot & Party Size →
Pre-select Food from Live Menu → Add Notes ("Meeting lunch at 1:15 PM") →
Confirm Booking → Digital Pass Generated →
Arrive at Restaurant → Seated at Reserved Table → Food Served Fresh with Zero Wait!
```

### Journey 2: In-Venue Spot Ordering (Table QR Menu)
```text
Sit at Table → Scan Table QR with Phone → Menu Opens Instantly →
Add Items to Cart → Tap "Place Order" →
Ticket Appears Instantly on Kitchen Live Rush Board →
Kitchen Prepares → Waiter Serves → Settle Bill with Cashier → Table Freed.
```

### Journey 3: Restaurant Staff Manual Order Punching (B2B Portal)
```text
Phone or Walk-in Customer Orders → Staff Opens "Punch Order" →
Selects Table & Menu Dishes → Clicks Submit →
Ticket Immediately Dispatched to Kitchen Rush Board →
Staff can append extra food rounds anytime.
```

### Journey 4: Restaurant Onboarding & Activation Gate (Admin Portal)
```text
Admin creates Restaurant Profile → Provisions Owner Login →
Admin uploads 4 Mandatory Documents (FSSAI, GST, Bank Proof, Owner ID) →
Admin reviews & approves all 4 documents →
Activation Gate Unlocked → Status changed: Draft → Active.
(If any doc is missing/rejected, status remains locked in Draft).
```

---

## 4. Key Business Rules (Simple & Strict)

1. **Activation Gate Rule:**
   - A restaurant **cannot** become `Active` unless all 4 mandatory documents (`DOC_FSSAI`, `DOC_GST`, `DOC_BANK`, `DOC_KYC_ID`) are in `Approved` state.
2. **Commercial Split Ratio Rule:**
   - Configured by Admin on the restaurant profile for business record-keeping only.
   - Does **not** perform automated deductions from customer bills. All orders record gross amounts.
3. **Instant 86'd (Sold Out) Stock Guard:**
   - One-click toggle on B2B portal.
   - Sold-out items are instantly disabled on Customer App and Table QR menus. Incoming orders with sold-out items are rejected.
4. **Calendar Shift Hierarchy:**
   - **Default:** All days run on Full Day operating hours.
   - **Half Day Override:** Clamps table slots to shift window (e.g. lunch only).
   - **Holiday Override:** Closes restaurant for the day; stops all bookings and orders.
5. **Staff Order Punching:**
   - Restaurant staff can punch manual orders and append items to active tables directly from the B2B portal without customer QR scans.

---

## 5. Functional Requirements

### 5.1 Super Admin Portal
- **ADM-01:** Secure login and session management.
- **ADM-02:** Restaurant profile management (business name, contact, address, cuisine, logos).
- **ADM-03:** Auto-provisioning of owner credentials upon restaurant creation.
- **ADM-04:** Document compliance upload (FSSAI, GST, Bank Proof, Owner ID).
- **ADM-05:** Document verification with `Approved` or `Rejected` status (with mandatory rejection reason).
- **ADM-06:** **Activation Gate:** Enforce that all 4 mandatory docs must be approved to set status to `Active`.
- **ADM-07:** Emergency toggle: Switch restaurant status between `Active` and `Suspended`.
- **ADM-08:** Commercial split percentage configuration (profile record-keeping only).
- **ADM-09:** Global audit ledger of all orders and reservations.
- **ADM-10:** Monthly settlement processing: Review monthly gross totals, record payment UTR number, mark as `Paid`.

### 5.2 Restaurant B2B Operations Portal
- **B2B-01:** Secure login isolated to own restaurant data only.
- **B2B-02:** Dining floor zones setup (Main Hall, AC Lounge, Terrace).
- **B2B-03:** Table setup (table number, seat capacity, assigned zone).
- **B2B-04:** High-resolution printable table QR code generation (single or bulk download).
- **B2B-05:** Availability slot engine (configurable slot duration: 60, 90, 120 mins).
- **B2B-06:** Operating calendar (Full Day default hours).
- **B2B-07:** Half-Day shift override (lunch-only, dinner-only, or custom window).
- **B2B-08:** Holiday closure override (full-day closure, one-click reset).
- **B2B-09:** Menu categories management (Starters, Mains, Drinks, Desserts).
- **B2B-10:** Menu dish management (name, description, price, photo, dietary tags `Veg`/`Non-Veg`/`Vegan`/`Jain`, prep time).
- **B2B-11:** **Instant 86'd Stock Toggle:** One-click sold-out disablement across customer menus.
- **B2B-12:** **Live Rush Board:** Real-time dashboard showing active tables, incoming orders, and pre-booked arrivals.
- **B2B-13:** Walk-in / phone reservation creation (locks table slot).
- **B2B-14:** **Manual Order Punching ("Create Order"):** Create orders directly without QR scan.
- **B2B-15:** Active order management: Append extra items/rounds to seated tables.
- **B2B-16:** Order status progression: `Confirmed` → `Preparing` → `Served` → `Completed`.
- **B2B-17:** Daily sales dashboard (gross revenue, order counts, table turnaround).
- **B2B-18:** Monthly settlement view and download with admin payment UTR reference.

### 5.3 Customer Mobile App (Pre-Booking)
- **PRE-01:** Customer registration and login.
- **PRE-02:** Restaurant discovery (browse venues, cuisines, photos, hours).
- **PRE-03:** Interactive date, time slot, and party size selector.
- **PRE-04:** Advance meal pre-ordering from live dynamic menu.
- **PRE-05:** Real-time stock validation (cannot pre-order sold-out dishes).
- **PRE-06:** Special notes (meeting arrival time, dietary requests).
- **PRE-07:** Digital reservation pass with booking reference and order summary.
- **PRE-08:** Live booking status tracking (`Confirmed`, `Preparing`, `Ready`, `Completed`).

### 5.4 Spot Food Booking (Table QR Menu)
- **SPO-01:** Instant web menu on QR scan (zero app download, zero login).
- **SPO-02:** Secure binding to specific table (shows "Table 04").
- **SPO-03:** Fast category navigation and dietary filters.
- **SPO-04:** Dish cards with photos, prices, dietary tags, and prep times.
- **SPO-05:** Sold-out items disabled in real-time.
- **SPO-06:** Floating cart drawer with custom cooking notes.
- **SPO-07:** One-tap order placement dispatching tickets directly to Live Rush Board.

---

## 6. Document Checklist Matrix

| Code | Document | Mandatory? | Tracked Info | Expiry Tracked? |
|---|---|:---:|---|:---:|
| `DOC_FSSAI` | **FSSAI Food License** | **Yes** | 14-digit License Number | **Yes** |
| `DOC_GST` | **GST Registration** | **Yes** | 15-character GSTIN | No |
| `DOC_BANK` | **Bank Proof** | **Yes** | Bank Name, Account No, IFSC, Holder Name | No |
| `DOC_KYC_ID` | **Owner Government ID** | **Yes** | Aadhaar / PAN / Passport Number | Optional |

---

## 7. Core Entities Summary

- **Restaurant:** Venue profile, status (`Draft`, `Active`, `Suspended`), commercial split percentage.
- **ComplianceDocument:** Legal files, status (`Pending Review`, `Approved`, `Rejected`), rejection reason.
- **DiningZone:** Floor section (e.g. AC Lounge, Terrace).
- **RestaurantTable:** Physical table, seat capacity, assigned zone, status (`Available`, `Occupied`, `Reserved`).
- **CalendarOverride:** Date, shift type (`Full Day`, `Half Day`, `Holiday`), shift times.
- **TableReservation:** Advance booking reference, diner ID, restaurant, date, slot, party size, notes.
- **MenuCategory:** Category name, sort order, active status.
- **FoodItem:** Dish name, price, photo, dietary tag, stock availability (`In Stock`, `Sold Out`).
- **TableOrder:** Order number, table ID, gross total, live status (`Confirmed`, `Preparing`, `Served`, `Completed`, `Cancelled`).
- **OrderItem:** Food item, snapshot unit price, quantity, cooking notes.
- **MonthlySettlement:** Billing month, total completed orders, gross revenue, status (`Accruing`, `Generated`, `Paid`), UTR number.

---

## 8. Definition of Done (Release Checklist)

The system is ready for launch when:
- [ ] Admin can onboard a restaurant, upload/approve all 4 mandatory documents, and set split ratio.
- [ ] Activation gate blocks activation if any mandatory document is missing or rejected.
- [ ] Restaurant can configure zones/tables and download printable QR codes.
- [ ] Restaurant can build menus with photos/dietary tags and toggle dishes between `In Stock` and `Sold Out`.
- [ ] Diners can use the **Customer App** to reserve tables and pre-order food in advance.
- [ ] Diners can scan physical table QR codes and order on the spot without app download.
- [ ] Orders (both pre-booked and QR spot) push instantly to the **Live Rush Board**.
- [ ] Staff can manually punch orders in the B2B portal and append items to active tables.
- [ ] Staff can progress orders: `Confirmed` → `Preparing` → `Served` → `Completed`.
- [ ] System aggregates monthly gross sales and Admin can record UTR payment references.
