from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user account.
    No authentication required.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login with username and password.
    Returns access and refresh JWT tokens.
    """
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveAPIView):
    """
    GET /api/auth/profile/
    Returns the currently logged-in user's profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
