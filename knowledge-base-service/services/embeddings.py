import google.generativeai as genai
import os
from typing import List

# Configure Google API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

EMBEDDING_MODEL = "models/embedding-001"

def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for a single text chunk using Google Gemini.
    """
    if not GOOGLE_API_KEY:
        print("Warning: GOOGLE_API_KEY not set. Returning dummy embedding.")
        return [0.0] * 768

    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document",
            title="Embedding of chunk"
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return []

def generate_query_embedding(text: str) -> List[float]:
    """
    Generate embedding for a query.
    """
    if not GOOGLE_API_KEY:
        return [0.0] * 768

    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_query"
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating query embedding: {e}")
        return []
