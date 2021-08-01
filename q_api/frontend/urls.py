from django.urls import path

from frontend.views import *

urlpatterns = [
    path("login", Login.as_view()),
    path("logout", Logout.as_view()),
    path("", DashboardView.as_view()),

    path("declaration/globalvariable/", DeclarationGlobalVariableView.as_view()),
    path("declaration/globalvariable/create", DeclarationGlobalVariableCreateView.as_view()),
    path("declaration/globalvariable/update/<str:sid>", DeclarationGlobalVariableUpdateView.as_view()),
    path("declaration/globalvariable/delete/<str:sid>", DeclarationGlobalVariableDeleteView.as_view()),
]
