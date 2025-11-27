import redis
import json
import os
from typing import List, Dict
from datetime import timedelta

class SessionService:
    def __init__(self):
        redis_host = os.getenv("REDIS_HOST", "redis")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True
        )
        self.session_ttl = timedelta(hours=24)  # Sessions expire after 24 hours
    
    def get_session_key(self, project_id: str, session_id: str) -> str:
        """Generate Redis key for session"""
        return f"chat_session:{project_id}:{session_id}"
    
    def get_conversation_history(self, project_id: str, session_id: str) -> List[Dict[str, str]]:
        """Retrieve conversation history from Redis"""
        key = self.get_session_key(project_id, session_id)
        history_json = self.redis_client.get(key)
        
        if history_json:
            return json.loads(history_json)
        return []
    
    def save_conversation_history(self, project_id: str, session_id: str, history: List[Dict[str, str]]):
        """Save conversation history to Redis"""
        key = self.get_session_key(project_id, session_id)
        self.redis_client.setex(
            key,
            self.session_ttl,
            json.dumps(history)
        )
    
    def add_message_to_history(self, project_id: str, session_id: str, role: str, content: str):
        """Add a single message to conversation history"""
        history = self.get_conversation_history(project_id, session_id)
        history.append({"role": role, "content": content})
        
        # Keep only last 20 messages to avoid token limits
        if len(history) > 20:
            history = history[-20:]
        
        self.save_conversation_history(project_id, session_id, history)
    
    def clear_session(self, project_id: str, session_id: str):
        """Clear conversation history for a session"""
        key = self.get_session_key(project_id, session_id)
        self.redis_client.delete(key)
