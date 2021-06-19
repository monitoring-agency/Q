from django.db import models
from django.db.models import CharField, ForeignKey


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


class Metric(models.Model):
    name = CharField(default="", max_length=255, unique=True)
    linked_check = ForeignKey(Check, on_delete=models.DO_NOTHING, blank=True, null=True)

    def __str__(self):
        return self.name
