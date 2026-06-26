#!/bin/bash
# SnapTrip VPS Setup Script
# Run this ON the VPS as root/ubuntu via SSH
# Usage: bash vps_setup.sh

set -e
echo "=== SnapTrip VPS Setup ==="
echo ""

# ---- 1. System Update ----
echo "[1/6] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y git curl wget unzip nginx sshpass

# ---- 2. Install Node.js 20 LTS ----
echo "[2/6] Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node: $(node -v)"
echo "NPM:  $(npm -v)"

# ---- 3. Install PM2 ----
echo "[3/6] Installing PM2..."
npm install -g pm2
echo "PM2: $(pm2 -v)"

# ---- 4. Install Docker ----
echo "[4/6] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi
echo "Docker: $(docker -v)"

# ---- 5. Create app directory ----
echo "[5/6] Creating app directory /opt/snaptrip..."
mkdir -p /opt/snaptrip

# ---- 6. Configure Nginx ----
echo "[6/6] Configuring Nginx..."
cat > /etc/nginx/sites-available/snaptrip << 'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/snaptrip /etc/nginx/sites-enabled/snaptrip
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "=== VPS Setup Complete! ==="
