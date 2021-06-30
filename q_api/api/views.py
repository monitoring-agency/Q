import base64
from abc import ABC
from datetime import datetime, timedelta
import json

import django.contrib.auth
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.utils.timezone import make_aware
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from api.models import AccountModel, ACLModel
from description.models import Check, CheckType


@method_decorator(csrf_exempt, "dispatch")
class CheckMixinView(View):
    """Base View for API requests.

    To include required parameters in body or urlencoded, call the super().__init__() with the required parameters.

    :param required_get: List of required parameters. Defaults to [].
    :param required_post:  List of required parameters. Defaults to [].
    :param required_put: List of required parameters. Defaults to [].
    :param required_delete: List of required parameters. Defaults to [].
    """

    def __init__(self, required_get=None, required_post=None, required_put=None, required_delete=None, **kwargs):
        super().__init__(**kwargs)
        self.required_get = required_get if required_get else []
        self.required_post = required_post if required_post else []
        self.required_put = required_put if required_put else []
        self.required_delete = required_delete if required_delete else []

    def _check_auth(self, request, required_params):
        timestamp_now = make_aware(datetime.now()).timestamp()

        # Check Authorization Header
        auth = request.META["HTTP_AUTHENTICATION"]
        decoded = base64.urlsafe_b64decode(auth).decode("utf-8")
        username = decoded.split(":")[0]
        token = decoded.split(":")[1]
        try:
            account = AccountModel.objects.get(internal_user__username=username)
        except AccountModel.DoesNotExist:
            return {"success": False, "message": "Username is incorrect or token expired", "status": 401}
        account_tokens = account.retrieve_tokens()
        if token not in [x.token for x in account_tokens]:
            return {"success": False, "message": "Username is incorrect or token expired", "status": 401}
        for acc_token in account_tokens:
            if token == acc_token.token:
                if not (acc_token.expire - timedelta(hours=2)).timestamp() < timestamp_now < acc_token.expire.timestamp():
                    return {"success": False, "message": "Username is incorrect or token expired", "status": 401}

        # Check ACLs
        for acl in account.linked_acl_group.linked_acls.all():
            if acl.name == f"API:{request.META['REQUEST_METHOD']}:{request.META['PATH_INFO']}":
                if not acl.allow:
                    return {"success": False, "message": "You are not allowed to use this", "status": 403}
                else:
                    break

        # Only POST and PUT have an body to decode
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

        # Check for required parameters
        for param in required_params:
            if param not in decoded:
                return {"success": False, "message": f"Parameter {param} is missing but mandatory", "status": 400}

        return {"success": True, "data": decoded}

    def get(self, request, *args, **kwargs):
        ret = self._check_auth(request, self.required_get)
        if not ret["success"]:
            return JsonResponse({"success": False, "message": ret["message"]}, status=ret["status"])
        return self.cleaned_get(ret["data"], args, kwargs)

    def post(self, request, *args, **kwargs):
        ret = self._check_auth(request, self.required_post)
        if not ret["success"]:
            return JsonResponse({"success": False, "message": ret["message"]}, status=ret["status"])
        return self.cleaned_post(ret["data"], args, kwargs)

    def put(self, request, *args, **kwargs):
        ret = self._check_auth(request, self.required_put)
        if not ret["success"]:
            return JsonResponse({"success": False, "message": ret["message"]}, status=ret["status"])
        return self.cleaned_put(ret["data"], args, kwargs)

    def delete(self, request, *args, **kwargs):
        ret = self._check_auth(request, self.required_delete)
        if not ret["success"]:
            return JsonResponse({"success": False, "message": ret["message"]}, status=ret["status"])
        return self.cleaned_delete(ret["data"], args, kwargs)

    def cleaned_get(self, params, *args, **kwargs):
        return NotImplemented

    def cleaned_post(self, params, *args, **kwargs):
        return NotImplemented

    def cleaned_put(self, params, *args, **kwargs):
        return NotImplemented

    def cleaned_delete(self, params, *args, **kwargs):
        return NotImplemented


@method_decorator(csrf_exempt, "dispatch")
class AuthenticateView(View):
    def post(self, request, *args, **kwargs):
        try:
            decoded = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "JSON could not be decoded"},
                status=400
            )
        if "username" not in decoded:
            return JsonResponse(
                {"success": False, "message": "Parameter username is required, but missing"},
                status=400
            )
        if "password" not in decoded:
            return JsonResponse(
                {"success": False, "message": "Parameter password is required, but missing"},
                status=400
            )
        # TODO use own method to allow different authentication methods
        user = django.contrib.auth.authenticate(username=decoded["username"], password=decoded["password"])
        if not user:
            return JsonResponse(
                {"success": False, "message": "Username or password is incorrect"},
                status=401
            )
        account: AccountModel = user.accountmodel_set.first()
        if not account:
            return JsonResponse(
                {"success": False, "message": "Error retrieving account"},
                status=500
            )

        # Check ACLs
        try:
            acl = account.linked_acl_group.linked_acls.get(name="API:POST:/api/v1/authenticate")
        except ACLModel.DoesNotExist:
            return JsonResponse({"success": False, "message": "Error retrieving ACL"}, status=500)
        if not acl.allow:
            return JsonResponse({"success": False, "message": "You are not allowed to use this"}, status=403)

        token = account.generate_token()
        return JsonResponse({"success": True, "message": "Token was added successfully", "data": token})


class ReloadConfigurationView(CheckMixinView):
    def cleaned_post(self, *args, **kwargs):
        return JsonResponse({"success": True, "message": "Request was successful"})


class CheckView(CheckMixinView):
    def __init__(self, **kwargs):
        super().__init__(
            required_post=["name"],
            required_put=[],
            required_delete=[],
            **kwargs
        )

    def cleaned_get(self, params, *args, **kwargs):
        return JsonResponse({"success": True})

    def cleaned_post(self, params, *args, **kwargs):
        try:
            if "check_type" in params:
                ct = CheckType.objects.get(id=params["check_type"])
        except CheckType.DoesNotExist:
            return JsonResponse(
                {"success": False, "message": f"CheckType with id {params['check_type']} was not found"},
                status=400
            )
        check, created = Check.objects.get_or_create(name=params["name"])
        if created:
            if "cmd" in params:
                check.cmd = params["cmd"]
            if "check_type" in params:
                check.check_type = ct
            check.save()
            return JsonResponse({"success": True, "message": "Object was created"}, status=201)
        else:
            return JsonResponse({"success": False, "message": "Check already exists with that name"}, status=409)

    def cleaned_put(self, params, *args, **kwargs):
        return JsonResponse({"success": True})

    def cleaned_delete(self, params, *args, **kwargs):
        return JsonResponse({"success": True})
