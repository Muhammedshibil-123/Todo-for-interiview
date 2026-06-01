

import requests
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiEmbeddingService:

    EMBEDDING_MODEL = "gemini-embedding-001"
    EMBEDDING_DIMENSIONS = 3072
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not self.api_key:
            logger.warning("[EMBEDDING] GEMINI_API_KEY not configured. Embeddings will be skipped.")

    def _build_text(self, task) -> str:
        parts = [f"Task: {task.title}."]

        if task.description:
            parts.append(f"Description: {task.description}.")


        priority_map = {'low': 'Low', 'medium': 'Medium', 'high': 'High'}
        status_map = {'todo': 'To Do', 'in_progress': 'In Progress', 'done': 'Done'}

        parts.append(f"Priority: {priority_map.get(task.priority, task.priority)}.")
        parts.append(f"Status: {status_map.get(task.status, task.status)}.")

        if task.due_date:
            parts.append(f"Due date: {task.due_date.strftime('%B %d, %Y')}.")

        return " ".join(parts)

    def generate_embedding(self, text: str):
        if not self.api_key:
            return None

        url = f"{self.BASE_URL}/{self.EMBEDDING_MODEL}:embedContent?key={self.api_key}"

        payload = {
            "model": f"models/{self.EMBEDDING_MODEL}",
            "content": {
                "parts": [{"text": text}]
            }
        }

        try:
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=15
            )

            if response.status_code != 200:
                logger.error(f"[EMBEDDING] Gemini API error {response.status_code}: {response.text[:200]}")
                return None

            data = response.json()
            embedding = data.get("embedding", {}).get("values", None)

            if embedding and len(embedding) == self.EMBEDDING_DIMENSIONS:
                logger.info(f"[EMBEDDING] Successfully generated {self.EMBEDDING_DIMENSIONS}D vector")
                return embedding
            else:
                logger.error(f"[EMBEDDING] Unexpected response shape: {len(embedding) if embedding else 'None'}")
                return None

        except requests.exceptions.Timeout:
            logger.error("[EMBEDDING] Gemini API request timed out")
            return None
        except Exception as e:
            logger.error(f"[EMBEDDING] Unexpected error: {e}")
            return None

    def generate_task_embedding(self, task):
        text = self._build_text(task)
        return self.generate_embedding(text)


class GroqService:
    def __init__(self):
        self.api_key = getattr(settings, 'GROQ_API_KEY', None)
        if not self.api_key:
            logger.warning("[GROQ] GROQ_API_KEY not configured. Query rewriting will be skipped.")

    def rewrite_query(self, query: str) -> str:
        if not self.api_key:
            return query

        try:
            from groq import Groq
            client = Groq(api_key=self.api_key)
            
            prompt = f"""
            You are an expert search query optimizer for a Todo list application.
            The user typed this conversational query: "{query}"
            
            Convert this into 1-3 highly specific keywords that describe the core topic.
            CRITICAL: Ignore generic words like 'things', 'related', 'any', 'added', 'its', 'show', 'me'.
            For example, if the query is "its i added any web related things", you should return "website, internet, deployment".
            
            Return ONLY the keywords separated by commas. No explanations.
            """
            
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.1,
                max_tokens=30,
            )
            
            rewritten = chat_completion.choices[0].message.content.strip()
            logger.info(f"[GROQ] Rewrote query: '{query}' -> '{rewritten}'")
            

            if not rewritten or len(rewritten) > 100:
                return query
                
            return rewritten
            
        except Exception as e:
            logger.error(f"[GROQ] Query rewrite failed: {e}")
            return query


embedding_service = GeminiEmbeddingService()
groq_service = GroqService()
