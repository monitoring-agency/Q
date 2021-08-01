import json

from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import render, redirect
from django.views import View
from django.views.generic import TemplateView

import api.views
from description.models import GlobalVariable


class Login(LoginView):
    template_name = "auth/login.html"
    success_url = "/"


class Logout(LoginRequiredMixin, LogoutView):
    template_name = ""


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/dashboard.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


class DeclarationGlobalVariableView(LoginRequiredMixin, TemplateView):
    template_name = "declaration/global_variable/index.html"

    def get(self, request, *args, **kwargs):
        global_variables = [x.to_dict() for x in GlobalVariable.objects.all()]
        return render(request, self.template_name, {"global_variables": global_variables})


class DeclarationGlobalVariableCreateView(LoginRequiredMixin, TemplateView):
    template_name = "declaration/global_variable/create_or_update.html"

    def get(self, request, *args, **kwargs):
        global_variable_names = [x.variable.name for x in GlobalVariable.objects.all()]
        return render(request, self.template_name, {"global_variable_names": global_variable_names})

    def post(self, request, *args, **kwargs):
        ret = api.views.GlobalVariableView().save_post(params=request.POST)
        if ret.status_code != 200:
            global_variable_names = [x.variable.name for x in GlobalVariable.objects.all()]
            return render(
                request, self.template_name,
                {"global_variable_names": global_variable_names, "error": json.loads(ret.content)["message"]}
            )
        return redirect("/declaration/globalvariable/")


class DeclarationGlobalVariableUpdateView(LoginRequiredMixin, TemplateView):
    template_name = "declaration/global_variable/create_or_update.html"

    def get(self, request, sid="", *args, **kwargs):
        try:
            existing = GlobalVariable.objects.get(id=sid).to_dict()
        except GlobalVariable.DoesNotExist:
            return render(request, "lib/error.html", {"error_header": "Variable is not existing"})
        return render(request, self.template_name, {"global_variable": existing})

    def post(self, request, sid="", *args, **kwargs):
        try:
            ret = api.views.GlobalVariableView().save_put(params=request.POST, sid=sid)
            if ret.status_code != 200:
                global_variable_names = [x.variable.name for x in GlobalVariable.objects.all()]
                return render(
                    request, self.template_name,
                    {"global_variable_names": global_variable_names, "error": json.loads(ret.content)["message"]}
                )
        except GlobalVariable.DoesNotExist:
            return render(request, "lib/error.html", {"error_header": "Variable is not existing"})
        return redirect("/declaration/globalvariable/")


class DeclarationGlobalVariableDeleteView(LoginRequiredMixin, View):

    def post(self, request, sid="", *args, **kwargs):
        try:
            global_variable = GlobalVariable.objects.get(id=sid)
        except GlobalVariable.DoesNotExist:
            return redirect("/declaration/globalvariable/")
        global_variable.delete()
        return redirect("/declaration/globalvariable/")

