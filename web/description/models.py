from django.db import models
from django.db.models import CharField, ForeignKey


class CheckType(models.Model):
    name = CharField(default="", max_length=255, unique=True)


class Checks(models.Model):
    name = CharField(default="", max_length=255, unique=True)
    cmd = CharField(default="", max_length=1024, blank=True, null=True)
    check_type = ForeignKey(CheckType, on_delete=models.DO_NOTHING, blank=True, null=True)
