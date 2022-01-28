import json
import logging
from datetime import datetime, timedelta

from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.contenttypes.models import ContentType
from django.http import JsonResponse
from django.middleware import csrf
from django.shortcuts import render, redirect
from django.views import View
from django.views.generic import TemplateView

from api import views
from description.models import Host, Metric
from proxy.models import ScheduledObject, CheckResult

logger = logging.getLogger(__name__)


class Login(LoginView):
    template_name = "auth/login.html"
    success_url = "/"


class Logout(LoginRequiredMixin, LogoutView):
    template_name = ""


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/dashboard.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class HostDashboardView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/host_dashboard.html"

    def get(self, request, *args, **kwargs):
        content_type = ContentType.objects.get_for_model(Host)
        host_status_objects = ScheduledObject.objects.filter(content_type=content_type)
        host_status = []
        for x in host_status_objects:
            last_timestamp = 0
            cr = None
            for y in x.linked_check_results.all():
                if y.meta_process_end_time.timestamp() > last_timestamp:
                    cr = y
            x.cr = cr
            x.host = Host.objects.get(id=x.object_id)
            x.datasets = True if cr and len(cr.data_sets.all()) > 0 else False
            host_status.append(x)

        return render(request, self.template_name, {"host_status": host_status})


class HostGraphView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/host_graph_dashboard.html"

    def get(self, request, sid="", *args, **kwargs):
        last_6_hours = datetime.utcnow() - timedelta(hours=6)
        check_results = CheckResult.objects.filter(scheduledobject__in=[sid], meta_process_end_time__gte=last_6_hours)
        data_sets = {}
        for x in check_results:
            if x.data_sets.exists():
                for y in x.data_sets.all():
                    if y.name not in data_sets:
                        data_sets[y.name] = []
                    data_sets[y.name].append({"label": x.meta_process_end_time, "value": y.value})
        return render(request, self.template_name, {"datasets": data_sets})


class MetricDashboardView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/metric_dashboard.html"

    def get(self, request, *args, **kwargs):
        content_type = ContentType.objects.get_for_model(Metric)
        metric_status_objects = ScheduledObject.objects.filter(content_type=content_type)
        metric_status = []
        for x in metric_status_objects:
            last_timestamp = 0
            cr = None
            for y in x.linked_check_results.all():
                if y.meta_process_end_time.timestamp() > last_timestamp:
                    cr = y
            x.cr = cr
            x.metric = Metric.objects.get(id=x.object_id)
            x.datasets = True if cr and len(cr.data_sets.all()) > 0 else False
            metric_status.append(x)

        return render(request, self.template_name, {"metric_status": metric_status})


#
# Templates for model specific classes which can call the API for creation, updating and deletion
#
class DeclarationTemplateIndex(LoginRequiredMixin, TemplateView):

    def get(self, request, model_class=None, extended_params_callback_list=None, *args, **kwargs):
        template_name = f"declaration/{model_class.__name__.lower()}/index.html"
        entries = [x.to_dict() for x in model_class.objects.all()]
        extended_params = {}
        if extended_params_callback_list:
            for x in extended_params_callback_list:
                extended_params = {**extended_params, **x()}
        return render(request, template_name, {"entries": entries, **extended_params})


class DeclarationTemplateDelete(LoginRequiredMixin, View):
    def post(self, request, sid="", model_class=None, *args, **kwargs):
        try:
            entry = model_class.objects.get(id=sid)
        except model_class.DoesNotExist:
            return redirect(f"/declaration/{model_class.__name__.lower()}/")
        entry.delete()
        return redirect(f"/declaration/{model_class.__name__.lower()}/")


class DeclarationTemplateCreate(LoginRequiredMixin, TemplateView):
    def get(self, request, model_class=None, extended_params_callback_list=None, *args, **kwargs):
        template_name = f"declaration/{model_class.__name__.lower()}/create_or_update.html"
        extended_params = {}
        if extended_params_callback_list:
            for x in extended_params_callback_list:
                extended_params = {**extended_params, **x()}
        return render(request, template_name, extended_params)

    def post(self, request, api_class=None, model_class=None, extended_params_callback_list=None, callback_list=None, *args, **kwargs):
        template_name = f"declaration/{model_class.__name__.lower()}/create_or_update.html"
        params = dict(request.POST)
        for x in params:
            if not len(params[x]) > 1:
                params[x] = params[x][0]
        extended_params = {}
        if extended_params_callback_list:
            for x in extended_params_callback_list:
                extended_params = {**extended_params, **x()}
        if callback_list:
            for x in callback_list:
                x(params, model_class)
        ret = api_class().save_post(params=params)
        if ret.status_code != 200 and ret.status_code != 201:
            return render(
                request, template_name, {"error": json.loads(ret.content)["message"], **extended_params}
            )
        return redirect(f"/declaration/{model_class.__name__.lower()}/")


class DeclarationTemplateUpdate(LoginRequiredMixin, TemplateView):
    def get(self, request, sid="", model_class=None, extended_params_callback_list=None, *args, **kwargs):
        template_name = f"declaration/{model_class.__name__.lower()}/create_or_update.html"
        extended_params = {}
        if extended_params_callback_list:
            for x in extended_params_callback_list:
                extended_params = {**extended_params, **x(sid)}
        try:
            existing = model_class.objects.get(id=sid).to_dict()
        except model_class.DoesNotExist:
            return render(
                request, "lib/error.html",
                {"error_header": f"{model_class.__name__} is not existing", **extended_params}
            )
        return render(request, template_name, {"existing": existing, **extended_params})

    def post(self, request, sid="", api_class=None, model_class=None, extended_params_callback_list=None, callback_list=None, *args, **kwargs):
        template_name = f"declaration/{model_class.__name__.lower()}/create_or_update.html"
        params = dict(request.POST)
        for x in params:
            if not len(params[x]) > 1:
                params[x] = params[x][0]
        extended_params = {}
        if extended_params_callback_list:
            for x in extended_params_callback_list:
                extended_params = {**extended_params, **x(sid)}
        if callback_list:
            for x in callback_list:
                x(params, model_class, sid)
        ret = api_class().save_put(params=params, sid=sid)
        if ret.status_code != 200:
            return render(request, template_name, {"error": json.loads(ret.content)["message"]}, **extended_params)
        return redirect(f"/declaration/{model_class.__name__.lower()}/")


#
# Specific views for declaration
#
class UpdateDeclarationView(LoginRequiredMixin, View):
    def post(self, request, sid="", *args, **kwargs):
        ret = views.UpdateDeclarationView().cleaned_post({"proxies": [sid]})
        return ret


class GenerateConfigurationView(LoginRequiredMixin, View):
    def post(self, request, sid="", *args, **kwargs):
        ret = views.GenerateProxyConfigurationView().cleaned_post({"proxy": sid})
        return ret


class React(TemplateView):
    template_name = "newBase.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

