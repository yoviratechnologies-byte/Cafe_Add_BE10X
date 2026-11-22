# PRODUCTION DEPLOYMENT & OPERATIONS RUNBOOK
## Aura Artisanal Cafe & Roastery

**Version:** 1.0.0  
**Target Environments:** Vercel / Cloudflare Edge, Containerized Docker / VPS, Self-Hosted Node.js  
**Lead:** DevOps & Deployment Engineer  

---

## 1. Practical Deployment Topologies

### Option A: Serverless Edge (Vercel / Cloudflare Pages) — Recommended for Public Scale
- **Frontend & Route Handlers:** Deployed to Vercel via GitHub integration.
- **Database:** Supabase managed PostgreSQL instance with connection pooling (PgBouncer).
- **Static Assets & 3D Models:** Cloudflare CDN / Vercel Edge Cache.
- **Zero cold-start overhead:** Static HTML and Three.js canvases are served directly from edge points of presence.

### Option B: Containerized Docker (Self-Hosted VPS / AWS EC2 / DigitalOcean)
- **Containerization:** Multi-stage `Dockerfile` with minimal Alpine image footprint (< 120 MB).
- **Reverse Proxy:** Nginx with Let's Encrypt automated TLS certificate renewal.
- **Process Manager:** Node.js cluster or Docker Compose restart policies.

---

## 2. Docker Container Manifests

### 2.1 Multi-Stage Production `Dockerfile`
```dockerfile
# Stage 1: Runtime Base
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

USER node

CMD ["node", "server/server.js"]
```

### 2.2 `docker-compose.yml`
```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: aura_cafe_web
    restart: always
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    volumes:
      - ./data:/app/data
```

---

## 3. Production Environment Variables Checklist

Before initiating production traffic, ensure the following environment variables are registered in the hosting provider's Secret Vault:

```bash
# Production Domain
NEXT_PUBLIC_APP_URL="https://auracafe.com"

# Managed PostgreSQL Database
DATABASE_URL="postgresql://aura_owner:<STRONG_PASSWORD>@ep-cool-db.us-east-1.aws.neon.tech/aura_prod?sslmode=require"

# Razorpay Production Credentials (Do NOT use rzp_test keys)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="whsec_live_xxxxxxxxxxxxxxxxxxxxxxxx"

# Cryptographic Token Secret
JWT_SECRET="<64_CHARACTER_RANDOM_HEX_STRING>"
```

---

## 4. Production Launch Day Checklist

- [ ] **DNS & SSL:** Root domain and `www` sub-domain point to server CNAME/A records. HTTPS certificate is active (A+ SSL Labs score).
- [ ] **Payment Gateway Switch:** Razorpay account activated with merchant KYC verified. Webhook URL configured pointing to `https://auracafe.com/api/payments/webhook`.
- [ ] **Webhook Signature Test:** Trigger test webhook from Razorpay dashboard to verify HMAC-SHA256 signature evaluation and idempotency storage.
- [ ] **Physical Cafe Verification:**
  - Verify printed table QR markers link accurately to `https://auracafe.com/#menu?table=XX`.
  - Confirm staff tablets load the Admin Order Queue at `https://auracafe.com/#admin`.
- [ ] **3D Canvas Mobile Test:** Verify 3D ceramic cup and steam particles render smoothly across Android Chrome, iOS Safari, and low-battery mode.
- [ ] **Database Backups:** Daily automated snapshot schedule active with 30-day retention window.
- [ ] **Rollback Plan:** Staged previous release build artifact tagged in Git repository. Rollback procedure executable in under 90 seconds.
