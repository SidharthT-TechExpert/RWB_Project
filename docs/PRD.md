# QuickBite – Product Requirements Document (PRD)

---

## 1. Product Overview

- **Product Name:** QuickBite
- **Product Type:** Dedicated Destination & Trending Food Pre-Booking Platform
- **Base Currency:** Indian Rupee (INR / ₹). All menu dish prices, customer pre-booking charges, and partner bank payouts are strictly transacted and displayed in Indian Rupees (₹).
- **Executive Summary:** QuickBite is a specialized dining platform designed specifically for **popular, iconic, trending, and long-distance destination restaurants** (e.g. famous highway eateries, heritage thali houses, iconic biryani destinations, coastal seafood hubs, and trending viral dining spots). It solves the severe problem of travelers driving long distances only to find signature dishes sold out and chaotic, hostile queues. Through QuickBite, diners pre-book guaranteed food portions and reserved seating ahead of time with strict cut-off windows (before 12:00 PM on the dining day; 7:00 PM day-before kitchen batch dispatch). Partner hotels receive aggregated kitchen preparation manifests and welcome travelers with guaranteed food and zero-wait hospitality ("good dining culture").

---

## 2. Problem Statement

Long-distance food travel and weekend dining at popular or trending destination restaurants suffer from major friction:
- **Long-Distance Travel Uncertainty:** Food enthusiasts, highway road-trippers, and families drive 50 to 150+ km specifically to visit famous or trending eateries.
- **The "Sold Out" Heartbreak:** Because these iconic restaurants prepare limited batches of signature dishes (e.g. special mutton biryani, fresh-catch seafood, traditional thalis), items frequently sell out by 1:00 PM or 8:00 PM. Travelers arrive hungry after hours on the road only to be told that the signature food is gone.
- **Chaotic "Cattle Queues" & Poor Culture:** Trending spots are overwhelmed by chaotic, unorganized crowds. Diners wait in harsh conditions for 45 to 90 minutes without seating, treated like numbers rather than valued guests.
- **Hesitant Travel Demand:** Many potential diners avoid visiting trending and iconic destination restaurants altogether because there is no guarantee they will get food or a hospitable dining experience.
- **Kitchen Operational Uncertainty:** Destination restaurants struggle to forecast daily guest volume accurately, resulting in either running out of signature dishes during peak rush or suffering expensive food spoilage.

---

## 3. Goals & Objectives

1. **Guaranteed Signature Food:** Guarantee that pre-booked signature dishes are reserved, prepared fresh, and waiting for travelers upon arrival—eliminating sold-out disappointment.
2. **Elevate Hospitality & Dining Culture:** Transform chaotic trending eateries into organized, welcoming experiences where pre-booked travelers are greeted promptly, seated at reserved tables, and served hot food with zero wait.
3. **Strict Cut-Off & Batch Scheduling:** Enforce clean preparation lead times: same-day bookings must be placed before **12:00 PM (Noon)**; the kitchen receives a consolidated **7:00 PM Day-Before Batch Sheet**, locking in ingredient procurement and prep schedules.
4. **Predictable Hotel Kitchen Production:** Provide destination kitchens with precise portion forecasts per arrival slot, optimizing kitchen throughput and eliminating food waste.
5. **Streamlined Platform Operations:** Remove unnecessary in-venue POS SaaS bloat; focus purely on destination pre-booking, slot management, 1-tap arrival check-in, and T+X delayed payouts.

---

## 4. Target Users

| User Persona | Role | Core Need & Pain Point |
|---|---|---|
| **Highway & Road-Trip Travelers** | Consumer | Driving 50–150+ km on highways; needs guaranteed food readiness and confirmed seating at a precise transit time. |
| **Weekend Destination Diners & Food Tourists** | Consumer | Traveling specifically to experience viral or iconic heritage food; needs guaranteed signature portions without waiting in chaotic queues. |
| **Family & Group Travelers** | Consumer | Planning dining for kids and elders; cannot tolerate standing in unorganized lines or risking sold-out dishes. |
| **Hotel / Restaurant Owner & Head Chef** | Partner | Needs exact advance portion counts for prep, smooth customer arrival pacing across slots, and predictable advance revenue. |
| **Front Desk / Welcome Host** | Partner | Needs a simple 1-tap interface to check in arriving travelers, seat them at reserved tables, and fire their prepped orders. |
| **Super Admin** | Platform Operator | Curates destination venues, verifies 4-document legal compliance, manages pre-booking splits, and executes bank payouts. |

