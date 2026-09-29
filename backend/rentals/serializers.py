from decimal import Decimal

from rest_framework import serializers

from .models import (
    Property,
    Room,
    RentPayment,
    UtilityBill,
    RentalAgreement,
)


class PropertySerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Property

        fields = [
            "id",
            "name",
            "address"
        ]


class RoomSerializer(
    serializers.ModelSerializer
):

    property_name = serializers.CharField(
        source="property.name",
        read_only=True
    )

    class Meta:

        model = Room

        fields = [
            "id",
            "property",
            "property_name",
            "room_number",
            "monthly_rent",
            "advance_amount",
            "is_occupied"
        ]

        read_only_fields = [
            "is_occupied"
        ]


class RentPaymentSerializer(
    serializers.ModelSerializer
):

    tenant_id = serializers.CharField(
        source="tenant.user.username",
        read_only=True
    )

    tenant_name = serializers.CharField(
        source="tenant.user.get_full_name",
        read_only=True
    )

    class Meta:

        model = RentPayment

        fields = [
            "id",
            "tenant",
            "tenant_id",
            "tenant_name",
            "amount",
            "payment_type",
            "payment_date",
            "rent_month",
            "status",
            "notes",
            "created_at"
        ]

        read_only_fields = [
            "tenant_id",
            "tenant_name",
            "created_at"
        ]

        validators = []

    def validate_rent_month(self, value):

        if value:
            return value.replace(day=1)

        return value


class UtilityBillSerializer(
    serializers.ModelSerializer
):

    tenant_id = serializers.CharField(
        source="tenant.user.username",
        read_only=True
    )

    tenant_name = serializers.CharField(
        source="tenant.user.get_full_name",
        read_only=True
    )

    remaining_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:

        model = UtilityBill

        fields = [
            "id",
            "tenant",
            "tenant_id",
            "tenant_name",
            "bill_type",
            "amount",
            "paid_amount",
            "remaining_amount",
            "billing_month",
            "due_date",
            "paid_date",
            "status",
            "units",
            "notes",
            "created_at"
        ]

        read_only_fields = [
            "tenant_id",
            "tenant_name",
            "remaining_amount",
            "created_at"
        ]

        validators = []

    def validate_billing_month(self, value):

        return value.replace(day=1)

    def validate(self, attrs):

        amount = attrs.get(
            "amount",
            getattr(
                self.instance,
                "amount",
                Decimal("0")
            )
        )

        paid_amount = attrs.get(
            "paid_amount",
            getattr(
                self.instance,
                "paid_amount",
                Decimal("0")
            )
        )

        amount = Decimal(str(amount))
        paid_amount = Decimal(str(paid_amount))

        if amount <= 0:

            raise serializers.ValidationError({
                "amount": (
                    "Bill amount must be greater than zero."
                )
            })

        if paid_amount < 0:

            raise serializers.ValidationError({
                "paid_amount": (
                    "Paid amount cannot be negative."
                )
            })

        if paid_amount > amount:

            raise serializers.ValidationError({
                "paid_amount": (
                    f"Paid amount cannot exceed "
                    f"the bill amount of ₹{amount:.2f}."
                )
            })

        # Automatically determine status.
        if paid_amount == Decimal("0"):

            attrs["status"] = (
                UtilityBill.Status.PENDING
            )

            attrs["paid_date"] = None

        elif paid_amount < amount:

            attrs["status"] = (
                UtilityBill.Status.PARTIALLY_PAID
            )

            attrs["paid_date"] = None

        else:

            attrs["status"] = (
                UtilityBill.Status.PAID
            )

            if not attrs.get(
                "paid_date",
                getattr(
                    self.instance,
                    "paid_date",
                    None
                )
            ):

                if self.instance:
                    pass
                else:
                    raise serializers.ValidationError({
                        "paid_date": (
                            "Paid date is required when "
                            "the full bill amount is paid."
                        )
                    })

        return attrs


class RentalAgreementSerializer(
    serializers.ModelSerializer
):

    tenant_id = serializers.CharField(
        source="tenant.user.username",
        read_only=True
    )

    tenant_name = serializers.CharField(
        source="tenant.user.get_full_name",
        read_only=True
    )

    room_number = serializers.CharField(
        source="room.room_number",
        read_only=True
    )

    class Meta:

        model = RentalAgreement

        fields = [
            "id",
            "tenant",
            "tenant_id",
            "tenant_name",
            "room",
            "room_number",
            "start_date",
            "end_date",
            "monthly_rent",
            "advance_amount",
            "document",
            "is_active",
            "created_at"
        ]

        read_only_fields = [
            "tenant_id",
            "tenant_name",
            "room_number",
            "is_active",
            "created_at"
        ]