from django.urls import path

import api.views
from description import models
from frontend.views import *

urlpatterns = [
    path("login", Login.as_view()),
    path("logout", Logout.as_view()),
    path("", DashboardView.as_view()),
    # Model specific views that can use the API are added with the function below
]


def generate_url_paths(api_class, model_class, extended_params=None, callback_list=None):
    name = model_class.__name__.lower()
    params = {
        "api_class": api_class,
        "model_class": model_class,
        "extended_params": extended_params if extended_params else {},
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
generate_url_paths(
    api.views.MetricTemplateView, models.MetricTemplate,
    {
        "checks": models.Check.objects.all(),
        "time_periods": models.TimePeriod.objects.all(),
     }
)
generate_url_paths(
    api.views.HostTemplateView, models.HostTemplate,
    {
        "checks": models.Check.objects.all(),
        "time_periods": models.TimePeriod.objects.all()
    }
)


def correct_request(params, model_class, sid=""):
    if "disabled" in params:
        params["disabled"] = True
    else:
        params["disabled"] = False


generate_url_paths(
    api.views.HostView, models.Host,
    {
        "checks": models.Check.objects.all(),
        "time_periods": models.TimePeriod.objects.all(),
        "proxies": models.Proxy.objects.all()
    },
    [correct_request]
)
generate_url_paths(
    api.views.MetricView, models.Metric,
    {
        "checks": models.Check.objects.all(),
        "time_periods": models.TimePeriod.objects.all(),
        "proxies": models.Proxy.objects.all(),
        "hosts": models.Host.objects.all()
    },
    [correct_request]
)
generate_url_paths(
    api.views.ContactView, models.Contact,
    {
        "time_periods": models.TimePeriod.objects.all(),
        "checks": models.Check.objects.all(),
    }
)
generate_url_paths(
    api.views.ContactGroupView, models.ContactGroup,
    {
        "contacts": models.Contact.objects.all()
    }
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


generate_url_paths(
    api.views.TimePeriodView, models.TimePeriod,
    {
        "days": models.Day.objects.all(),
    },
    [fix_time_periods]
)
