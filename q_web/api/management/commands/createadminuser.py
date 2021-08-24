from django.contrib.auth.models import User
from django.core.management import BaseCommand

from api.models import AccountModel, ACLGroupModel


class Command(BaseCommand):
    def handle(self, *args, **options):
        username = input("Enter username:")
        password = input("Enter password:")
        mail = input("Enter mail:")

        user = User.objects.create_user(
            username=username, email=mail, password=password, is_superuser=True, is_staff=True
        )
        try:
            acl_model = ACLGroupModel.objects.get(name="allow_all")
        except ACLGroupModel.DoesNotExist:
            print("Run populate before creating an admin user")
            user.delete()
            exit(1)
        AccountModel.objects.create(internal_user=user, linked_acl_group=acl_model)
