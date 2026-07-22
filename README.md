# QuickBite 🍽️

A production-ready restaurant pre-booking & food ordering platform.

> **Backend:** Express.js + TypeScript monolith · **Frontend:** Next.js 15 · **Mobile:** Expo React Native · **DB:** MongoDB + Redis · **Deploy:** Docker + AWS EC2

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)    
- [Fork & Clone](#fork--clone)
- [Run Locally](#run-locally)
- [Environment Variables](#environment-variables)
- [Secret Management — Infisical CLI](#secret-management--infisical-cli)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)      
- [Server Structure](#server-structure)    
- [Docker](#docker)
- [Production Deployment](#production-deployment-aws-ec2)
- [User Roles](#user-roles)
- [Troubleshooting](#troubleshooting)

---

## Architecture

**Monolithic MVC** — single Express API, one MongoDB database, Redis for caching.

```
quickbite/
├── server/                   ← Express MVC API (Node.js + TypeScript)
│   └── src/
│       ├── config/           database, redis, logger, passport, env
│       ├── constants/        roles, statuses, HTTP codes
│       ├── controllers/      request handlers (thin layer)
│       ├── errors/           typed error classes
│       ├── middlewares/      auth, validate, rateLimit, errorHandler
│       ├── models/           14 Mongoose models (single DB)
│       ├── routes/           13 Express routers
│       ├── services/         all business logic
│       └── utils/            jwt, response helpers, bcrypt, pagination
├── apps/
│   ├── web/                  ← Next.js 15 (customer + dashboard + admin)
│   └── mobile/               ← Expo React Native
├── nginx/nginx.conf          ← Reverse proxy (SSL, rate limiting)
├── docker-compose.yml        ← Local dev (API + MongoDB + Redis)
├── docker-compose.prod.yml   ← Production (pre-built image + nginx)
└── .github/workflows/        ← CI typecheck/build + CD deploy to EC2
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express.js, TypeScript 5 |
| Database | MongoDB 8 (Mongoose ODM) |
| Cache | Redis 7 (ioredis) |
| Auth | JWT access + refresh tokens, Google OAuth2, OTP email |
| Payments | Razorpay, Stripe |
| Notifications | Firebase Cloud Messaging (push), Nodemailer (email) |
| Frontend | Next.js 15, Tailwind CSS, Radix UI, Zustand, TanStack Query |
| Mobile | Expo 51, Expo Router, React Native |
| Proxy | Nginx (SSL/TLS, rate limiting) |
| Secrets | Infisical CLI (optional) |
| Deployment | Docker, AWS EC2, GitHub Actions CI/CD |

---

## Prerequisites

Install these before anything else:

| Tool | Version | Download |
|---|---|---|
| Node.js | >= 20 | https://nodejs.org |
| npm | >= 10 | bundled with Node.js |
| Git | latest | https://git-scm.com |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |

---

## Fork & Clone

### 1. Fork on GitHub

1. Open `https://github.com/ORIGINAL_OWNER/quickbite`
2. Click **Fork** (top right) → select your account
3. Wait for the fork to complete

### 2. Clone your fork

**Windows:**
```powershell
git clone https://github.com/YOUR_USERNAME/quickbite.git
cd quickbite
```

**Mac / Linux:**
```bash
git clone https://github.com/YOUR_USERNAME/quickbite.git
cd quickbite
```

### 3. Add upstream remote

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/quickbite.git

# Verify
git remote -v
```

### 4. Sync with upstream (get latest changes)

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Run Locally

> Run all commands from the **project root** unless told otherwise.

### Step 1 — Install dependencies

**Windows (PowerShell):**
```powershell
cd server
npm install
cd ..

cd apps\web
npm install
cd ..\..
```

**Mac / Linux:**
```bash
cd server && npm install && cd ..
cd apps/web && npm install && cd ../..
```

---

### Step 2 — Set up secrets via Infisical

All secrets are managed in Infisical — no `.env` file needed.

**Install the CLI first** (see [Secret Management — Infisical CLI](#secret-management--infisical-cli)):

```bash
# Mac
brew install infisical/get-cli/infisical

# Linux
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get install -y infisical

# Windows (Scoop)
scoop install infisical
```

Login and link the project:

```bash
infisical login
infisical init
```

After `infisical init`, set the default environment in `.infisical.json`:

```json
{
  "workspaceId": "your-workspace-id",
  "defaultEnvironment": "dev"
}
```

**Push your secrets to Infisical** (one-time setup):

```bash
# Windows (PowerShell)
.\scripts\push-secrets-to-infisical.ps1

# Mac / Linux
chmod +x scripts/push-secrets-to-infisical.sh
./scripts/push-secrets-to-infisical.sh
```

> Edit the script first — replace all `REPLACE` values with your actual secrets.

Verify secrets are in Infisical:

```bash
infisical secrets --env=dev
```

You should see all your secrets listed. If the list is empty, the scripts above haven't been run yet.

**Web app** — still needs a local env file (Next.js `NEXT_PUBLIC_*` vars are baked at build time, can't be injected at runtime):

**Windows:**
```powershell
Copy-Item apps\web\.env.local.example apps\web\.env.local
```

**Mac / Linux:**
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1` inside it.

---

### Step 3 — Start MongoDB and Redis

```bash
docker compose up mongodb redis -d
```

Confirm they are running:
```bash
docker compose ps
```

Expected output:
```
NAME                   STATUS
quickbite-mongodb      running
quickbite-redis        running
```

---

### Step 4 — Start the API server

Open **Terminal 1** — run from the **project root**:

```bash
npm run dev:api
```

This runs `infisical run --env=dev -- npm run dev` inside `server/`.

Wait for:
```
🚀 QuickBite API running on port 3000
```

| URL | Description |
|---|---|
| `http://localhost:3000/health` | Health check |
| `http://localhost:3000/api/v1` | API info |

---

### Step 5 — Start the web app

Open **Terminal 2** — run from the **project root**:

```bash
npm run dev:web
```

Web app → `http://localhost:3001`

---

### Step 6 — (Optional) Start the mobile app

Open **Terminal 3**:

**Windows:**
```powershell
cd apps\mobile
npm install
npx expo start
```

**Mac / Linux:**
```bash
cd apps/mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

> For mobile, set the API URL to your machine's local IP — not `localhost`.
> Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux).
> Then set in `apps/mobile/.env`:
> ```
> EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api/v1
> ```

---

### All running — what you have:

| Service | URL |
|---|---|
| API | `http://localhost:3000` |
| Web app | `http://localhost:3001` |
| Mobile | Expo QR code |
| MongoDB | `localhost:27017` |
| Redis | `localhost:6379` |

---

## Environment Variables

All secrets are stored and managed in **Infisical**. There is no `.env` file in this project.

> See [Secret Management — Infisical CLI](#secret-management--infisical-cli) below for setup.

### Secrets you need to add in Infisical

Add these in your Infisical project under the **Development** and **Production** environments:

```
# ── Server ────────────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── Database ──────────────────────────────────────────────────
MONGODB_URI=mongodb://127.0.0.1:27017/quickbite

# ── Redis ─────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── JWT ───────────────────────────────────────────────────────
JWT_ACCESS_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── CORS ──────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3001
FRONTEND_URL=http://localhost:3001

# ── Email ─────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=noreply@quickbite.com

# ── Google OAuth ──────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# ── Google Maps ───────────────────────────────────────────────
GOOGLE_MAPS_API_KEY=

# ── Firebase ─────────────────────────────────────────────────
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# ── Razorpay ──────────────────────────────────────────────────
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# ── Stripe ────────────────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# ── Cloudinary ────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ── Rate Limiting ─────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**For the web app** — add these in Infisical or directly in `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**For the mobile app** — add in `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api/v1
```

---

## Secret Management — Infisical CLI

All environment variables are managed exclusively through **Infisical**. No `.env` files are used or committed.

### How it works

```
infisical run --env=dev -- npm run dev
       │
       └── connects to Infisical
           fetches all secrets for the environment
           injects them into process.env
           starts the app
           app reads process.env as normal
```

### 1. Install Infisical CLI

**Mac:**
```bash
brew install infisical/get-cli/infisical
```

**Linux / Ubuntu:**
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get install -y infisical
```

**Windows (requires [Scoop](https://scoop.sh)):**
```powershell
scoop install infisical
```

Verify install:
```bash
infisical --version
```

---

### 2. Login

```bash
infisical login
```

Select **Infisical Cloud** and complete login in your browser.

---

### 3. Add your project secrets

**Option A — Use the push script (fastest):**

```bash
# Windows (PowerShell) — edit values first, then run:
.\scripts\push-secrets-to-infisical.ps1

# Mac / Linux — edit values first, then run:
chmod +x scripts/push-secrets-to-infisical.sh
./scripts/push-secrets-to-infisical.sh
```

**Option B — Dashboard:**

1. Go to [app.infisical.com](https://app.infisical.com)
2. Open your `quickbite` project
3. Select the **Development** environment
4. Add all secrets from the [Environment Variables](#environment-variables) section
5. Repeat for **Production** with production values

Verify secrets are saved:

```bash
infisical secrets --env=dev
```

---

### 4. Link your local project

Run once in the project root:

```bash
infisical init
```

Select your organization → project → default environment (`dev`).

This creates `.infisical.json` — **safe to commit**, contains no secrets:

```json
{
  "workspaceId": "your-project-id",
  "defaultEnvironment": "dev"
}
```

---

### 5. Start the app with secrets

**Development:**
```bash
# Terminal 1 — API
infisical run --env=dev -- npm run dev

# Terminal 2 — Web
cd apps/web
npm run dev
```

Or update `package.json` once so the team uses the same command every time:

```json
"scripts": {
  "dev:api":   "infisical run --env=dev -- npm run dev --prefix server",
  "start:api": "infisical run --env=prod -- npm run start --prefix server",
  "dev:web":   "npm run dev --prefix apps/web"
}
```

Then just:
```bash
npm run dev:api    # Terminal 1 — API with secrets injected
npm run dev:web    # Terminal 2 — Web app
```

---

### 6. CI/CD — GitHub Actions

For automated deployments, use a **Machine Identity token**:

1. Infisical dashboard → **Organization Settings → Machine Identities → Create**
2. Auth method: **Universal Auth** → copy the token
3. Add to GitHub as a single secret: `INFISICAL_TOKEN`

In `.github/workflows/deploy.yml`:

```yaml
- name: Deploy with secrets from Infisical
  run: |
    infisical run \
      --token=${{ secrets.INFISICAL_TOKEN }} \
      --env=prod \
      -- node dist/server.js
```

Only **one secret** needed in GitHub (`INFISICAL_TOKEN`) instead of 20+.

---

## Available Scripts

All commands run from the **project root**.

### API + Web

| Command | Description |
|---|---|
| `npm run dev:api` | Start API with Infisical secrets injected (hot reload) |
| `npm run dev:web` | Start Next.js web app on port 3001 |
| `npm run build:api` | Compile TypeScript → `server/dist/` |
| `npm run build:web` | Production build of web app |
| `npm run start:api` | Run compiled API with production secrets |
| `npm run infra:up` | Start MongoDB + Redis via Docker |
| `npm run infra:down` | Stop Docker infrastructure |
| `npm run docker:up` | Start full stack (API + MongoDB + Redis) |
| `npm run docker:down` | Stop all containers |
| `npm run docker:build` | Rebuild API Docker image |

### Run inside `server/` directly

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload (ts-node + nodemon) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm test` | Run Jest tests |
| `npm run lint` | ESLint check |

### Docker (project root)

| Command | Description |
|---|---|
| `docker compose up mongodb redis -d` | Start only databases |
| `docker compose up -d` | Start full stack |
| `docker compose down` | Stop all containers |
| `docker compose down -v` | Stop and wipe all data |
| `docker compose logs -f api` | Tail API logs |
| `docker compose exec mongodb mongosh quickbite` | MongoDB shell |
| `docker compose exec redis redis-cli` | Redis CLI |

---

## API Endpoints

All routes prefixed with `/api/v1`.

| Module | Base Path | Auth |
|---|---|---|
| Auth | `/api/v1/auth` | Partial |
| Users | `/api/v1/users` | ✅ Required |
| Restaurants | `/api/v1/restaurants` | Partial |
| Food & Menu | `/api/v1/food` | Partial |
| Bookings | `/api/v1/bookings` | ✅ Required |
| Orders | `/api/v1/orders` | ✅ Required |
| Payments | `/api/v1/payments` | ✅ Required |
| Reviews | `/api/v1/reviews` | Partial |
| Search | `/api/v1/search` | Optional |
| Location | `/api/v1/location` | ❌ Public |
| Notifications | `/api/v1/notifications` | ✅ Required |
| Admin | `/api/v1/admin` | ✅ Admin only |
| Analytics | `/api/v1/analytics` | ✅ Owner/Admin |

### Auth

```
POST  /api/v1/auth/register
POST  /api/v1/auth/login
POST  /api/v1/auth/logout
POST  /api/v1/auth/refresh
GET   /api/v1/auth/verify-email
POST  /api/v1/auth/send-otp
POST  /api/v1/auth/verify-otp
POST  /api/v1/auth/forgot-password
POST  /api/v1/auth/reset-password
POST  /api/v1/auth/change-password
GET   /api/v1/auth/me
```

### Restaurants

```
GET   /api/v1/restaurants
GET   /api/v1/restaurants/featured
GET   /api/v1/restaurants/nearby?lat=&lng=
GET   /api/v1/restaurants/search?q=
GET   /api/v1/restaurants/slug/:slug
GET   /api/v1/restaurants/:id
POST  /api/v1/restaurants              (owner/admin)
PUT   /api/v1/restaurants/:id          (owner/admin)
POST  /api/v1/restaurants/:id/tables   (owner/admin)
```

### Bookings

```
POST  /api/v1/bookings
GET   /api/v1/bookings/my
GET   /api/v1/bookings/:id
GET   /api/v1/bookings/number/:bookingNumber
PATCH /api/v1/bookings/:id/cancel
GET   /api/v1/bookings/restaurant/:id  (owner/admin)
PATCH /api/v1/bookings/:id/confirm     (owner/admin)
PATCH /api/v1/bookings/:id/check-in    (owner/admin)
PATCH /api/v1/bookings/:id/complete    (owner/admin)
```

---

## Server Structure

```
server/src/
├── config/
│   ├── database.ts        MongoDB connection
│   ├── redis.ts           Redis + cache helpers (setCache/getCache)
│   ├── logger.ts          Winston logger
│   ├── passport.ts        Google OAuth2
│   └── env.ts             dotenv loader
│
├── constants/index.ts     ROLES, statuses, HTTP codes, CACHE_TTL
│
├── controllers/           Parse request → call service → send response
├── errors/index.ts        AppError + subclasses (404, 401, 403, 409…)
├── middlewares/           authenticate, validate, rateLimiter, errorHandler
│
├── models/                One MongoDB database, 14 Mongoose schemas
│   ├── User.ts            Auth (email, password, roles, refresh tokens)
│   ├── OTP.ts             OTP codes with auto-expire
│   ├── UserProfile.ts     Addresses, favorites, wallet
│   ├── Restaurant.ts      Info, tables, opening hours, geo location
│   ├── Category.ts        Menu categories
│   ├── FoodItem.ts        Items, variants, add-ons, nutrition
│   ├── Booking.ts         Table + food pre-order bookings
│   ├── Order.ts           Food orders with item-level status
│   ├── Payment.ts         Razorpay + Stripe records
│   ├── Review.ts          Ratings, helpful votes, owner replies
│   ├── Coupon.ts          Discount codes
│   ├── Notification.ts    Push + email + in-app notifications
│   ├── SearchHistory.ts   30-day TTL search logs
│   └── AnalyticsEvent.ts  90-day TTL platform events
│
├── routes/                One router per domain (13 total)
│
├── services/              All business logic
│   ├── AuthService.ts
│   ├── UserService.ts
│   ├── RestaurantService.ts
│   ├── FoodService.ts
│   ├── BookingService.ts
│   ├── OrderService.ts
│   ├── PaymentService.ts
│   ├── ReviewService.ts
│   ├── SearchService.ts
│   ├── LocationService.ts
│   ├── NotificationService.ts
│   ├── AdminService.ts
│   ├── AnalyticsService.ts
│   └── EmailService.ts
│
├── utils/
│   ├── index.ts           bcrypt, slug, pagination, date, distance
│   ├── jwt.ts             generate/verify access + refresh tokens
│   └── response.ts        sendSuccess, sendCreated, sendError
│
├── app.ts                 Express app — all middleware + routes
└── server.ts              Entry point — connect DB + Redis → listen
```

---

## Docker

### Development

```bash
# Start databases only (recommended — run server locally for hot reload)
docker compose up mongodb redis -d

# Start everything including the API container
docker compose up -d

# Logs
docker compose logs -f api

# Stop
docker compose down

# Stop and wipe all data
docker compose down -v
```

### Test production build locally

```bash
docker build -f server/Dockerfile -t quickbite-api .
docker run -p 3000:3000 --env-file .env.docker quickbite-api

# Windows
Invoke-WebRequest http://localhost:3000/health

# Mac / Linux
curl http://localhost:3000/health
```

---

## Production Deployment (AWS EC2)

### Step 1 — EC2 setup (one-time)

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
bash <(curl -s https://raw.githubusercontent.com/YOUR_USERNAME/quickbite/main/scripts/setup-ec2.sh)
exit && ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Step 2 — GitHub Secrets

Go to repo → **Settings → Secrets and variables → Actions**

**Minimum required:**

| Secret | Value |
|---|---|
| `EC2_HOST` | EC2 public IP |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Full `.pem` private key contents |
| `DOMAIN` | e.g. `api.qickbite.com` |
| `MONGODB_URI` | MongoDB Atlas URI |
| `REDIS_URL` | Upstash Redis URL |
| `JWT_ACCESS_SECRET` | 64-char random string |
| `JWT_REFRESH_SECRET` | 64-char random string |

**Additional secrets** (add as needed for features):
`SMTP_USER`, `SMTP_PASS`, `FIREBASE_*`, `RAZORPAY_*`, `STRIPE_*`, `GOOGLE_*`, `CLOUDINARY_*`

### Step 3 — SSL

```bash
# On EC2
sudo certbot certonly --standalone -d api.yourdomain.com
```

### Step 4 — Deploy

```bash
git push origin main
```

GitHub Actions runs automatically:
1. TypeScript type check
2. Docker build + push to `ghcr.io`
3. SSH to EC2 → pull image → restart container → health check

---

## User Roles

| Role | Access |
|---|---|
| `customer` | Browse, book, order, pay, review |
| `restaurant_owner` | Manage restaurant, menu, bookings, orders, analytics |
| `admin` | Full platform — approve restaurants, coupons, all data |
| `delivery_partner` | Delivery management (extendable) |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `JWT_ACCESS_SECRET is not defined` | Secrets not in Infisical — run `infisical secrets --env=dev` to check, then run the push script |
| Only 1 secret injected | Secrets not added to Infisical yet — run `.\scripts\push-secrets-to-infisical.ps1` (Windows) or `./scripts/push-secrets-to-infisical.sh` (Mac/Linux) |
| `defaultEnvironment` is empty | Edit `.infisical.json` — set `"defaultEnvironment": "dev"` |
| `MongoDB connection failed` | Check `MONGODB_URI` in Infisical and run `docker compose up mongodb -d` |
| `Redis unavailable` | Run `docker compose up redis -d` — app works without Redis |
| API returns 404 for all routes | Confirm API started with `npm run dev:api` from project root |
| Web app can't reach API | Set `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1` in `apps/web/.env.local` |
| Mobile can't reach API | Use machine IP not `localhost` — `http://192.168.x.x:3000/api/v1` in `apps/mobile/.env` |
| Port 3000 already in use | Change `PORT` secret in Infisical dev env or kill the existing process |
| `infisical: command not found` | Install CLI — see [Secret Management](#secret-management--infisical-cli) |
| `infisical init` fails | Run `infisical login` first, then `infisical init` |
| TypeScript build errors | Run `cd server` then `npx tsc --noEmit` to see the full list |
| Docker permission denied | Run `sudo usermod -aG docker $USER` then log out and back in |

---

## License

MIT
