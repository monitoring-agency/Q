from typing import List

from django.contrib.auth.models import User
import base64
import json
from collections import ChainMap

from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import CharField, ForeignKey, ManyToManyField, PositiveIntegerField, BooleanField, EmailField


class GlobalVariable(models.Model):
    """Represents a global variable"""
    variable = GenericRelation("GenericKVP")
    comment = CharField(default="", max_length=1024, null=True, blank=True)

    allowed_values = ["comment"]

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        kvp = {
            "id": self.id,
        }
        if "comment" in values:
            kvp["comment"] = self.comment if self.comment else ""
        for x, y in self.variable.first().to_dict().items():
            kvp.update({
                "key": x,
                "value": y
            })
        return kvp


class SchedulingInterval(models.Model):
    """Scheduling Interval. The value is interpreted in seconds."""
    interval = models.PositiveIntegerField(default=350)

    def __str__(self):
        return str(self.interval)


class Day(models.Model):
    """Day of the weak. Quite simple."""
    name = CharField(default="", max_length=16, unique=True)

    def __str__(self):
        return self.name

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.name == "":
            raise ValueError("Name of day can not be \"\"")
        super(Day, self).save(force_insert=force_insert, force_update=force_update, using=using,
                              update_fields=update_fields)


class Period(models.Model):
    """Specific start and stop time.

    Values can be from 0000 to 2400.
    """
    start_time = CharField(default="", max_length=4, validators=[RegexValidator("(([01][0-9]|2[0-3])[0-5][0-9]|2400)")])
    stop_time = CharField(default="", max_length=4, validators=[RegexValidator("(([01][0-9]|2[0-3])[0-5][0-9]|2400)")])

    def __str__(self):
        return f"{self.start_time}-{self.stop_time}"

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if int(self.stop_time) <= int(self.start_time):
            raise ValueError("start_time has to lesser than stop_time")
        super(Period, self).save(force_insert=force_insert, force_update=force_update, using=using,
                                 update_fields=update_fields)


class DayTimePeriod(models.Model):
    """Time period(s) of a specific day"""
    day = ForeignKey(Day, on_delete=models.CASCADE)
    periods = ManyToManyField(Period)

    def __str__(self):
        return f"{self.day} - {' '.join([str(x) for x in self.periods.all()])}"


class TimePeriod(models.Model):
    """The complete time period. Included values for all days"""
    name = CharField(default="", max_length=255, unique=True)
    time_periods = ManyToManyField(DayTimePeriod)
    comment = CharField(default="", max_length=1024, null=True, blank=True)

    allowed_values = ["name", "comment", "time_periods"]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "comment" in values:
            ret["comment"] = self.comment
        if "time_periods" in values:
            ret["time_periods"] = {
                x.day.name: [
                    {"start_time": y.start_time, "stop_time": y.stop_time}
                    for y in x.periods.all()
                ] for x in self.time_periods.all()
            }
        return ret

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.name == "":
            raise ValueError("Name of a TimePeriod can not be \"\"")
        super(TimePeriod, self).save(force_insert=force_insert, force_update=force_update, using=using,
                                     update_fields=update_fields)


class Check(models.Model):
    name = CharField(default="", max_length=255, unique=True)
    cmd = CharField(default="", max_length=1024, blank=True, null=True)
    comment = CharField(default="", max_length=1024, blank=True, null=True)

    allowed_values = ["name", "cmd", "comment"]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "cmd" in values:
            ret["cmd"] = self.cmd
        if "comment" in values:
            ret["comment"] = self.comment
        return ret

    def to_export(self, kvp: dict):
        if self.cmd:
            cmd = self.cmd
            for x in kvp:
                cmd = cmd.replace(x, kvp[x])
        else:
            cmd = ""
        return cmd

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.name == "":
            raise ValueError("Name of a Check can not be \"\"")
        super(Check, self).save(force_insert=force_insert, force_update=force_update, using=using,
                                update_fields=update_fields)


