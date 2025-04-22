#!/bin/bash

set -e  # Exit on error

APP_DIR=~/leela
DIST_DIR="$APP_DIR/dist"
CLIENT_BUILD_DIR="$DIST_DIR/client"
NGINX_HTML_DIR="/var/www/html"
SERVER_ENTRY="$DIST_DIR/server/server/index.js"
PM2_APP_NAME="leela-node"

echo "[0/5] Removing old build directories..."
rm -rf $DIST_DIR

echo "[1/5] Pulling latest code..."
cd "$APP_DIR"

git reset --hard
git clean -fd
git pull

echo "[2/5] Installing dependencies and building project..."
npm install
sed -i "s/^SERVER_HOST=.*/SERVER_HOST=$(hostname -I | awk '{print $1}')/" ./src/config/.development.env
npm run build:client
npm run build:server

echo "[3/5] Deploying client to nginx..."
rm -rf "${NGINX_HTML_DIR:?}"/*
cp -r "$CLIENT_BUILD_DIR"/* "$NGINX_HTML_DIR"/

echo "[4/5] Restarting NodeJS server via pm2..."
if pm2 list | grep -q "$PM2_APP_NAME"; then
    pm2 restart "$PM2_APP_NAME"
else
    ENV_DIR=./src/config NODE_ENV=development pm2 start "$SERVER_ENTRY" --name "$PM2_APP_NAME"
fi

echo "[5/5] Deployment completed successfully."
