from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
import json
from services.kb_service import KBService
from services.llm_service import LLMService

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

class ChatRequest(BaseModel):
    query: str
    project_id: str
    history: List[Dict[str, str]] = []

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
    # 1. Retrieve context from Knowledge Base
    context = await kb_service.get_relevant_context(request.query, request.project_id)
    
    # 2. Generate response using LLM
    response = await llm_service.generate_response(request.query, context, request.history)
    
    return {
        "response": response,
        "context_used": context
    }

@app.websocket("/ws/chat/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await websocket.accept()
    history = [] # In a real app, load this from Redis/DB
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message_data = json.loads(data)
            query = message_data.get("query")
            
            if not query:
                continue
                
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
            
            # Update history (simple in-memory for this session)
            history.append({"role": "user", "content": query})
            history.append({"role": "assistant", "content": full_response})
            
    except WebSocketDisconnect:
        print(f"Client disconnected from project {project_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass
