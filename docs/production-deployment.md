# QuickBite — Production Deployment on AWS EC2

Complete step-by-step guide to deploy QuickBite to AWS EC2 using Docker + GitHub Actions.

---

## Architecture

```
Internet
   │
   ▼
AWS EC2 (t3.medium or larger)
   │
Nginx (port 80/443) — SSL termination + reverse proxy
   │
   ├── web container (Next.js, port 3006)
   └── api-gateway container (port 3000)
           │
    ┌──────┴──────────────────────────────┐
    │  All 14 microservice containers     │
    └──────┬──────────────────────────────┘
           │
    ┌──────┴───────────────┐
    │ mongodb  redis  mq   │  (Docker containers on same EC2)
    └──────────────────────┘
```

---

## Part 1 — AWS EC2 Instance

### 1.1 Launch EC2

1. Go to **AWS Console → EC2 → Launch Instance**
2. Settings:
   - **Name:** `quickbite-prod`
   - **AMI:** Ubuntu Server 24.04 LTS (64-bit x86)
   - **Instance type:** `t3.small` (2 vCPU, 2GB RAM) — free tier eligible, good for MVP/demo. Upgrade to `t3.medium` or `t3.large` after getting investors.
   - **Key pair:** Create new → name it `quickbite-key` → download `.pem` file
   - **Security Group:** Create new with these rules:

| Type  | Port  | Source    | Purpose         |
|-------|-------|-----------|-----------------|
| SSH   | 22    | Your IP   | Server access   |
| HTTP  | 80    | 0.0.0.0/0 | Web traffic     |
| HTTPS | 443   | 0.0.0.0/0 | Secure web      |

> **Do not open port 15672 (RabbitMQ UI) publicly.** If you need the dashboard, use SSH tunneling:
> ```bash
> ssh -i quickbite-key.pem -L 15672:localhost:15672 ubuntu@<your EC2 IP>
> # then open http://localhost:15672 in your browser
> ```

3. **Storage:** 30 GB gp3 is free tier. Use **100 GB gp3** for Docker images + MongoDB data + logs (~$5.60/mo for the extra 70 GB)
4. Click **Launch Instance**
5. Note the **Public IPv4 address** (e.g. `54.123.45.67`)

### 1.2 Point your domain to EC2

In your DNS provider, add an A record:
```
@ → 54.123.45.67  (your EC2 IP)
www → 54.123.45.67
```

Wait 5–10 minutes for DNS to propagate.

---

## Part 2 — GitHub Secrets

Go to your repo: **Settings → Secrets and variables → Actions → New repository secret**

Add each of these:

| Secret Name | Value | How to get it |
|-------------|-------|---------------|
| `EC2_HOST` | `54.123.45.67` | Your EC2 public IP |
| `EC2_USER` | `ubuntu` | Default Ubuntu user |
| `EC2_SSH_KEY` | Contents of `quickbite-key.pem` | Open .pem file, copy ALL text |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api/v1` | Your domain |
| `DOMAIN` | `yourdomain.com` | Your domain |
| `MONGO_PASSWORD` | `YourStrongPassword123!` | Create a strong password |
| `RABBITMQ_PASSWORD` | `YourRabbitPassword123!` | Create a strong password |
| `JWT_ACCESS_SECRET` | Random 64-char string | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Random 64-char string | `openssl rand -hex 32` |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard | razorpay.com |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard | razorpay.com |
| `STRIPE_SECRET_KEY` | From Stripe dashboard | dashboard.stripe.com |
| `SMTP_USER` | Your Gmail address | Gmail account |
| `SMTP_PASS` | Gmail App Password | myaccount.google.com/apppasswords |
| `GOOGLE_CLIENT_ID` | From Google Console | console.cloud.google.com |
| `GOOGLE_CLIENT_SECRET` | From Google Console | console.cloud.google.com |
| `GOOGLE_MAPS_API_KEY` | From Google Console | console.cloud.google.com |
| `FIREBASE_PROJECT_ID` | From Firebase Console | console.firebase.google.com |
| `FIREBASE_PRIVATE_KEY` | Service account key | Firebase → Project Settings → Service Accounts |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Firebase → Project Settings → Service Accounts |

---

## Part 3 — First-Time EC2 Setup

SSH into your server:
```bash
chmod 400 quickbite-key.pem
ssh -i quickbite-key.pem ubuntu@54.123.45.67
```

Run the setup script:
```bash
curl -fsSL https://raw.githubusercontent.com/SidharthT-TechExpert/Qickbite/main/scripts/setup-ec2.sh | bash
```

Or manually:
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create project directory
mkdir -p ~/quickbite/nginx/ssl
```

---

## Part 4 — SSL Certificate (Free with Let's Encrypt)

SSH into EC2 and run:

```bash
# Install certbot
sudo apt-get install -y certbot

# Get certificate (replace with your domain)
sudo certbot certonly --standalone \
  --email admin@yourdomain.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com \
  -d www.yourdomain.com

# Certificates are now at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

Update `nginx/nginx.conf` — replace `yourdomain.com` with your actual domain.

Auto-renew SSL (runs every 12 hours):
```bash
sudo crontab -e
# Add this line:
0 */12 * * * certbot renew --quiet && docker compose -f ~/quickbite/docker-compose.prod.yml restart nginx
```

---

## Part 5 — Create Production .env.docker on EC2

SSH into EC2 and create the env file:

```bash
cat > ~/quickbite/.env.docker << 'EOF'
NODE_ENV=production

