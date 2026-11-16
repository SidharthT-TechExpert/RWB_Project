# QuickBite Entity-Relationship (ER) Architecture

This document provides visual architectural diagrams and domain relationship mappings for the **QuickBite** platform database using Mermaid modeling syntax.

---

## 1. Complete Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o| RESTAURANTS : "manages/belongs to"
    RESTAURANTS ||--o{ COMPLIANCE_DOCUMENTS : "submits"
    RESTAURANTS ||--o{ DINING_ZONES : "contains"
    DINING_ZONES ||--o{ RESTAURANT_TABLES : "houses"
    RESTAURANTS ||--o{ KITCHEN_PRINTERS : "deploys"
    RESTAURANTS ||--o{ MENU_CATEGORIES : "organizes"
    KITCHEN_PRINTERS ||--o{ MENU_CATEGORIES : "prints tickets for"
    MENU_CATEGORIES ||--o{ FOOD_ITEMS : "contains"
    RESTAURANTS ||--o{ CALENDAR_OVERRIDES : "schedules"
    RESTAURANTS ||--o{ TABLE_RESERVATIONS : "receives"
    RESTAURANT_TABLES ||--o{ TABLE_RESERVATIONS : "allocated to"
    RESTAURANTS ||--o{ TABLE_ORDERS : "processes"
    RESTAURANT_TABLES ||--o{ TABLE_ORDERS : "served at"
    TABLE_RESERVATIONS ||--o| TABLE_ORDERS : "initiates"
    TABLE_ORDERS ||--o{ ORDER_ITEMS : "comprises"
    FOOD_ITEMS ||--o{ ORDER_ITEMS : "ordered as"
    KITCHEN_PRINTERS ||--o{ ORDER_ITEMS : "routed to"
    RESTAURANTS ||--o{ DAILY_SETTLEMENT_BATCHES : "settled via"
    DAILY_SETTLEMENT_BATCHES ||--o{ TABLE_RESERVATIONS : "aggregates"
    RESTAURANTS ||--o{ MONTHLY_SETTLEMENTS : "reconciles"

    USERS {
        uuid id PK
        uuid restaurant_id FK
        string email UK
        string password_hash
        string role
        string full_name
        boolean must_reset_password
        boolean is_active
        timestamp created_at
    }

    RESTAURANTS {
        uuid id PK
        string legal_name
        string brand_name
        string slug UK
        string status
        decimal prebooking_split_percentage
        int payout_delay_days
        time opening_time
        time closing_time
    }

    COMPLIANCE_DOCUMENTS {
        uuid id PK
        uuid restaurant_id FK
        string document_type
        string file_s3_key
        string status
        string rejection_reason
        uuid verified_by_user_id FK
        timestamp verified_at
    }

    DINING_ZONES {
        uuid id PK
        uuid restaurant_id FK
        string name
        boolean is_active
    }

    RESTAURANT_TABLES {
        uuid id PK
        uuid restaurant_id FK
        uuid zone_id FK
        string table_number
        int seating_capacity
        string qr_secret_hash
        string status
        boolean is_active
    }

    KITCHEN_PRINTERS {
        uuid id PK
        uuid restaurant_id FK
        string name
        string ip_address
        int port
        int paper_width_mm
        boolean is_active
    }

    MENU_CATEGORIES {
        uuid id PK
        uuid restaurant_id FK
        string name
        int display_order
        uuid assigned_printer_id FK
        boolean is_active
    }

    FOOD_ITEMS {
        uuid id PK
        uuid restaurant_id FK
        uuid category_id FK
        string name
        decimal price
        boolean is_veg
        boolean is_available
        int prep_time_minutes
    }

    CALENDAR_OVERRIDES {
        uuid id PK
        uuid restaurant_id FK
        date override_date
        string override_type
        time shift_start_time
        time shift_end_time
        string reason
    }

    TABLE_RESERVATIONS {
        uuid id PK
        uuid restaurant_id FK
        uuid table_id FK
        string customer_name
        date reservation_date
        time slot_time
        int party_size
        decimal prebooking_amount
        decimal applied_split_ratio
        decimal platform_fee_amount
        decimal partner_payout_amount
        string status
        uuid daily_batch_id FK
    }

    TABLE_ORDERS {
        uuid id PK
        string order_number UK
        uuid restaurant_id FK
        uuid table_id FK
        uuid reservation_id FK
        string order_type
        string status
        decimal gross_food_amount
        decimal tax_amount
        decimal total_bill_amount
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid food_item_id FK
        string item_name_snapshot
        decimal unit_price_snapshot
        int quantity
        uuid category_id_snapshot FK
        uuid assigned_printer_id_snapshot FK
        timestamp kot_printed_at
    }

    DAILY_SETTLEMENT_BATCHES {
        uuid id PK
        uuid restaurant_id FK
        date batch_date
        timestamp holding_matures_at
        int prebookings_created_count
        int prebookings_completed_count
        decimal gross_food_sales
        decimal platform_fee_deduction
        decimal net_payout_amount
        string status
        string utr_number
        string invoice_number UK
        string invoice_pdf_url
        timestamp settled_at
    }

    MONTHLY_SETTLEMENTS {
        uuid id PK
        uuid restaurant_id FK
        string period_month
        int total_prebookings_count
        decimal gross_prebooking_fees
        decimal platform_share_total
        decimal partner_share_total
        string statement_pdf_url
    }
```

---

## 2. Core Operational Subsystems

### 2.1 Restaurant Onboarding & Compliance Verification Flow

```mermaid
flowchart TD
    A["Partner Onboarding Registered"] --> B["4 Documents Uploaded (FSSAI, GST, Bank Proof, KYC ID)"]
    B --> C["Admin Review in Admin Portal"]
    C -->|Reject| D["Record Rejection Reason & Email Partner"]
    D --> B
    C -->|Approve All 4 Docs| E["Activation Gate Unlocked"]
    E --> F["Admin Switches Status to Active"]
    F --> G["Venue Live for Table Pre-Bookings & QR Ordering"]
```

### 2.2 Category-Based KOT Thermal Printing Flow

```mermaid
flowchart TD
    Order["Order Placed (CONFIRMED)"] --> Decompose["Decompose Order Items by Category"]
    Decompose --> CatCheck{"Category Assigned Printer?"}
    CatCheck -->|Assigned| PrinterFound["Route Items to Category Printer (e.g. Shawarma Station 192.168.1.150:9100)"]
    CatCheck -->|Unassigned| Fallback["Route to Primary Default Kitchen Printer"]
    PrinterFound --> PrintFormat["Synthesize ESC/POS Thermal Commands"]
    Fallback --> PrintFormat
    PrintFormat --> RawSocket["Dispatch to IP:9100 over Raw TCP Socket"]
    RawSocket --> Stamp["Update order_items.kot_printed_at"]
```

### 2.3 Delayed Daily Settlement (T+X Days) & Partner Invoice Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Pre-Booking)
    participant Platform as QuickBite Platform
    participant Batch as Daily Settlement Batch
    actor Admin as Super Admin
    actor Partner as Restaurant Partner

    Customer->>Platform: Pre-book Table & Meal (Transacted in ₹)
    Platform->>Platform: Snapshot Split Ratio & Calculate Platform Fee
    Note over Platform: Order Fulfilled & Marked COMPLETED
    Platform->>Batch: Add to Daily Batch (Status: HOLDING_DELAY)
    Note over Batch: Holding for X days (e.g. T+2 dispute window)
    Platform->>Batch: Maturity Worker: Status -> DISBURSABLE
    Admin->>Batch: Review Daily Batch (Created vs Completed Metrics & ₹ Net)
    Admin->>Partner: Transfer Funds via Bank NEFT/RTGS
    Admin->>Batch: Submit Bank UTR Number
    Batch->>Batch: Status -> SETTLED
    Batch->>Partner: Push Formal PDF Tax Invoice to Invoices Section
    Batch->>Partner: Send Email Notification with UTR Reference
```

---

## 3. Financial Invariant Guarantees

1. **Pre-Booking Fee Exclusivity:** The commercial split percentage (`prebooking_split_percentage`) applies strictly to upfront pre-booking customer charges. Spot QR orders and in-venue manual punching incur **0% platform commission**.
2. **Snapshot Immutability:** When a pre-booking occurs, `applied_split_ratio`, `platform_fee_amount`, and `partner_payout_amount` are written to `table_reservations`. Any future change to the restaurant's contract split ratio in the Admin Portal leaves past reservations and statements untouched.
3. **Paise Accuracy:** All columns use `DECIMAL(10, 2)` denominated strictly in Indian Rupees (₹), completely eliminating binary floating-point rounding errors.
