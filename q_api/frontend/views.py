from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import render


class Login(LoginView):
    template_name = "auth/login.html"
    success_url = "/"


class Logout(LogoutView):
    template_name = ""

