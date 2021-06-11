from django.db.models import Model, CharField


class Check(Model):
    name = CharField(default="", unique=True, max_length=255)
    cmd = CharField(default="", max_length=512, blank=True, null=True)
