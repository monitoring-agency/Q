#!/usr/bin/env python3
import base64
import json
import os

import django
import httpx


def callback(config, cr):
    ret = httpx.post(
        f"https://{config.web_address}:{config.web_port}/proxy/api/v1/submit", timeout=3, json=json.loads(cr.json),
        cert=("/var/lib/q/certs/q-proxy-fullchain.pem", "/var/lib/q/certs/q-proxy-privkey.pem"),
        headers={
            "Authentication":
                base64.urlsafe_b64encode(f"{config.proxy_id}:{config.web_secret}".encode("utf-8")).decode("utf-8")
        }
    )
    if ret.status_code == 200:
        cr.delete()
    else:
        print(ret.status_code, ret.text)


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "q_proxy.settings")
    django.setup()

    from api.models import ConfigurationModel, CheckResultModel
    c = ConfigurationModel.objects.first()
    backlog = list(CheckResultModel.objects.all())
    for x in backlog:
        callback(c, x)


if __name__ == '__main__':
    main()
