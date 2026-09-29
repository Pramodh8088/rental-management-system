from django.urls import path

from .views import (
    LandlordRegisterView,
    CreateTenantView,
    DeleteLandlordAccountView,
)


urlpatterns = [

    path(
        "register/",
        LandlordRegisterView.as_view(),
        name="landlord-register",
    ),

    path(
        "create-tenant/",
        CreateTenantView.as_view(),
        name="create-tenant",
    ),

    path(
        "delete-account/",
        DeleteLandlordAccountView.as_view(),
        name="delete-landlord-account",
    ),

]