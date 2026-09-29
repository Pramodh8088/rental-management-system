from django.db import transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from rentals.models import Room

from .models import Tenant
from .serializers import TenantSerializer


class TenantListCreateView(ListCreateAPIView):

    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role != User.Role.LANDLORD:
            return Tenant.objects.none()

        return Tenant.objects.filter(
            landlord=self.request.user
        )

    def perform_create(self, serializer):

        if self.request.user.role != User.Role.LANDLORD:
            return

        serializer.save(
            landlord=self.request.user
        )


class TenantDetailView(
    RetrieveUpdateDestroyAPIView
):

    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role != User.Role.LANDLORD:
            return Tenant.objects.none()

        return Tenant.objects.filter(
            landlord=self.request.user
        )

    def perform_update(self, serializer):

        if self.request.user.role != User.Role.LANDLORD:
            return

        serializer.save()

    def perform_destroy(self, instance):

        if self.request.user.role != User.Role.LANDLORD:
            return

        room = instance.room

        instance.is_active = False
        instance.leaving_date = timezone.now().date()
        instance.room = None

        instance.save(
            update_fields=[
                "is_active",
                "leaving_date",
                "room",
            ]
        )

        instance.user.is_active = False

        instance.user.save(
            update_fields=[
                "is_active",
            ]
        )

        if room:

            room.is_occupied = False

            room.save(
                update_fields=[
                    "is_occupied",
                ]
            )


class AssignRoomView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        if request.user.role != User.Role.LANDLORD:

            return Response(
                {
                    "error": "Only landlords can assign rooms."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            tenant = Tenant.objects.get(
                id=pk,
                landlord=request.user
            )

        except Tenant.DoesNotExist:

            return Response(
                {
                    "error": "Tenant not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not tenant.is_active:

            return Response(
                {
                    "error": "This tenant is inactive."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if tenant.room is not None:

            return Response(
                {
                    "error": (
                        "This tenant already has a room "
                        "assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        room_id = request.data.get("room")

        if not room_id:

            return Response(
                {
                    "error": "Room ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            room = Room.objects.get(
                id=room_id,
                property__landlord=request.user
            )

        except Room.DoesNotExist:

            return Response(
                {
                    "error": "Room not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if room.is_occupied:

            return Response(
                {
                    "error": "This room is already occupied."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            tenant.room = room

            tenant.save(
                update_fields=[
                    "room",
                ]
            )

            room.is_occupied = True

            room.save(
                update_fields=[
                    "is_occupied",
                ]
            )

        return Response(
            {
                "message": "Room assigned successfully.",
                "tenant": tenant.user.username,
                "room": room.room_number,
                "property": room.property.name,
                "monthly_rent": room.monthly_rent,
                "advance_amount": room.advance_amount,
            },
            status=status.HTTP_200_OK
        )


class TenantProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != User.Role.TENANT:

            return Response(
                {
                    "error": (
                        "Only tenants can access "
                        "this page."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            tenant = Tenant.objects.get(
                user=request.user
            )

        except Tenant.DoesNotExist:

            return Response(
                {
                    "error": "Tenant profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TenantSerializer(
            tenant
        )

        return Response(
            serializer.data
        )