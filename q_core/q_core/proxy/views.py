import base64
import json
import logging

from django.core.handlers.wsgi import WSGIRequest
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

import rc_protocol

from api.models import Proxy

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, "dispatch")
class AuthenticationView(View):

    def _check_auth(self, request: WSGIRequest):
        # Check Authorization Header
        if "HTTP_AUTHENTICATION" not in request.META:
            return JsonResponse({"success": False, "message": "No authentication header is given"}, status=401)
        auth = request.META["HTTP_AUTHENTICATION"]
        decoded = base64.urlsafe_b64decode(auth).decode("utf-8")
        proxy_id = decoded.split(":")[0]
        checksum = decoded.split(":")[1]
        try:
            if not Proxy.objects.filter(disabled=False, id=proxy_id).exists():
                return JsonResponse(
                    {"success": False, "message": f"Proxy with id {proxy_id} does not exist or is disabled"},
                    status=403
                )
            proxy = Proxy.objects.get(id=proxy_id)

            # Only POST and PUT have a body to decode
            if request.META["REQUEST_METHOD"] == "POST" or request.META["REQUEST_METHOD"] == "PUT":
                # Decode json
                try:
                    # If request.body is None or an empty string, json.loads fails
                    decoded = json.loads(request.body if request.body else "{}")
                except json.JSONDecodeError:
                    return {"success": False, "message": "Json could not be decoded", "status": 400}
            elif request.META["REQUEST_METHOD"] == "GET" or request.META["REQUEST_METHOD"] == "DELETE":
                # Set decoded to urlencoded parameters
                decoded = request.GET

            if not rc_protocol.validate_checksum(
                request=decoded,
                checksum=checksum,
                shared_secret=proxy.web_secret,
                salt=request.path.split("/")[-1],
                use_time_component=True
            ):
                return JsonResponse(
                    {"success": False, "message": f"Checksum test failed"},
                    status=403
                )

        except Proxy.DoesNotExist:
            # Proxy should exist as the if above should check this
            return JsonResponse(
                {"success": False, "message": f"Could not retrieve proxy with id {proxy_id}"},
                status=500
            )
        return proxy_id, decoded

    def get(self, request, *args, **kwargs):
        ret = self._check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        return self.save_get(request, ret[0], ret[1], *args, **kwargs)

    def post(self, request, *args, **kwargs):
        ret = self._check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        return self.save_post(request, ret[0], ret[1], *args, **kwargs)

    def put(self, request, *args, **kwargs):
        ret = self._check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        return self.save_put(request, ret[0], ret[1], *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        ret = self._check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        return self.save_delete(request, ret[0], ret[1], *args, **kwargs)

    def save_get(self, request, proxy_id, decoded, *args, **kwargs):
        return NotImplemented

    def save_post(self, request, proxy_id, decoded, *args, **kwargs):
        return NotImplemented

    def save_put(self, request, proxy_id, decoded, *args, **kwargs):
        return NotImplemented

    def save_delete(self, request, proxy_id, decoded, *args, **kwargs):
        return NotImplemented
