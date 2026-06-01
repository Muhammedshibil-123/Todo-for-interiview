from django.urls import path
from .views import TaskListCreateView, TaskDetailView, AIChatView

urlpatterns = [
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/ai-chat/', AIChatView.as_view(), name='ai-chat'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
]