class Contact(models.Model):
    """Contact represents the model which holds the contact information and the contact methods that should be
        used when generating an event.
    """
    name = CharField(default="", max_length=255, unique=True)
    mail = EmailField(default="", max_length=255, null=True, blank=True)
    linked_host_notifications = ManyToManyField(Check, blank=True, related_name="contact_host_check")
    linked_host_notification_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="contact_host_nt")
    linked_metric_notifications = ManyToManyField(Check, blank=True, related_name="contact_metric_check")
    linked_metric_notification_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="contact_metric_nt")
    comment = CharField(default="", max_length=1024, blank=True, null=True)
    variables = GenericRelation("GenericKVP")

    allowed_values = [
        "name", "mail", "linked_host_notifications", "linked_host_notification_period", "linked_metric_notifications",
        "linked_metric_notification_period", "comment", "variables"
    ]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "mail" in values:
            ret["mail"] = self.mail if self.mail else ""
        if "linked_host_notifications" in values:
            ret["linked_host_notifications"] = [
               x.id for x in self.linked_host_notifications.all().only("id")
            ] if self.linked_host_notifications else ""
        if "linked_host_notification_period" in values:
            ret["linked_host_notification_period"] = self.linked_host_notification_period_id if self.linked_host_notifications else ""
        if "linked_metric_notifications" in values:
            ret["linked_metric_notifications"] = [
                x.id for x in self.linked_metric_notifications.all().only("id")
            ] if self.linked_metric_notifications else ""
        if "linked_metric_notification_period" in values:
            ret["linked_metric_notification_period"] = self.linked_metric_notification_period_id if self.linked_metric_notification_period else ""
        if "comment" in values:
            ret["comment"] = self.comment if self.comment else ""
        if "variables" in values:
            ret["variables"] = dict(ChainMap(*[x.to_dict() for x in self.variables.all()][::-1]))
        return ret

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.name == "":
            raise ValueError("Name of a Contact can not be \"\"")
        super(Contact, self).save(force_insert=force_insert, force_update=force_update, using=using,
                                  update_fields=update_fields)


class ContactGroup(models.Model):
    """This class represents a group of contacts. Only used for grouping"""
    name = CharField(default="", max_length=255, unique=True)
    comment = CharField(default="", max_length=1024, blank=True, null=True)
    linked_contacts = ManyToManyField(Contact, blank=True)

    allowed_values = ["name", "comment", "linked_contacts"]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "comment" in values:
            ret["comment"] = self.comment if self.comment else ""
        if "linked_contacts" in values:
            ret["linked_contacts"] = [x.id for x in self.linked_contacts.all().only("id")]
        return ret

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.name == "":
            raise ValueError("Name of a ContactGroup can not be \"\"")
        super(ContactGroup, self).save(force_insert=force_insert, force_update=force_update, using=using,
                                       update_fields=update_fields)


class Proxy(models.Model):
    """Q Proxy instance"""
    name = CharField(default="", max_length=255, unique=True)
    address = CharField(default="", max_length=255)
    port = PositiveIntegerField(default=8443)
    secret = CharField(default="", max_length=255)
    core_secret = CharField(default="", max_length=255)
    core_address = CharField(default="", max_length=255)
    core_port = PositiveIntegerField(default=4443)
    disabled = BooleanField(default=False)
    comment = CharField(default="", max_length=1024, blank=True, null=True)

    allowed_values = [
        "name", "address", "port", "core_address", "core_port", "disabled", "comment"
    ]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "address" in values:
            ret["address"] = self.address
        if "port" in values:
            ret["port"] = self.port
        if "core_address" in values:
            ret["core_address"] = self.core_address
        if "core_port" in values:
            ret["core_port"] = self.core_port
        if "disabled" in values:
            ret["disabled"] = self.disabled
        if "comment" in values:
            ret["comment"] = self.comment if self.comment else ""
        return ret

    def to_base64(self):
        return base64.b64encode(json.dumps({
            "core_address": self.core_address,
            "core_port": self.core_port,
            "secret": self.secret,
            "core_secret": self.core_secret
        }).encode("utf-8")).decode("utf-8")


