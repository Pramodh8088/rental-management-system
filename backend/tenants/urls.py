from django.urls import path

from .views import (
    TenantListCreateView,
    TenantDetailView,
    AssignRoomView,
    TenantProfileView,
)


urlpatterns = [

    path(
        "",
        TenantListCreateView.as_view(),
        name="tenant-list"
    ),

    path(
        "me/",
        TenantProfileView.as_view(),
        name="tenant-profile"
    ),

    path(
        "<int:pk>/",
        TenantDetailView.as_view(),
        name="tenant-detail"
    ),

    path(
        "<int:pk>/assign-room/",
        AssignRoomView.as_view(),
        name="assign-room"
    ),

]