---

## 5. User Stories

### Diners & Travelers
- *As a road-trip traveler,* I want to pre-book 4 portions of iconic mutton biryani 2 days ahead, so my family is guaranteed our meal when we reach the highway restaurant after a 3-hour drive.
- *As a business traveler on transit,* I want to reserve a 1:30 PM lunch slot with pre-ordered meals, so I can arrive, be seated immediately, and finish lunch within 45 minutes without waiting in long queues.
- *As a weekend foodie,* I want to see real-time remaining portion counters for signature dishes, so I can lock in my order before the daily quota fills up.

### Hotel & Kitchen Operators
- *As a head chef at a destination restaurant,* I want to receive the consolidated 7:00 PM batch sheet the night before, so my kitchen team can prep the exact meat and fresh ingredients needed without stress or waste.
- *As a restaurant host,* I want to scan a traveler's VIP pass when they arrive and seat them immediately with their pre-ordered food already firing in the kitchen.
- *As a restaurant owner,* I want to configure arrival slot capacities and set daily limits on signature dishes, so our kitchen is never overwhelmed.

### Platform Operators
- *As a Super Admin,* I want to review uploaded compliance documents (FSSAI, GST, Bank Proof, Owner ID) and verify them before activating any destination partner.
- *As a Super Admin,* I want delayed payout statements generated automatically (T+X days post-dining), so I can transfer pre-booked food amounts to restaurant accounts with bank UTR references.

---

## 6. Functional Requirements

### 6.1 Hotel Partner Operations Portal (Pre-Booking Management)
*(Replaces the generic in-venue POS SaaS)*
- **B2B-01 Multi-Tenant Partner Access:** Secure login for hotel owners, managers, and front-desk hosts with isolated venue data.
- **B2B-02 Today's Pre-Bookings & Slot Board:** Visual timeline showing all bookings organized by arrival slots (e.g., 12:30 PM – 1:30 PM, 1:30 PM – 2:30 PM, 7:30 PM – 8:30 PM), guest counts, customer names, phone numbers, and pre-booked dishes.
- **B2B-03 Automated Kitchen Batch Prep Sheet:** Aggregated portion count sheet grouped by slot (e.g., "Slot 1:00 PM: 32 Special Biryani, 14 Tandoori Chicken, 8 Fresh Lime"). Generates automatically at the 7:00 PM day-before cut-off and updates dynamically for authorized morning bookings.
- **B2B-04 Daily Quota & Signature Dish Limits:** Set maximum daily portion limits for signature/trending dishes and maximum seating capacity per arrival slot.
- **B2B-05 Slot Availability & Cut-Off Engine:** Configure standard dining slots (60, 90, 120 mins), table allocations, lead times, and same-day 12:00 PM cut-off rules.
- **B2B-06 Operating Calendar & Shift Overrides:** Default weekly schedule, half-day shift overrides (lunch-only or dinner-only), and holiday blackouts.
- **B2B-07 Digital Pre-Booking Menu Studio:** Manage signature dishes, pricing in INR (₹), dietary tags (`Veg`, `Non-Veg`, `Vegan`, `Jain`), preparation times, and instant sold-out toggles.
- **B2B-08 1-Tap Guest Arrival Check-in:** Front desk/host scans customer QR pass or taps "Check-in" on the portal. Instantly marks status as `Arrived / Seated`, alerts the kitchen to fire the fresh food, and frees up queue congestion.
- **B2B-09 Daily Settlements & Invoices Tracker (T+X Days):** Track matured payouts for completed pre-bookings, volume stats (created vs completed), and download official PDF Tax Invoices stamped with bank UTR transaction numbers.

