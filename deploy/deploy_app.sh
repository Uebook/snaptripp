#!/bin/bash
# SnapTrip Deploy Script - Run from your LOCAL Mac
# Usage: VPS_IP=your.vps.ip VPS_PASS=yourpassword bash deploy_app.sh

set -e

VPS_IP="${VPS_IP:-}"
VPS_USER="ubuntu"
VPS_PASS="${VPS_PASS:-}"
APP_DIR="/opt/snaptrip"
PROJECT_DIR="/Users/vansh/ReactProject/mn356/Snaptrip"

if [ -z "$VPS_IP" ] || [ -z "$VPS_PASS" ]; then
  echo "ERROR: Set VPS_IP and VPS_PASS before running"
  echo "Usage: VPS_IP=1.2.3.4 VPS_PASS=mypassword bash deploy/deploy_app.sh"
  exit 1
fi

echo "=== SnapTrip Deployment to $VPS_IP ==="
echo ""

# ---- 1. Sync project files (excluding heavy/generated dirs) ----
echo "[1/4] Syncing project files to VPS..."
rsync -avz --progress \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env.local' \
  --exclude='.env.vercel*' \
  --exclude='scratch' \
  --exclude='cities.csv' \
  --exclude='countries.csv' \
  --exclude='*.log' \
  -e "sshpass -p '$VPS_PASS' ssh -o StrictHostKeyChecking=no" \
  "$PROJECT_DIR/" \
  "$VPS_USER@$VPS_IP:$APP_DIR/"

echo ""
echo "[2/4] Uploading .env.production to VPS..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no \
  "$PROJECT_DIR/deploy/.env.production" \
  "$VPS_USER@$VPS_IP:$APP_DIR/.env.production"

echo ""
echo "[3/4] Installing dependencies and building app on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" << REMOTE
  set -e
  cd $APP_DIR

  echo "  -> npm install..."
  npm install --production=false

  echo "  -> npm run build..."
  NODE_ENV=production npm run build

  echo "  -> Starting/restarting with PM2..."
  pm2 delete snaptrip 2>/dev/null || true
  pm2 start "npm run start -- -p 3001" \
    --name snaptrip \
    --cwd $APP_DIR \
    --env production

  pm2 save
  pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true
  pm2 status
REMOTE

echo ""
echo "[4/4] Reloading Nginx..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" \
  "sudo nginx -t && sudo systemctl reload nginx"

echo ""
echo "=== Deployment Complete! ==="
echo "  Site: http://$VPS_IP"
echo "  PM2:  pm2 status (run on VPS to check)"
