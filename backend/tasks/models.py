from django.db import models
from django.contrib.auth.models import User
from pgvector.django import VectorField


class Task(models.Model):
    """
    Task model representing a single task in the system.
    Each task belongs to a user and has priority, status, and due date.
    Includes a vector embedding field for AI-powered semantic search.
    """

    # Priority choices
    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
    ]

    # Status choices
    STATUS_TODO = 'todo'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_DONE = 'done'
    STATUS_CHOICES = [
        (STATUS_TODO, 'To Do'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_DONE, 'Done'),
    ]

    # Fields
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_TODO)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # AI Semantic Search — pgvector embedding (3072 dimensions from Gemini)
    embedding = VectorField(dimensions=3072, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"

    def get_embedding_text(self):
        """
        Serializes all task fields into a single descriptive string
        that will be converted into a vector embedding for semantic search.
        """
        priority_map = {'low': 'Low', 'medium': 'Medium', 'high': 'High'}
        status_map = {'todo': 'To Do', 'in_progress': 'In Progress', 'done': 'Done'}

        parts = [f"Task: {self.title}."]
        if self.description:
            parts.append(f"Description: {self.description}.")
        parts.append(f"Priority: {priority_map.get(self.priority, self.priority)}.")
        parts.append(f"Status: {status_map.get(self.status, self.status)}.")
        if self.due_date:
            parts.append(f"Due date: {self.due_date.strftime('%B %d, %Y')}.")
        return " ".join(parts)

