#!/usr/bin/env bash

apt install nginx python3 python3-pip python3-venv default-libmysqlclient-dev build-essential redis
useradd -m -r -d /usr/sbin/q-core -s /bin/bash q-core
cp -r q_core/ /usr/sbin/q-core
cp requirements.txt /usr/sbin/q-core/
chown -R q-core: /usr/sbin/q-core/
su - q-core -c 'python3 -m venv venv'
su - q-core -c 'venv/bin/python3 -m pip install -r requirements.txt'
su - q-core -c 'venv/bin/python3 q_core/manage.py migrate'
mkdir /var/log/q-core/
chown q-core: /var/log/q-core/
mkdir /etc/q-core/
ln -s /usr/sbin/q-core/q_core/q_core/settings.py /etc/q-core/
cp gunicorn.conf.py /etc/q-core/
cp q-core.service /lib/systemd/system/
cp q-core.socket /lib/systemd/system/
ln -s /lib/systemd/system/q-core.service /etc/systemd/system/multi-user.target.wants/
ln -s /lib/systemd/system/q-core.socket /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload
systemctl enable q-core.socket q-core.service
systemctl restart q-core.socket
systemctl restart q-core.service
systemctl reload nginx
