#!/usr/bin/env bash

apt install python3 python3-pip python3-venv
useradd -m -r -d /usr/sbin/q-scheduler -s /bin/bash q-scheduler
cp -r q_scheduler/ /usr/sbin/q-scheduler/
cp requirements.txt /usr/sbin/q-scheduler/
chown -R q-scheduler: /usr/sbin/q-scheduler/
su - q-scheduler -c 'python3 -m venv venv'
su - q-scheduler -c 'venv/bin/python3 -m pip install -r requirements.txt'
mkdir /var/log/q-scheduler/
chown q-scheduler: /var/log/q-scheduler/
mkdir /etc/q-scheduler/
cp q-scheduler.service /lib/systemd/system/
ln -s /lib/systemd/system/q-scheduler.service /etc/systemd/system/multi-user.target.wants/
systemctl daemon-reload
systemctl restart q-scheduler.service

