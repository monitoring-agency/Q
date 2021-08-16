import json
import logging
import os

import httpx
from django.http import JsonResponse
from django.views import View

from api.models import CheckResultModel
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
        with open(settings.DECLARATION_PATH, "w") as fh:
            json.dump(decoded, fh, indent=2)
            logger.info("Wrote declaration")
        os.system("sudo /bin/systemctl restart q-scheduler.service")
        return JsonResponse({"success": True})


class SubmitResultView(View):
    def post(self, request, *args, **kwargs):
        try:
            decoded = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "JSON decode error"})
        try:
            httpx.post(f"",timeout=3)
        except httpx.ConnectTimeout:
            logger.warning(f"Could not reach q-web, saving to backlog")
            CheckResultModel.objects.create(json.dumps(decoded))

