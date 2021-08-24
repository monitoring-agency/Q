import base64
import json
import logging
import os

import httpx
from django.http import JsonResponse
from django.views import View

from api.models import CheckResultModel, ConfigurationModel
from q_proxy import settings

logger = logging.getLogger(__name__)


def _check_auth(request):
    # Check Authorization Header
    if "HTTP_AUTHENTICATION" not in request.META:
        return JsonResponse({"success": False, "message": "No authentication header is given"}, status=401)
    auth = request.META["HTTP_AUTHENTICATION"]
    secret = base64.urlsafe_b64decode(auth).decode("utf-8")
    try:
        config = ConfigurationModel.objects.first()
    except ConfigurationModel.DoesNotExist:
        return JsonResponse({"success": False, "message": "Configuration is incomplete"}, status=500)
    if config.secret != secret:
        return JsonResponse({"success": False, "message": "Authentication Header was incorrect"}, status=403)


class UpdateDeclarationView(View):
    def post(self, request, *args, **kwargs):
        ret = _check_auth(request)
        if isinstance(ret, JsonResponse):
            return ret
        try:
            decoded = json.loads(request.body)
        except json.JSONDecodeError:
            logger.error(f"Json could not be decoded: {request.body}")
            return JsonResponse(
                {"success": False, "message": "Json could not be decoded"}, status=400
            )
        logger.debug(f"Got /updateDeclaration: {decoded}")
        with open(settings.DECLARATION_PATH, "w") as fh:
            json.dump(decoded, fh, indent=2)
            logger.info("Wrote declaration")
        os.system("sudo /bin/systemctl restart q-scheduler.service")
        return JsonResponse({"success": True})


class SubmitView(View):
    def post(self, request, *args, **kwargs):
        try:
            decoded = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "JSON decode error"})
        try:
            if len(ConfigurationModel.objects.all()) == 0:
                logger.warning(f"No Configuration found in database, saving to backlog")
                CheckResultModel.objects.create(json=json.dumps(decoded))
                return JsonResponse({"success": True, "message": "Data was saved to backlog"})
            c = ConfigurationModel.objects.first()
            ret = httpx.post(
                f"https://{c.web_address}:{c.web_port}/proxy/api/v1/submit", timeout=3, json=decoded,
                cert=("/var/lib/q/certs/q-proxy-fullchain.pem", "/var/lib/q/certs/q-proxy-privkey.pem"),
                headers={
                    "Authentication":
                        base64.urlsafe_b64encode(f"{c.proxy_id}:{c.web_secret}".encode("utf-8")).decode("utf-8")
                }
            )
            logger.info(ret.text)
        except httpx.ConnectTimeout or ConfigurationModel.DoesNotExist:
            logger.warning(f"Could not reach q-web, saving to backlog")
            CheckResultModel.objects.create(json=json.dumps(decoded))
            return JsonResponse({"success": True, "message": "Data was saved to backlog"})
        return JsonResponse({"success": True})
