from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class DatabaseConnection(BaseModel):
    project_id: str
    type: Literal["postgres", "mysql"]
    name: str = Field(..., description="Friendly name for this connection")
    
    # Connection Details
    host: str
    port: int
    username: str
    encrypted_password: str
    database: str
    
    ssl_mode: Optional[str] = "prefer"
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CreateDatabaseConnectionRequest(BaseModel):
    type: Literal["postgres", "mysql"]
    name: str
    host: str
    port: int
    username: str
    password: str  # Plain text in request, will be encrypted
    database: str
    ssl_mode: Optional[str] = "prefer"
