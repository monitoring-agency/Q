from django.core.management import BaseCommand
from api.management.acl_models import create_acl_models
from api.management.create_days import create_time_related
from api.management.create_proxy import create_proxy


class Command(BaseCommand):
    def handle(self, *args, **options):
        create_time_related()
        print("Populated timerelated")
        create_acl_models()
        print("Populated ACLGroupModels")
        create_proxy()
        print("Populated default proxy")
