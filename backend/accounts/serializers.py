from rest_framework import serializers
from .models import User
from tenants.models import Tenant
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer
)

class LandlordRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=User.Role.LANDLORD,
        )

        return user


class TenantCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField()
    address = serializers.CharField(required=False, allow_blank=True)
    joining_date = serializers.DateField()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "This tenant ID already exists."
            )

        return value

class MyTokenObtainPairSerializer(
    TokenObtainPairSerializer
):

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token["username"] = user.username
        token["role"] = user.role

        return token