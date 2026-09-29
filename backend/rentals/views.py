from decimal import Decimal

from django.db import transaction
from django.db.models import Sum

from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)

from rest_framework.permissions import IsAuthenticated

from rest_framework.exceptions import (
    ValidationError,
    PermissionDenied,
)

from rest_framework.response import Response

from rest_framework import status

from accounts.models import User
from tenants.models import Tenant

from .models import (
    Property,
    Room,
    RentPayment,
    UtilityBill,
    RentalAgreement,
)

from .serializers import (
    PropertySerializer,
    RoomSerializer,
    RentPaymentSerializer,
    UtilityBillSerializer,
    RentalAgreementSerializer,
)

from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)


def validate_payment_limit(
    tenant,
    payment_type,
    amount,
    rent_month=None,
    exclude_payment=None,
):

    amount = Decimal(str(amount))

    if amount <= 0:
        raise ValidationError({
            "amount": "Payment amount must be greater than zero."
        })

    room = tenant.room

    if not room:
        raise ValidationError({
            "amount": (
                "This tenant is not assigned to a room. "
                "Assign a room before recording a payment."
            )
        })

    if payment_type == RentPayment.PaymentType.ADVANCE:

        maximum_amount = room.advance_amount

        payments = RentPayment.objects.filter(
            tenant=tenant,
            payment_type=RentPayment.PaymentType.ADVANCE,
        )

        if exclude_payment is not None:
            payments = payments.exclude(
                pk=exclude_payment.pk
            )

        current_total = payments.aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")

        # If advance is already fully recorded,
        # no new advance payment should be accepted.
        if current_total >= maximum_amount:

            raise ValidationError({
                "amount": (
                    "The advance amount has already been fully paid. "
                    f"Room advance: ₹{maximum_amount:.2f}. "
                    f"Already recorded: ₹{current_total:.2f}."
                )
            })

        new_total = current_total + amount

        if new_total > maximum_amount:

            remaining = maximum_amount - current_total

            if remaining < 0:
                remaining = Decimal("0")

            raise ValidationError({
                "amount": (
                    "Advance payment exceeds the room advance amount. "
                    f"Room advance: ₹{maximum_amount:.2f}. "
                    f"Already recorded: ₹{current_total:.2f}. "
                    f"Maximum remaining: ₹{remaining:.2f}."
                )
            })

    elif payment_type == RentPayment.PaymentType.RENT:

        if not rent_month:
            raise ValidationError({
                "rent_month": (
                    "Rent month is required for rent payments."
                )
            })

        maximum_amount = room.monthly_rent

        payments = RentPayment.objects.filter(
            tenant=tenant,
            payment_type=RentPayment.PaymentType.RENT,
            rent_month=rent_month,
        )

        if exclude_payment is not None:
            payments = payments.exclude(
                pk=exclude_payment.pk
            )

        current_total = payments.aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")

        # If rent for this month is already fully recorded,
        # no new rent payment should be accepted.
        if current_total >= maximum_amount:

            raise ValidationError({
                "amount": (
                    "The monthly rent has already been fully paid "
                    "for this month. "
                    f"Monthly rent: ₹{maximum_amount:.2f}. "
                    f"Already recorded: ₹{current_total:.2f}."
                )
            })

        new_total = current_total + amount

        if new_total > maximum_amount:

            remaining = maximum_amount - current_total

            if remaining < 0:
                remaining = Decimal("0")

            raise ValidationError({
                "amount": (
                    "Rent payment exceeds the monthly rent amount. "
                    f"Monthly rent: ₹{maximum_amount:.2f}. "
                    f"Already recorded for this month: "
                    f"₹{current_total:.2f}. "
                    f"Maximum remaining: ₹{remaining:.2f}."
                )
            })


class PropertyListCreateView(ListCreateAPIView):

    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role != User.Role.LANDLORD:
            return Property.objects.none()

        return Property.objects.filter(
            landlord=self.request.user
        )

    def perform_create(self, serializer):

        if self.request.user.role != User.Role.LANDLORD:
            raise PermissionDenied(
                "Only landlords can manage properties."
            )

        serializer.save(
            landlord=self.request.user
        )


