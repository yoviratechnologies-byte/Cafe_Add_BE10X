# CHANGELOG & RELEASE NOTES
## Aura Artisanal Cafe & Roastery — Implementation Track

All notable changes to the Aura Artisanal Cafe & Roastery platform are documented here.

---

## [Version 1.0.0] — 2026-11-22 (Full 8-Phase Execution)

### Phase 0: Discovery, Requirements & 3D Asset Audit
- **Added:** `PROJECT_REQUIREMENTS.md` specifying brand parameters, MVP boundaries, Japandi design direction, and performance budgets.
- **Added:** `ASSET_INVENTORY.md` establishing the 3D model manifest, procedural WebGL geometry fallbacks, and memory management rules.
- **Added:** `SYSTEM_ARCHITECTURE.md` defining client presentation, application server, and persistence tiers.
- **Added:** `DATABASE_SCHEMA.md` specifying minor currency integer precision, snapshot schemas, and order state machines.
- **Added:** `DEVELOPMENT_ROADMAP.md` tracking all tasks and verification outputs.

### Phase 1: UX, Brand System & Architecture Foundation
- **Added:** Global design system (`styles.css`) featuring custom Japandi earth palette (Roasted Sienna, Espresso, Crema Paper, Forest Sage).
- **Added:** Responsive typography using Playfair Display display headings and Inter interface sans.
- **Added:** Seed database file (`data/database.json`) with 5 categories, 11 artisanal products, modifiers, users, and business settings.
- **Added:** `ENVIRONMENT_SETUP.md` and `.env.example`.

### Phase 2: Core Frontend & Public Experience
- **Added:** Sticky navigation header with brand mark, mobile bag drawer trigger, and staff admin portal toggle.
- **Added:** Branded Hero section with craft statistics (92°C precision extraction, 18hr slow drip, 100% direct trade).
- **Added:** Farm-to-cup story and roastery philosophy section.
- **Added:** Dynamic menu with category filter pills and real-time search.
- **Added:** Product Customization Modal with live modifier price delta calculation.
- **Added:** Slide-over Cart Drawer with real-time recalculation of GST tax (5%) and delivery fees.
- **Added:** Visit section with live "Open Now" status badge and table QR ordering details.

### Phase 3: 3D Asset Integration & Motion
- **Added:** High-performance WebGL 3D engine (`three-scene.js`).
- **Added:** Procedural 3D ceramic coffee cup geometry, contoured saucer, and canvas latte art froth texture.
- **Added:** Volumetric rising steam particle simulation with soft alpha blending and physics drift.
- **Added:** Interactive desktop mouse drag parallax and mobile touch orbit controls.
- **Added:** Virtual Cafe Atmosphere Tour with 4 interactive camera transitions (Espresso Bar, Roastery Corner, Lounge, Pastry Vitrine).
- **Added:** Zero-WebGL hardware fallback card and `prefers-reduced-motion` compliance.

### Phase 4: Backend REST API & Admin Operations Portal
- **Added:** Multi-threaded REST API server in PowerShell (`server/server.ps1`) and Node.js (`server/server.js`).
- **Added:** Protected Admin Operations Dashboard (`index.html#admin`).
- **Added:** Role-Based Access Control (RBAC) supporting Owner (Admin), Manager, and Lead Barista (Staff).
- **Added:** Real-time Kanban Order Queue with status transitions (`Accept`, `Brewing`, `Ready`, `Complete`, `Refund`).
- **Added:** Menu & Stock Management interface with live availability toggle and price adjustments.
- **Added:** Table Reservation calendar with guest seating status management.
- **Added:** Real-time business analytics cards (Today's revenue, active tickets, confirmed bookings).
- **Added:** Immutable administrative audit event logger.

### Phase 5: Commerce Engine, Payment Gateway Sandbox & Reservations
- **Added:** Authoritative server-side price quote endpoint (`/api/quote`).
- **Added:** Razorpay-compatible payment gateway simulation modal with live success and decline testing.
- **Added:** Cryptographic HMAC-SHA256 webhook signature verification.
- **Added:** Idempotency cache preventing duplicate order fulfillment or double-charging.
- **Added:** Live Order Status Tracker modal with 4 progressive stages.
- **Added:** Concurrency-protected table booking engine preventing overbooking beyond 40 guests.

### Phase 6: Automated Testing Suite & QA Audit
- **Added:** Automated test runner (`tests/run-tests.ps1`).
- **Executed:** 28 comprehensive automated tests covering unit business logic, price snapshots, concurrency, state machine transitions, webhook signatures, and RBAC authorization.
- **Result:** 28 passed, 0 failed (100% pass rate).
- **Added:** Quality Assurance Report (`TESTING_REPORT.md`).

### Phase 7: Production Deployment & Docker Containerization
- **Added:** Multi-stage production `Dockerfile` and `docker-compose.yml`.
- **Added:** Production Deployment Runbook (`DEPLOYMENT_GUIDE.md`).
- **Added:** Windows one-click server launcher (`start-server.bat`).

### Phase 8: Stabilization & Operations Handover
- **Added:** REST API Documentation (`API_DOCUMENTATION.md`).
- **Added:** Master documentation (`README.md`).
- **Certified:** Production-ready Commercial Release Candidate.