class OrderedListItem(models.Model):
    """Representation of an item of an ordered list of something"""
    index = PositiveIntegerField(default=1)
    referent = GenericForeignKey('content_type', 'object_id')
    content_type = ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = PositiveIntegerField()


class HostTemplate(models.Model):
    """Template of a host"""
    name = CharField(default="", max_length=255, unique=True)
    address = CharField(default="", max_length=255, blank=True, null=True)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    host_templates = ManyToManyField(OrderedListItem, blank=True)
    linked_contacts = ManyToManyField(Contact, blank=True)
    linked_contact_groups = ManyToManyField(ContactGroup, blank=True)
    scheduling_interval = ForeignKey(SchedulingInterval, on_delete=models.DO_NOTHING, blank=True, null=True)
    scheduling_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="scheduling_ht"
    )
    notification_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="notification_ht"
    )
    comment = CharField(default="", max_length=1024, blank=True, null=True)
    variables = GenericRelation("GenericKVP")

    allowed_values = [
        "name", "address", "linked_check", "host_templates", "linked_contacts", "linked_contact_groups",
        "scheduling_interval", "scheduling_period", "notification_period", "comment", "variables"
    ]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "address" in values:
            ret["address"] = self.address if self.address else ""
        if "linked_check" in values:
            ret["linked_check"] = self.linked_check_id if self.linked_check else ""
        if "host_templates" in values:
            hts = [(x.object_id, x.index) for x in self.host_templates.all()]
            hts.sort(key=lambda x: x[1])
            ret["host_templates"] = [x[0] for x in hts]
        if "linked_contacts" in values:
            ret["linked_contacts"] = [x.id for x in self.linked_contacts.all().only("id")]
        if "linked_contact_groups" in values:
            ret["linked_contact_groups"] = [x.id for x in self.linked_contact_groups.all().only("id")]
        if "scheduling_interval" in values:
            ret["scheduling_interval"] = self.scheduling_interval.interval if self.scheduling_interval else ""
        if "scheduling_period" in values:
            ret["scheduling_period"] = self.scheduling_period_id if self.scheduling_period else ""
        if "notification_period" in values:
            ret["notification_period"] = self.notification_period_id if self.notification_period else ""
        if "comment" in values:
            ret["comment"] = self.comment if self.comment else ""
        if "variables" in values:
            ret["variables"] = dict(ChainMap(*[x.to_dict() for x in self.variables.all()][::-1]))
        return ret

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.name == "":
            raise ValueError("Name of a HostTemplate can not be \"\"")
        super(HostTemplate, self).save(force_insert=force_insert, force_update=force_update, using=using,
                                       update_fields=update_fields)


