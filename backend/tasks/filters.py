from django_filters import rest_framework as filters
from .models import Task


class TaskFilter(filters.FilterSet):
    """
    Custom filter for Task queryset.
    Allows filtering by status and priority.
    """
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    priority = filters.CharFilter(field_name='priority', lookup_expr='exact')
    due_date_before = filters.DateFilter(field_name='due_date', lookup_expr='lte')
    due_date_after = filters.DateFilter(field_name='due_date', lookup_expr='gte')

    class Meta:
        model = Task
        fields = ['status', 'priority', 'due_date_before', 'due_date_after']
