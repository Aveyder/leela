#!/bin/bash

set -e

WORK_DIR=~/leela

DIST_DIR="dist"
CLIENT_BUILD_DIR="$DIST_DIR/client"
SERVER_BUILD_DIR="$DIST_DIR/server"

ENV_DIR="src/config"

NGINX_HTML_DIR="/var/www/html"

SERVER_ENTRY="$SERVER_BUILD_DIR/server/index.js"

PM2_APP_NAME="leela-node"

cd "$WORK_DIR"

echo "🧹 [0/5] removing '$DIST_DIR'"
rm -rf $DIST_DIR

echo "⬇️ [1/5] git pull $(git config --get remote.origin.url)"
git reset --hard
git clean -fd
git pull

echo "🔧 [2/5] npm install & npm run build:*"
npm install
sed -i "s/^SERVER_HOST=.*/SERVER_HOST=$(hostname -I | awk '{print $1}')/" $ENV_DIR/.development.env
npm run build:client
npm run build:server

echo "🚀 [3/5] deploying client"
rm -rf ${NGINX_HTML_DIR:?}/*
cp -r $CLIENT_BUILD_DIR/* $NGINX_HTML_DIR/

echo "🔄 [4/5] restarting server"
if pm2 list | grep -q "$PM2_APP_NAME"; then
    pm2 restart "$PM2_APP_NAME"
else
    ENV_DIR=$ENV_DIR NODE_ENV=development pm2 start "$SERVER_ENTRY" --name "$PM2_APP_NAME"
fi

echo "✅ [5/5] deployment completed"
