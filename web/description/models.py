import re

from django.db import models
from django.db.models import CharField, ForeignKey, ManyToManyField


class Variable(models.Model):
    name = CharField(unique=True, max_length=255)
    value = CharField(blank=True, null=True, default="", max_length=1024)

    def __str__(self):
        return self.name

    def validate(self, variable_name: str) -> bool:
        """Validates a given variable.

        To return True, the variable has to be a- and prefixed with '#' and is not allowed to have ' ' in it.

        :param variable_name: Name of the variable
        :type variable_name: str
        :return: Returns True if a valid variable name is given
        :rtype: bool
        """
        if not variable_name.startswith('#') or not variable_name.endswith('#'):
            return False
        if " " in variable_name:
            return False
        return True


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
    start_time = CharField(default="", max_length=4)
    stop_time = CharField(default="", max_length=4)

    def __str__(self):
        return f"{self.start_time}-{self.stop_time}"

    def validate(self, time):
        pattern = re.compile(r"(([01][0-9]|2[0-3])[0-5][0-9]|2400)")
        return pattern.match(time)


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


class Host(models.Model):
    name = CharField(default="", max_length=255, unique=True)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
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

    def __str__(self):
        return self.name


class Metric(models.Model):
    name = CharField(default="", max_length=255)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)
    linked_host = ForeignKey(Host, on_delete=models.CASCADE)
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

    def __str__(self):
        return self.name
