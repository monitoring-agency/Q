from collections import ChainMap

from django.urls import path

import api.views
from description import models
from frontend.views import *

urlpatterns = [
    path("login", Login.as_view()),
    path("logout", Logout.as_view()),

    path("", DashboardView.as_view()),

    path("declaration/proxy/<str:sid>/updateDeclaration", UpdateDeclarationView.as_view()),
    path("declaration/proxy/<str:sid>/generateConfiguration", GenerateConfigurationView.as_view()),
    # Model specific views that can use the API are added with the function below
]


def generate_url_paths(api_class, model_class, extended_params_callback_list=None, callback_list=None):
    name = model_class.__name__.lower()
    params = {
        "api_class": api_class,
        "model_class": model_class,
        "extended_params_callback_list": extended_params_callback_list if extended_params_callback_list else [],
        "callback_list": callback_list if callback_list else []
    }
    [urlpatterns.append(x) for x in [
        path(f"declaration/{name}/", DeclarationTemplateIndex.as_view(), params),
        path(f"declaration/{name}/create", DeclarationTemplateCreate.as_view(), params),
        path(f"declaration/{name}/update/<str:sid>", DeclarationTemplateUpdate.as_view(), params),
        path(f"declaration/{name}/delete/<str:sid>", DeclarationTemplateDelete.as_view(), params),
    ]]


generate_url_paths(
    api.views.GlobalVariableView, models.GlobalVariable
)
generate_url_paths(
    api.views.CheckView, models.Check
)


def metric_template_callback():
    return {
        "checks": models.Check.objects.all(),
        "time_periods": models.TimePeriod.objects.all(),
        "metric_templates": models.MetricTemplate.objects.all(),
     }


def correct_metric_template(params, model_class, sid=""):
    if "metric_templates" not in params:
        params["metric_templates"] = ""


generate_url_paths(
    api.views.MetricTemplateView, models.MetricTemplate,
    [metric_template_callback],
    [correct_metric_template]
)


def host_template_callback():
    return {
        "checks": models.Check.objects.all(),
        "time_periods": models.TimePeriod.objects.all(),
        "host_templates": models.HostTemplate.objects.all(),
    }


def correct_host_template(params, model_class, sid=""):
    if "host_templates" not in params:
        params["host_templates"] = ""


generate_url_paths(
    api.views.HostTemplateView, models.HostTemplate,
    [host_template_callback],
    [correct_host_template]
)


def correct_request(params, model_class, sid=""):
    if "disabled" in params:
        params["disabled"] = True
    else:
        params["disabled"] = False
    if "host_templates" in params:
        if not params["host_templates"]:
            params["host_templates"] = ""
    else:
        params["host_templates"] = ""
    if "metric_templates" not in params:
        params["metric_templates"] = ""


def host_callback():
    return {
        "checks": models.Check.objects.all(),
        "time_periods": models.TimePeriod.objects.all(),
        "proxies": models.Proxy.objects.all(),
        "host_templates": models.HostTemplate.objects.all(),
    }


generate_url_paths(
    api.views.HostView, models.Host,
    [host_callback],
    [correct_request]
)


def metric_callback():
    hosts = models.Host.objects.all()
    return {
        "checks": models.Check.objects.all(),
        "time_periods": models.TimePeriod.objects.all(),
        "proxies": models.Proxy.objects.all(),
        "hosts": hosts,
        "hosts_dict": dict(ChainMap(*[{x.id: x} for x in hosts])),
        "metric_templates": models.MetricTemplate.objects.all(),
    }


generate_url_paths(
    api.views.MetricView, models.Metric,
    [metric_callback],
    [correct_request]
)


def contact_callback():
    return {
        "time_periods": models.TimePeriod.objects.all(),
        "checks": models.Check.objects.all(),
    }


generate_url_paths(
    api.views.ContactView, models.Contact,
    [contact_callback]
)


def contact_group_callback():
    return {
        "contacts": models.Contact.objects.all()
    }


def correct_contact_group(params, model_class, sid=""):
    if "linked_contacts" not in params:
        params["linked_contacts"] = ""


generate_url_paths(
    api.views.ContactGroupView, models.ContactGroup,
    [contact_group_callback],
    [correct_contact_group]
)


def fix_time_periods(params, model_class, sid=""):
    days = models.Day.objects.all()
    time_periods = {}
    for d in days:
        time_periods[d.name] = []
        for item in params:
            if item.startswith(str(d.id)) and item.endswith("_end") and params[item]:
                start_item = item[0:-3] + "start"
                if params[item] == "00:00":
                    params[item] = "24:00"
                if start_item in params:
                    if params[start_item]:
                        time_periods[d.name].append({"start_time": params[start_item].replace(":", ""), "stop_time": params[item].replace(":", "")})

    for day in time_periods:
        if len(time_periods[day]) == 0:
            time_periods[day] = [{"start_time": "", "stop_time": ""}]
    params["time_periods"] = time_periods


def time_period_callback():
    return {
        "days": models.Day.objects.all(),
    }


generate_url_paths(
    api.views.TimePeriodView, models.TimePeriod,
    [time_period_callback],
    [fix_time_periods]
)


def proxy_callback():
    return {
        "proxies": models.Proxy.objects.all()
    }


generate_url_paths(
    api.views.ProxyView, models.Proxy,
    [proxy_callback],
    [correct_request]
)
