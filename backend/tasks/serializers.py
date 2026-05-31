from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.
    Converts Task objects to/from JSON format for the API.
    """
    # Read-only fields that are auto-generated
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'user',
            'title',
            'description',
            'priority',
            'status',
            'due_date',
            'created_at',
            'updated_at',
        ]

    def validate_title(self, value):
        """Title must not be empty."""
        if not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value
