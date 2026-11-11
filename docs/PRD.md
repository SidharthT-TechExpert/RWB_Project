# Qickbite — 3-Phase Product Requirements Document (PRD)

> **Status**: Draft v1 (Phase 1 Core Logic + Roadmap Skeleton — awaiting remaining booking/checkout & Phase 2–3 details)  
> **Primary Objective**: Build a clean, trustworthy, high-craft platform from scratch that converts **Restaurant Owners (Partners)** and **Premium Customers (VIPs)** from Day 1.

---

## 1. Strategic Overview & 3-Phase Roadmap

| Phase | Goal | Target Audience | Core Focus |
| :--- | :--- | :--- | :--- |
| **Phase 1: Pitch-Ready VIP MVP** | Launch a live, runnable platform to onboard initial partners and impress VIP diners | Founders/Admin, Early Restaurant Owners, VIP Customers | White-glove admin onboarding, flexible revenue split, table & menu setup, adaptive booking flow (`Table` / `Food` / `Both`), revenue & monthly settlement visibility |
| **Phase 2: Live Payments, Ops & Retention** *(Upcoming details)* | Automate money movement, live service workflows, and repeat VIP engagement | Restaurant Staff/Managers, Returning VIPs | Online checkout & payment gateway, automated/scheduled payouts, real-time notifications, booking status lifecycle, cancellation/refund rules, verified reviews, VIP access/tiers |
| **Phase 3: Scale, Multi-Branch & Intelligence** *(Upcoming details)* | Expand into multi-outlet hospitality brands and curated concierge experiences | Enterprise Restaurant Groups, High-Tier VIPs | Multi-branch management, role-based staff accounts, concierge/occasion requests, loyalty/perks, deep analytics & POS/mobile integrations |

---

## 2. Phase 1: Pitch-Ready VIP MVP (Detailed Requirements)

### 2.1 User Roles & Access
1. **Super Admin** — Platform operator (manages companies, documents, revenue splits, global bookings, and settlements).
2. **Company / Restaurant Owner** — Partner (manages premium tables, premium food menu, bookings, revenue, and monthly settlements).
3. **Premium Customer (VIP)** — End diner (discovers curated restaurants, views tables/menu/reviews, and books table, food, or both).

---

### 2.2 Portal 1: Admin Dashboard
#### Confirmed Scope
- **Authentication**: Secure Admin login.
- **Company Onboarding & Directory**:
  - Create and edit restaurant/company profiles (brand name, owner contact, address, description, cuisine tags, cover/gallery images, login credentials for the partner).
  - Upload and manage company verification documents (e.g., business license, food safety certificate, tax/GST ID, bank/KYC docs).
  - **Company Visibility Status**: `Draft` / `Active` / `Suspended` toggle so Admin can prepare a partner's profile & photos completely before exposing it to VIPs.
- **Dynamic Split Ratio Management & Snapshot Integrity**:
  - Configure revenue split ratio per company (e.g., `85% Partner / 15% Platform`, adjustable per partner).
  - Store the exact `platformSplitPct` / `partnerSplitPct` snapshot on every booking at creation time so future ratio edits never corrupt historical revenue or settlements.
- **Sales, Revenue & Bookings Overview**:
  - Platform-wide KPIs: Total Gross Sales, Platform Commission Earned, Partner Net Payable, Total Bookings (`Table` / `Food` / `Both`).
  - Filterable table of all bookings and sales by restaurant, date range, and status.
- **Settlement Status Controls**:
  - Monthly settlement summary per restaurant with ability to record payout reference (`Pending` → `Paid` with transaction ref & date).

---

