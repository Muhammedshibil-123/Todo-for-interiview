from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Task


class TaskModelTest(TestCase):
    """Unit tests for the Task model."""

    def setUp(self):
        """Create a test user and sample task before each test."""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.task = Task.objects.create(
            user=self.user,
            title='Test Task',
            description='A simple test task',
            priority='medium',
            status='todo',
        )

    def test_task_creation(self):
        """Test that a task is created correctly."""
        self.assertEqual(self.task.title, 'Test Task')
        self.assertEqual(self.task.priority, 'medium')
        self.assertEqual(self.task.status, 'todo')

    def test_task_str(self):
        """Test the string representation of a task."""
        self.assertEqual(str(self.task), 'Test Task (todo)')

    def test_task_belongs_to_user(self):
        """Test that the task is associated with the correct user."""
        self.assertEqual(self.task.user, self.user)


class TaskAPITest(TestCase):
    """Integration tests for the Task REST API endpoints."""

    def setUp(self):
        """Set up test client, user, and authentication."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='apiuser',
            password='apipass123'
        )
        # Get JWT token
        response = self.client.post('/api/auth/login/', {
            'username': 'apiuser',
            'password': 'apipass123'
        })
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_task(self):
        """Test POST /api/tasks/ creates a new task."""
        data = {
            'title': 'New Task',
            'description': 'Created via API',
            'priority': 'high',
            'status': 'todo',
        }
        response = self.client.post('/api/tasks/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Task')

    def test_list_tasks(self):
        """Test GET /api/tasks/ returns only logged-in user's tasks."""
        Task.objects.create(user=self.user, title='Task 1', priority='low', status='todo')
        Task.objects.create(user=self.user, title='Task 2', priority='high', status='done')

        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_update_task(self):
        """Test PUT /api/tasks/{id}/ updates a task."""
        task = Task.objects.create(
            user=self.user, title='Old Title', priority='low', status='todo'
        )
        response = self.client.put(f'/api/tasks/{task.id}/', {
            'title': 'Updated Title',
            'priority': 'high',
            'status': 'in_progress',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')
        self.assertEqual(response.data['status'], 'in_progress')

    def test_delete_task(self):
        """Test DELETE /api/tasks/{id}/ removes a task."""
        task = Task.objects.create(
            user=self.user, title='Delete Me', priority='low', status='todo'
        )
        response = self.client.delete(f'/api/tasks/{task.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())

    def test_filter_by_status(self):
        """Test filtering tasks by status."""
        Task.objects.create(user=self.user, title='Task A', priority='low', status='todo')
        Task.objects.create(user=self.user, title='Task B', priority='low', status='done')

        response = self.client.get('/api/tasks/?status=done')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_search_by_title(self):
        """Test searching tasks by title keyword."""
        Task.objects.create(user=self.user, title='Fix login bug', priority='high', status='todo')
        Task.objects.create(user=self.user, title='Design homepage', priority='low', status='todo')

        response = self.client.get('/api/tasks/?search=login')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_unauthenticated_access(self):
        """Test that unauthenticated requests are rejected."""
        self.client.credentials()  # Remove token
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
