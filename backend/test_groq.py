import os, sys, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
sys.path.insert(0, '.')
django.setup()

from tasks.models import Task
from tasks.ai_services import embedding_service, groq_service
from pgvector.django import CosineDistance

query = 'its i added any web related things'

print(f"Original Query: '{query}'")
optimized = groq_service.rewrite_query(query)
print(f"Optimized Query (from Groq): '{optimized}'")

qe = embedding_service.generate_embedding(optimized)
all_tasks = list(
    Task.objects.filter(embedding__isnull=False)
    .annotate(distance=CosineDistance('embedding', qe))
    .order_by('distance')[:15]
)

if all_tasks:
    best = all_tasks[0].distance
    relative_cutoff = best * 1.08
    absolute_cutoff = 0.48
    cutoff = min(relative_cutoff, absolute_cutoff)
    filtered = [t for t in all_tasks if t.distance <= cutoff]

    print(f'\nSearch Results (best={best:.4f}, cutoff={cutoff:.4f}):')
    for t in filtered:
        print(f'  {t.distance:.4f}  |  {t.title}')
