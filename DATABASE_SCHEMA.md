# DATABASE SCHEMA SPECIFICATION
## Aura Artisanal Cafe & Roastery — Data Model & Entity Relations

**Version:** 1.0.0  
**Status:** Approved for Implementation  
**Data Engine:** Relational Database (PostgreSQL / SQLite / Persistent JSON Store)  

---

## 1. Entity-Relationship Overview

```
+----------------+          +-------------------+          +------------------------+
|   CATEGORIES   | 1      * |     PRODUCTS      | 1      * |     PRODUCT_OPTIONS    |
|----------------|----------|-------------------|----------|------------------------|
| id (PK)        |          | id (PK)           |          | id (PK)                |
| name           |          | category_id (FK)  |          | product_id (FK)        |
| slug           |          | name              |          | name ("Milk", "Size")  |
| display_order  |          | description       |          | required (boolean)     |
| is_active      |          | base_price (paise)|          +-----------+------------+
+----------------+          | image_url         |                      | 1
                            | is_available      |                      | *
                            | tags (array)      |          +-----------v------------+
                            +---------+---------+          |  PRODUCT_OPTION_VALUES |
                                      | 1                  |------------------------|
                                      |                    | id (PK)                |
                                      | *                  | option_id (FK)         |
+----------------+          +---------v---------+          | label ("Oat", "Large") |
|     ORDERS     | 1      * |    ORDER_ITEMS    |          | price_delta (paise)    |
|----------------|----------|-------------------|          +------------------------+
| id (PK)        |          | id (PK)           |
| order_number   |          | order_id (FK)     |
| customer_name  |          | product_id (FK)   |
| customer_phone |          | item_name_snapshot|
| customer_email |          | unit_price_snap   |
| fulfilment_type|          | qty               |
| table_number   |          | options_snapshot  |
| delivery_addr  |          | total_price_snap  |
| subtotal_cents |          +-------------------+
| tax_cents      |
| total_cents    |          +-------------------+          +------------------------+
| payment_status |          |   RESERVATIONS    |          |      AUDIT_EVENTS      |
| order_status   |          |-------------------|          |------------------------|
| created_at     |          | id (PK)           |          | id (PK)                |
+----------------+          | booking_ref       |          | timestamp              |
                            | guest_name        |          | actor_role             |
                            | guest_phone       |          | actor_email            |
                            | guest_email       |          | action_type            |
                            | party_size        |          | entity_type            |
                            | booking_date      |          | entity_id              |
                            | time_slot         |          | change_details         |
                            | area_preference   |          +------------------------+
                            | status            |
                            | created_at        |
                            +-------------------+
```

---

## 2. Table Specifications & Precision Rules

### 2.1 Currency & Pricing Precision Rule
All monetary values (prices, price deltas, subtotals, taxes, shipping fees, final totals) **MUST** be stored as 64-bit integer minor units (paise in INR, cents in USD).
- Example: An artisanal cappuccino priced at ₹240.00 is strictly stored as `24000`.
- Tax calculation: `Math.round(taxableSubtotal * 0.05)`.
- Under no circumstances shall floating-point currencies be persisted in records.

### 2.2 Immutable Price Snapshots
When an order is created, `ORDER_ITEMS` stores:
- `item_name_snapshot`: The exact name of the item at purchase time.
- `unit_price_snap`: The exact base price at purchase time.
- `options_snapshot`: Serialized JSON array of chosen modifiers and their respective price deltas.
This guarantees that subsequent menu price updates or archived items will never alter historical financial records or customer receipts.

### 2.3 Order Status State Machine
- `pending_payment` -> `paid` -> `accepted` -> `preparing` -> `ready` -> `completed`
- Exception states: `cancelled`, `refunded`, `failed`.
- Only server-side verified payment events or authenticated staff actions can trigger valid transitions.

### 2.4 Reservation Concurrency & Capacity
- Total Cafe Capacity: 40 indoor/outdoor seats.
- Time Slot Window: 90 minutes.
- Constraint: Total guests for any given overlapping 90-minute window cannot exceed 40.
