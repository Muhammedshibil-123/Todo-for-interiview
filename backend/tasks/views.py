from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.conf import settings
from pgvector.django import CosineDistance
from .models import Task
from .serializers import TaskSerializer
from .ai_services import embedding_service

import logging
logger = logging.getLogger(__name__)


def _update_task_embedding(task):
    """
    Helper: Generate and save embedding for a task.
    Non-blocking — if it fails, the task is still saved without an embedding.
    """
    try:
        embedding = embedding_service.generate_task_embedding(task)
        if embedding:
            Task.objects.filter(pk=task.pk).update(embedding=embedding)
            logger.info(f"[EMBEDDING] Saved embedding for task #{task.pk}")
    except Exception as e:
        logger.error(f"[EMBEDDING] Failed for task #{task.pk}: {e}")


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
            task = serializer.save(user=request.user)

            # Generate and save embedding for the new task
            _update_task_embedding(task)

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
            updated_task = serializer.save()

            # Re-generate embedding when task is fully updated
            _update_task_embedding(updated_task)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        # partial=True allows updating only the fields that are sent
        task = self.get_object(pk, request.user)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            updated_task = serializer.save()

            # Re-generate embedding when task is updated
            _update_task_embedding(updated_task)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = self.get_object(pk, request.user)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AIChatView(APIView):
    """
    POST /api/tasks/ai-chat/
    Body: { "message": "What high-priority tasks are due this week?" }

    AI-powered chat assistant using RAG (Retrieval-Augmented Generation).
    1. Embeds the user's question via Gemini
    2. Finds the top 5 most relevant tasks via pgvector cosine similarity
    3. Sends those tasks + the question to Groq LLM
    4. Returns the LLM's natural language response
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip()
        if not message:
            return Response(
                {'error': 'Message is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 1: Embed the user's question
        query_embedding = embedding_service.generate_embedding(message)
        if query_embedding is None:
            return Response(
                {'error': 'AI service temporarily unavailable.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Step 2: Find top 5 most relevant tasks via pgvector
        relevant_tasks = list(
            Task.objects
            .filter(user=request.user, embedding__isnull=False)
            .annotate(distance=CosineDistance('embedding', query_embedding))
            .order_by('distance')[:5]
        )

        # Step 3: Build context string from the retrieved tasks
        if relevant_tasks:
            tasks_context = "\n".join([
                f"- Title: {t.title} | Description: {t.description or 'None'} | "
                f"Priority: {t.priority} | Status: {t.status} | "
                f"Due: {t.due_date.strftime('%B %d, %Y') if t.due_date else 'No due date'}"
                for t in relevant_tasks
            ])
        else:
            tasks_context = "No tasks found."

        # Step 4: Send to Groq LLM with the context
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)

            system_prompt = f"""You are a helpful and friendly AI task assistant for a Todo application called TaskFlow.
You help users understand, manage, and organize their tasks.

Here are the user's most relevant tasks based on their question:
{tasks_context}

Rules:
- Answer based ONLY on the tasks provided above.
- If the tasks don't contain enough info to answer, say so honestly.
- Keep responses concise and helpful (2-4 sentences max).
- Use a friendly, professional tone.
- If asked about priorities, due dates, or status, reference the actual task data.
- Format task names in bold when mentioning them."""

            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                model="llama-3.1-8b-instant",
                temperature=0.3,
                max_tokens=300,
            )

            ai_response = chat_completion.choices[0].message.content.strip()

            return Response({
                'message': message,
                'response': ai_response,
                'tasks_used': len(relevant_tasks),
            })

        except Exception as e:
            logger.error(f"[AI_CHAT] Groq error: {e}")
            return Response(
                {'error': 'AI chat service temporarily unavailable.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


