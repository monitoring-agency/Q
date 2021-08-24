from django.db.models import Model, CharField, DateTimeField, FloatField, ManyToManyField, ForeignKey, CASCADE


class DataSet(Model):
    name = CharField(default="", max_length=255)
    value = FloatField(default=0)


class CheckState(Model):
    state = CharField(default="", max_length=255)


class CheckResult(Model):
    output = CharField(default="", max_length=8192)
    state = ForeignKey(CheckState, on_delete=CASCADE, null=True)
    meta_process_end_time = DateTimeField()
    meta_process_execution_time = FloatField(default=0)
    data_sets = ManyToManyField(DataSet)
