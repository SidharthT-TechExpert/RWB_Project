# QuickBite 🍽️

> Production-ready restaurant pre-booking platform — microservices architecture

QuickBite lets customers discover nearby restaurants, reserve tables, pre-order food, and skip the wait — all in one seamless experience.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI |
| Mobile | React Native (Expo) — iOS & Android |
| Backend | Node.js, Express.js, TypeScript, Microservices |
| Database | MongoDB, Redis |
| Auth | JWT, Refresh Tokens, Google OAuth, OTP |
| Payments | Razorpay, Stripe |
| Notifications | Firebase Push, Email, SMS |
| Events | RabbitMQ |
| Deployment | Docker, Kubernetes, Vercel, Nginx |

---

## Architecture

```
Browser / Mobile App
        │
   API Gateway :3000
        │
┌───────┴──────────────────────────────────────┐
│  auth     :3001   user        :3002           │
│  restaurant:3003  food        :3004           │
│  booking  :3005   order       :3006           │
│  payment  :3007   review      :3008           │
│  search   :3009   location    :3010           │
│  notification:3011 admin      :3012           │
│  analytics:3013                               │
└───────┬──────────────────────────────────────┘
        │
   MongoDB + Redis + RabbitMQ
```

---

## Project Structure

```
quickbite/
├── apps/
│   ├── web/              # Next.js 15 frontend
│   └── mobile/           # React Native (Expo)
├── services/
│   ├── api-gateway/      # Port 3000 — routing, auth, rate limiting
│   ├── auth-service/     # Port 3001 — JWT, OAuth, OTP
│   ├── user-service/     # Port 3002 — profiles, addresses, wallet
│   ├── restaurant-service/# Port 3003 — restaurants, tables, hours
│   ├── food-service/     # Port 3004 — menu, categories, items
│   ├── booking-service/  # Port 3005 — reservations, pre-orders
│   ├── order-service/    # Port 3006 — orders, kitchen tracking
│   ├── payment-service/  # Port 3007 — Razorpay, Stripe, refunds
│   ├── review-service/   # Port 3008 — ratings, reviews, replies
│   ├── search-service/   # Port 3009 — search, suggestions, history
│   ├── location-service/ # Port 3010 — geocoding, nearby, distance
│   ├── notification-service/# Port 3011 — push, email, SMS
│   ├── admin-service/    # Port 3012 — approvals, coupons, CMS
│   └── analytics-service/# Port 3013 — revenue, reports, growth
├── packages/
│   └── shared/           # Common utilities (JWT, logger, errors, etc.)
├── k8s/                  # Kubernetes manifests
├── nginx/                # Nginx reverse proxy config
├── docker-compose.yml    # Local infrastructure (Redis + RabbitMQ)
├── ecosystem.config.js   # PM2 config for running all services
└── .env.example          # Environment variable template
```

---

## Getting Started (Local Development)

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- npm 10+

### 1. Clone & install

```bash
git clone https://github.com/your-org/quickbite.git
cd quickbite
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env — add your MongoDB URI if not using native install
```

> **MongoDB:** If you have MongoDB installed natively, it runs on `localhost:27017` automatically.  
> **Redis & RabbitMQ:** Started via Docker below.

### 3. Start infrastructure

```bash
# Starts Redis + RabbitMQ in Docker (MongoDB runs natively)
docker compose up redis rabbitmq -d

# Verify they're healthy
docker compose ps
```

### 4. Start services

Open separate terminal tabs for each service:

```bash
npm run dev:gateway      # API Gateway   → localhost:3000
npm run dev:auth         # Auth Service  → localhost:3001
npm run dev:user         # User Service  → localhost:3002
npm run dev:restaurant   # Restaurant    → localhost:3003
npm run dev:food         # Food/Menu     → localhost:3004
npm run dev:booking      # Booking       → localhost:3005
npm run dev:order        # Orders        → localhost:3006
npm run dev:payment      # Payments      → localhost:3007
npm run dev:review       # Reviews       → localhost:3008
npm run dev:search       # Search        → localhost:3009
npm run dev:notification # Notifications → localhost:3011
npm run dev:admin        # Admin       1  → localhost:3012
npm run dev:analytics    # Analytics     → localhost:3013
```

> For local testing you only need the first 6: gateway, auth, user, restaurant, food, booking.

### 5. Start the web app

```bash
cd apps/web
cp .env.local.example .env.local
npm run dev
# → http://localhost:3001
```

### 6. Verify everything works

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@quickbite.com","password":"Test@1234"}'
```

---

## Running All Services at Once (PM2)

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs        # view all logs
pm2 stop all    # stop everything
```

---

## Mobile App

```bash
cd apps/mobile
npm install

npm run ios      # iOS simulator (Mac only)
npm run android  # Android emulator
npm start        # Expo Go — scan QR with your phone
```

For physical device testing, update the API URL in `apps/mobile/src/lib/api.ts`:

```ts
const API_URL = 'http://YOUR_LOCAL_IP:3000/api/v1';
```

---

## Available Pages

