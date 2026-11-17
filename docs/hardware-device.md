# QuickBite Custom Billing Machine: Hardware Specification & Architecture

This document details the hardware components, single-unit custom enclosure design, integrated customer mini-screen, card slot, embedded thermal printer, and table isolation lifecycle for the **QuickBite Custom Billing Machine**.

---

## 1. Device Concept & Operational Flow

> [!IMPORTANT]
> **Single Unified Custom Device (Not Two Separate Machines):**
> The **Customer Mini Screen**, the **Card Ingestion Slot**, and the **Thermal Receipt Printer** are engineered directly into **ONE single custom-designed physical machine**. It is not a fragmented set of separate external peripherals. 

The custom machine sits on the restaurant billing counter facing the customer, connected via USB or Local Network to the billing staff's POS screen (the QuickBite Restaurant B2B Portal running on the counter computer or tablet).

```text
1. Food Serving Time: Waiter Hands Physical Dining Session Card to Customer (e.g. Card #07)
   ↓
2. Customer Finishes Meal: Hands Card at Billing Counter
   ↓
3. Billing Staff Inserts Card into the Custom Machine's Integrated Card Slot
   ↓
4. Machine Reads Card UID & Instantly Synchronizes:
   • Staff POS Screen: Full operational breakdown, item management controls ([Void], [Qty Edit], [Add Item])
   • Machine's Built-in Customer Mini Screen: Displays complete itemized food list, unit prices, subtotal, GST, paid online, and balance to pay
   ↓
5. Staff Manages Any Item Corrections (Unserved dishes voided with mandatory Reason Code & Audit Log)
   • Customer Mini Screen updates dynamically in real-time
   ↓
6. Customer Settles Payment Directly with Restaurant (Cash, Card Machine, or Restaurant's Own Razorpay/UPI)
   (Note: In-venue payments flow 100% directly to the restaurant partner)
   ↓
7. Staff 1-Tap "Print Receipt" on Staff POS:
   • This EXACT Custom Machine Prints Final Itemized Tax Invoice from its Built-in Thermal Printer & Auto-Cuts Paper
   • Payment & Order are Marked COMPLETED (Anchors T+X Payout Clock for any online pre-booked food)
   ↓
8. Strict Table Isolation:
   • Table Session is Terminated & Table Status Resets to VACANT
   • Previous Order is Permanently Sealed & Archived (Zero bleed-over to next customer)
   • Card is Unlinked & Returned to Available Pool Tray for Reuse
```

---

## 2. Hardware Bill of Materials (BOM) for the Custom Machine

The custom-designed machine integrates all billing, display, and printing mechanisms inside one cohesive chassis:

| Subsystem | Component Description | Recommended Model / Specification | Integration within Custom Machine |
|---|---|---|---|
| **Embedded Compute** | Single Board Computer / Controller Board | **Option A (Maker/Custom):** Raspberry Pi 4 (2GB/4GB) or Raspberry Pi Compute Module 4 (CM4)<br>**Option B (Industrial):** Rockchip RK3566 / RK3568 Embedded Controller Board with USB host, TTL serial, and MIPI/HDMI display | Housed internally inside the custom chassis; drives the mini-screen, card reader, and thermal printer |
| **Integrated Customer Mini Screen** | Front-Facing Customer Display | 5.0-inch to 7.0-inch IPS LCD Display (800×480 or 1024×600), $\ge 400\text{ nits}$ brightness | Flush-mounted into the front face of the custom machine facing the dining customer |
| **Integrated Card Slot** | Card Ingestion Slot & Reader | **Contact:** ISO 7816 Smart Card Reader (AU9540 / RTS5169 USB IC) with microswitch card-detect<br>**Contactless:** 13.56 MHz RFID/NFC Slot (PN532 / RC522) with optical slot sensor | Embedded into the front lower panel directly beneath the mini screen |
| **Integrated Thermal Printer** | High-Speed Embedded Thermal Printer Mechanism | 58mm or 80mm Embedded Thermal Printer Mechanism with Auto-Cutter (CSN-A2, Fujitsu FTP-628MCL, or Seiko CAPD series), 203 DPI, $\ge 150\text{mm/s}$ | Mounted directly inside the top of the custom machine; receipt feeds and cuts from the top paper mouth |
| **Host Connectivity** | High-Speed USB Device Interface / LAN / Wi-Fi | USB 2.0 Type-B/Type-C Slave + Dual-band Wi-Fi + RJ45 Ethernet | Connects the custom machine to the billing staff's counter POS computer/tablet |
| **Power Management** | DC Power Input & Internal Mini-UPS | 12V DC / 24V DC 3.0A–4.0A input + Internal 2S/3S Li-ion Battery Pack (with charging circuit) | Powers the controller, customer mini screen, and thermal auto-cutter even during power cuts |
| **Custom Enclosure** | Single Unified Custom Countertop Chassis | Custom-Molded ABS / CNC Anodized Aluminum Enclosure with front mini screen bezel, card slot, and top receipt exit | Unified physical footprint on the restaurant counter (not 2 separate devices) |

