from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import render
from django.views.generic import TemplateView


class Login(LoginView):
    template_name = "auth/login.html"
    success_url = "/"


class Logout(LoginRequiredMixin, LogoutView):
    template_name = ""


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/dashboard.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

