# AI Agent Service

The AI Agent Service is a Python FastAPI microservice responsible for generating intelligent responses using Google Gemini LLM, managing conversation history, and coordinating with the Knowledge Base service.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Services](#services)
- [Configuration](#configuration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The AI Agent Service acts as the brain of the chat widget, handling:
- **LLM Integration**: Communicates with Google Gemini for response generation
- **Session Management**: Maintains conversation history using Redis
- **Context Retrieval**: Queries the Knowledge Base for relevant information
- **Response Generation**: Combines context and history to generate accurate responses

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Agent Service                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ LLM Service  │  │ KB Service   │  │Session Service│ │
│  │              │  │              │  │              │ │
│  │ - Gemini API │  │ - Query KB   │  │ - Redis      │ │
│  │ - Streaming  │  │ - Get Context│  │ - History    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │              FastAPI Application                │  │
│  │  - /chat (POST)                                 │  │
│  │  - /ws/chat/{project_id} (WebSocket)           │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   Google Gemini      Knowledge Base          Redis
   (External API)     (Port 8000)          (Port 6379)
```

## 🛠️ Technology Stack

- **Framework**: FastAPI 0.104+
- **Python**: 3.11
- **LLM Library**: LiteLLM (Google Gemini integration)
- **HTTP Client**: httpx
- **Cache/Sessions**: Redis (via redis-py)
- **ASGI Server**: Uvicorn

## 📦 Setup

### Prerequisites

- Docker and Docker Compose (recommended)
- Python 3.11+ (for local development)
- Google API Key
- Access to Knowledge Base Service
- Access to Redis

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key | ✅ Yes | - |
| `LITELLM_MODEL` | LLM model identifier | No | `gemini/gemini-2.5-flash` |
| `KNOWLEDGE_BASE_URL` | KB service URL | No | `http://knowledge-base:8000` |
| `REDIS_URL` | Redis connection string | No | `redis://redis:6379/0` |
| `REDIS_HOST` | Redis hostname | No | `redis` |
| `REDIS_PORT` | Redis port | No | `6379` |

### Installation

#### Using Docker (Recommended)

```bash
# Build the service
docker-compose build ai-agent

# Start the service
docker-compose up -d ai-agent

# View logs
docker-compose logs -f ai-agent
```

#### Local Development

```bash
cd ai-agent-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_API_KEY=your_key_here
export KNOWLEDGE_BASE_URL=http://localhost:8000
export REDIS_URL=redis://localhost:6379/0

# Run the service
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## 🔌 API Endpoints

### 1. Health Check

**GET** `/`

Returns service status.

**Response:**
```json
{
  "message": "AI Agent Service is running"
}
```

### 2. Chat Endpoint

**POST** `/chat`

Generate an AI response for a user query.

**Request Body:**
```json
{
  "query": "What is your return policy?",
  "project_id": "proj_abc123",
  "session_id": "session_xyz789",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ]
}
```

**Parameters:**
- `query` (string, required): User's question
- `project_id` (string, required): Project identifier for KB filtering
- `session_id` (string, optional): Session ID for conversation continuity
- `history` (array, optional): Previous conversation messages

**Response:**
```json
{
  "response": "Our return policy allows returns within 30 days...",
  "context_used": ["Document chunk 1", "Document chunk 2"],
  "session_id": "session_xyz789"
}
```

**Flow:**
1. Retrieve conversation history from Redis (if `session_id` provided)
2. Query Knowledge Base for relevant context
3. Generate response using LLM with context and history
4. Save updated conversation history to Redis
5. Return response

### 3. WebSocket Chat

**WebSocket** `/ws/chat/{project_id}`

Streaming chat endpoint for real-time responses.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8001/ws/chat/proj_abc123');

ws.onopen = () => {
  ws.send(JSON.stringify({
    query: "Tell me about your products",
    session_id: "session_xyz789"
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.chunk); // Streaming response chunk
};
```

**Message Format:**
```json
{
  "query": "User question",
  "session_id": "optional_session_id"
}
```

**Response Stream:**
```json
{"chunk": "I"}
{"chunk": " can"}
{"chunk": " help"}
{"done": true}
```

## 🔧 Services

### 1. LLM Service (`services/llm_service.py`)

Handles all interactions with the Google Gemini LLM.

**Key Functions:**

#### `generate_response(query, context, history)`

Generates a complete response.

```python
response = await llm_service.generate_response(
    query="What is your return policy?",
    context=["Returns accepted within 30 days..."],
    history=[
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi!"}
    ]
)
```

**Parameters:**
- `query` (str): User's question
- `context` (list): Relevant document chunks from KB
- `history` (list): Conversation history

**Returns:** Complete response string

#### `generate_stream_response(query, context, history)`

Generates a streaming response.

```python
async for chunk in llm_service.generate_stream_response(query, context, history):
    print(chunk, end='', flush=True)
```

**System Prompt:**

The service uses a carefully crafted system prompt that:
- Defines the AI's role as a customer support assistant
- Instructs natural, multilingual responses
- Emphasizes context-based answers
- Handles greetings and off-topic requests appropriately

### 2. Knowledge Base Service (`services/kb_service.py`)

Client for querying the Knowledge Base service.

**Key Functions:**

#### `get_relevant_context(query, project_id, limit=5)`

Retrieves relevant document chunks.

```python
context = await kb_service.get_relevant_context(
    query="return policy",
    project_id="proj_abc123",
    limit=5
)
# Returns: ["chunk1", "chunk2", ...]
```

**Parameters:**
- `query` (str): Search query
- `project_id` (str): Project ID for filtering
- `limit` (int): Maximum number of chunks to return

**Returns:** List of relevant text chunks

**Error Handling:**
- Returns empty list if KB service is unavailable
- Logs errors for debugging

### 3. Session Service (`services/session_service.py`)

Manages conversation history using Redis.

**Key Functions:**

#### `get_conversation_history(project_id, session_id)`

Retrieves conversation history from Redis.

```python
history = session_service.get_conversation_history(
    project_id="proj_abc123",
    session_id="session_xyz789"
)
# Returns: [{"role": "user", "content": "..."}, ...]
```

#### `add_message_to_history(project_id, session_id, role, content)`

Adds a message to conversation history.

```python
session_service.add_message_to_history(
    project_id="proj_abc123",
    session_id="session_xyz789",
    role="user",
    content="What is your return policy?"
)
```

**Features:**
- **TTL**: 24-hour expiration for sessions
- **Limit**: Stores last 20 messages to manage token limits
- **Key Format**: `chat_session:{project_id}:{session_id}`

#### `clear_session(project_id, session_id)`

Clears conversation history for a session.

```python
session_service.clear_session("proj_abc123", "session_xyz789")
```

## ⚙️ Configuration

### LiteLLM Configuration

The service uses LiteLLM for LLM integration, which provides:
- Unified interface for multiple LLM providers
- Automatic retries and error handling
- Streaming support
- Token counting

**Model Configuration:**
```python
# Default model
LITELLM_MODEL = "gemini/gemini-2.5-flash"

# Can be changed to:
# - gemini/gemini-1.5-pro
# - gemini/gemini-1.5-flash
# - openai/gpt-4
# - anthropic/claude-3-opus
```

### Redis Configuration

```python
# Connection
REDIS_HOST = "redis"
REDIS_PORT = 6379

# Session settings
SESSION_TTL = timedelta(hours=24)  # 24-hour expiration
MAX_HISTORY_MESSAGES = 20  # Last 20 messages
```

## 💻 Development

### Project Structure

```
ai-agent-service/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container definition
└── services/
    ├── llm_service.py     # LLM integration
    ├── kb_service.py      # Knowledge Base client
    └── session_service.py # Session management
```

### Adding New Features

#### 1. Add a New Endpoint

```python
# In main.py
@app.post("/new-endpoint")
async def new_endpoint(request: NewRequest):
    # Your logic here
    return {"result": "success"}
```

#### 2. Modify System Prompt

```python
# In services/llm_service.py
SYSTEM_PROMPT = """
Your updated system prompt here...
"""
```

#### 3. Add New LLM Provider

```python
# In services/llm_service.py
# LiteLLM supports multiple providers
# Just change the model name:
response = completion(
    model="openai/gpt-4",  # or "anthropic/claude-3-opus"
    messages=messages
)
```

### Testing

```bash
# Test health endpoint
curl http://localhost:8001/

# Test chat endpoint
curl -X POST http://localhost:8001/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "Hello",
    "project_id": "test_project"
  }'
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Error generating response: 403 Your API key was reported as leaked"

**Cause**: Google API key has been compromised.

**Solution**:
1. Generate new API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Update `.env` file
3. Restart service: `docker-compose restart ai-agent`

#### 2. "Error querying Knowledge Base: Connection refused"

**Cause**: Knowledge Base service is not running or unreachable.

**Solution**:
```bash
# Check KB service status
docker-compose ps knowledge-base

# Check logs
docker-compose logs knowledge-base

# Restart if needed
docker-compose restart knowledge-base
```

#### 3. Redis Connection Error

**Cause**: Redis service is not running.

**Solution**:
```bash
# Check Redis status
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

#### 4. Conversation History Not Persisting

**Cause**: Session ID not being sent or Redis connection issue.

**Solution**:
1. Verify `session_id` is included in requests
2. Check Redis logs: `docker-compose logs redis`
3. Verify Redis TTL settings in `session_service.py`

### Debugging

```bash
# Enable verbose logging
docker-compose logs -f ai-agent

# Check Redis keys
docker-compose exec redis redis-cli
> KEYS chat_session:*
> GET chat_session:proj_abc:session_xyz

# Test LLM directly
python -c "from services.llm_service import LLMService; import asyncio; asyncio.run(LLMService().generate_response('test', [], []))"
```

## 📊 Performance Considerations

- **Token Limits**: History limited to 20 messages to stay within token limits
- **Caching**: Redis caching for conversation history reduces latency
- **Streaming**: WebSocket streaming provides better UX for long responses
- **Error Handling**: Graceful degradation if KB service is unavailable

## 🔐 Security

- **API Key**: Never commit `GOOGLE_API_KEY` to version control
- **CORS**: Configure allowed origins in production
- **Rate Limiting**: Consider adding rate limiting for production
- **Input Validation**: All inputs are validated via Pydantic models

---

**For questions or issues, refer to the main [README.md](../README.md)**
