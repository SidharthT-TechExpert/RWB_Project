#!/bin/bash
# Run this ONCE on a fresh AWS EC2 instance (Ubuntu 24.04)
# Usage: chmod +x setup-ec2.sh && ./setup-ec2.sh

set -e

echo "🚀 Setting up QuickBite on EC2..."

# ─── System updates ───────────────────────────────────────────
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git unzip

# ─── Install Docker ───────────────────────────────────────────
echo "📦 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# ─── Install Docker Compose ───────────────────────────────────
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ─── Create project directory ────────────────────────────────
echo "📁 Creating project directory..."
mkdir -p ~/quickbite/nginx/ssl
mkdir -p ~/quickbite/logs

# ─── Install Certbot (for free SSL) ──────────────────────────
echo "🔒 Installing Certbot..."
sudo apt-get install -y certbot

echo ""
echo "✅ EC2 setup complete!"
echo ""
echo "Next steps:"
echo "  1. Point DNS (apex, www, api) at this EC2 IP"
echo "  2. Issue SSL: sudo certbot certonly --standalone -d qickbite.com -d www.qickbite.com -d api.qickbite.com"
echo "  3. Push to main (GitHub Actions deploys web + API + nginx to ~/quickbite)"
echo ""
echo "⚠️  Log out and back in for docker group to take effect"
