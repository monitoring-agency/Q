from django.contrib import admin

from description.models import *


@admin.register(SchedulingInterval)
class SchedulingIntervalAdmin(admin.ModelAdmin):
    list_display = ("__str__", "interval")


@admin.register(CheckType)
class CheckTypeAdmin(admin.ModelAdmin):
    list_display = ("__str__", "name")


@admin.register(Check)
class CheckAdmin(admin.ModelAdmin):
    list_display = ("__str__", "name", "check_type")


@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display = ("linked_host", "__str__",)


@admin.register(Period)
class PeriodAdmin(admin.ModelAdmin):
    list_display = ("start_time", "stop_time")


@admin.register(DayTimePeriod)
class DayTimePeriodAdmin(admin.ModelAdmin):
    list_display = ("__str__",)


@admin.register(TimePeriod)
class TimePeriodAdmin(admin.ModelAdmin):
    list_display = ("__str__",)


@admin.register(Host)
class HostAdmin(admin.ModelAdmin):
    list_display = ("__str__",)


@admin.register(MetricTemplate)
class MetricTemplateAdmin(admin.ModelAdmin):
    list_display = ("__str__",)


@admin.register(HostTemplate)
class HostTemplateAdmin(admin.ModelAdmin):
    list_display = ("__str__",)


@admin.register(GlobalVariable)
class GlobalVariableAdmin(admin.ModelAdmin):
    list_display = ("__str__",)


@admin.register(Proxy)
class ProxyAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "port")


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "mail", "comment")


@admin.register(ContactGroup)
class ContactGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "comment",)
