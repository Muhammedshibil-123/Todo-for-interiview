from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')

    mobile_number = serializers.CharField(write_only=True, required=True, max_length=15)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'mobile_number','password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        mobile_number = validated_data.pop('mobile_number')
        user = User.objects.create_user(**validated_data)
        user.is_active = False
        user.save()

        UserProfile.objects.create(user=user, mobile_number=mobile_number)
        return user


class VerifyRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