# Service URLs (container names as hostnames)
AUTH_SERVICE_URL=http://auth-service:3001
USER_SERVICE_URL=http://user-service:3002
RESTAURANT_SERVICE_URL=http://restaurant-service:3003
FOOD_SERVICE_URL=http://food-service:3004
BOOKING_SERVICE_URL=http://booking-service:3005
ORDER_SERVICE_URL=http://order-service:3006
PAYMENT_SERVICE_URL=http://payment-service:3007
REVIEW_SERVICE_URL=http://review-service:3008
SEARCH_SERVICE_URL=http://search-service:3009
LOCATION_SERVICE_URL=http://location-service:3010
NOTIFICATION_SERVICE_URL=http://notification-service:3011
ADMIN_SERVICE_URL=http://admin-service:3012
ANALYTICS_SERVICE_URL=http://analytics-service:3013

# MongoDB (with auth — use your MONGO_PASSWORD)
MONGODB_URI=mongodb://quickbite:YOUR_MONGO_PASSWORD@mongodb:27017/quickbite?authSource=admin

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# RabbitMQ
RABBITMQ_URL=amqp://quickbite:YOUR_RABBITMQ_PASSWORD@rabbitmq:5672

# JWT (use strong random values)
JWT_ACCESS_SECRET=YOUR_JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=YOUR_JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1

# Payments
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_GMAIL
SMTP_PASS=YOUR_APP_PASSWORD
EMAIL_FROM=noreply@yourdomain.com

# Firebase
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_PRIVATE_KEY=YOUR_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL=YOUR_CLIENT_EMAIL

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback

# Google Maps
GOOGLE_MAPS_API_KEY=YOUR_MAPS_KEY
EOF
```

---

## Part 6 — Update GitHub Actions with your repo details

In `.github/workflows/deploy.yml`, the `IMAGE_PREFIX` is automatically set from your GitHub repo owner. No changes needed if you push to GitHub.

Also update `docker-compose.prod.yml` — replace `your-org` with your GitHub username:
```bash
# On EC2, or update in your repo before pushing
sed -i 's/your-org/SidharthT-TechExpert/g' docker-compose.prod.yml
```

---

## Part 7 — First Manual Deployment (bootstrap)

On EC2, before the first GitHub Actions run:

```bash
cd ~/quickbite

# Log in to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u SidharthT-TechExpert --password-stdin

# Pull and start (after GitHub Actions has built images)
export IMAGE_PREFIX=ghcr.io/sidhartht-techexpert/quickbite
export IMAGE_TAG=latest
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

---

## Part 8 — Trigger Automatic Deployment

From your local machine, push to main:

```bash
git checkout main
git merge feat/initial-platform
git push origin main
```

GitHub Actions will automatically:
1. ✅ Lint and type check
2. 🔨 Build Docker images for all 14 services + web app
3. 📤 Push images to GitHub Container Registry (ghcr.io)
4. 🚀 SSH into EC2 and deploy with zero-downtime rolling update

Watch it at: `https://github.com/SidharthT-TechExpert/Qickbite/actions`

---

## Useful Commands on EC2

```bash
# View all running containers
docker compose -f ~/quickbite/docker-compose.prod.yml ps

# View logs for a service
docker compose -f ~/quickbite/docker-compose.prod.yml logs -f auth-service

# Restart a service
docker compose -f ~/quickbite/docker-compose.prod.yml restart booking-service

# Stop everything
docker compose -f ~/quickbite/docker-compose.prod.yml down

# Update a single service without downtime
docker compose -f ~/quickbite/docker-compose.prod.yml pull auth-service
docker compose -f ~/quickbite/docker-compose.prod.yml up -d --no-deps auth-service

# Check disk usage
docker system df

# Free up unused images
docker image prune -f

# Monitor resources
docker stats
```

---

## Estimated Costs (AWS)

| Resource | Instance | Monthly cost |
|----------|----------|-------------|
| EC2 t3.small | 2 vCPU, 2GB RAM | **Free tier eligible** |
| EC2 t3.medium | 2 vCPU, 4GB RAM | ~$30 (post-investor) |
| EC2 t3.large | 2 vCPU, 8GB RAM | ~$60 (production) |
| EBS Storage 30GB | gp3 | Free tier |
| EBS Storage 100GB | gp3 | ~$8/mo (30GB free + $5.60 for extra 70GB) |
| Data transfer | 10GB/mo | ~$1 |

> For production with real traffic, use `t3.large` minimum.
> For high traffic, consider moving MongoDB to MongoDB Atlas and Redis to ElastiCache.

---

## Troubleshooting

**Services keep restarting:**
```bash
docker compose -f docker-compose.prod.yml logs auth-service --tail 50
```

**MongoDB connection refused:**
```bash
# Check MongoDB is healthy
docker compose -f docker-compose.prod.yml exec mongodb mongosh --eval "db.adminCommand('ping')"
```

**SSL certificate not working:**
```bash
sudo certbot renew --dry-run
```

**Out of disk space:**
```bash
docker system prune -a -f
```

**GitHub Actions failing:**
- Check `Actions` tab in GitHub for error details
- Most common issue: incorrect secrets — verify each one in Settings → Secrets
