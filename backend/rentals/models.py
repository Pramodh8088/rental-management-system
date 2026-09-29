from django.conf import settings
from django.db import models
from django.db.models import Q


class Property(models.Model):

    name = models.CharField(
        max_length=100
    )

    address = models.TextField()

    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties"
    )

    def __str__(self):
        return self.name


class Room(models.Model):

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="rooms"
    )

    room_number = models.CharField(
        max_length=20
    )

    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    advance_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    is_occupied = models.BooleanField(
        default=False
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "property",
                    "room_number"
                ],
                name="unique_room_number_per_property"
            )
        ]

    def __str__(self):
        return (
            f"{self.property.name} - "
            f"Room {self.room_number}"
        )


class RentPayment(models.Model):

    class PaymentType(models.TextChoices):

        RENT = "RENT", "Rent"

        ADVANCE = "ADVANCE", "Advance"

    class Status(models.TextChoices):

        PAID = "PAID", "Paid"

        PENDING = "PENDING", "Pending"

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="payments"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_type = models.CharField(
        max_length=20,
        choices=PaymentType.choices
    )

    payment_date = models.DateField(
        null=True,
        blank=True
    )

    rent_month = models.DateField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    notes = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "tenant",
                    "payment_type",
                    "rent_month"
                ],
                condition=Q(
                    payment_type="RENT",
                    rent_month__isnull=False
                ),
                name="unique_rent_payment_per_tenant_month"
            )
        ]

    def __str__(self):
        return (
            f"{self.tenant.user.username} - "
            f"{self.payment_type} - "
            f"{self.amount}"
        )


class UtilityBill(models.Model):

    class BillType(models.TextChoices):

        ELECTRICITY = (
            "ELECTRICITY",
            "Electricity"
        )

        WATER = (
            "WATER",
            "Water"
        )

    class Status(models.TextChoices):

        PENDING = (
            "PENDING",
            "Pending"
        )

        PARTIALLY_PAID = (
            "PARTIALLY_PAID",
            "Partially Paid"
        )

        PAID = (
            "PAID",
            "Paid"
        )

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="utility_bills"
    )

    bill_type = models.CharField(
        max_length=20,
        choices=BillType.choices
    )

    # Total amount of the bill
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    # Amount actually paid by tenant
    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    billing_month = models.DateField()

    due_date = models.DateField(
        null=True,
        blank=True
    )

    paid_date = models.DateField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    units = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    notes = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "tenant",
                    "bill_type",
                    "billing_month"
                ],
                name="unique_utility_bill_per_tenant_type_month"
            )
        ]

    @property
    def remaining_amount(self):

        remaining = (
            self.amount -
            self.paid_amount
        )

        if remaining < 0:
            return 0

        return remaining

    def update_payment_status(self):

        if self.paid_amount <= 0:

            self.status = self.Status.PENDING

            self.paid_date = None

        elif self.paid_amount < self.amount:

            self.status = (
                self.Status.PARTIALLY_PAID
            )

            self.paid_date = None

        else:

            self.paid_amount = self.amount

            self.status = self.Status.PAID

        return self

    def __str__(self):

        return (
            f"{self.tenant.user.username} - "
            f"{self.bill_type} - "
            f"{self.billing_month}"
        )


class RentalAgreement(models.Model):

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="agreements"
    )

    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agreements"
    )

    start_date = models.DateField()

    end_date = models.DateField()

    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    advance_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    document = models.FileField(
        upload_to="agreements/",
        null=True,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.tenant.user.username} - "
            f"Agreement"
        )