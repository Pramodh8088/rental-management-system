from django.urls import path

from .views import (
    PropertyListCreateView,
    PropertyDetailView,
    RoomListCreateView,
    RoomDetailView,
    RentPaymentListCreateView,
    RentPaymentDetailView,
    UtilityBillListCreateView,
    UtilityBillDetailView,
    RentalAgreementListCreateView,
    RentalAgreementDetailView,
)


urlpatterns = [

    # Properties
    path(
        "properties/",
        PropertyListCreateView.as_view(),
        name="property-list-create",
    ),

    path(
        "properties/<int:pk>/",
        PropertyDetailView.as_view(),
        name="property-detail",
    ),

    # Rooms
    path(
        "rooms/",
        RoomListCreateView.as_view(),
        name="room-list-create",
    ),

    path(
        "rooms/<int:pk>/",
        RoomDetailView.as_view(),
        name="room-detail",
    ),
    path(
    "payments/",
    RentPaymentListCreateView.as_view(),
    name="payment-list-create",
    ),
    path(
        "payments/<int:pk>/",
        RentPaymentDetailView.as_view(),
        name="payment-detail",
    ),
    path(
    "bills/",
    UtilityBillListCreateView.as_view(),
    name="bill-list-create",
    ),
    path(
        "bills/<int:pk>/",
        UtilityBillDetailView.as_view(),
        name="bill-detail",
    ),
    path(
    "agreements/",
    RentalAgreementListCreateView.as_view(),
    name="agreement-list-create",
    ),
    path(
        "agreements/<int:pk>/",
        RentalAgreementDetailView.as_view(),
        name="agreement-detail",
    ),
]