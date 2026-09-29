from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from tenants.models import Tenant

from .serializers import (
    LandlordRegisterSerializer,
    TenantCreateSerializer,
    MyTokenObtainPairSerializer,
)

from rest_framework_simplejwt.views import TokenObtainPairView


class LandlordRegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LandlordRegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                {
                    "message": "Landlord account created successfully.",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateTenantView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role != User.Role.LANDLORD:

            return Response(
                {
                    "error": "Only landlords can create tenants."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TenantCreateSerializer(
            data=request.data
        )

        if serializer.is_valid():

            data = serializer.validated_data

            tenant_user = User.objects.create_user(
                username=data["username"],
                password=data["password"],
                email=data.get("email", ""),
                first_name=data["first_name"],
                last_name=data.get("last_name", ""),
                role=User.Role.TENANT,
            )

            tenant = Tenant.objects.create(
                user=tenant_user,
                landlord=request.user,
                phone=data["phone"],
                address=data.get("address", ""),
                joining_date=data["joining_date"],
            )

            return Response(
                {
                    "message": "Tenant created successfully.",
                    "tenant": {
                        "id": tenant.id,
                        "tenant_id": tenant_user.username,
                        "name": tenant_user.get_full_name(),
                        "phone": tenant.phone,
                        "joining_date": tenant.joining_date,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class DeleteLandlordAccountView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        if request.user.role != User.Role.LANDLORD:

            return Response(
                {
                    "error": "Only landlords can delete their account."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        landlord = request.user

        # Deactivate landlord account instead of
        # physically deleting the database record.
        landlord.is_active = False

        landlord.save(
            update_fields=["is_active"]
        )

        return Response(
            {
                "message": "Landlord account has been deactivated successfully."
            },
            status=status.HTTP_200_OK,
        )


class MyTokenObtainPairView(TokenObtainPairView):

    serializer_class = MyTokenObtainPairSerializer