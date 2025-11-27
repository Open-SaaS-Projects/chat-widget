import httpx
import os
from typing import List, Dict, Any

KNOWLEDGE_BASE_URL = os.getenv("KNOWLEDGE_BASE_URL", "http://localhost:8000")

class KBService:
    async def get_relevant_context(self, query: str, project_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Query the Knowledge Base service for relevant chunks.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{KNOWLEDGE_BASE_URL}/query",
                    data={
                        "query": query,
                        "project_id": project_id,
                        "limit": limit
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error querying Knowledge Base: {e}")
                return []
