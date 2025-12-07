# MAKKN Chat Widget Platform

A production-ready, AI-powered customer support chat widget platform with knowledge base integration, built using a microservices architecture.

## 🏗️ Architecture Overview

This project consists of three main microservices:

```
┌─────────────────────────────────────────────────────────────┐
│                      Chat Platform                          │
│                  (Next.js Frontend)                         │
│                     Port: 3000                              │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────────────────────────┐
             │              │                                  │
┌────────────▼─────┐  ┌────▼──────────────┐  ┌───────────────▼─────┐
│   AI Agent       │  │ Knowledge Base    │  │   Redis             │
│   Service        │  │ Service           │  │   (Sessions)        │
│   Port: 8001     │  │ Port: 8000        │  │   Port: 6379        │
└──────────────────┘  └───────┬───────────┘  └─────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼──────┐    ┌──────▼──────┐
            │   MongoDB    │    │   Qdrant    │
            │ (Metadata)   │    │  (Vectors)  │
            │ Port: 27017  │    │ Port: 6333  │
            └──────────────┘    └─────────────┘
```

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Service Documentation](#service-documentation)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Features
- **AI-Powered Chat**: Intelligent responses using Google Gemini 2.5 Flash
- **Knowledge Base**: Upload and query documents (PDF, DOCX, TXT, MD)
- **Conversation Memory**: 24-hour session persistence with Redis
- **Multilingual Support**: Automatic language detection and matching
- **Embeddable Widget**: Standalone JavaScript widget for any website
- **Real-time Preview**: Live widget customization interface
- **Vector Search**: Semantic search using Qdrant vector database

### Advanced Features
- **Project Management**: Multi-tenant support with project isolation
- **Custom Branding**: Configurable colors, icons, and styling
- **Session Management**: Persistent conversations across page reloads
- **Document Processing**: Automatic text extraction and chunking
- **Semantic Search**: Context-aware responses using embeddings
- **Domain Restriction**: Secure widget deployment with origin validation (NEW)
  - Configure allowed domains in deployment settings
  - Prevents unauthorized widget usage on other websites
  - Supports exact domain matching and wildcard subdomains
  - Automatic localhost bypass for development
- **Custom Chat Workflows**: Visual node-based workflow builder with hybrid execution
  - 9 node types: Start, Message, User Input, Condition, AI Agent, API Call, Variable Set, Handoff, End
  - Drag-and-drop visual editor using React Flow
  - Hybrid execution: Frontend for simple nodes, backend for complex operations
  - API whitelist security for external integrations
  - Optional feature - projects work without workflows
- **Safe Data Integrations**: Securely connect the AI to business data
  - **Database Integration**: Execute safe, parameterized SQL queries on PostgreSQL/MySQL
  - **API Integration**: Connect to external REST APIs without sharing database credentials
  - **Zero-Trust**: AI can only execute pre-defined, named "Tools" (Actions)
  - **Encryption**: Credentials encrypted at rest using Fernet


## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **State Management**: React Context API
- **Workflow Editor**: React Flow (node-based visual editor)

### Backend Services
- **AI Agent**: Python FastAPI
- **Knowledge Base**: Python FastAPI
- **LLM**: Google Gemini 2.5 Flash (via LiteLLM)
- **Embeddings**: Google Gemini Embedding Model

### Databases
- **MongoDB**: Document metadata storage + **Project configurations, workflows, and settings** (NEW)
- **Qdrant**: Vector database for semantic search
- **Redis**: Session and conversation history storage

**MongoDB Collections**:
- `projects` - All project data (widget config, workflows, API whitelist, domain restrictions)
- `documents` - Knowledge base document metadata
- `chunks` - Document chunks for vector search

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Built-in Next.js API routes

## 📦 Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Google API Key**: From [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chat-widget
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Google API Key (REQUIRED)
GOOGLE_API_KEY=your_google_api_key_here
```

**Important**: Never commit your `.env` file to Git. It's already in `.gitignore`.

### 3. Start All Services

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **AI Agent API**: http://localhost:8001
- **Knowledge Base API**: http://localhost:8000
- **Qdrant Dashboard**: http://localhost:6333/dashboard

### 5. Test the Widget

Open the test page: http://localhost:3000/widget/test.html

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_API_KEY` | Google Gemini API key | - | ✅ Yes |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LITELLM_MODEL` | LLM model to use | `gemini/gemini-2.5-flash` |
| `MONGO_URL` | MongoDB connection string | `mongodb://mongo:27017` |
| `MONGODB_URI` | MongoDB URI (frontend) | `mongodb://mongo:27017` |
| `MONGODB_DB` | MongoDB database name | `chat-widget` |
| `QDRANT_URL` | Qdrant connection URL | `http://qdrant:6333` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |

## 📚 Service Documentation

Detailed technical documentation for each service:

- **[Chat Platform](./chat-platform/README.md)** - Next.js frontend application
- **[AI Agent Service](./ai-agent-service/README.md)** - LLM integration and response generation
- **[Knowledge Base Service](./knowledge-base-service/README.md)** - Document processing and vector search

## 🔌 API Endpoints

### Chat Platform (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Landing page |
| `/dashboard` | GET | Project dashboard |
| `/project/[id]` | GET | Widget editor |
| `/api/chat` | POST | Chat proxy endpoint |
| `/api/config/[id]` | GET | Widget configuration |

### AI Agent Service (Port 8001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/chat` | POST | Generate AI response |
| `/ws/chat/{project_id}` | WebSocket | Streaming chat |

### Knowledge Base Service (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/upload` | POST | Upload document |
| `/query` | POST | Search knowledge base |

## 💻 Development

### Project Structure

```
chat-widget/
├── chat-platform/           # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   └── context/        # State management
│   └── public/
│       └── widget/         # Embeddable widget
│
├── ai-agent-service/       # AI Agent microservice
│   ├── main.py            # FastAPI application
│   └── services/
│       ├── llm_service.py # LLM integration
│       ├── kb_service.py  # Knowledge base client
│       └── session_service.py # Session management
│
├── knowledge-base-service/ # Knowledge Base microservice
│   ├── main.py            # FastAPI application
│   ├── database.py        # DB connections
│   ├── models.py          # Data models
│   └── services/
│       ├── embeddings.py  # Embedding generation
│       └── file_processing.py # Document processing
│
└── docker-compose.yml      # Container orchestration
```

### Running in Development Mode

```bash
# Start with live reload
docker-compose up

# Rebuild specific service
docker-compose build <service-name>

# View logs for specific service
docker-compose logs -f <service-name>

# Restart specific service
docker-compose restart <service-name>
```

### Adding New Features

1. **Frontend Changes**: Edit files in `chat-platform/src/`
2. **AI Agent Changes**: Edit files in `ai-agent-service/`
3. **Knowledge Base Changes**: Edit files in `knowledge-base-service/`
4. **Rebuild**: `docker-compose build <service>`
5. **Restart**: `docker-compose restart <service>`

## 💾 MongoDB Storage (NEW)

All project data is now stored in MongoDB instead of localStorage or JSON files. This provides persistent, scalable, and production-ready storage.

### Data Architecture

**Database**: `chat-widget`  
**Collection**: `projects`

**Document Structure**:
```javascript
{
  _id: ObjectId,
  id: "proj_...",           // Unique project ID
  name: "Project Name",
  createdAt: Date,
  updatedAt: Date,
  config: {
    // Widget Configuration
    position: "left" | "right",
    websiteUrl: "https://example.com",
    
    // Styling
    colors: { primary, header, background, foreground, input },
    branding: { chatIcon, agentIcon, userIcon, ... },
    text: { headerTitle, welcomeMessage, placeholder },
    
    // AI Configuration
    persona: { tone, agentType, responseLength, customInstructions },
    
    // Custom Workflows
    workflow: {
      nodes: [...],
      edges: [...],
      viewport: {...}
    },
    
    // Security
    apiWhitelist: ["domain.com", "*.trusted.com"]
  }
}
```

### API Endpoints

All project operations use REST API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List all projects |
| `/api/projects` | POST | Create new project |
| `/api/projects/[id]` | GET | Get project by ID |
| `/api/projects/[id]` | PUT | Update project |
| `/api/projects/[id]` | DELETE | Delete project |
| `/api/projects/migrate` | POST | Migrate localStorage data |

### Storage Benefits

- ✅ **Persistent**: Data survives browser clears
- ✅ **Multi-device**: Access projects from any device
- ✅ **Scalable**: Production-ready database
- ✅ **Backup**: Easy database backup/restore
- ✅ **No Files**: No JSON file dependencies

### Migration from localStorage

If you have existing projects in localStorage:

1. Open browser console at http://localhost:3000
2. Load migration script:
   ```javascript
   const script = document.createElement('script');
   script.src = '/migrate-to-mongodb.js';
   document.head.appendChild(script);
   ```
3. Run migration:
   ```javascript
   await migrateToMongoDB()
   ```
4. Verify projects loaded
5. (Optional) Clear localStorage:
   ```javascript
   clearLocalStorage()
   ```

### Database Management

**View all projects**:
```bash
docker compose exec mongo mongosh
use chat-widget
db.projects.find().pretty()
```

**Count projects**:
```bash
db.projects.countDocuments()
```

**Backup database**:
```bash
docker compose exec mongo mongodump --db chat-widget --out /backup
```

## 🔒 Domain Restriction (NEW)

Secure your chat widgets by restricting them to specific domains. This prevents unauthorized use on other websites.

### How to Configure

1. Open your project in the editor
2. Go to **"Deployment"** tab
3. Enter your allowed domain in the **"Domain Restriction"** section
4. The widget will only work on that domain

### Domain Formats

**Exact Domain:**
```
https://example.com
```
Only works on `example.com`

**Wildcard Subdomains:**
```
https://*.example.com
```
Works on all subdomains: `www.example.com`, `app.example.com`, etc.

### Security Benefits

- ✅ Prevents widget theft and unauthorized usage
- ✅ Protects your API quota
- ✅ Controls where your brand appears
- ✅ Automatic validation on every chat request

### Development Mode

- Localhost is always allowed during development
- Set `NODE_ENV=production` to enable validation in production

## 🔌 Safe Data Integrations (NEW)

Empower your AI agent to securely access your business data without exposing direct database access to the LLM.

### Features
1.  **Named Actions**: You define specific tools (e.g., `get_order_status`, `search_products`) with strict parameters. The AI can only call these tools, not write arbitrary SQL.
2.  **Multiple Sources**:
    *   **Database**: PostgreSQL and MySQL supported.
    *   **API**: REST API endpoints (GET/POST/PUT/DELETE).
3.  **Security**:
    *   Database passwords encrypted at rest.
    *   SQL injection protection via parameterized queries.
    *   No direct schema exposure to the AI.

### How to Configure
1.  Go to **"Brain"** -> **"Data Accessing"**.
2.  **Add Connection**: Enter your database credentials (host, port, user, pass).
3.  **Add Action**:
    *   *Type*: Choose "Database Query" or "API Request".
    *   *Query/URL*: Define the SQL (`SELECT * FROM orders WHERE id=:id`) or API URL (`https://api.site.com/orders/:id`).
    *   *Parameters*: Define JSON schema for the inputs (e.g., `id` is required integer).
4.  **Use in Chat**: The AI will automatically detect when to use the tool based on user questions (e.g., "Where is my order #123?").

## 🔄 Custom Chat Workflows (NEW)

The platform now supports custom chat workflows with a visual node-based editor, allowing you to create sophisticated conversation flows beyond simple AI chat.

### Overview

Custom workflows enable you to:
- Design complex conversation flows visually
- Branch based on user input with conditions
- Integrate external APIs securely
- Combine AI responses with custom logic
- Hand off to human agents when needed

### Key Features

- **Visual Editor**: Drag-and-drop interface using React Flow
- **9 Node Types**: Complete toolkit for building workflows
- **Hybrid Execution**: Frontend for speed, backend for security
- **API Whitelist**: Secure external API integration
- **Optional**: Projects work without workflows (backward compatible)

### Node Types

| Node | Type | Execution | Description |
|------|------|-----------|-------------|
| Start | Entry | Frontend | Workflow entry point |
| Message | Display | Frontend | Send message to user |
| User Input | Capture | Frontend | Wait for user input |
| Condition | Logic | Frontend/Backend | Branch based on conditions |
| AI Agent | AI | Backend | LLM with knowledge base |
| API Call | Integration | Backend | External HTTP requests |
| Variable Set | Data | Frontend | Store/update variables |
| Handoff | Transfer | Backend | Transfer to human agent |
| End | Exit | Frontend | Workflow termination |

### How to Use

#### 1. Create a Workflow

1. Open a project in the editor
2. Click **"Chat Workflow"** in the left navigation
3. Click **"Create Workflow"** button
4. The visual editor opens with a default workflow

#### 2. Build Your Workflow

1. **Add Nodes**: Click nodes from the palette on the left
2. **Connect Nodes**: Drag from output handle (right) to input handle (left)
3. **Configure Nodes**: Double-click nodes to edit properties (coming soon)
4. **Validate**: Check validation status in the header
5. **Save**: Click "Save Workflow" button

#### 3. Configure API Whitelist (Optional)

If using API Call nodes:

1. In the Chat Workflow panel, click **"Manage"** under API Whitelist
2. Enter allowed domains (e.g., `api.example.com` or `*.example.com`)
3. Click **"Add"**
4. API Call nodes will only work with whitelisted domains

#### 4. Test Your Workflow

1. Save the workflow
2. Open the widget preview
3. Test the conversation flow
4. Iterate and refine

### Architecture: Hybrid Execution

Workflows use a hybrid execution model for optimal performance and security:

**Frontend Execution** (Fast):
- Start, Message, User Input, Condition (simple), Variable Set, End
- Executes instantly in the browser
- No network latency

**Backend Execution** (Secure):
- AI Agent, API Call, Handoff, Condition (complex)
- Runs on the server
- Access to LLM, knowledge base, and external APIs
- No CORS issues

**Flow**:
```
User Input → Frontend Executor → Simple Node? → Execute Locally
                                ↓
                         Complex Node? → Send to Backend
                                ↓
                         Backend Executor → Return Result
                                ↓
                         Frontend Continues → Next Node
```

### Example Workflows

**Simple FAQ Bot**:
```
Start → Message ("Welcome!") → User Input → AI Agent → End
```

**Conditional Support**:
```
Start → User Input → Condition
                      ├─ "billing" → API Call (Get Account) → Message
                      ├─ "technical" → AI Agent → End
                      └─ default → Handoff (Human Agent)
```

**API Integration**:
```
Start → User Input → API Call (External CRM) → Variable Set → Message → End
```

### Workflow State Management

- **Session-based**: Each user session has independent workflow state
- **Redis Storage**: State persisted in Redis with 24-hour TTL
- **Variables**: Store and retrieve data across nodes
- **History**: Track execution path for debugging

### Disabling Workflows

To revert to default AI chat:

1. Go to Chat Workflow panel
2. Click **"Disable Workflow"** at the bottom
3. Confirm the action
4. Widget returns to standard LLM + knowledge base behavior

### Technical Details

**Frontend Files**:
- `src/lib/workflow-types.ts` - TypeScript type definitions
- `src/lib/workflow-utils.ts` - Validation and utilities
- `src/lib/WorkflowExecutor.ts` - Frontend execution engine
- `src/components/editor/WorkflowEditor.tsx` - Visual editor
- `src/components/editor/workflow-nodes/` - Custom node components

**Backend Files**:
- `services/workflow_executor.py` - Backend execution engine
- `services/workflow_service.py` - Redis state management
- `main.py` - API endpoint integration

## 🚢 Deployment

### Production Checklist

- [ ] Set strong MongoDB credentials
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment-specific variables
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for databases
- [ ] Review and update security settings

### Docker Compose Production

```bash
# Build for production
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Troubleshooting

### Common Issues

#### 1. API Key Error: "Your API key was reported as leaked"

**Solution**: Generate a new API key and update `.env`:
```bash
# 1. Get new key from https://aistudio.google.com/app/apikey
# 2. Update .env file
# 3. Restart services
docker-compose down
docker-compose up -d
```

#### 2. MongoDB Connection Error

**Solution**: Ensure MongoDB container is running:
```bash
docker-compose ps mongo
docker-compose logs mongo
```

#### 3. Qdrant Collection Already Exists

**Solution**: The system now handles this automatically. If issues persist:
```bash
docker-compose restart knowledge-base
```

#### 4. Widget Not Loading

**Solution**: Check CORS and API URLs:
```bash
# Verify frontend is running
curl http://localhost:3000

# Check widget file
curl http://localhost:3000/widget/widget.js
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai-agent
docker-compose logs -f knowledge-base
docker-compose logs -f frontend

# Last N lines
docker-compose logs --tail=50 ai-agent
```

### Resetting the System

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Rebuild and start fresh
docker-compose build
docker-compose up -d
```

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: [your-email@example.com]

---

**Built with ❤️ by MAKKN**