### 6.2 Pre-Booking Cut-Off & Batch Scheduling Engine
- **CUT-01 Same-Day 12:00 PM Hard Cut-off:** Diners must book same-day slots before **12:00 PM (Noon)**. Any attempt to place a same-day booking after 12:00 PM is blocked with an alert informing the diner that the kitchen preparation window has closed.
- **CUT-02 Day-Before 7:00 PM Batch Manifest Dispatch:** Every evening at 7:00 PM (19:00 local time):
  1. The system aggregates all confirmed bookings for the following day.
  2. Dispatches the **Consolidated Kitchen Batch Prep Sheet** to the hotel partner portal and kitchen notification chimes.
  3. Dispatches the **Final VIP Trip Pass & Travel Reminder** via SMS/Email/App Notification to all confirmed diners with directions and arrival protocols.
- **CUT-03 Post-7:00 PM Next-Day Bookings (30-Minute Grace Window):**
  - Diners booking between 7:00 PM and midnight for the next day's afternoon/evening slots (prior to the next day's 12:00 PM cut-off) receive their confirmation and pass within a 30-minute processing window.
  - The hotel's Kitchen Batch Prep Sheet dynamically updates with incremental additions highlighted for the kitchen team.

### 6.3 Unified Customer Application (Destination & Trending Discovery + Pre-Booking)
- **CUST-01 Phone OTP Authentication:** Quick sign-up/login with verified Name and Mobile Number.
- **CUST-02 Trending & Destination Discovery:** Explore curated destination eateries, highway hubs, viral spots, and heritage restaurants with distance, driving time estimates, ambiance photos, and traveler reviews.
- **CUST-03 Guaranteed Dish Pre-Ordering:** Browse live menus with signature dish highlight badges and real-time remaining portion counters.
- **CUST-04 Slot & Table Reservation:** Select date, party size (2, 4, 6, 8+ pax), arrival slot window, and suitable table(s).
- **CUST-05 Special Travel Notes:** Add travel arrival notes (e.g. "Traveling from Bangalore, arriving by 1:30 PM with family, serve soup immediately").
- **CUST-06 Upfront Pre-Booking Checkout:** Transparent payment of Pre-Booking Fee + Selected Food Items Price in Indian Rupees (₹) via UPI, NetBanking, or Cards.
- **CUST-07 Digital VIP Trip Pass:** Confirmed digital pass featuring unique QR code, booking ID, reserved slot time, route map shortcut, itemized dish summary, and live status badge (`Confirmed` → `Prepped` → `Arrived / Seated` → `Completed`).
- **CUST-08 Automated Notifications:** Day-before 7:00 PM trip pass reminder, live kitchen prep confirmation, and arrival welcoming prompt.
- **CUST-09 Dining History & Tax Invoices:** View past road-trip dining history and download itemized digital receipts.

### 6.4 Super Admin Portal (Governance, Compliance & Delayed Settlements)
- **ADM-01 Curated Partner Onboarding:** Create profiles for trending, destination, and highway dining partners.
- **ADM-02 4-Document Compliance Gate:** Mandatory review of FSSAI License, GST Certificate, Bank Proof, and Owner KYC ID. Activation locked in `Draft` until all 4 are `Approved` with 1-click `Active` / `Suspended` control.
- **ADM-03 Pre-Booking Commercial Split Configuration:** Record agreed platform commission percentage on pre-bookings.
- **ADM-04 Daily Delayed Settlement Engine (T+X Days Post-Dining):**
  - FIFO-sorted matured batches (`completed_at + X days`).
  - Multi-criteria filters, volume metrics (created vs completed pre-bookings, gross food total, net partner payout).
  - Bank transfer execution & Bank UTR reference entry.
  - Automated PDF Tax Invoice / Settlement Receipt generation.
- **ADM-05 Global Audit & Anti-Fraud Inspector:** Filterable log of cross-venue pre-bookings with verified diner details, phone numbers, and client IP addresses for fraud prevention.

---

## 7. Non-Functional Requirements

- **Sub-Second Performance:** Search, discovery, and menu catalogs load in under `1.5 seconds` even on highway mobile connections; bookings synchronize in $\le 500\text{ms}$.
- **Strict Data Isolation:** Multi-tenant separation ensures partner hotels only access their own pre-bookings and customer arrival data.
- **PWA Full-Screen Mode:** Hotel Partner Portal runs borderless on counter tablets and iPads, preventing staff from navigating away during check-in rush.
- **Reliability & Concurrency:** Real-time stock counters prevent overbooking signature dishes beyond daily kitchen capacity.
- **Audit Logging:** Immutable audit ledger for document approvals, booking status transitions, and bank payouts.

