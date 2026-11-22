# REST API DOCUMENTATION & INTEGRATION SPECIFICATION
## Aura Artisanal Cafe & Roastery

**Version:** 1.0.0  
**Base URL:** `http://localhost:8080` (or `https://api.auracafe.com` in production)  
**Authentication:** Bearer Token (JWT) / Session Cookie for Admin endpoints  
**Data Format:** `application/json`  

---

## 1. Public Storefront Endpoints

### 1.1 Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Returns service status and timestamp.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "service": "Aura Artisanal API",
    "timestamp": "2026-11-22T20:30:00.000Z"
  }
  ```

### 1.2 Get Menu & Business Information
- **Endpoint:** `GET /api/menu`
- **Description:** Returns active categories, available products, modifier options, and cafe settings.
- **Response `200 OK`:**
  ```json
  {
    "business_settings": {
      "cafe_name": "Aura Artisanal Cafe & Roastery",
      "currency_symbol": "₹",
      "tax_rate_percentage": 5,
      "max_table_capacity": 40
    },
    "categories": [
      { "id": "cat-espresso", "name": "Espresso & Hot Brews", "slug": "espresso-hot" }
    ],
    "products": [
      {
        "id": "prod-flat-white",
        "category_id": "cat-espresso",
        "name": "Velvet Flat White",
        "price_paise": 24000,
        "is_available": true
      }
    ],
    "product_options": { ... }
  }
  ```

### 1.3 Authoritative Price Quote
- **Endpoint:** `POST /api/quote`
- **Description:** Recalculates subtotal, modifier price deltas, 5% GST tax, packaging fee, and delivery fee on the server. Never trusts client calculations.
- **Request Body:**
  ```json
  {
    "fulfilment_type": "pickup",
    "items": [
      {
        "product_id": "prod-flat-white",
        "qty": 2,
        "options": [
          { "price_delta_paise": 4000 }
        ]
      }
    ]
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "subtotal_paise": 56000,
    "tax_paise": 2800,
    "packaging_paise": 2000,
    "delivery_paise": 0,
    "total_paise": 60800,
    "quote_token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "expires_at": "2026-11-22T20:45:00.000Z"
  }
  ```

---

## 2. Order & Commerce Endpoints

### 2.1 Create Order
- **Endpoint:** `POST /api/orders`
- **Description:** Persists a customer order in `pending_payment` status and creates immutable line item snapshots.
- **Request Body:**
  ```json
  {
    "customer_name": "Rohan Mehra",
    "customer_phone": "+91 98200 11223",
    "customer_email": "rohan.m@example.com",
    "fulfilment_type": "dine_in",
    "table_number": "Table 04",
    "subtotal_paise": 52000,
    "tax_paise": 2600,
    "total_paise": 54600,
    "items": [
      {
        "product_id": "prod-flat-white",
        "name_snapshot": "Velvet Flat White",
        "unit_price_paise": 28000,
        "qty": 1,
        "options_snapshot": [{ "label": "Barista Oat Milk", "delta_paise": 4000 }]
      }
    ]
  }
  ```
- **Response `201 Created`:** Returns complete order entity with assigned `order_number` (e.g. `AUR-8921`).

### 2.2 Payment Webhook (Razorpay Compatible)
- **Endpoint:** `POST /api/payments/webhook`
- **Headers:** `X-Razorpay-Signature: <hmac-sha256-hex>`
- **Description:** Validates signature using server secret. Implements idempotency key caching to reject duplicate replays. Updates order status from `pending_payment` to `paid`.

---

## 3. Table Reservation Endpoints

### 3.1 Check Availability & Book Table
- **Endpoint:** `POST /api/reservations`
- **Description:** Verifies that existing bookings for the specified date and 90-minute time slot plus the requested party size do not exceed the 40-guest floor capacity.
- **Request Body:**
  ```json
  {
    "guest_name": "Vikram Sethi",
    "guest_phone": "+91 98110 99887",
    "guest_email": "vikram.sethi@example.com",
    "party_size": 4,
    "booking_date": "2026-11-23",
    "time_slot": "04:30 PM",
    "area_preference": "Espresso Bar High Seats",
    "special_requests": "Celebrating an anniversary"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "id": "res-176382100",
    "booking_ref": "RES-772",
    "status": "confirmed",
    "created_at": "2026-11-22T20:30:00.000Z"
  }
  ```
- **Error Response `409 Conflict`:**
  ```json
  {
    "error": "Capacity Exceeded",
    "message": "The selected time slot is at maximum capacity."
  }
  ```

---

## 4. Admin Operations Endpoints (Protected by RBAC)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | Admin, Manager, Staff | Fetch live order queue. |
| `PATCH`| `/api/orders/:id` | Admin, Manager, Staff | Transition order status (`accepted`, `preparing`, `ready`, `completed`). |
| `POST` | `/api/admin/menu` | Admin, Manager | Create a new seasonal menu offering. |
| `PATCH`| `/api/admin/menu/:id`| Admin | Update item base price or stock availability toggle. |
| `GET` | `/api/audit` | Admin, Manager | Fetch immutable chronological administrative event log. |