### 2.3 Portal 2: Company / Restaurant Owner Dashboard
#### Confirmed Scope
- **Authentication**: Partner login (provisioned by Admin).
- **Premium Table Management**:
  - Manage premium table count, seating capacity (e.g., 2, 4, 6, 8 guests), and table price.
  - Upload table photos and set table titles/descriptions (e.g., *Chef's Counter*, *Private Booth*, *Terrace VIP*).
- **Slot-Based Availability Engine**:
  - Pair tables with **operating hours + time slots + slot duration** (e.g., 90 or 120 min blocks) so tables are bookable per date/time without double-booking.
- **Holiday & Availability Calendar**:
  - **Full Day (Fixed Default)**: All regular dates default to the restaurant's fixed full-day operating schedule and full slot list unless overridden on the calendar.
  - **Half-Day Override**: Partners can switch any specific date (or date range) to **Half Day** (e.g., First Half / Lunch-only or Second Half / Dinner-only, or custom active hours), automatically exposing only the slots within that half-day window.
  - **Holiday / Closed Override**: Partners can mark specific dates as **Holiday (Full-Day Closed)** to block bookings for the entire day, and can revert any override back to the default **Full Day** at any time.
- **Premium Food Menu Setup & Management**:
  - Create and manage menu categories and premium dishes (name, description, price, photo, dietary tag, availability toggle).
- **Bookings Management**:
  - View all incoming VIP bookings (distinguishing `Table Only`, `Food Only`, and `Both`, with pre-ordered dish list when applicable).
  - **Create Booking ("Create Book Table")**: Ability for the restaurant to manually create/log a table booking (e.g., phone/concierge VIP request) so inventory stays accurate.
  - **Simple Booking Status Actions**: `Confirmed` → `Checked In / Seated` → `Completed` / `No-Show` / `Cancelled`.
- **Revenue & Monthly Settlement**:
  - View restaurant-specific gross revenue, platform fee breakdown (per configured split ratio), and net earnings.
  - View monthly settlement history and breakdown.

#### Recommended Phase 1 Enhancements
- **Direct vs Platform Booking Flag**: Partner-created offline/walk-in bookings block table availability without charging platform commission (or tracked separately in revenue reports).
- **Holiday Override Conflict Guard**: Warn the partner if they attempt to mark a date as Holiday/Half-Day when confirmed VIP bookings already exist on affected slots.

---

### 2.4 Portal 3: Premium Customer (VIP) Experience
#### Confirmed Scope
- **VIP Dashboard (Simple, High-Craft Design)**:
  - Clean, distraction-free showcase listing onboarded premium restaurants (name, cuisine, location, starting table/menu price, rating, hero photo).
- **Restaurant Details Page**:
  - Curated **Table Photos** (showing VIP ambiance/seating options).
  - Curated **Premium Food Photos** & full **Premium Menu** with pricing.
  - **Customer Reviews** section.
  - Primary CTA to start booking.
- **Adaptive Booking Flow**:
  - **Step 1 — Booking Mode Selector**: User selects **"Table Only"**, **"Food Only"**, or **"Both (Table + Food)"**.
  - **Calendar-Aware Date & Slot Picker**: Respects the restaurant's Holiday & Availability Calendar (Holiday dates disabled; Half-Day dates show only slots in the active window; unmodified dates use the default Full-Day slots).
  - **Dynamic Form Arrangement**: Remaining fields adapt strictly to the selected mode:
    - If **Table Only**: Date, Time Slot, Party Size → Choose Table (displaying capacity & table price) → Guest notes.
    - If **Food Only**: Fulfillment type (Pickup / Dine-in Pre-order) + Date/Time → Select Premium Menu Items & quantities (with item prices & subtotal).
    - If **Both**: Date, Time Slot, Party Size → Choose Table (capacity & table price) → Select Premium Menu Items & quantities → Combined summary.
- *(Remaining steps—e.g., checkout, payment, confirmation pass, post-booking actions—pending user's next input.)*

#### Recommended Phase 1 Enhancements
- **Date/Time/Guest Filter Before Table Choice**: Ask Date, Time, and Guest Count before listing tables so only available, suitably sized tables appear.
- **Clear Table Price Policy Label**: Display explicitly whether table price is a *Reservation Fee*, *Minimum Spend*, or *Adjustable against Food Bill*.
- **VIP Touchpoints**: Occasion tag (`Anniversary`, `Business Dinner`, `Celebration`), special requests/allergies, and a clean VIP Booking Pass / Reference ID upon confirmation.
- **Curated Initial Reviews**: Allow verified completed-booking reviews + Admin-curated editorial/verified partner reviews for newly onboarded venues so pages don't launch empty.

---

## 3. Core Business Logic Rules (To Lock Before Coding)

1. **Revenue Split Calculation**:
   - At booking creation: `platformFee = grossAmount * (splitRatio / 100)`, `partnerNet = grossAmount - platformFee`.
   - Split ratio is snapshotted per transaction; changing a restaurant's split ratio in Admin affects **future** bookings only.
2. **Table Inventory Model**:
   - Individual named/typed VIP tables (e.g., *Window Booth #1 — 4 seats — ₹1,500*) or categorized inventory with quantity, booked against `(restaurantId, tableId, date, timeSlot)`.
3. **Offline/Manual Restaurant Bookings**:
   - Occupy the same `(tableId, date, timeSlot)` slot to prevent double-booking, tagged `source = 'partner_manual'` so settlement math stays accurate.
4. **Holiday & Availability Calendar Resolution**:
   - Every unedited date defaults to **Full Day** (fixed base operating hours & time slots).
   - Calendar overrides per date support `half_day` (e.g., First Half / Second Half or custom open–close window filtering available slots) and `holiday` (full-day closed — zero bookable slots), with option to reset back to `full_day`.

---

## 4. Open Questions (Awaiting Your Input)

1. **Table Pricing Rule**: Is the table price an **extra VIP booking fee**, a **cover charge credited toward food**, or a **minimum spend**?
2. **Split Ratio Scope**: Does Admin's split percentage apply equally to **Table Price + Food Total**, or only one / separate percentages?
3. **"Food Only" Fulfillment**: When a VIP chooses **Food Only**, is it **Pickup/Takeaway**, **Delivery**, or **Counter/Walk-in Pre-order**?
4. **VIP Access Model**: Should VIP customers register freely, enter via an invite code/Admin approval, or browse publicly and log in at booking?
5. **Remaining Phase 1 & Phase 2/3 Details**: Ready whenever you share the rest of the booking checkout flow and Phase 2–3 requirements!
