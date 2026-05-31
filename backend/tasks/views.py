from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Task
from .serializers import TaskSerializer


class TaskListCreateView(APIView):
    """
    GET  /api/tasks/  — List all tasks for the logged-in user.
                        Supports filtering by status & priority,
                        search by title, and pagination.

    POST /api/tasks/  — Create a new task.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Start with only the logged-in user's tasks
        tasks = Task.objects.filter(user=request.user)

        # --- Filter by status (e.g. ?status=todo) ---
        status_param = request.query_params.get('status')
        if status_param:
            tasks = tasks.filter(status=status_param)

        # --- Filter by priority (e.g. ?priority=high) ---
        priority_param = request.query_params.get('priority')
        if priority_param:
            tasks = tasks.filter(priority=priority_param)

        # --- Search by title (e.g. ?search=login) ---
        search_param = request.query_params.get('search')
        if search_param:
            tasks = tasks.filter(title__icontains=search_param)

        # --- Pagination ---
        # Default: 6 tasks per page, e.g. ?page=2
        page_size = 6
        total_count = tasks.count()

        try:
            page = int(request.query_params.get('page', 1))
        except ValueError:
            page = 1

        start = (page - 1) * page_size
        end = start + page_size
        paginated_tasks = tasks[start:end]

        serializer = TaskSerializer(paginated_tasks, many=True)

        # Return response in the same format DRF pagination uses
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'results': serializer.data,
        })

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically assign the logged-in user
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    """
    GET    /api/tasks/{id}/  — Retrieve a single task.
    PUT    /api/tasks/{id}/  — Fully update a task.
    PATCH  /api/tasks/{id}/  — Partially update a task (e.g. just status).
    DELETE /api/tasks/{id}/  — Delete a task.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        """
        Helper: fetch the task only if it belongs to the current user.
        Returns 404 if not found or not owned by this user.
        """
        return get_object_or_404(Task, pk=pk, user=user)

    def get(self, request, pk):
        task = self.get_object(pk, request.user)
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, pk):
        task = self.get_object(pk, request.user)
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        # partial=True allows updating only the fields that are sent
        task = self.get_object(pk, request.user)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = self.get_object(pk, request.user)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
