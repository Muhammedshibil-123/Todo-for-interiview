import os, sys, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
sys.path.insert(0, '.')
django.setup()

from tasks.models import Task
from tasks.ai_services import embedding_service
from pgvector.django import CosineDistance

queries = [
    'its i added any web related things',
    'web',
    'website',
    'react',
]

for query in queries:
    qe = embedding_service.generate_embedding(query)
    all_tasks = list(
        Task.objects.filter(embedding__isnull=False)
        .annotate(distance=CosineDistance('embedding', qe))
        .order_by('distance')[:5]
    )
    
    print(f'\nQuery: "{query}"')
    for t in all_tasks:
        print(f'    {t.distance:.4f}  |  {t.title}')
