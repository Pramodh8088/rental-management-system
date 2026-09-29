from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        LANDLORD = "LANDLORD", "Landlord"
        TENANT = "TENANT", "Tenant"

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    def __str__(self):
        return self.username