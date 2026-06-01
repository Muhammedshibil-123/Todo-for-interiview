from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import OTP


class AuthTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testauth',
            email='testauth@example.com',
            password='testpass123'
        )

    def test_register_user(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@example.com',
            'mobile_number': '9876543210',
            'password': 'StrongPass@123',
            'password2': 'StrongPass@123',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_verify_registration_accepts_matching_otp(self):
        user = User.objects.create_user(
            username='pendinguser',
            email='pending@example.com',
            password='StrongPass@123',
            is_active=False,
        )
        OTP.objects.create(user=user, otp_code='123456')

        response = self.client.post('/api/auth/verify-registration/', {
            'email': 'pending@example.com',
            'otp': ' 123456 ',
        })

        user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(user.is_active)

    def test_reset_password_accepts_matching_otp(self):
        OTP.objects.create(user=self.user, otp_code='654321')

        response = self.client.post('/api/auth/reset-password/', {
            'email': 'testauth@example.com',
            'otp': ' 654321 ',
            'new_password': 'NewStrongPass@123',
        })

        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user.check_password('NewStrongPass@123'))

    def test_register_password_mismatch(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'baduser',
            'password': 'pass1',
            'password2': 'pass2',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testauth',
            'password': 'testpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh_token', response.cookies)

    def test_login_wrong_password(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testauth',
            'password': 'wrongpass',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authenticated(self):
        login = self.client.post('/api/auth/login/', {
            'username': 'testauth',
            'password': 'testpass123',
        })
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testauth')