---

## 8. User Flows

### Flow 1: Customer Discovery & Advance Food Pre-Booking
```text
Open App → Discover Trending / Destination Restaurant →
Select Travel Date, Arrival Time Slot & Party Size →
Select Table(s) & Pre-Order Signature Food from Menu (Real-Time Portion Counter) →
Add Special Travel / Arrival Instructions →
Submit Before 12:00 PM Cut-off →
Pay Pre-Booking Charge + Selected Food Items Price upfront in ₹ →
Digital VIP Trip Pass Generated with Unique QR Code.
```

### Flow 2: 7:00 PM Day-Before Batch Dispatch & Kitchen Manifest
```text
Clock Hits 7:00 PM (Night Before Dining Day) →
System Automatically Consolidates All Confirmed Bookings for Next Day →
Dispatches Automated Kitchen Batch Prep Sheet to Hotel Partner Dashboard →
Sends VIP Trip Pass Reminder & Route Map to Diners via SMS / Push Notification →
Hotel Kitchen Preps Exact Ingredients and Fresh Stocks with Zero Waste.
```

### Flow 3: Diner Arrival, 1-Tap Check-In & VIP Hospitality
```text
Travelers Arrive at Destination Restaurant →
Proceed to QuickBite VIP Welcome Counter / Host Desk →
Host Scans Traveler's Digital VIP Pass QR (or 1-Tap Check-In on Tablet) →
Order Status Transitions to "Arrived / Seated" →
Diners Escorted Immediately to Reserved Table (Zero Wait, Good Hospitality Culture) →
Kitchen Fires Pre-Prepped Fresh Meal → Food Served Promptly →
Meal Enjoyed → Host Taps "Complete Booking" →
Table Released & T+X Delay Clock Initiated for Partner Payout.
```

### Flow 4: Restaurant Onboarding & 4-Document Activation Gate
```text
Admin Creates Restaurant Profile → System Automatically Generates & Emails Owner Password →
Admin Uploads 4 Mandatory Documents (FSSAI, GST, Bank Proof, Owner ID) →
Admin Reviews Documents → System Emails Partner Approval/Rejection Notice (with Rejection Reason) →
When All 4 Documents Are Approved → Activation Gate Unlocked → Status Changed from "Draft" to "Active".
```

### Flow 5: Daily Delayed Food Payout (T+X Days Post-Dining)
```text
Customer Finishes Dining → Host Taps "Complete" (completed_at recorded) →
Holding Clock Starts Strictly From completed_at (X Days Delay for Quality & Dispute Clearance) →
Delay Window Matures (NOW >= completed_at + X days) →
Batches Surface in Admin Daily Settlement Window Prioritized by FIFO (Oldest Batches First) →
Admin Transfers Food Total to Partner Bank Account & Logs UTR Reference →
System Automatically Generates Official PDF Tax Invoice / Settlement Receipt →
Partner Views Settlement Stats & Downloads Invoice in Portal.
```

---

## 9. UI/UX Requirements & Key Screens Needed

The QuickBite ecosystem spans three streamlined surfaces:

### 9.1 Surface 1: Unified Customer Application (Mobile Native / PWA)
1. **Phone OTP Auth & Profile:** Fast phone number OTP login, verified full name, and dietary preferences.
2. **Trending & Destination Discovery (Home View):** Curated destination carousel, highway route filters, driving distance/time badges, ambiance gallery, traveler ratings, and signature dish highlights.
3. **Restaurant Detail & Signature Showcase:** Story of the eatery, heritage/specialty dish showcase, ambiance gallery, map pin, operating hours, and primary "Pre-Book Food & Table" action.
4. **Slot, Date & Table Selector:** Calendar date picker, available arrival time slots (e.g. 1:00 PM – 2:00 PM), guest party size, and table selector.
5. **Signature Dish Pre-Ordering Screen:** Categorized menu with remaining portion counters (e.g. *"Only 9 portions left"*), dietary badges (`Veg`, `Non-Veg`, `Vegan`, `Jain`), and special travel notes modal.
6. **Pre-Booking Checkout Screen:** Itemized summary in INR (₹) showing Pre-Booking Charge + Selected Food Items Price, split snapshot, and UPI/Cards payment.
7. **Digital VIP Trip Pass Screen:** High-contrast QR pass, booking ID, arrival countdown, route navigation link, pre-ordered dish list, and live status progression (`Confirmed` → `Prepped` → `Arrived / Seated` → `Completed`).
8. **Trip Dining History & Invoices:** Archive of past road-trip dining experiences with downloadable tax invoices.

