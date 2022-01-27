from django.urls import path

from api.views import *


urlpatterns = [
    # Various API
    path("authenticate", AuthenticateView.as_view()),
    path("logout", Logout.as_view()),

    # Model API
    path("checks", CheckView.as_view()),
    path("checks/<str:sid>", CheckView.as_view()),
    path("metrics", MetricView.as_view()),
    path("metrics/<str:sid>", MetricView.as_view()),
    path("metrictemplates", MetricTemplateView.as_view()),
    path("metrictemplates/<str:sid>", MetricTemplateView.as_view()),
    path("hosts", HostView.as_view()),
    path("hosts/<str:sid>", HostView.as_view()),
    path("hosttemplates", HostTemplateView.as_view()),
    path("hosttemplates/<str:sid>", HostTemplateView.as_view()),
    path("timeperiods", TimePeriodView.as_view()),
    path("timeperiods/<str:sid>", TimePeriodView.as_view()),
    path("globalvariables", GlobalVariableView.as_view()),
    path("globalvariables/<str:sid>", GlobalVariableView.as_view()),
    path("contacts", ContactView.as_view()),
    path("contacts/<str:sid>", ContactView.as_view()),
    path("contactgroups", ContactGroupView.as_view()),
    path("contactgroups/<str:sid>", ContactGroupView.as_view()),
    path("proxies", ProxyView.as_view()),
    path("proxies/<str:sid>", ProxyView.as_view()),

    # Routine API
    path("updateDeclaration", UpdateDeclarationView.as_view()),
    path("generateProxyConfiguration", GenerateProxyConfigurationView.as_view()),
]
