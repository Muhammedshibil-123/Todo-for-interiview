from django.db import models
from django.contrib.auth.models import User
import random


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    mobile_number = models.CharField(max_length=15, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp_profile')
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        self.otp_code = str(random.randint(100000, 999999))
        self.save()
        return self.otp_code

    def matches(self, otp):
        if self.otp_code is None:
            return False
        return str(self.otp_code).strip() == str(otp).strip()

    def clear_otp(self):
        self.otp_code = None
        self.save()
