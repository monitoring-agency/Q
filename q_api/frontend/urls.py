from django.urls import path

from frontend.views import *

urlpatterns = [
    path("login", Login.as_view()),
]
