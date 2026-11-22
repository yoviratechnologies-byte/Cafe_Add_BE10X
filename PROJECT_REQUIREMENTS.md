# PROJECT REQUIREMENTS & SPECIFICATION
## Aura Artisanal Cafe & Roastery — Immersive 3D Commercial Website & Business Platform

**Version:** 1.0.0  
**Status:** Approved for Implementation  
**Project Lead:** Principal Software Architect & Lead Product Engineer  

---

## 1. Executive Summary
Aura Artisanal Cafe & Roastery is a high-end specialty coffee brand, roastery, and dining destination. This project establishes an authentic digital flagship that translates the physical cafe's tactile atmosphere, warm minimalist architectural aesthetics, and artisanal craftsmanship into a high-performance web experience. 

Beyond a visual showcase, the platform functions as an end-to-end commercial operations operating system featuring:
- An immersive 3D WebGL hero and virtual cafe atmosphere tour.
- A dynamic, data-driven menu with dietary filters and customization modifiers.
- A verified e-commerce ordering engine with server-side price validation.
- Razorpay-compatible payment gateway simulation with cryptographically verified webhooks.
- Concurrency-safe table reservation engine with slot duration and capacity management.
- A protected staff/owner administrative portal for real-time order queuing, menu adjustments, booking calendars, and business analytics.

---

## 2. Brand Identity & Aesthetic Guidelines

| Attribute | Specification |
| :--- | :--- |
| **Brand Name** | Aura Artisanal Cafe & Roastery |
| **Core Philosophy** | "Sourced ethically. Roasted meticulously. Brewed with intention." |
| **Architectural Style** | Japandi (Japanese-Scandinavian) warm minimalism: light oak timber, brushed brass, raw microcement, soft ambient lighting (2700K warm glow). |
| **Primary Palette** | Deep Espresso (`#1A1412`), Roasted Sienna (`#8C4A2F`), Warm Terracotta (`#C26D43`) |
| **Secondary Palette** | Crema Oat Paper (`#F7F3EB`), Cardboard Warm (`#E8DFD0`), Forest Sage (`#2E4237`) |
| **Typography** | Headlines: Serif display (Playfair Display / Fraunces); UI/Body: Crisp geometric sans (Inter / Outfit / SF Pro) |
| **Tone of Voice** | Welcoming, refined, unpretentious, transparent, artisanal. |

---

## 3. Scope & Feature Boundaries

### In-Scope (MVP Release)
1. **Responsive Public Web Experience:**
   - 3D Hero scene with interactive ceramic coffee cup, rising steam particles, and turntable orbit controls.
   - 3D Atmosphere Tour featuring interactive camera viewpoints of the cafe floor.
   - Comprehensive Cafe Story, Farm-to-Cup transparency, and sustainable roasting metrics.
   - Live categorized menu with real-time text search and dietary filtering (Vegan, Gluten-Free, Nut-Free).
   - Beverage customization modal (Size, Dairy/Plant Milk choice, Espresso Shots, Sweetness).
   - Cart slide-over drawer with item modification and real-time subtotal calculation.
   - Checkout engine supporting In-Cafe Dine-In (with Table #), Counter Pickup, and Local Delivery.
   - Sandbox Payment Gateway (Razorpay-compatible) with server-side signature validation.
   - Real-time Order Tracking interface with multi-stage progress timeline.
   - Table Reservation booking system with party size selection, real-time availability check, and instant confirmation.
   - Location, interactive opening hours status badge ("Open Now" / "Opens at 8:00 AM"), contact forms, and map integration.
   - Graceful WebGL fallback and reduced-motion compliance (`prefers-reduced-motion`).

2. **Protected Business Admin Dashboard:**
   - Role-Based Access Control (RBAC): Admin (Owner), Manager, Barista/Staff.
   - Live Order Queue: Real-time order flow (`Pending` → `Accepted` → `Preparing` → `Ready` → `Completed` / `Refunded`).
   - Menu Management: Add/edit/archive items, price configuration in minor units (paise/rupees), toggle availability in real-time.
   - Table Reservation Calendar: Capacity checks, guest seating status, cancellation management.
   - Commercial Analytics: Daily revenue, popular items, order volume, average ticket size.
   - Immutable Audit Log: Administrative change tracking for price edits, status overrides, and refunds.

### Explicitly Out-of-Scope (Deferred to Phase 8 / Post-MVP)
- Multi-branch franchise inventory syncing.
- Native mobile applications (iOS/Android).
- Hardware POS terminal integrations.
- Live GPS driver tracking for long-distance couriers.
- Automated raw ingredient-level supply chain procurement.

---

## 4. Non-Functional Requirements & Performance Budgets

| Metric | Target Budget | Verification Strategy |
| :--- | :--- | :--- |
| **Initial Page Load (FCP)** | < 1.2 seconds on 4G | Code-splitting, deferred WebGL bundle |
| **Largest Contentful Paint (LCP)** | < 2.0 seconds | High-priority poster image before 3D loads |
| **Cumulative Layout Shift (CLS)** | < 0.05 | Fixed dimension canvas containers |
| **WebGL Memory Footprint** | < 80 MB GPU RAM | Compressed textures, low-poly geometries |
| **Frame Rate** | 60 FPS on desktop, 45+ FPS on mid-range mobile | Adaptive pixel ratio (max 1.5), efficient draw calls |
| **Accessibility** | WCAG 2.1 Level AA | Semantic HTML, screen reader labels, keyboard navigation |
| **Security** | Zero client trust | Server-side price recalculation, signed webhooks, JWT auth |

---

## 5. Stakeholder Assumptions & Confirmed Policies

1. **Currency & Precision:** All monetary amounts are handled in minor units (e.g., INR paise, ₹100 = 10000) to eliminate floating-point calculation drift.
2. **Taxation:** Flat 5% GST applied to restaurant food and beverages on net taxable amount.
3. **Reservation Windows:** 90-minute default dining duration; maximum 8 guests per self-serve reservation; larger parties require direct staff contact.
4. **Order Fulfilment Hours:** Orders are accepted 30 minutes after opening until 30 minutes before closing.
