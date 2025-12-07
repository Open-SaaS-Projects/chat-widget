from pydantic import BaseModel, Field
from typing import Dict, Optional, Any, Literal

class ParameterDefinition(BaseModel):
    type: str = Field(..., description="Data type of the parameter (string, integer, etc.)")
    description: str = Field(..., description="Description of the parameter for the LLM")
    required: bool = Field(True, description="Whether the parameter is required")

class ApiConfig(BaseModel):
    url: str = Field(..., description="The API endpoint URL")
    method: Literal["GET", "POST", "PUT", "DELETE", "PATCH"] = Field("GET", description="HTTP method")
    headers: Optional[Dict[str, str]] = Field(None, description="HTTP headers")
    body: Optional[Dict[str, Any]] = Field(None, description="JSON body template (can use :param syntax)")

class AgentAction(BaseModel):
    id: Optional[str] = Field(None, description="Unique identifier for the action")
    project_id: str = Field(..., description="Project ID this action belongs to")
    connection_id: Optional[str] = Field(None, description="ID of the database connection (required if action_type is database)")
    name: str = Field(..., description="Name of the tool/action (snake_case)")
    description: str = Field(..., description="Description of what the action does")
    action_type: Literal["database", "api"] = Field("database", description="Type of action")
    sql_query: Optional[str] = Field(None, description="SQL query to execute (required if action_type is database)")
    api_config: Optional[ApiConfig] = Field(None, description="API configuration (required if action_type is api)")
    parameters: Dict[str, ParameterDefinition] = Field(default_factory=dict, description="Parameters for the query or API")

class CreateAgentActionRequest(BaseModel):
    connection_id: Optional[str] = None
    name: str
    description: str
    action_type: Literal["database", "api"] = "database"
    sql_query: Optional[str] = None
    api_config: Optional[ApiConfig] = None
    parameters: Dict[str, ParameterDefinition] = {}
