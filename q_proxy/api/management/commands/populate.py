import certifi
from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options):
        ca_bundle = certifi.where()
        with open("/var/lib/q/certs/q-ca.pem", "rb") as fh:
            q_ca = fh.read()
        with open(ca_bundle, "rb") as fh:
            if fh.read().endswith(q_ca):
                return
        with open(ca_bundle, "ab") as fh:
            fh.write(q_ca)
