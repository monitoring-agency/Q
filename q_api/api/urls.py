from django.urls import path

from api.views import *


urlpatterns = [
    # Various API
    path("authenticate", AuthenticateView.as_view()),

    # Model API
    path("check", CheckView.as_view()),
    path("check/<str:sid>", CheckView.as_view()),
    path("metric", MetricView.as_view()),
    path("metric/<str:sid>", MetricView.as_view()),
    path("timeperiod", TimePeriodView.as_view()),
    path("timeperiod/<str:sid>", TimePeriodView.as_view()),
    path("globalvariable", GlobalVariableView.as_view()),
    path("globalvariable/<str:sid>", GlobalVariableView.as_view()),

    # Routine API
    path("reloadDescription", ReloadConfigurationView.as_view()),
]
