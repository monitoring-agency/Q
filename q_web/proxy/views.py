import json
from datetime import datetime

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from proxy.models import DataModel, CheckResult


@method_decorator(csrf_exempt, "dispatch")
class SubmitView(View):
    def post(self, request, *args, **kwargs):
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
