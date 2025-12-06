"""
Workflow state management service using Redis
"""

from typing import Dict, Optional, Any
import json
import redis


class WorkflowService:
    """Service for managing workflow execution state in Redis"""
    
    def __init__(self, redis_url: str = "redis://redis:6379/0"):
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
        except Exception as e:
            print(f"Warning: Could not connect to Redis: {e}")
            self.redis_client = None
    
    def _get_workflow_key(self, project_id: str, session_id: str) -> str:
        """Generate Redis key for workflow state"""
        return f"workflow:{project_id}:{session_id}"
    
    def get_workflow_state(self, project_id: str, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve workflow state from Redis"""
        if not self.redis_client:
            return None
        
        try:
            key = self._get_workflow_key(project_id, session_id)
            state_json = self.redis_client.get(key)
            
            if state_json:
                return json.loads(state_json)
            return None
        except Exception as e:
            print(f"Error getting workflow state: {e}")
            return None
    
    def set_workflow_state(
        self,
        project_id: str,
        session_id: str,
        state: Dict[str, Any],
        ttl: int = 86400  # 24 hours
    ) -> bool:
        """Store workflow state in Redis"""
        if not self.redis_client:
            return False
        
        try:
            key = self._get_workflow_key(project_id, session_id)
            state_json = json.dumps(state)
            self.redis_client.setex(key, ttl, state_json)
            return True
        except Exception as e:
            print(f"Error setting workflow state: {e}")
            return False
    
    def reset_workflow_state(self, project_id: str, session_id: str) -> bool:
        """Delete workflow state from Redis"""
        if not self.redis_client:
            return False
        
        try:
            key = self._get_workflow_key(project_id, session_id)
            self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"Error resetting workflow state: {e}")
            return False
    
    def update_workflow_variables(
        self,
        project_id: str,
        session_id: str,
        variables: Dict[str, Any]
    ) -> bool:
        """Update workflow variables in existing state"""
        state = self.get_workflow_state(project_id, session_id)
        if state:
            state['variables'] = {**state.get('variables', {}), **variables}
            return self.set_workflow_state(project_id, session_id, state)
        return False
