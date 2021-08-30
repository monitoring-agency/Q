import base64
import datetime
import json
import logging

from django.contrib.contenttypes.models import ContentType
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from description.models import Proxy, Host, Metric
from proxy.models import CheckResult, CheckState, DataSet, ScheduledObject

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, "dispatch")
class AuthenticationView(View):

    def _check_auth(self, request):
        # Check Authorization Header
        if "HTTP_AUTHENTICATION" not in request.META:
            return JsonResponse({"success": False, "message": "No authentication header is given"}, status=401)
        auth = request.META["HTTP_AUTHENTICATION"]
        decoded = base64.urlsafe_b64decode(auth).decode("utf-8")
        proxy_id = decoded.split(":")[0]
        proxy_secret = decoded.split(":")[1]
        try:
            if not Proxy.objects.filter(disabled=False, id=proxy_id).exists():
                return JsonResponse(
                    {"success": False, "message": f"Proxy with id {proxy_id} does not exist or is disabled"},
                    status=403
                )
            proxy = Proxy.objects.get(id=proxy_id)
            if not proxy.web_secret == proxy_secret:
                return JsonResponse({"success": False, "message": "Secret is incorrect"}, status=403)
        except Proxy.DoesNotExist:
            # Proxy should exist as the if above should check this
            return JsonResponse(
                {"success": False, "message": f"Could not retrieve proxy with id {proxy_id}"},
                status=500
            )

    def get(self, request, *args, **kwargs):
        ret = self._check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        return self.save_get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        ret = self._check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        return self.save_post(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        ret = self._check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        return self.save_put(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        ret = self._check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        return self.save_delete(request, *args, **kwargs)

    def save_get(self, request, *args, **kwargs):
        return NotImplemented

    def save_post(self, request, *args, **kwargs):
        return NotImplemented

    def save_put(self, request, *args, **kwargs):
        return NotImplemented

    def save_delete(self, request, *args, **kwargs):
        return NotImplemented


class SubmitView(AuthenticationView):
    def __init__(self):
        super(SubmitView, self).__init__()

    def save_post(self, request, *args, **kwargs):
        try:
            decoded = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Json could not be decoded"}, status=400)
        logger.debug(f"Retrieved CheckResult: {decoded}")
        try:
            state = CheckState.objects.get(state=decoded["state"])
        except CheckState.DoesNotExist:
            return JsonResponse(
                {"success": False, "message": f"CheckState {decoded['state']} is not valid"},
                status=400
            )
        try:
            if decoded["context"] == "host":
                content_type = ContentType.objects.get_for_model(Host)
            elif decoded["context"] == "metric":
                content_type = ContentType.objects.get_for_model(Metric)
            else:
                return JsonResponse({"success": False, "message": "Context is not in ['host', 'metric']"}, status=400)
            scheduled_object = ScheduledObject.objects.get(object_id=decoded["object_id"], content_type=content_type)
            cr = CheckResult.objects.create(
                state=state,
                output=decoded["output"],
                meta_process_execution_time=decoded["meta"]["process_execution_time"],
                meta_process_end_time=datetime.datetime.fromtimestamp(decoded["meta"]["process_end_time"])
            )
            for x in decoded["datasets"]:
                ds, _ = DataSet.objects.get_or_create(name=x["name"], value=x["value"])
                cr.data_sets.add(ds)
            cr.save()
            scheduled_object.linked_check_results.add(cr)
            scheduled_object.save()
        except ScheduledObject.DoesNotExist:
            return JsonResponse(
                {
                    "success": False,
                    "message": f"Object with id {decoded['object_id']} does not exist"
                },
                status=400
            )
        return JsonResponse({"success": True})
