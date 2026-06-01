import os, sys, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
sys.path.insert(0, '.')
django.setup()

from tasks.models import Task
from tasks.ai_services import embedding_service
from pgvector.django import CosineDistance

queries = [
    'something about school homework',
    'website deployment and coding',
    'health exercise body fitness',
    'cooking food dinner',
    'its i added any web related things',
]

for query in queries:
    qe = embedding_service.generate_embedding(query)
    all_tasks = list(
        Task.objects.filter(embedding__isnull=False)
        .annotate(distance=CosineDistance('embedding', qe))
        .order_by('distance')[:15]
    )
    
    best = all_tasks[0].distance
    relative_cutoff = best * 1.20
    absolute_cutoff = 0.48
    cutoff = min(relative_cutoff, absolute_cutoff)
    filtered = [t for t in all_tasks if t.distance <= cutoff]
    
    print(f'\nQuery: "{query}" (best={best:.4f}, cutoff={cutoff:.4f})')
    print(f'  Showing {len(filtered)} of {len(all_tasks)}:')
    for t in filtered:
        print(f'    {t.distance:.4f}  |  {t.title}')
