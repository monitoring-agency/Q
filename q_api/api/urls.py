from django.urls import path

from api.views import *


urlpatterns = [
    # Various API
    path("authenticate", AuthenticateView.as_view()),

    # Model API
    path("check", CheckView.as_view()),
    path("check/<int:cid>", CheckView.as_view()),

    # Routine API
    path("reloadDescription", ReloadConfigurationView.as_view()),
]
