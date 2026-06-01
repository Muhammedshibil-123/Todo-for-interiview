"""
Management command to backfill vector embeddings for existing tasks.
Run with: python manage.py backfill_embeddings
"""

import time
from django.core.management.base import BaseCommand
from tasks.models import Task
from tasks.ai_services import embedding_service


class Command(BaseCommand):
    help = 'Generate and save vector embeddings for all tasks that do not have one yet.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-generate embeddings for ALL tasks, even those that already have one.',
        )

    def handle(self, *args, **options):
        if options['force']:
            tasks = Task.objects.all()
            self.stdout.write(f"Force mode: regenerating embeddings for ALL {tasks.count()} tasks...")
        else:
            tasks = Task.objects.filter(embedding__isnull=True)
            self.stdout.write(f"Found {tasks.count()} tasks without embeddings.")

        if not tasks.exists():
            self.stdout.write(self.style.SUCCESS("Nothing to do. All tasks already have embeddings."))
            return

        success = 0
        failed = 0

        for task in tasks:
            try:
                embedding = embedding_service.generate_task_embedding(task)
                if embedding:
                    Task.objects.filter(pk=task.pk).update(embedding=embedding)
                    success += 1
                    self.stdout.write(f"  [OK] Task #{task.pk}: {task.title[:50]}")
                else:
                    failed += 1
                    self.stdout.write(self.style.WARNING(f"  [SKIP] Task #{task.pk}: No embedding returned"))

                # Small delay to respect API rate limits
                time.sleep(0.3)

            except Exception as e:
                failed += 1
                self.stdout.write(self.style.ERROR(f"  [FAIL] Task #{task.pk}: {e}"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Done! {success} embeddings generated, {failed} failed."))
