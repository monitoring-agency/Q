from django.contrib import admin

from api.models import *


@admin.register(AccountModel)
class AccountModelAdmin(admin.ModelAdmin):
    list_display = ("__str__",)


@admin.register(ACLGroupModel)
class ACLGroupModelAdmin(admin.ModelAdmin):
    list_display = ("name",)
