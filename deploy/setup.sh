#!/bin/bash

set -e

APP_USER="leela"
GIT_REPO="https://github.com/Aveyder/leela.git"
WORK_DIR="/home/$APP_USER/leela"

if id "$APP_USER" &>/dev/null; then
    echo "error: user '$APP_USER' already exists"
    exit 1
fi

useradd -m -s /bin/bash "$APP_USER"

mkdir -p /home/$APP_USER/.ssh
chmod 700 /home/$APP_USER/.ssh

cp /root/.ssh/authorized_keys /home/$APP_USER/.ssh/authorized_keys
chmod 600 /home/$APP_USER/.ssh/authorized_keys
chown -R $APP_USER:$APP_USER /home/$APP_USER/.ssh

echo "user '$APP_USER' created"

apt-get update
apt-get install -y curl gnupg2 ca-certificates lsb-release

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

apt-get install -y nodejs

node -v
npm -v

apt-get install -y nginx

chown -R "$APP_USER:$APP_USER" /var/www/html

systemctl enable nginx
systemctl start nginx
systemctl status nginx

npm install -g pm2

sudo -u $APP_USER git clone "$GIT_REPO" "$WORK_DIR"

echo "✅ setup completed"