### 9.2 Surface 2: Hotel Partner Operations Portal (Tablet / PC PWA)
1. **Partner Authentication:** Login with email and system-generated credentials; mandatory first-time password rotation.
2. **Today's Pre-Bookings & Slot Board:** Visual timeline of arrivals grouped by time slots, displaying guest names, party sizes, and pre-ordered dishes.
3. **Automated Kitchen Batch Prep Sheet:** Consolidated portion requirements for the kitchen team per slot (e.g. *"1:00 PM Slot: 45 Biryani, 12 Fish Fry"*), generated at 7:00 PM day-before.
4. **1-Tap Guest Check-In Screen:** Camera QR scanner or quick search to validate incoming diners, seat them at reserved tables, and notify the kitchen.
5. **Quota & Capacity Manager:** Configure daily preparation limits for signature dishes and seating capacity per slot.
6. **Operating Calendar & Shift Overrides:** Default weekly schedule, half-day shift overrides, and holiday closures.
7. **Settlements & Invoices Section:** Daily rolling payout tracker (T+X days), created vs completed booking volume stats, and official downloadable tax invoices with bank UTR numbers.

### 9.3 Surface 3: Super Admin Portal (Platform Management & Payouts)
1. **Platform Authentication:** Secure login with multi-factor session validation.
2. **Partner Onboarding Wizard:** Entity details, brand name, cuisine badges, location, ambiance media, and pre-booking split percentage.
3. **4-Document Compliance Verification Modal:** Document viewer for FSSAI, GST, Bank Proof, and Owner ID with 1-click Approve/Reject, mandatory rejection reason, and Activation Gate toggle.
4. **Daily Delayed Settlement Hub (T+X Days):** FIFO-sorted matured batches, multi-criteria filters, volume metrics, bank UTR entry modal, and automated tax invoice trigger.
5. **Monthly Platform Split Ledger:** Monthly platform commission statements and CSV/PDF export.
6. **Global Master Audit Ledger & Anti-Fraud Inspector:** Filterable log of cross-venue pre-bookings with verified diner details, phone numbers, and client IP addresses for fraud prevention.

---

## 10. Acceptance Criteria

### Destination Food Pre-Booking & Quotas
- Customers must be able to discover trending/destination restaurants with distance and driving time estimates.
- Signature dishes must display real-time remaining portion counters and prevent overbooking beyond daily limits.
- Upfront checkout must transparently charge Pre-Booking Charge + Selected Food Items Price in Indian Rupees (₹).
- Same-day pre-bookings must be rejected automatically after the 12:00 PM cut-off.

### 7:00 PM Batch Manifest & Notifications
- Every evening at 7:00 PM, the system must automatically generate and deliver the next day's Kitchen Batch Prep Sheet to the hotel partner portal.
- Diners must receive their finalized VIP Trip Pass reminder and route navigation link at 7:00 PM the night before dining.
- Bookings placed after 7:00 PM for the following day must be confirmed within 30 minutes, updating the kitchen batch sheet dynamically.

### Arrival & VIP Hospitality
- Arriving travelers must be verified via a 1-tap QR scan or check-in button on the hotel portal.
- Successful check-in transitions booking status to `Arrived / Seated` and frees up queue delays.
- Completed dining seals the booking and initiates the T+X payout clock.

### Compliance & Settlements
- No restaurant can be activated until all 4 compliance documents are `Approved` by Super Admin.
- Pre-booked food payouts must be held for T+X days post-dining and disbursed via FIFO queue with valid bank UTR references.
