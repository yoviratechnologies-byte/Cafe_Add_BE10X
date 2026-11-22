# SYSTEM ARCHITECTURE DOCUMENTATION
## Aura Artisanal Cafe & Roastery — Digital Flagship & Operations OS

**Version:** 1.0.0  
**Status:** Approved Architecture  
**Author:** Principal Software Architect  

---

## 1. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                            CLIENT PRESENTATION TIER                               |
|                                                                                   |
|  +------------------------+  +-------------------------+  +--------------------+  |
|  | Customer Web App       |  | 3D WebGL Engine         |  | Staff Admin Portal |  |
|  | - Hero & Atmosphere    |  | - Three.js WebGL Canvas |  | - Live Order Queue |  |
|  | - Dynamic Menu & Filter|  | - Procedural / GLTF Cup |  | - Menu Item CRUD  |  |
|  | - Cart & Modifiers     |  | - Steam Particle Sim    |  | - Bookings Manager |  |
|  | - Razorpay Sandbox UI  |  | - Spatial Tour Engine   |  | - Sales Analytics  |  |
|  | - Live Order Tracking  |  | - CSS3 Motion Fallback  |  | - Audit Trail Log  |  |
|  +-----------+------------+  +------------+------------+  +---------+----------+  |
+--------------|----------------------------|-------------------------|-------------+
               | HTTPS / JSON               | GPU WebGL Context       | HTTPS / JWT
               v                            v                         v
+-----------------------------------------------------------------------------------+
|                           APPLICATION SERVER & API TIER                           |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Modern REST API Engine & Static File Delivery                               |  |
|  | - Next.js Enterprise Route Handlers (Server Actions / Edge API Routes)      |  |
|  | - Local Multi-Threaded Self-Contained Server Runtime (Zero Dependency)      |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|  +-------------------+  +---------------+---+  +-------------------+  +---------+ |
|  | Business Rules    |  | Payment Engine    |  | Reservation Engine|  | RBAC    | |
|  | - Price snapshot  |  | - Razorpay Order  |  | - Capacity check  |  | - Admin | |
|  | - Tax (5% GST)    |  | - Signature verify|  | - Slot concurrency|  | - Mgr   | |
|  | - Modifiers delta |  | - Webhook Idemp. |  | - Operating hours |  | - Staff | |
|  +-------------------+  +-------------------+  +-------------------+  +---------+ |
+-----------------------------------------|-----------------------------------------+
                                          v
+-----------------------------------------------------------------------------------+
|                             DATA PERSISTENCE TIER                                 |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Relational / Document Store (`data/database.json` & PostgreSQL Prisma Model)|  |
|  | - Users & Role Permissions                                                  |  |
|  | - Menu Categories & Products with Option Variants                           |  |
|  | - Orders, Snapshot Line Items & Status Transitions                          |  |
|  | - Concurrency-Protected Table Bookings                                      |  |
|  | - Immutable Audit Log Stream                                                |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Structure & Data Flow

### 2.1 E-Commerce Ordering Flow:
1. **Client Selection:** Customer configures item modifiers (Size, Milk, Shot).
2. **Server-Side Quote:** Client dispatches cart payload to `/api/quote`. The server fetches live product pricing from the database, validates modifier availability, calculates taxes (5% GST) and delivery fees, and returns an authoritative quote token.
3. **Checkout Initialization:** Customer enters delivery or dine-in table details. The server generates an internal order record in `pending_payment` status and creates a sandbox Razorpay order ID.
4. **Payment Gateway Interaction:** Customer completes payment via Razorpay modal (simulated sandbox).
5. **Cryptographic Verification:** Server verifies the signature (`HMAC-SHA256`) against the order secret.
6. **Order Queue Dispatch:** Upon verification, order transitions to `paid` status, logs an audit entry, and instantly populates the staff Live Order Queue.

### 2.2 Concurrency-Safe Reservation Flow:
1. **Capacity Query:** Customer queries `/api/reservations?date=YYYY-MM-DD`.
2. **Availability Calculation:** Server scans existing bookings for the specified 90-minute window against max floor capacity (40 guests total).
3. **Atomic Booking:** When creating a reservation (`POST /api/reservations`), a file-lock / transaction-safe lock verifies capacity before persisting the booking, preventing race conditions.

---

## 3. Technology Stack Selection & Justification

| Technology | Purpose | Justification |
| :--- | :--- | :--- |
| **Vanilla ES6 Modules / React Components** | Frontend UI Framework | Blazing fast, zero build-step overhead for local execution, direct DOM reactivity. |
| **Three.js (r128+)** | 3D Graphics Engine | Industry-standard WebGL abstraction, rich geometry tools, optimal mobile shader support. |
| **Modern Modular REST API Server** | Backend Runtime | Self-contained, multi-threaded, robust JSON persistence, zero setup required. |
| **Next.js & TypeScript** | Enterprise Codebase | Production-ready Next.js 14 App Router codebase for Vercel/Docker enterprise deployment. |
| **Tailwind CSS Tokens** | Styling & Theme System | Predictable utility classes, customizable warm palette, fluid typography. |
