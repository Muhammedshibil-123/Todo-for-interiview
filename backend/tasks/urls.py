from django.urls import path
from .views import TaskListCreateView, TaskDetailView, AIChatView

urlpatterns = [
    # GET  /api/tasks/      → list tasks (with filters, search, pagination)
    # POST /api/tasks/      → create task
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),

    # POST /api/tasks/ai-chat/  → AI chat assistant (RAG)
    path('tasks/ai-chat/', AIChatView.as_view(), name='ai-chat'),

    # GET    /api/tasks/{id}/  → retrieve task
    # PUT    /api/tasks/{id}/  → full update
    # PATCH  /api/tasks/{id}/  → partial update (e.g. just change status)
    # DELETE /api/tasks/{id}/  → delete task
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
]

