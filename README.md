# Aura Artisanal Cafe & Roastery
### Immersive 3D Commercial Website & Business Operations Platform

[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-2d6a4f.svg)](#)
[![Tests: 28 Passed](https://img.shields.io/badge/Automated%20Tests-28%2F28%20Passed-brightgreen.svg)](#)
[![Architecture: Japandi 3D WebGL](https://img.shields.io/badge/3D%20Engine-Three.js%20WebGL-c26d43.svg)](#)

---

## ☕ Overview

**Aura Artisanal Cafe & Roastery** is a high-end specialty coffee brand, roastery, and dining destination in Indiranagar, Bengaluru. This platform delivers a production-grade commercial digital presence combining:
1. **Physical Cafe Identity:** Warm Japandi minimalism (oak timber, microcement, brushed brass, 2700K ambient lighting).
2. **Digital Customer Experience:** Real-time 3D WebGL hero section with ceramic cup and rising steam, interactive virtual cafe tour, live data-driven menu, customization drawer, slide-over cart, Razorpay payment sandbox, and live order tracking.
3. **Business Operations OS:** Role-protected staff admin portal with Kanban order queuing, menu pricing controls, real-time stock availability toggling, table reservations calendar, revenue metrics, and an immutable audit log.

---

## 🚀 Quick Start (Zero Dependencies Required)

You can launch and test the complete application immediately on Windows:

1. Double-click **`start-server.bat`** (or execute `powershell -ExecutionPolicy Bypass -File server/server.ps1 -Port 8080`).
2. Open your web browser:
   - **Customer Storefront & 3D Experience:** [http://localhost:8080](http://localhost:8080)
   - **Staff & Owner Admin Portal:** [http://localhost:8080#admin](http://localhost:8080#admin)

Alternatively, if you prefer running via Node.js:
```bash
node server/server.js
```

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive automated test runner verifying business logic, server recalculation, table booking concurrency, state transitions, and webhook cryptography:

```powershell
powershell -ExecutionPolicy Bypass -File tests/run-tests.ps1
```

**Verification Results:**
- **28 / 28 Automated Tests Passed (100% Success Rate)**
- Full audit results documented in [`TESTING_REPORT.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/TESTING_REPORT.md).

---

## 📁 Project Architecture & Documentation Index

| Document | Purpose |
| :--- | :--- |
| **[`PROJECT_REQUIREMENTS.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/PROJECT_REQUIREMENTS.md)** | Core product brief, brand aesthetic, MVP scope boundaries, and performance targets. |
| **[`ASSET_INVENTORY.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/ASSET_INVENTORY.md)** | 3D WebGL asset audit, triangle budgets, lighting setup, and procedural fallbacks. |
| **[`SYSTEM_ARCHITECTURE.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/SYSTEM_ARCHITECTURE.md)** | High-level architectural diagrams, data flows, and technology justifications. |
| **[`DATABASE_SCHEMA.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/DATABASE_SCHEMA.md)** | Relational data model, minor unit currency precision, and immutable price snapshots. |
| **[`API_DOCUMENTATION.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/API_DOCUMENTATION.md)** | REST API specification with endpoints, schemas, payloads, and error codes. |
| **[`DEVELOPMENT_ROADMAP.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/DEVELOPMENT_ROADMAP.md)** | Complete Phase 0–Phase 8 execution checklist and milestone tracker. |
| **[`TESTING_REPORT.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/TESTING_REPORT.md)** | Quality assurance audit report covering unit, integration, and security tests. |
| **[`DEPLOYMENT_GUIDE.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/DEPLOYMENT_GUIDE.md)** | Production deployment runbook for Vercel, Docker, VPS, and Razorpay live keys. |
| **[`ENVIRONMENT_SETUP.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/ENVIRONMENT_SETUP.md)** | Environment configuration instructions and environment variable matrix. |
| **[`CHANGELOG.md`](file:///c:/VinData/Nov26_Sessions/3D_Website%20example/Cafe_Website/CHANGELOG.md)** | Chronological record of features and deliverables across all 8 phases. |

---

## 🎨 Design System & Aesthetic Tokens

- **Brand Name:** Aura Artisanal Cafe & Roastery
- **Aesthetic Direction:** Japandi (Japanese-Scandinavian) warm minimalism
- **Palette:**
  - Espresso Black: `#1A1412`
  - Roasted Sienna: `#8C4A2F`
  - Warm Terracotta: `#C26D43`
  - Crema Paper Background: `#FBF8F2`
  - Forest Sage: `#31483E`
- **Typography:**
  - Headings: *Playfair Display*
  - Body & UI: *Inter*

---

## 🛡️ Security & Reliability Safeguards

1. **Zero Client Trust:** Prices, taxes (5% GST), and totals are strictly calculated and validated on the server.
2. **Immutable Price Snapshots:** Order items preserve historical price and name snapshots, ensuring future menu adjustments never distort previous transactions.
3. **Concurrency Protection:** Table reservations calculate floor capacity (max 40 guests) dynamically, preventing overbooking race conditions.
4. **Idempotent Webhooks:** Razorpay payment webhooks verify HMAC-SHA256 signatures and cache event identifiers to prevent duplicate fulfillment.
5. **Role-Based Access Control:** Strict permission matrix separates Owner (Admin), Manager, and Barista (Staff) capabilities.

---

&copy; 2026 Aura Artisanal Cafe & Roastery. Built for commercial excellence.
