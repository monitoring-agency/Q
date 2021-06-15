from django.db import models
from django.db.models import CharField


class Checks(models.Model):
    name = CharField(default="", max_length=255, unique=True, blank=False, null=False)
    cmd = CharField(default="", max_length=1024, blank=True, null=True)
