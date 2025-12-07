from typing import List, Dict, Any, Optional
from models.tool_action import AgentAction, CreateAgentActionRequest, ParameterDefinition
from services.database_service import DatabaseService
import uuid
import json

# In-memory storage for MVP
# Map: project_id -> Action ID -> AgentAction
_ACTIONS_DB: Dict[str, Dict[str, AgentAction]] = {}

class ToolsService:
    def __init__(self, database_service: DatabaseService = None):
        self.db_service = database_service or DatabaseService()

    def create_action(self, project_id: str, request: CreateAgentActionRequest) -> AgentAction:
        """Create a new named action (tool) for the agent."""
        action_id = str(uuid.uuid4())
        
        action = AgentAction(
            id=action_id,
            project_id=project_id,
            connection_id=request.connection_id,
            name=request.name,
            description=request.description,
            sql_query=request.sql_query,
            parameters=request.parameters
        )
        
        if project_id not in _ACTIONS_DB:
            _ACTIONS_DB[project_id] = {}
            
        _ACTIONS_DB[project_id][action_id] = action
        return action

    def get_actions(self, project_id: str) -> List[AgentAction]:
        """Get all actions defined for a project."""
        if project_id not in _ACTIONS_DB:
            return []
        return list(_ACTIONS_DB[project_id].values())

    def get_action(self, project_id: str, action_id: str) -> Optional[AgentAction]:
        if project_id in _ACTIONS_DB and action_id in _ACTIONS_DB[project_id]:
            return _ACTIONS_DB[project_id][action_id]
        return None

    def get_tools_for_llm(self, project_id: str) -> List[Dict[str, Any]]:
        """
        Convert defined Actions into LiteLLM/OpenAI Tool definitions.
        """
        actions = self.get_actions(project_id)
        tools = []
        
        for action in actions:
            # Build JSON Schema for parameters
            properties = {}
            required = []
            
            for param_name, param_def in action.parameters.items():
                properties[param_name] = {
                    "type": param_def.type,
                    "description": param_def.description
                }
                if param_def.required:
                    required.append(param_name)
            
            tool_def = {
                "type": "function",
                "function": {
                    "name": action.name,
                    "description": action.description,
                    "parameters": {
                        "type": "object",
                        "properties": properties,
                        "required": required
                    }
                }
            }
            tools.append(tool_def)
            
        return tools


    async def execute_tool_call(self, tool_call: Dict[str, Any], project_id: str) -> str:
        """
        Execute a tool call requested by the LLM.
        """
        function_name = tool_call.get("function", {}).get("name")
        arguments_json = tool_call.get("function", {}).get("arguments", "{}")
        
        try:
            arguments = json.loads(arguments_json)
        except json.JSONDecodeError:
            return f"Error: Invalid JSON arguments for tool {function_name}"

        print(f"🔧 Executing Action: {function_name} with params: {arguments}")

        # Find the action definition for the given project
        # This assumes _ACTIONS_DB is the source of truth and self.actions is not pre-populated
        project_actions = _ACTIONS_DB.get(project_id, {})
        action = next((a for a in project_actions.values() if a.name == function_name), None)
        
        if not action:
            return f"Error: Tool {function_name} not found for project {project_id}."

        try:
            if action.action_type == "database":
                if not action.connection_id or not action.sql_query:
                     return "Error: Misconfigured Database Action."
                
                # Execute SQL via DatabaseService
                result = self.db_service.execute_query(
                    project_id=project_id,
                    connection_id=action.connection_id,
                    sql_query=action.sql_query,
                    params=arguments
                )
                return json.dumps(result, default=str)
            
            elif action.action_type == "api" and action.api_config:
                # Execute API Request
                
                url = action.api_config.url
                # URL param substitution (e.g., :id -> 123)
                for key, value in arguments.items():
                    if f":{key}" in url:
                        url = url.replace(f":{key}", str(value))
                
                # Body substitution if POST/PUT
                json_body = None
                if action.api_config.body:
                    # Deep copy to avoid mutating cache
                    json_body = json.loads(json.dumps(action.api_config.body))
                    # Simple recursive substitution could go here. 
                    # For MVP, let's assume flat body or direct top-level keys match arguments
                    for k, v in json_body.items():
                        if isinstance(v, str) and v.startswith(":") and v[1:] in arguments:
                             json_body[k] = arguments[v[1:]]

                # Headers
                headers = action.api_config.headers or {}
                
                async with httpx.AsyncClient() as client:
                    response = await client.request(
                        method=action.api_config.method,
                        url=url,
                        headers=headers,
                        json=json_body if json_body else None,
                        timeout=10.0
                    )
                    
                    # Return success or error
                    if response.status_code >= 400:
                         return f"API Error {response.status_code}: {response.text}"
                    
                    try:
                        return json.dumps(response.json(), default=str)
                    except:
                        return response.text

            return "Error: Unknown action type or configuration."

        except Exception as e:
            print(f"❌ Execution Error: {e}")
            return f"Error executing tool: {str(e)}"
