from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import CharField, ForeignKey, ManyToManyField, PositiveIntegerField, BooleanField


class SchedulingInterval(models.Model):
    """Scheduling Interval. The value is interpreted in seconds.

    """
    interval = models.PositiveIntegerField(default=350)

    def __str__(self):
        return str(self.interval)


class Day(models.Model):
    """Day of the weak. Quite simple."""
    name = CharField(default="", max_length=16, unique=True)

    def __str__(self):
        return self.name


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
            raise ValueError("Starttime has to be Stoptime")
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

    def __str__(self):
        return self.name


class CheckType(models.Model):
    name = CharField(default="", max_length=255, unique=True)

    def __str__(self):
        return self.name


class Check(models.Model):
    name = CharField(default="", max_length=255, unique=True)
    cmd = CharField(default="", max_length=1024, blank=True, null=True)
    check_type = ForeignKey(CheckType, on_delete=models.DO_NOTHING, blank=True, null=True)

    def __str__(self):
        return self.name


class HostTemplate(models.Model):
    name = CharField(default="", max_length=255, unique=True)
    address = CharField(default="", max_length=255, blank=True, null=True)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    host_templates = ManyToManyField("self", blank=True)
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
    kvp = GenericRelation("GenericKVP")

    def __str__(self):
        return self.name


class Host(models.Model):
    name = CharField(default="", max_length=255, unique=True)
    address = CharField(default="", max_length=255, blank=True, null=True)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    disabled = BooleanField(default=False, blank=True, null=True)
    host_templates = ManyToManyField(HostTemplate, blank=True)
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
    kvp = GenericRelation("GenericKVP")

    def __str__(self):
        return self.name


class MetricTemplate(models.Model):
    name = CharField(default="", max_length=255)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    linked_host = ForeignKey(Host, on_delete=models.CASCADE)
    metric_template = ManyToManyField("self", blank=True)
    scheduling_interval = ForeignKey(SchedulingInterval, on_delete=models.DO_NOTHING, blank=True, null=True)
    scheduling_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="scheduling_mt"
    )
    notification_period = ForeignKey(
        TimePeriod, on_delete=models.DO_NOTHING,
        blank=True, null=True,
        related_name="notification_mt"
    )
    kvp = GenericRelation("GenericKVP")

    def __str__(self):
        return self.name


class Metric(models.Model):
    name = CharField(default="", max_length=255)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    linked_host = ForeignKey(Host, on_delete=models.CASCADE)
    disabled = BooleanField(default=False, blank=True, null=True)
    metric_template = ManyToManyField(MetricTemplate, blank=True)
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
    kvp = GenericRelation("GenericKVP")

    def __str__(self):
        return self.name


class Label(models.Model):
    label = CharField(default="", max_length=255, unique=True, blank=True)

    def __str__(self):
        return self.label


class GenericKVP(models.Model):
    key = ForeignKey(Label, on_delete=models.CASCADE, related_name="key")
    value = ForeignKey(Label, on_delete=models.CASCADE, related_name="value")
    referent = GenericForeignKey('content_type', 'object_id')
    content_type = ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = PositiveIntegerField()

    def __str__(self):
        return f"{self.referent} - {self.key}: {self.value}"
