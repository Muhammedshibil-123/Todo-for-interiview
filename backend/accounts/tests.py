from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class AuthTest(TestCase):
    """Unit tests for user authentication endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testauth',
            password='testpass123'
        )

    def test_register_user(self):
        """Test POST /api/auth/register/ creates a new user."""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'StrongPass@123',
            'password2': 'StrongPass@123',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_password_mismatch(self):
        """Test that mismatched passwords return a 400 error."""
        response = self.client.post('/api/auth/register/', {
            'username': 'baduser',
            'password': 'pass1',
            'password2': 'pass2',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        """Test POST /api/auth/login/ returns JWT tokens."""
        response = self.client.post('/api/auth/login/', {
            'username': 'testauth',
            'password': 'testpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password(self):
        """Test login with wrong password fails."""
        response = self.client.post('/api/auth/login/', {
            'username': 'testauth',
            'password': 'wrongpass',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authenticated(self):
        """Test that authenticated users can access their profile."""
        login = self.client.post('/api/auth/login/', {
            'username': 'testauth',
            'password': 'testpass123',
        })
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testauth')
