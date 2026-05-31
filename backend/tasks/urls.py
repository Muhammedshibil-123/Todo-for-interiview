from django.urls import path
from .views import TaskListCreateView, TaskDetailView

urlpatterns = [
    # GET  /api/tasks/      → list tasks (with filters, search, pagination)
    # POST /api/tasks/      → create task
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),

    # GET    /api/tasks/{id}/  → retrieve task
    # PUT    /api/tasks/{id}/  → full update
    # PATCH  /api/tasks/{id}/  → partial update (e.g. just change status)
    # DELETE /api/tasks/{id}/  → delete task
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
]
