import base64
import json
from datetime import datetime

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from description.models import Proxy
from proxy.models import DataModel, CheckResult


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

        if "stdout" not in decoded:
            return JsonResponse({"success": False, "message": "stdout not in json"}, status=400)
        if "return_code" not in decoded:
            return JsonResponse({"success": False, "message": "return_code not in json"}, status=400)
        if "meta" not in decoded:
            return JsonResponse({"success": False, "message": "meta not in json"}, status=400)
        if "process_time" not in decoded["meta"]:
            return JsonResponse({"success": False, "message": "process_time not in meta"}, status=400)
        if "process_execution_time" not in decoded["meta"]:
            return JsonResponse({"success": False, "message": "process_execution_time not in meta"}, status=400)
        if "data" not in decoded:
            return JsonResponse({"success": False, "message": "data not in json"}, status=400)

        cr = CheckResult.objects.create(
            stdout=decoded["stdout"], return_code=decoded["return_code"],
            meta_process_time=datetime.fromtimestamp(decoded["meta"]["process_time"]),
            meta_process_execution_time=decoded["meta"]["process_execution_time"]
        )
        for d in decoded["data"]:
            dm, _ = DataModel.objects.get_or_create(value=d)
            cr.linked_data.add(dm)
        cr.save()

        return JsonResponse({"success": True})
