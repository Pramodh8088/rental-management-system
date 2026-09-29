from django.utils import timezone

from rest_framework.exceptions import (
    PermissionDenied,
    ValidationError,
)
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from tenants.models import Tenant

from .models import Complaint
from .serializers import ComplaintSerializer


class ComplaintListCreateView(ListCreateAPIView):

    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == User.Role.TENANT:
            return Complaint.objects.filter(
                tenant__user=self.request.user
            )

        return Complaint.objects.filter(
            tenant__landlord=self.request.user
        )

    def perform_create(self, serializer):

        if self.request.user.role != User.Role.TENANT:
            raise ValidationError(
                "Only tenants can create complaints."
            )

        try:
            tenant = Tenant.objects.get(
                user=self.request.user,
                is_active=True
            )
        except Tenant.DoesNotExist:
            raise ValidationError(
                "Active tenant profile not found."
            )

        serializer.save(tenant=tenant)


class ComplaintDetailView(RetrieveUpdateDestroyAPIView):

    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == User.Role.TENANT:
            return Complaint.objects.filter(
                tenant__user=self.request.user
            )

        return Complaint.objects.filter(
            tenant__landlord=self.request.user
        )

    def perform_update(self, serializer):

        complaint = serializer.save()

        if complaint.status == Complaint.Status.RESOLVED:

            if complaint.resolved_at is None:
                complaint.resolved_at = timezone.now()
                complaint.save(
                    update_fields=["resolved_at"]
                )

        else:

            if complaint.resolved_at is not None:
                complaint.resolved_at = None
                complaint.save(
                    update_fields=["resolved_at"]
                )