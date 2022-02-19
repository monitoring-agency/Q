#!/usr/bin/env bash

apt install nginx python3 python3-pip python3-venv
useradd -m -r -d /usr/sbin/q-proxy -s /bin/bash q-proxy
cp -r q_proxy/ /usr/sbin/q-proxy/
cp requirements.txt /usr/sbin/q-proxy/
chown -R q-proxy: /usr/sbin/q-proxy/
su - q-proxy -c 'python3 -m venv venv'
su - q-proxy -c 'venv/bin/python3 -m pip install -r requirements.txt'
su - q-proxy -c 'venv/bin/python3 q_proxy/manage.py migrate'
mkdir /var/log/q-proxy/
chown q-proxy: /var/log/q-proxy/
mkdir /etc/q-proxy/
ln -s /usr/sbin/q-proxy/q_proxy/q_proxy/settings.py /etc/q-proxy/
cp gunicorn.conf.py /etc/q-proxy/
cp q-proxy.service /lib/systemd/system/
cp q-proxy.socket /lib/systemd/system/
ln -s /lib/systemd/system/q-proxy.service /etc/systemd/system/multi-user.target.wants/
ln -s /lib/systemd/system/q-proxy.socket /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload
systemctl enable q-proxy.socket q-proxy.service
systemctl restart q-proxy.socket
systemctl restart q-proxy.service
systemctl reload nginx

