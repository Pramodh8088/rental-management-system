from rest_framework import serializers
from .models import Tenant


class TenantSerializer(serializers.ModelSerializer):

    tenant_id = serializers.CharField(
        source="user.username",
        read_only=True
    )

    first_name = serializers.CharField(
        source="user.first_name"
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
        allow_blank=True
    )

    email = serializers.EmailField(
        source="user.email",
        required=False,
        allow_blank=True
    )

    room_number = serializers.CharField(
        source="room.room_number",
        read_only=True
    )

    property_name = serializers.CharField(
        source="room.property.name",
        read_only=True
    )

    monthly_rent = serializers.DecimalField(
        source="room.monthly_rent",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    advance_amount = serializers.DecimalField(
        source="room.advance_amount",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:

        model = Tenant

        fields = [
            "id",
            "tenant_id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
            "joining_date",
            "leaving_date",
            "is_active",
            "room",
            "room_number",
            "property_name",
            "monthly_rent",
            "advance_amount",
        ]

        read_only_fields = [
            "tenant_id",
            "is_active",
            "room",
        ]