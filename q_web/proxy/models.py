from django.db.models import Model, CharField, DateTimeField, FloatField, IntegerField, ManyToManyField


class DataModel(Model):
    value = FloatField(default=0)


class CheckResult(Model):
    stdout = CharField(default="", max_length=8192)
    return_code = IntegerField(default=-1)
    linked_data = ManyToManyField(DataModel, blank=True)
    linked_object = IntegerField(default=0)
    linked_object_type = IntegerField(default=0)
    meta_process_time = DateTimeField()
    meta_process_execution_time = FloatField()
