from django.db import models
from django.db.models import CharField, PositiveIntegerField


class ConfigurationModel(models.Model):
    web_address = CharField(default="", max_length=256)
    web_port = PositiveIntegerField(default=4443)


class CheckResultModel(models.Model):
    json = CharField(max_length=8192, default="")