class Host(models.Model):
    """This class represents a host"""
    name = CharField(max_length=255, unique=True)
    address = CharField(default="", max_length=255, blank=True, null=True)
    linked_proxy = ForeignKey(Proxy, on_delete=models.CASCADE)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    disabled = BooleanField(default=False, blank=True, null=True)
    host_templates = ManyToManyField(OrderedListItem, blank=True)
    linked_contacts = ManyToManyField(Contact, blank=True)
    linked_contact_groups = ManyToManyField(ContactGroup, blank=True)
    scheduling_interval = ForeignKey(SchedulingInterval, on_delete=models.DO_NOTHING, blank=True, null=True)
    scheduling_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="scheduling_h"
    )
    notification_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="notification_h"
    )
    comment = CharField(default="", max_length=1024, blank=True, null=True)
    variables = GenericRelation("GenericKVP")

    allowed_values = [
        "name", "address", "linked_proxy", "linked_check", "disabled", "host_templates", "linked_contacts",
        "linked_contact_groups", "scheduling_interval", "scheduling_period", "notification_period", "comment",
        "variables"
    ]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "address" in values:
            ret["address"] = self.address if self.address else ""
        if "linked_proxy" in values:
            ret["linked_proxy"] = self.linked_proxy_id
        if "linked_check" in values:
            ret["linked_check"] = self.linked_check_id if self.linked_check else ""
        if "disabled" in values:
            ret["disabled"] = self.disabled
        if "host_templates" in values:
            hts = [(x.object_id, x.index) for x in self.host_templates.all()]
            hts.sort(key=lambda x: x[1])
            ret["host_templates"] = [x[0] for x in hts]
        if "linked_contacts" in values:
            ret["linked_contacts"] = [x.id for x in self.linked_contacts.all().only("id")]
        if "linked_contact_groups" in values:
            ret["linked_contact_groups"] = [x.id for x in self.linked_contact_groups.all().only("id")]
        if "scheduling_interval" in values:
            ret["scheduling_interval"] = self.scheduling_interval.interval if self.scheduling_interval else ""
        if "scheduling_period" in values:
            ret["scheduling_period"] = self.scheduling_period_id if self.scheduling_period else ""
        if "notification_period" in values:
            ret["notification_period"] = self.notification_period_id if self.notification_period else ""
        if "comment" in values:
            ret["comment"] = self.comment if self.comment else ""
        if "variables" in values:
            ret["variables"] = dict(ChainMap(*[x.to_dict() for x in self.variables.all()][::-1]))
        return ret

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.name == "":
            raise ValueError("Name of a Host can not be \"\"")
        super(Host, self).save(force_insert=force_insert, force_update=force_update, using=using,
                               update_fields=update_fields)


class ObservableTemplate(models.Model):
    """This class represents a template for an observable"""
    name = CharField(default="", max_length=255, unique=True)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    observable_templates = ManyToManyField(OrderedListItem, blank=True)
    linked_contacts = ManyToManyField(Contact, blank=True)
    linked_contact_groups = ManyToManyField(ContactGroup, blank=True)
    scheduling_interval = ForeignKey(SchedulingInterval, on_delete=models.DO_NOTHING, blank=True, null=True)
    scheduling_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="scheduling_ot"
    )
    notification_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="notification_ot"
    )
    comment = CharField(default="", max_length=1024, blank=True, null=True)
    variables = GenericRelation("GenericKVP")

    allowed_values = [
        "name", "linked_check", "observable_templates", "linked_contacts", "linked_contact_groups",
        "scheduling_interval", "scheduling_period", "notification_period", "comment", "variables"
    ]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "linked_check" in values:
            ret["linked_check"] = self.linked_check_id if self.linked_check else ""
        if "observable_templates" in values:
            ots = [(x.object_id, x.index) for x in self.observable_templates.all()]
            ots.sort(key=lambda x: x[1])
            ret["observable_templates"] = [x[0] for x in ots]
        if "linked_contacts" in values:
            ret["linked_contacts"] = [x.id for x in self.linked_contacts.all().only("id")]
        if "linked_contact_groups" in values:
            ret["linked_contact_groups"] = [x.id for x in self.linked_contact_groups.all().only("id")]
        if "scheduling_interval" in values:
            ret["scheduling_interval"] = self.scheduling_interval.interval if self.scheduling_interval else ""
        if "scheduling_period" in values:
            ret["scheduling_period"] = self.scheduling_period_id if self.scheduling_period else ""
        if "notification_period" in values:
            ret["notification_period"] = self.notification_period_id if self.notification_period else ""
        if "comment" in values:
            ret["comment"] = self.comment if self.comment else ""
        if "variables" in values:
            ret["variables"] = dict(ChainMap(*[x.to_dict() for x in self.variables.all()][::-1]))
        return ret

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if self.name == "":
            raise ValueError("Name of a ObservableTemplate can not be \"\"")
        super(ObservableTemplate, self).save(force_insert=force_insert, force_update=force_update, using=using,
                                             update_fields=update_fields)


