from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import json
from services.kb_service import KBService
from services.llm_service import LLMService
from services.session_service import SessionService

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
llm_service = LLMService()
session_service = SessionService()

class ChatRequest(BaseModel):
    query: str
    project_id: str
    session_id: Optional[str] = "default"
    history: List[Dict[str, str]] = []
    persona: Optional[Dict[str, str]] = {}

@app.get("/")
async def root():
    return {
        "message": "AI Agent Service is running",
        "model": os.getenv("LITELLM_MODEL", "gemini/gemini-2.5-flash")
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/chat")
async def chat(request: ChatRequest):
    print(f"📨 Chat Request: query='{request.query}' project_id='{request.project_id}'")
    print(f"🎭 Persona Config: {json.dumps(request.persona, indent=2)}")
    
    # 1. Get conversation history from Redis
    stored_history = session_service.get_conversation_history(request.project_id, request.session_id)
    
    # Use stored history if available, otherwise use provided history
    conversation_history = stored_history if stored_history else request.history
    
    # 2. Retrieve context from Knowledge Base
    context = await kb_service.get_relevant_context(request.query, request.project_id)
    
    # 3. Generate response using LLM with conversation history and persona
    response = await llm_service.generate_response(request.query, context, conversation_history, request.persona)
    
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
            async for chunk in llm_service.generate_stream_response(query, context, history):
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
