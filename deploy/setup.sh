#!/bin/bash

set -e

APP_USER="leela"

if id "$APP_USER" &>/dev/null; then
    echo "User '$APP_USER' already exists. Exiting."
    exit 1
fi

useradd -m -s /bin/bash "$APP_USER"

mkdir -p /home/$APP_USER/.ssh
chmod 700 /home/$APP_USER/.ssh

cp /root/.ssh/authorized_keys /home/$APP_USER/.ssh/authorized_keys
chmod 600 /home/$APP_USER/.ssh/authorized_keys
chown -R $APP_USER:$APP_USER /home/$APP_USER/.ssh

echo "User '$APP_USER' created and SSH key copied."

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

sudo -u $APP_USER git clone "https://github.com/Aveyder/leela.git" "/home/$APP_USER/leela"

