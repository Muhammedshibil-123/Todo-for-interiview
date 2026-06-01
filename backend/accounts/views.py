import requests
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import OTP
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)

class CustomTokenjwtView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            refresh_token = response.data.get("refresh")
            
            response.set_cookie(
                key=settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token"),
                value=refresh_token,
                max_age=int(settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME").total_seconds()),
                secure=settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False),
                httponly=settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True),
                samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax"),
            )

            del response.data["refresh"]

        return response


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token"))

        if refresh_token:
            request.data["refresh"] = refresh_token

        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                if "refresh" in response.data:
                    new_refresh_token = response.data["refresh"]
                    response.set_cookie(
                        key=settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token"),
                        value=new_refresh_token,
                        max_age=int(settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME").total_seconds()),
                        secure=settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False),
                        httponly=settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True),
                        samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax"),
                    )

                access_token_str = response.data.get("access")
                access_token = AccessToken(access_token_str)
                user = User.objects.get(id=access_token["user_id"])
                user_serializer = UserSerializer(user)
                response.data["user"] = user_serializer.data

            return response
        except (InvalidToken, TokenError, User.DoesNotExist):
            response = Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie(settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token"))
            return response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get(settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token"))
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
            response.delete_cookie(settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token"))
            return response
        except Exception:
            return Response({"error": "Logout failed"}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        otp_profile, _ = OTP.objects.get_or_create(user=user)
        otp_code = otp_profile.generate_otp()

        try:
            send_mail(
                "Verify Your TaskFlow Account",
                f"Your account verification OTP is: {otp_code}. Do not share this with anyone.",
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")


class VerifyRegistrationOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .serializers import VerifyRegistrationSerializer
        serializer = VerifyRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]

            try:
                user = User.objects.get(email=email)
                if user.is_active:
                    return Response({"message": "Account is already verified."}, status=status.HTTP_200_OK)

                otp_profile = OTP.objects.get(user=user)

                if otp_profile.otp_code == otp and otp_profile.otp_code is not None:
                    user.is_active = True
                    user.save()
                    otp_profile.clear_otp()
                    return Response({"message": "Account verified successfully."}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

            except (User.DoesNotExist, OTP.DoesNotExist):
                return Response({"error": "User or OTP not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            try:
                user = User.objects.get(email=email)
                otp_profile, _ = OTP.objects.get_or_create(user=user)
                otp_code = otp_profile.generate_otp()

                send_mail(
                    "Reset Your TaskFlow Password",
                    f"Your Password Reset OTP is: {otp_code}. Do not share this with anyone.",
                    settings.EMAIL_HOST_USER,
                    [email],
                    fail_silently=False,
                )

                return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]
            password = serializer.validated_data["new_password"]

            try:
                user = User.objects.get(email=email)
                otp_profile = OTP.objects.get(user=user)

                if otp_profile.otp_code == otp and otp_profile.otp_code is not None:
                    user.set_password(password)
                    user.save()
                    otp_profile.clear_otp()
                    return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

            except (User.DoesNotExist, OTP.DoesNotExist):
                return Response({"error": "User or OTP not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        google_token = request.data.get("token")
        if not google_token:
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

        user_info_req = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={google_token}")
        
        if not user_info_req.ok:
            return Response({"error": "Invalid Google Token"}, status=status.HTTP_400_BAD_REQUEST)

        idinfo = user_info_req.json()
        email = idinfo.get("email")
        if not email:
            return Response({"error": "Email not provided by Google"}, status=status.HTTP_400_BAD_REQUEST)

        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                return Response({"error": "Your account is inactive."}, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
            )
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)

        response = Response(
            {
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            },
            status=status.HTTP_200_OK,
        )

        response.set_cookie(
            key=settings.SIMPLE_JWT.get("AUTH_COOKIE", "refresh_token"),
            value=str(refresh),
            max_age=int(settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME").total_seconds()),
            secure=settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False),
            httponly=settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True),
            samesite=settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax"),
        )

        return response
