from django.urls import path

from api.views import *


urlpatterns = {
    path("api/v1/updateDeclaration", UpdateDeclarationView.as_view()),
    # Internal endpoints
    path("scheduler/api/v1/submitResult", SubmitResultView.as_view()),
}
