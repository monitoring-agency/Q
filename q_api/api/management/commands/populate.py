from django.core.management import BaseCommand
from api.acl_models import create_acl_models


class Command(BaseCommand):
    def handle(self, *args, **options):
        create_acl_models()
        print("Populated ACLGroupModels")
