from django.urls import path

from proxy.views import *


urlpatterns = [
    path("submit", SubmitView.as_view()),
]
