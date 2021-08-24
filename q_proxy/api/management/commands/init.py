import base64
import json

from django.core.management import BaseCommand

from api.models import ConfigurationModel


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--b64",
            required=True,
            action="store",
            dest="b64",
            help="Base64 proxy configuration"
        )

    def handle(self, *args, **options):
        b64 = options["b64"]
        try:
            configuration = json.loads(base64.b64decode(b64).decode("utf-8"))
        except json.JSONDecodeError:
            print("Could not decode")
            exit(1)
        if len(ConfigurationModel.objects.all()) > 0:
            ConfigurationModel.objects.first().delete()
        ConfigurationModel.objects.create(
            web_address=configuration["web_address"],
            web_port=int(configuration["web_port"]),
            web_secret=configuration["web_secret"],
            secret=configuration["secret"],
            proxy_id=int(configuration["id"]),
        )
