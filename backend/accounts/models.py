from django.db import models
from django.contrib.auth.models import User
import random

class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp_profile')
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        self.otp_code = str(random.randint(100000, 999999))
        self.save()
        return self.otp_code

    def clear_otp(self):
        self.otp_code = None
        self.save()
