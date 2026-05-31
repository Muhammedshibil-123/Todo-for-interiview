from django.urls import path
from .views import (
    RegisterView, 
    VerifyRegistrationOTPView,
    CustomTokenjwtView, 
    CustomTokenRefreshView, 
    LogoutView,
    ProfileView,
    ForgotPasswordView,
    ResetPasswordView,
    GoogleLoginView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('verify-registration/', VerifyRegistrationOTPView.as_view(), name='auth-verify-registration'),
    path('login/', CustomTokenjwtView.as_view(), name='auth-login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('profile/', ProfileView.as_view(), name='auth-profile'),
    
    # Password Reset
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),
    
    # Social Auth
    path('google/', GoogleLoginView.as_view(), name='auth-google'),
]
