from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import json
from services.kb_service import KBService
from services.llm_service import LLMService
from services.session_service import SessionService
from services.workflow_executor import WorkflowExecutor
from services.workflow_service import WorkflowService
from services.database_service import DatabaseService
from services.tools_service import ToolsService
from models.db_connection import CreateDatabaseConnectionRequest
from models.tool_action import CreateAgentActionRequest

app = FastAPI(
    title="AI Agent Service",
    description="Microservice for AI Chat Agent using Google Gemini",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
kb_service = KBService()
session_service = SessionService()
workflow_service = WorkflowService()
database_service = DatabaseService()
tools_service = ToolsService(database_service)
llm_service = LLMService(tools_service) # Inject tools_service

class ChatRequest(BaseModel):
    query: str
    project_id: str
    session_id: Optional[str] = "default"
    history: List[Dict[str, str]] = []
    persona: Optional[Dict[str, str]] = {}
    workflow_state: Optional[Dict] = None  # For hybrid execution

@app.get("/")
async def root():
    return {
        "message": "AI Agent Service is running",
        "model": os.getenv("LITELLM_MODEL", "gemini/gemini-2.5-flash")
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# --- Database Connection Management ---
@app.post("/projects/{project_id}/db-connection")
async def create_db_connection(project_id: str, request: CreateDatabaseConnectionRequest):
    """Save a database connection configuration."""
    try:
        connection = database_service.save_connection(project_id, request)
        # Don't return the password
        response = connection.model_dump()
        response.pop("encrypted_password")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}/db-connection")
async def get_db_connections(project_id: str):
    """Get all connections for a project."""
    return database_service.get_connections(project_id)

@app.post("/projects/{project_id}/db-connection/{connection_id}/test")
async def test_db_connection(project_id: str, connection_id: str):
    """Test a database connection."""
    try:
        success = database_service.test_connection(project_id, connection_id)
        return {"success": success}
    except Exception as e:
        return {"success": False, "error": str(e)}

# --- Action (Tools) Management ---
@app.post("/projects/{project_id}/actions")
async def create_action(project_id: str, request: CreateAgentActionRequest):
    """Create a new Named SQL Action (Tool)."""
    try:
        action = tools_service.create_action(project_id, request)
        return action
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}/actions")
async def get_actions(project_id: str):
    """List all actions for a project."""
    return tools_service.get_actions(project_id)

# --- Chat Endpoints ---

@app.post("/chat")
async def chat(request: ChatRequest):
    print(f"📨 Chat Request: query='{request.query}' project_id='{request.project_id}'")
    print(f"🎭 Persona Config: {json.dumps(request.persona, indent=2)}")
    
    # Check if project has workflow (would come from project config in production)
    # For now, we'll check if workflow_state is provided
    if request.workflow_state:
        # Hybrid execution: Frontend sent workflow state, execute backend node
        print(f"🔄 Hybrid workflow execution for node: {request.workflow_state.get('currentNodeId')}")
        
        # Get workflow definition from project config (mock for now)
        # In production, load from database/storage
        workflow_def = request.workflow_state.get('workflow', {})
        
        if workflow_def:
            executor = WorkflowExecutor(
                workflow_definition=workflow_def,
                session_id=request.session_id,
                project_id=request.project_id,
                llm_service=llm_service,
                kb_service=kb_service
            )
            
            # Load state from frontend
            executor.load_state(request.workflow_state)
            
            # Execute current backend node
            result = await executor.execute_current_node()
            
            # Save state to Redis
            workflow_service.set_workflow_state(
                request.project_id,
                request.session_id,
                executor.get_state()
            )
            
            return {
                "node_result": {
                    "messages": result.messages,
                    "nextNodeId": result.next_node_id,
                    "variables": result.variables,
                    "isComplete": result.is_complete
                },
                "session_id": request.session_id
            }
    
    # Default behavior: No workflow, use existing LLM-based chat
    # 1. Get conversation history from Redis
    stored_history = session_service.get_conversation_history(request.project_id, request.session_id)
    
    # Use stored history if available, otherwise use provided history
    conversation_history = stored_history if stored_history else request.history
    
    # 2. Retrieve context from Knowledge Base
    context = await kb_service.get_relevant_context(request.query, request.project_id)
    
    # 3. Generate response using LLM with conversation history and persona
    # IMPORTANT: Passing project_id to enable tool usage specific to this project
    response = await llm_service.generate_response(
        query=request.query, 
        context_chunks=context, 
        history=conversation_history, 
        persona_config=request.persona,
        project_id=request.project_id
    )
    
    # 4. Update conversation history in Redis
    session_service.add_message_to_history(request.project_id, request.session_id, "user", request.query)
    session_service.add_message_to_history(request.project_id, request.session_id, "assistant", response)
    
    return {
        "response": response,
        "context_used": context,
        "session_id": request.session_id
    }

@app.websocket("/ws/chat/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await websocket.accept()
    session_id = "default"  # Could be passed as query param
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            query = message_data.get("query")
            
            if not query:
                continue
            
            # Get conversation history
            history = session_service.get_conversation_history(project_id, session_id)
                
            # 1. Retrieve context
            context = await kb_service.get_relevant_context(query, project_id)
            
            # 2. Stream response
            full_response = ""
            # IMPORTANT: Passing project_id to enable tool usage
            async for chunk in llm_service.generate_stream_response(
                query=query, 
                context_chunks=context, 
                history=history,
                project_id=project_id
            ):
                full_response += chunk
                await websocket.send_text(json.dumps({
                    "type": "chunk",
                    "content": chunk
                }))
            
            # Send completion message
            await websocket.send_text(json.dumps({
                "type": "complete",
                "full_response": full_response,
                "context_used": context
            }))
            
            # Update history in Redis
            session_service.add_message_to_history(project_id, session_id, "user", query)
            session_service.add_message_to_history(project_id, session_id, "assistant", full_response)
            
    except WebSocketDisconnect:
        print(f"Client disconnected from project {project_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass
