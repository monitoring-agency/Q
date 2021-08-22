import json
import logging
import os

import httpx
from django.http import JsonResponse
from django.views import View

from api.models import CheckResultModel, ConfigurationModel
from q_proxy import settings

logger = logging.getLogger(__name__)


class UpdateDeclarationView(View):
    def post(self, request, *args, **kwargs):
        try:
            decoded = json.loads(request.body)
        except json.JSONDecodeError:
            logger.error(f"Json could not be decoded: {request.body}")
            return JsonResponse(
                {"success": False, "message": "Json could not be decoded"}, status=400
            )
        logger.debug(f"Got /updateDeclaration: {decoded}")
        if "web_address" in decoded and "web_port" in decoded:
            if len(ConfigurationModel.objects.all()) > 0:
                c = ConfigurationModel.objects.first()
                c.web_address = decoded["web_address"]
                c.web_port = decoded["web_port"]
                c.save()
            else:
                ConfigurationModel.objects.create(web_address=decoded["web_address"], web_port=decoded["web_port"])

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
            httpx.post(
                f"https://{c.web_address}:{c.web_port}/proxy/api/v1/submit", timeout=3, json=decoded,
                cert=("/var/lib/q/certs/q-proxy-fullchain.pem", "/var/lib/q/certs/q-proxy-privkey.pem")
            )
        except httpx.ConnectTimeout or ConfigurationModel.DoesNotExist:
            logger.warning(f"Could not reach q-web, saving to backlog")
            CheckResultModel.objects.create(json=json.dumps(decoded))
            return JsonResponse({"success": True, "message": "Data was saved to backlog"})
        return JsonResponse({"success": True})
