# ENVIRONMENT SETUP & LOCAL EXECUTION GUIDE
## Aura Artisanal Cafe & Roastery

**Version:** 1.0.0  
**Target Environments:** Local Workstation, Staging Sandbox, Production Cloud  

---

## 1. Prerequisites & Execution Modes

The platform is designed to be completely versatile, supporting two modes:

### Mode A: Zero-Dependency Instant Local Execution (Recommended for Immediate Testing)
- **Requirements:** Any modern web browser (Chrome, Edge, Firefox, Safari).
- **Startup:** Double-click `start-server.bat` or run `powershell -ExecutionPolicy Bypass -File server/server.ps1`.
- **Port:** Defaults to `http://localhost:8080` (or configured port).
- **Features:** Complete interactive 3D WebGL scenes, full public storefront, dynamic menu, cart, Razorpay sandbox payment simulation, order status tracker, table reservations, and full Admin Operations Dashboard backed by persistent JSON storage (`data/database.json`).

### Mode B: Enterprise Next.js / TypeScript / Node.js
- **Requirements:** Node.js 18.x or 20.x, npm / pnpm / yarn.
- **Dependencies Installation:** `npm install`
- **Development Server:** `npm run dev`
- **Production Build:** `npm run build && npm run start`

---

## 2. Directory Structure Overview

```
Cafe_Website/
├── data/
│   └── database.json          # Persistent state store (menu, orders, reservations, audit)
├── public/                    # Static assets, fonts, icons, 3D model dropzone
│   ├── assets/
│   │   ├── models/            # Drop external .glb / .gltf files here
│   │   └── images/            # Cafe photography & food imagery
├── src/                       # Enterprise Next.js 14 App Router codebase
│   ├── app/                   # App Router pages and API routes
│   ├── components/            # Three.js 3D canvas and UI components
│   └── lib/                   # Business logic, state, and calculation utilities
├── server/
│   ├── server.ps1             # Native high-performance REST API & static server
│   └── server.js              # Node.js Express/HTTP alternative server
├── tests/
│   └── run-tests.ps1          # Automated test suite runner
├── index.html                 # Production Web Client entry point
├── styles.css                 # Refined Japanese-Scandinavian design system styles
├── app.js                     # Modular reactive application logic
├── three-scene.js             # Three.js WebGL 3D Hero & Atmosphere Tour engine
├── start-server.bat           # One-click Windows startup script
├── Dockerfile                 # Multi-stage production container manifest
└── docker-compose.yml         # Containerized web & persistence stack
```

---

## 3. Verifying the Local Setup

1. Start the server using `start-server.bat`.
2. Open your web browser and navigate to:
   - **Public Website:** `http://localhost:8080`
   - **Admin Operations Portal:** `http://localhost:8080#admin`
3. Default Admin Credentials for testing:
   - **Email:** `admin@auracafe.com`
   - **Password:** `admin123` (or direct instant login via staff switch)
