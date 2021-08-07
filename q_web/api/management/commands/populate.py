from django.core.management import BaseCommand
from api.acl_models import create_acl_models
from description.create_days import create_days


class Command(BaseCommand):
    def handle(self, *args, **options):
        create_days()
        print("Populated Days")
        create_acl_models()
        print("Populated ACLGroupModels")