### Customer Web App
| Page | URL |
|------|-----|
| Home | `/` |
| Restaurants | `/restaurants` |
| Restaurant Detail | `/restaurants/[slug]` |
| Search | `/search` |
| Cart | `/cart` |
| Bookings | `/bookings` |
| Orders | `/orders` |
| Profile | `/profile` |
| Wallet | `/wallet` |
| Notifications | `/notifications` |
| Favourites | `/favorites` |
| Settings | `/settings` |
| Help | `/help` |

### Restaurant Dashboard
| Page | URL |
|------|-----|
| Overview | `/dashboard` |
| Bookings | `/dashboard/bookings` |
| Menu Management | `/dashboard/menu` |
| Orders (Live) | `/dashboard/orders` |
| Reviews | `/dashboard/reviews` |
| Analytics | `/dashboard/analytics` |
| Promotions | `/dashboard/promotions` |
| Settings | `/dashboard/settings` |

### Admin Panel
| Page | URL |
|------|-----|
| Dashboard | `/admin` |
| Restaurants | `/admin/restaurants` |
| Users | `/admin/users` |
| Bookings | `/admin/bookings` |
| Orders | `/admin/orders` |
| Payments | `/admin/payments` |
| Coupons | `/admin/coupons` |
| Analytics | `/admin/analytics` |
| Reports | `/admin/reports` |

---

## API Reference

All endpoints go through the API Gateway at `http://localhost:3000/api/v1`.

### Auth
```
POST /auth/register        Register new user
POST /auth/login           Login with email/password
POST /auth/logout          Logout
POST /auth/refresh         Refresh access token
POST /auth/send-otp        Send OTP login code
POST /auth/verify-otp      Verify OTP and login
POST /auth/forgot-password Request password reset
POST /auth/reset-password  Reset password with token
GET  /auth/me              Get current user
```

### Restaurants
```
GET  /restaurants          List restaurants (with filters)
GET  /restaurants/featured Featured restaurants
GET  /restaurants/nearby   Nearby restaurants (?lat&lng)
GET  /restaurants/search   Search (?q=)
GET  /restaurants/:slug    Restaurant detail by slug
POST /restaurants          Create restaurant (owner)
PUT  /restaurants/:id      Update restaurant (owner)
```

### Bookings
```
POST /bookings             Create booking
GET  /bookings/my          My bookings
GET  /bookings/:id         Booking detail
PATCH /bookings/:id/cancel Cancel booking
```

### Food
```
GET  /food/:restaurantId/menu          Full menu
GET  /food/:restaurantId/categories    Categories
GET  /food/items/:id                   Item detail
POST /food/:restaurantId/items         Add item (owner)
PUT  /food/:restaurantId/items/:id     Update item (owner)
```

### Payments
```
POST /payments/razorpay/order    Create Razorpay order
POST /payments/razorpay/verify   Verify payment
POST /payments/stripe/intent     Create Stripe intent
GET  /payments/my                Payment history
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI_*` | ✅ | MongoDB connection strings |
| `REDIS_HOST` | ✅ | Redis host (localhost for Docker) |
| `JWT_ACCESS_SECRET` | ✅ | JWT signing secret |
| `JWT_REFRESH_SECRET` | ✅ | JWT refresh signing secret |
| `RAZORPAY_KEY_ID` | Payment features | Razorpay API key |
| `STRIPE_SECRET_KEY` | Payment features | Stripe API key |
| `SMTP_USER` / `SMTP_PASS` | Email features | SMTP credentials |
| `FIREBASE_PROJECT_ID` | Push notifications | Firebase config |
| `GOOGLE_CLIENT_ID` | Google login | OAuth credentials |
| `GOOGLE_MAPS_API_KEY` | Location features | Maps API key |

---

## Docker (Full Stack)

Run everything — all 14 microservices + MongoDB + Redis + RabbitMQ — with a single command:

```bash
# Build images and start all services
docker compose up -d

# View logs
docker compose logs -f api-gateway

# Stop everything
docker compose down
```

---

## Deployment

### Frontend → Vercel
```bash
cd apps/web
npx vercel --prod
```

### Backend → Any VPS / Cloud
```bash
# Build all services
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Kubernetes
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml      # fill in real values first
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/horizontal-pod-autoscaler.yaml
```

---

## Testing

```bash
# Run all tests
npm test

# Test specific service
npm test --workspace=services/auth-service

# Health check all services
for port in 3000 3001 3002 3003 3004 3005; do
  echo "Port $port: $(curl -s http://localhost:$port/health | python -c 'import sys,json; print(json.load(sys.stdin)[\"success\"])')"
done
```

---

## Services Health URLs

| Service | Health Check |
|---------|-------------|
| API Gateway | http://localhost:3000/health |
| Auth | http://localhost:3001/health |
| User | http://localhost:3002/health |
| Restaurant | http://localhost:3003/health |
| Food | http://localhost:3004/health |
| Booking | http://localhost:3005/health |
| Order | http://localhost:3006/health |
| Payment | http://localhost:3007/health |
| Review | http://localhost:3008/health |
| Search | http://localhost:3009/health |
| Location | http://localhost:3010/health |
| Notification | http://localhost:3011/health |
| Admin | http://localhost:3012/health |
| Analytics | http://localhost:3013/health |

---

## RabbitMQ Dashboard

When running locally via Docker:
- URL: http://localhost:15672
- Username: `quickbite`
- Password: `quickbite_secret`

---

## License

MIT © QuickBite