---

## 3. Physical Layout & Dual-Screen Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        RESTAURANT CASHIER & COUNTERTOP SETUP                           │
│                                                                                        │
│   [STAFF POS SCREEN]                       [QUICKBITE CUSTOM BILLING MACHINE]          │
│   (Counter Computer / Tablet)              (Single Unified Custom Countertop Unit)     │
│   ┌──────────────────────────────────┐     ┌────────────────────────────────────────┐  │
│   │ Table: Table 04 | Card: #07      │     │  TOP: [RECEIPT AUTO-CUT EXIT MOUTH]    │  │
│   │ -------------------------------- │     │  ====================================  │  │
│   │ 2x Chicken Biryani    [Edit][🗑️] │     │                                        │  │
│   │ 4x Butter Naan        [Edit][🗑️] │     │  FRONT CUSTOMER MINI SCREEN:           │  │
│   │ 2x Mint Lime Juice    [Edit][🗑️] │     │  ┌──────────────────────────────────┐  │  │
│   │ -------------------------------- │     │  │ Table 04 - Order Summary         │  │  │
│   │ [+ Add Item]  [Audit History 📜] │     │  │ -------------------------------- │  │  │
│   │ -------------------------------- │     │  │ 2x Chicken Biryani       ₹440.00 │  │  │
│   │ Total Bill:              ₹756.00 │     │  │ 4x Butter Naan           ₹160.00 │  │  │
│   │ Already Paid (App):     -₹400.00 │     │  │ 2x Mint Lime Juice       ₹120.00 │  │  │
│   │ Need to Pay:             ₹356.00 │     │  │ -------------------------------- │  │  │
│   │                                  │     │  │ Subtotal:                ₹720.00 │  │  │
│   │  ┌────────────────────────────┐  │     │  │ GST (5%):                ₹ 36.00 │  │  │
│   │  │   [ PRINT RECEIPT ] (1)    ├──┼────►│  │ Total Bill:              ₹756.00 │  │  │
│   │  └────────────────────────────┘  │     │  │ Already Paid (App):     -₹400.00 │  │  │
│   └──────────────────────────────────┘     │  │ BALANCE TO PAY:          ₹356.00 │  │  │
│                                            │  └──────────────────────────────────┘  │  │
│                                            │                                        │  │
│                                            │  INTEGRATED FRONT CARD SLOT:           │  │
│                                            │  [ ====== [DINING CARD #07] ====== ]   │  │
│                                            └────────────────────────────────────────┘  │
│                                            * ONE CUSTOM MACHINE HOUSING BOTH THE       │
│                                              CUSTOMER MINI SCREEN & THERMAL PRINTER!   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Customer Mini-Screen Display (Food List & Financials)
- **Itemized Dish Transparency:** Customers clearly see the **full ordered food list**—dish name, quantity, unit price, and line total—along with the subtotal, GST taxes, advance online payments, and remaining balance to pay.
- **Dynamic Real-Time Sync:** If billing staff adjusts quantities or voids an item at the counter, the custom machine's mini-screen updates **instantly in real time** so the diner sees the exact adjusted bill before tendering payment.

### 3.2 Billing Staff Order Item Management & Audit Log Controls
Billing staff can manage active table items directly on the counter POS prior to printing the final receipt:
1. **Item Actions Supported:**
   - **Void Item (Cancel Dish):** Remove an erroneously punched or unserved dish.
   - **Adjust Quantity:** Increase or decrease item count (e.g. from 4 naans to 2 naans).
   - **Add Item:** Punch an additional item requested by diners at checkout (e.g. bottled water, takeaway dessert).
2. **Mandatory Audit Trail Enforcement:**
   To eliminate cashier fraud, shrinkage, or bill tampering:
   - Any item removal, cancellation, or quantity decrease requires a **Mandatory Reason Code** (e.g. `NOT_SERVED`, `CUSTOMER_REJECTED`, `KITCHEN_SPILLAGE`, `WRONGLY_PUNCHED`).
   - If the dish was already dispatched to the kitchen (KOT printed), voiding requires **Manager PIN Authorization**.
   - Every change writes an immutable audit record to `order_item_audit_logs` capturing: Staff User ID, Dish Name, Old Qty, New Qty, Delta ₹ Amount, Reason Code, and Manager Approver.
   - The staff screen has an `[Audit History 📜]` button allowing managers to inspect all past modifications on the ticket.

### 3.3 Payment Settlement & 1-Tap Print
1. **Customer In-Venue Payment:** Customer pays the net balance to the restaurant (Cash, restaurant card machine, or restaurant's own Razorpay/UPI setup).
2. **Staff 1-Tap "Print Receipt":** Staff taps 1 button on their POS screen. This custom machine immediately prints the receipt from its integrated printer mouth, cuts the paper, updates order and payment to `COMPLETED`, and isolates the table for the next customer.

---

## 4. Strict Table Isolation Lifecycle

To ensure that the next customer dining at that table has an entirely clean, isolated session without any bleed-over from the previous customer:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Billing Staff
    participant Machine as Countertop Billing Machine
    participant DB as Backend Database (PostgreSQL)
    actor NextCustomer as Next Customer

    Staff->>Machine: Tap 1-Click "Print Receipt"
    Machine->>DB: Atomic Transaction: Settle & Isolate Table
    
    rect rgb(240, 255, 240)
        Note over DB: ATOMIC ISOLATION TRANSACTION
        DB->>DB: 1. Update Current Order: status = 'COMPLETED', payment_status = 'FULLY_PAID'
        DB->>DB: 2. Record completed_at = NOW() (Starts T+X delayed payout clock)
        DB->>DB: 3. Unbind Dining Card: dining_session_cards.status = 'AVAILABLE', active_order_id = NULL
        DB->>DB: 4. Reset Table Status: restaurant_tables.status = 'VACANT'
        DB->>DB: 5. Invalidate Active Session Token for this Table
        DB->>DB: 6. Archive Order: Permanent Read-Only Record Sealed in Database
    end

    Machine->>Machine: Built-in Thermal Printer Prints Receipt & Auto-Cuts
    Staff->>Staff: Remove Card & Place in Available Pool Tray

    Note over NextCustomer,DB: NEXT DINING PARTY ARRIVES AT TABLE
    NextCustomer->>DB: Scans Table QR Code or Waiter Opens Table
    DB->>DB: Generates Fresh, Isolated Session Token (New Order ID)
    DB-->>NextCustomer: Loads Empty Cart & Live Menu (0 Items, ₹0.00 Balance)
    Note over NextCustomer,DB: Table is 100% Isolated. Previous customer's orders, items, and billing cannot bleed over!
```

### Table Isolation Rules:
1. **Zero State Bleed:** When an order transitions to `COMPLETED`, its active association with `table_id` is severed. Querying active orders for that table returns `NULL`.
2. **Read-Only Archive:** Once marked `COMPLETED`, line items and bill amounts cannot be altered, appended to, or deleted.
3. **Fresh Session Generation:** The next customer scanning the table QR code or seated by staff receives a brand-new cryptographic session and a new `order_number` (`ORD-xxxxx`).
4. **Card Reusability:** The physical card is returned to `AVAILABLE` status in the restaurant's card inventory tray, ready to be assigned to any future table without retaining historical data.

---

## 5. Printed Thermal Receipt Format (80mm ESC/POS)

```text
+------------------------------------------+
|            TANDOOR NIGHTS RESTAURANT     |
|       124 MG Road, Indiranagar, Bengaluru|
|     GSTIN: 29AAAAA0000A1Z5 | FSSAI: 1122 |
|------------------------------------------|
| Date: 17/11/2026 14:15     Table: Table 04|
| Order: ORD-84920            Card: CARD-07|
| Cashier: Staff Member                    |
|------------------------------------------|
| Item                 Qty    Price   Total|
|------------------------------------------|
| Chicken Biryani        2   220.00  440.00|
| Butter Naan            4    40.00  160.00|
| Mint Lime Juice        2    60.00  120.00|
|------------------------------------------|
| Subtotal                         ₹ 720.00|
| CGST (2.5%)                      ₹  18.00|
| SGST (2.5%)                      ₹  18.00|
| Total Bill Amount                ₹ 756.00|
|------------------------------------------|
| Advance Online Paid (App)       -₹ 400.00|
| Net Amount Paid at Counter       ₹ 356.00|
| Balance Due                      ₹   0.00|
|------------------------------------------|
| Status: FULLY PAID & COMPLETED           |
|------------------------------------------|
|      THANK YOU FOR DINING WITH US!       |
|          Powered by QuickBite            |
+------------------------------------------+
[AUTO-CUT PAPER]
```
