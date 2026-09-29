from django.conf import settings
from django.db import models


class Tenant(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tenant_profile",
    )

    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tenants",
        limit_choices_to={"role": "LANDLORD"},
    )

    room = models.ForeignKey(
        "rentals.Room",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tenants",
    )

    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)

    joining_date = models.DateField()
    leaving_date = models.DateField(
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username