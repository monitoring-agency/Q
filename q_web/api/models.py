import random
import string
from datetime import datetime, timedelta

from django.contrib.auth.models import User
from django.db import models
from django.db.models import ForeignKey, CharField, BooleanField, ManyToManyField, DateTimeField
from django.utils.timezone import make_aware

from description.models import TimePeriod


class ACLModel(models.Model):
    """The name of the ACL should have the following structure:
    Location:Method:Endpoint
        e.g.:
        API:POST:/api/v1/metric

    """
    name = CharField(default="", max_length=255)
    allow = BooleanField(default=False)

    def __str__(self):
        return f"{self.name}:{self.allow}"


class ACLGroupModel(models.Model):
    name = CharField(default="", max_length=255, unique=True)
    linked_acls = ManyToManyField(ACLModel)

    def __str__(self):
        return self.name


class AccountModel(models.Model):
    internal_user = ForeignKey(User, on_delete=models.CASCADE)
    linked_acl_group = ForeignKey(ACLGroupModel, on_delete=models.DO_NOTHING, default=2)
    notification_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="notification_acc"
    )

    def __str__(self):
        return self.internal_user.username

    def get_username(self):
        return self.internal_user.get_username()

    def get_firstname(self):
        return self.internal_user.first_name

    def get_lastname(self):
        return self.internal_user.last_name
