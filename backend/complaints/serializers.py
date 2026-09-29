from rest_framework import serializers

from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):

    tenant_id = serializers.CharField(
        source="tenant.user.username",
        read_only=True
    )

    tenant_name = serializers.CharField(
        source="tenant.user.get_full_name",
        read_only=True
    )

    class Meta:
        model = Complaint

        fields = [
            "id",
            "tenant",
            "tenant_id",
            "tenant_name",
            "subject",
            "description",
            "status",
            "landlord_response",
            "created_at",
            "updated_at",
            "resolved_at",
        ]

        read_only_fields = [
            "id",
            "tenant",
            "tenant_id",
            "tenant_name",
            "created_at",
            "updated_at",
            "resolved_at",
        ]