class PropertyDetailView(RetrieveUpdateDestroyAPIView):

    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role != User.Role.LANDLORD:
            return Property.objects.none()

        return Property.objects.filter(
            landlord=self.request.user
        )


class RoomListCreateView(ListCreateAPIView):

    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role != User.Role.LANDLORD:
            return Room.objects.none()

        return Room.objects.filter(
            property__landlord=self.request.user
        )

    def perform_create(self, serializer):

        if self.request.user.role != User.Role.LANDLORD:
            raise PermissionDenied(
                "Only landlords can manage rooms."
            )

        property_id = self.request.data.get("property")

        try:

            property_obj = Property.objects.get(
                id=property_id,
                landlord=self.request.user
            )

        except Property.DoesNotExist:

            raise ValidationError(
                "Property does not belong to you."
            )

        serializer.save(
            property=property_obj
        )


class RoomDetailView(RetrieveUpdateDestroyAPIView):

    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role != User.Role.LANDLORD:
            return Room.objects.none()

        return Room.objects.filter(
            property__landlord=self.request.user
        )


class RentPaymentListCreateView(ListCreateAPIView):

    serializer_class = RentPaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == User.Role.TENANT:

            return RentPayment.objects.filter(
                tenant__user=self.request.user
            )

        if self.request.user.role == User.Role.LANDLORD:

            return RentPayment.objects.filter(
                tenant__landlord=self.request.user
            )

        return RentPayment.objects.none()

    def create(self, request, *args, **kwargs):

        if request.user.role != User.Role.LANDLORD:
            raise PermissionDenied(
                "Only landlords can manage rent payments."
            )

        tenant_id = request.data.get("tenant")

        try:

            tenant = Tenant.objects.get(
                id=tenant_id,
                landlord=request.user,
                is_active=True,
            )

        except Tenant.DoesNotExist:

            raise ValidationError(
                "Tenant does not belong to you or is inactive."
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        payment_type = serializer.validated_data["payment_type"]

        rent_month = serializer.validated_data.get(
            "rent_month"
        )

        if payment_type == RentPayment.PaymentType.RENT:

            if not rent_month:

                raise ValidationError(
                    "Rent month is required for rent payments."
                )

            # Always keep rent month as the first day
            # of the selected month.
            rent_month = rent_month.replace(
                day=1
            )

        with transaction.atomic():

            tenant = (
                Tenant.objects
                .select_for_update()
                .select_related("room")
                .get(
                    id=tenant.id,
                    landlord=request.user,
                    is_active=True,
                )
            )

            if tenant.room_id:

                Room.objects.select_for_update().get(
                    id=tenant.room_id
                )

            existing_payment = None

            if (
                payment_type == RentPayment.PaymentType.RENT
                and rent_month
            ):

                existing_payment = (
                    RentPayment.objects
                    .select_for_update()
                    .filter(
                        tenant=tenant,
                        payment_type=RentPayment.PaymentType.RENT,
                        rent_month=rent_month,
                    )
                    .first()
                )

            # IMPORTANT:
            #
            # For a NEW payment, do NOT exclude the existing
            # rent payment. We need the existing amount to be
            # included when checking the monthly limit.
            #
            # Example:
            # Monthly rent = ₹10,000
            # Existing      = ₹5,000
            # New           = ₹5,000
            #
            # Total = ₹10,000 -> allowed.
            #
            # If existing = ₹10,000 and new = ₹1,000,
            # validation sees ₹10,000 + ₹1,000 and rejects it.

            validate_payment_limit(
                tenant=tenant,
                payment_type=payment_type,
                amount=serializer.validated_data["amount"],
                rent_month=rent_month,
            )

            if existing_payment:

                # For rent payments, the database has one
                # record per tenant/month.
                #
                # Therefore, when a tenant makes another
                # partial payment, add the new payment amount
                # to the existing amount instead of replacing it.

                existing_amount = Decimal(
                    str(existing_payment.amount)
                )

                new_amount = Decimal(
                    str(serializer.validated_data["amount"])
                )

                combined_amount = (
                    existing_amount + new_amount
                )

                update_data = (
                    serializer.validated_data.copy()
                )

                update_data["amount"] = combined_amount
                update_data["rent_month"] = rent_month

                serializer.update(
                    existing_payment,
                    update_data
                )

                response_serializer = self.get_serializer(
                    existing_payment
                )

                return Response(
                    {
                        "message": (
                            "Rent payment added successfully. "
                            "The total payment for this month "
                            "has been updated."
                        ),
                        "payment": response_serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )

            new_payment = serializer.save(
                tenant=tenant
            )

        response_serializer = self.get_serializer(
            new_payment
        )

        return Response(
            {
                "message": "Payment recorded successfully.",
                "payment": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class RentPaymentDetailView(
    RetrieveUpdateDestroyAPIView
):

    serializer_class = RentPaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == User.Role.TENANT:

            return RentPayment.objects.filter(
                tenant__user=self.request.user
            )

        if self.request.user.role == User.Role.LANDLORD:

            return RentPayment.objects.filter(
                tenant__landlord=self.request.user
            )

        return RentPayment.objects.none()

    def perform_update(self, serializer):

        if self.request.user.role != User.Role.LANDLORD:
            raise PermissionDenied(
                "Only landlords can update rent payments."
            )

        instance = self.get_object()

        tenant = serializer.validated_data.get(
            "tenant",
            instance.tenant
        )

        payment_type = serializer.validated_data.get(
            "payment_type",
            instance.payment_type
        )

        amount = serializer.validated_data.get(
            "amount",
            instance.amount
        )

        rent_month = serializer.validated_data.get(
            "rent_month",
            instance.rent_month
        )

        if payment_type == RentPayment.PaymentType.RENT and rent_month:

            rent_month = rent_month.replace(
                day=1
            )

        if (
            payment_type == RentPayment.PaymentType.RENT
            and not rent_month
        ):

            raise ValidationError({
                "rent_month": (
                    "Rent month is required for rent payments."
                )
            })

        with transaction.atomic():

            tenant = Tenant.objects.select_for_update().get(
                id=tenant.id,
                landlord=self.request.user,
                is_active=True,
            )

            if tenant.room_id:

                Room.objects.select_for_update().get(
                    id=tenant.room_id
                )

            # IMPORTANT:
            #
            # During EDIT, exclude the current record.
            #
            # Example:
            # Existing payment = ₹20,000
            # Edit it to       = ₹12,000
            #
            # The old ₹20,000 is excluded from the calculation,
            # so the new ₹12,000 can be validated correctly.

            validate_payment_limit(
                tenant=tenant,
                payment_type=payment_type,
                amount=amount,
                rent_month=rent_month,
                exclude_payment=instance,
            )

            serializer.save(
                tenant=tenant,
                payment_type=payment_type,
                rent_month=rent_month,
            )

    def perform_destroy(self, instance):

        if self.request.user.role != User.Role.LANDLORD:
            raise PermissionDenied(
                "Only landlords can delete payments."
            )

        instance.delete()


class UtilityBillListCreateView(
    ListCreateAPIView
):

    serializer_class = UtilityBillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == User.Role.TENANT:

            return UtilityBill.objects.filter(
                tenant__user=self.request.user
            )

        if self.request.user.role == User.Role.LANDLORD:

            return UtilityBill.objects.filter(
                tenant__landlord=self.request.user
            )

        return UtilityBill.objects.none()

    def create(self, request, *args, **kwargs):

        if request.user.role != User.Role.LANDLORD:

            raise PermissionDenied(
                "Only landlords can create utility bills."
            )

        tenant_id = request.data.get(
            "tenant"
        )

        try:

            tenant = Tenant.objects.get(
                id=tenant_id,
                landlord=request.user,
                is_active=True,
            )

        except Tenant.DoesNotExist:

            raise ValidationError(
                "Tenant does not belong to you or is inactive."
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        billing_month = serializer.validated_data[
            "billing_month"
        ]

        bill_type = serializer.validated_data[
            "bill_type"
        ]

        with transaction.atomic():

            existing_bill = (
                UtilityBill.objects
                .select_for_update()
                .filter(
                    tenant=tenant,
                    bill_type=bill_type,
                    billing_month=billing_month,
                )
                .first()
            )

            if existing_bill:

                # Existing bill is updated.

                serializer.update(
                    existing_bill,
                    serializer.validated_data
                )

                response_serializer = (
                    self.get_serializer(
                        existing_bill
                    )
                )

                return Response(
                    {
                        "message": (
                            "Utility bill updated successfully."
                        ),
                        "bill": (
                            response_serializer.data
                        ),
                    },
                    status=status.HTTP_200_OK,
                )

            # NEW BILL
            #
            # A newly created bill must always start
            # with zero paid amount and Pending status.

            new_bill = serializer.save(
                tenant=tenant,
                paid_amount=Decimal("0"),
                status=UtilityBill.Status.PENDING,
                paid_date=None
            )

        response_serializer = (
            self.get_serializer(
                new_bill
            )
        )

        return Response(
            {
                "message": (
                    "Utility bill created successfully."
                ),
                "bill": (
                    response_serializer.data
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class UtilityBillDetailView(
    RetrieveUpdateDestroyAPIView
):

    serializer_class = UtilityBillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == User.Role.TENANT:

            return UtilityBill.objects.filter(
                tenant__user=self.request.user
            )

        if self.request.user.role == User.Role.LANDLORD:

            return UtilityBill.objects.filter(
                tenant__landlord=self.request.user
            )

        return UtilityBill.objects.none()

    def perform_update(self, serializer):

        if self.request.user.role != User.Role.LANDLORD:

            raise PermissionDenied(
                "Only landlords can update utility bills."
            )

        instance = self.get_object()

        serializer.save()

    def perform_destroy(self, instance):

        if self.request.user.role != User.Role.LANDLORD:

            raise PermissionDenied(
                "Only landlords can delete utility bills."
            )

        instance.delete()

class RentalAgreementListCreateView(
    ListCreateAPIView
):

    serializer_class = RentalAgreementSerializer
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_queryset(self):

        if self.request.user.role == User.Role.TENANT:

            return RentalAgreement.objects.filter(
                tenant__user=self.request.user
            )

        if self.request.user.role == User.Role.LANDLORD:

            return RentalAgreement.objects.filter(
                tenant__landlord=self.request.user
            )

        return RentalAgreement.objects.none()

    def perform_create(self, serializer):

        if self.request.user.role != User.Role.LANDLORD:
            raise PermissionDenied(
                "Only landlords can create rental agreements."
            )

        tenant_id = self.request.data.get("tenant")

        try:

            tenant = Tenant.objects.get(
                id=tenant_id,
                landlord=self.request.user,
                is_active=True,
            )

        except Tenant.DoesNotExist:

            raise ValidationError(
                "Tenant does not belong to you or is inactive."
            )

        serializer.save(
            tenant=tenant
        )


class RentalAgreementDetailView(
    RetrieveUpdateDestroyAPIView
):

    serializer_class = RentalAgreementSerializer
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_queryset(self):

        if self.request.user.role == User.Role.TENANT:

            return RentalAgreement.objects.filter(
                tenant__user=self.request.user
            )

        if self.request.user.role == User.Role.LANDLORD:

            return RentalAgreement.objects.filter(
                tenant__landlord=self.request.user
            )

        return RentalAgreement.objects.none()

    def perform_update(self, serializer):

        if self.request.user.role != User.Role.LANDLORD:
            raise PermissionDenied(
                "Only landlords can update rental agreements."
            )

        serializer.save()

    def perform_destroy(self, instance):

        if self.request.user.role != User.Role.LANDLORD:
            raise PermissionDenied(
                "Only landlords can delete rental agreements."
            )

        instance.delete()