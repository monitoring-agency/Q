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
    path("metrictemplate", MetricTemplateView.as_view()),
    path("metrictemplate/<str:sid>", MetricTemplateView.as_view()),
    path("host", HostView.as_view()),
    path("host/<str:sid>", HostView.as_view()),
    path("hosttemplate", HostTemplateView.as_view()),
    path("hosttemplate/<str:sid>", HostTemplateView.as_view()),
    path("timeperiod", TimePeriodView.as_view()),
    path("timeperiod/<str:sid>", TimePeriodView.as_view()),
    path("globalvariable", GlobalVariableView.as_view()),
    path("globalvariable/<str:sid>", GlobalVariableView.as_view()),
    path("contact", ContactView.as_view()),
    path("contact/<str:sid>", ContactView.as_view()),
    path("contactgroup", ContactGroupView.as_view()),
    path("contactgroup/<str:sid>", ContactGroupView.as_view()),
    path("proxy", ProxyView.as_view()),
    path("proxy/<str:sid>", ProxyView.as_view()),

    # Routine API
    path("updateDeclaration", UpdateDeclarationView.as_view()),
    path("generateProxyConfiguration", GenerateProxyConfigurationView.as_view()),
]
