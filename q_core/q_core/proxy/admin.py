from django.contrib import admin


from proxy.models import *


@admin.register(ScheduledObject)
class ScheduledObjectAdmin(admin.ModelAdmin):
    pass


@admin.register(CheckResult)
class CheckResultAdmin(admin.ModelAdmin):
    list_display = ("state", "meta_process_end_time")


@admin.register(DataSet)
class DataSetAdmin(admin.ModelAdmin):
    list_display = ("name", "value")
