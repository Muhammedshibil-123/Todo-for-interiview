import os, sys, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
sys.path.insert(0, '.')
django.setup()

from tasks.models import Task
from tasks.ai_services import embedding_service, groq_service
from pgvector.django import CosineDistance

query = 'its i added any web related things'

print(f"Original Query: '{query}'")

# Let's test different manual rewrites
rewrites = ['web', 'website', 'web development', 'internet', 'deploy']

for optimized in rewrites:
    qe = embedding_service.generate_embedding(optimized)
    all_tasks = list(
        Task.objects.filter(embedding__isnull=False)
        .annotate(distance=CosineDistance('embedding', qe))
        .order_by('distance')[:3]
    )
    print(f"\nManual Rewrite: '{optimized}'")
    for t in all_tasks:
        print(f'  {t.distance:.4f}  |  {t.title}')