class Observable(models.Model):
    """This class represents an Observable"""
    name = CharField(default="", max_length=255)
    linked_proxy = ForeignKey(Proxy, on_delete=models.CASCADE)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    linked_host = ForeignKey(Host, on_delete=models.CASCADE)
    disabled = BooleanField(default=False, blank=True, null=True)
    observable_templates = ManyToManyField(OrderedListItem, blank=True)
    linked_contacts = ManyToManyField(Contact, blank=True)
    linked_contact_groups = ManyToManyField(ContactGroup, blank=True)
    scheduling_interval = ForeignKey(SchedulingInterval, on_delete=models.DO_NOTHING, blank=True, null=True)
    scheduling_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="scheduling"
    )
    notification_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="notification"
    )
    comment = CharField(default="", max_length=1024, blank=True, null=True)
    variables = GenericRelation("GenericKVP")

    allowed_values = [
        "name", "linked_proxy", "linked_check", "linked_host", "disabled", "observable_templates", "linked_contacts",
        "linked_contact_groups", "scheduling_interval", "scheduling_period", "notification_period", "comment",
        "variables"
    ]

    def __str__(self):
        return self.name

    def to_dict(self, values: List = None):
        values = values if values is not None else self.allowed_values
        ret = {
            "id": self.id
        }
        if "name" in values:
            ret["name"] = self.name
        if "linked_proxy" in values:
            ret["linked_proxy"] = self.linked_proxy_id
        if "linked_check" in values:
            ret["linked_check"] = self.linked_check_id if self.linked_check else ""
        if "linked_host" in values:
            ret["linked_host"] = self.linked_host_id
        if "disabled" in values:
            ret["disabled"] = self.disabled
        if "observable_templates" in values:
            ots = [(x.object_id, x.index) for x in self.observable_templates.all()]
            ots.sort(key=lambda x: x[1])
            ret["observable_templates"] = [x[0] for x in ots]
        if "linked_contacts" in values:
            ret["linked_contacts"] = [x.id for x in self.linked_contacts.all().only("id")]
        if "linked_contact_groups" in values:
            ret["linked_contact_groups"] = [x.id for x in self.linked_contact_groups.all().only("id")]
        if "scheduling_interval" in values:
            ret["scheduling_interval"] = self.scheduling_interval.interval if self.scheduling_interval else ""
        if "scheduling_period" in values:
            ret["scheduling_period"] = self.scheduling_period_id if self.scheduling_interval else ""
        if "notification_period" in values:
            ret["notification_period"] = self.notification_period_id if self.notification_period else ""
        if "comment" in values:
            ret["comment"] = self.comment if self.comment else ""
        if "variables" in values:
            ret["variables"] = dict(ChainMap(*[x.to_dict() for x in self.variables.all()][::-1]))
        return ret


class Label(models.Model):
    label = CharField(default="", max_length=255, unique=True, blank=True)

    def __str__(self):
        return self.label


class GenericKVP(models.Model):
    """This class represents variables.

    To access, use .key and .value
    """
    key = ForeignKey(Label, on_delete=models.CASCADE, related_name="key")
    value = ForeignKey(Label, on_delete=models.CASCADE, related_name="value")
    referent = GenericForeignKey('content_type', 'object_id')
    content_type = ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = PositiveIntegerField()

    def __str__(self):
        return f"{self.referent} - {self.key}: {self.value}"

    def to_dict(self):
        return {self.key.label: self.value.label}


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
    """This model represents a user in Q"""
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


class ScheduledObject(models.Model):
    """This object is the representation of a scheduled object like an observable or a host.

    It links to its declaration origins as well as the measurement the data can be found.
    """
    measurement = CharField(default="", unique=True, max_length=255)

    referent = GenericForeignKey('content_type', 'object_id')
    content_type = ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = PositiveIntegerField()
