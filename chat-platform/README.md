# Chat Platform (Frontend)

The Chat Platform is a Next.js 14 application that provides a widget customization interface, project management dashboard, and serves the embeddable chat widget.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Setup](#setup)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Components](#components)
- [API Routes](#api-routes)
- [Embeddable Widget](#embeddable-widget)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

The Chat Platform provides:
- **Landing Page**: Marketing page with features and pricing
- **Dashboard**: Project management interface
- **Widget Editor**: Visual customization tool with live preview
- **Embeddable Widget**: Standalone JavaScript widget for external websites
- **API Proxy**: Routes requests to backend microservices

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Chat Platform (Next.js)                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                    Pages                           │ │
│  │  - / (Landing)                                     │ │
│  │  - /dashboard (Projects)                           │ │
│  │  - /project/[id] (Editor)                          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                 API Routes                         │ │
│  │  - /api/chat (Proxy to AI Agent)                   │ │
│  │  - /api/config/[id] (Widget Config)                │ │
│  │  - /api/projects/* (MongoDB CRUD) (NEW)            │ │
│  │  - /api/projects/migrate (Data Migration) (NEW)    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Static Assets                         │ │
│  │  - /widget/widget.js (Embeddable Widget)           │ │
│  │  - /widget/test.html (Test Page)                   │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
   AI Agent Service                  Knowledge Base Service
   (Port 8001)                       (Port 8000)
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Build Tool**: Next.js built-in (Turbopack)

## 📦 Setup

### Prerequisites

- Node.js 20+ (for local development)
- Docker (for containerized deployment)

### Installation

#### Using Docker (Recommended)

```bash
# Build the service
docker-compose build frontend

# Start the service
docker-compose up -d frontend

# View logs
docker-compose logs -f frontend
```

#### Local Development

```bash
cd chat-platform

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Frontend base URL | `http://localhost:3000` |
| `KNOWLEDGE_BASE_API_URL` | KB service URL (server-side) | `http://knowledge-base:8000` |
| `AI_AGENT_API_URL` | AI Agent URL (server-side) | `http://ai-agent:8001` |

## 📁 Project Structure

```
chat-platform/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Landing page
│   │   ├── dashboard/           # Dashboard pages
│   │   │   └── page.tsx
│   │   ├── project/[id]/        # Editor pages
│   │   │   └── page.tsx
│   │   └── api/                 # API routes
│   │       ├── chat/
│   │       │   └── route.ts     # Chat proxy
│   │       └── config/[id]/
│   │           └── route.ts     # Config API
│   │
│   ├── components/              # React components
│   │   ├── editor/             # Editor components
│   │   │   ├── ConfigurationPanel.tsx
│   │   │   └── panels/         # Config panels
│   │   ├── preview/            # Preview components
│   │   │   └── PreviewArea.tsx
│   │   ├── landing/            # Landing page components
│   │   └── ui/                 # Shared UI components
│   │
│   └── context/                # React Context
│       └── WidgetContext.tsx   # Widget state management
│
├── public/
│   └── widget/                 # Embeddable widget
│       ├── widget.js          # Widget code
│       └── test.html          # Test page
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## ✨ Key Features

### 1. Landing Page (`/`)

Marketing page with:
- Hero section with CTA
- Features showcase
- How it works section
- Responsive design

### 2. Dashboard (`/dashboard`)

Project management interface:
- List all projects
- Create new projects
- Navigate to editor
- Project metadata (ID, name, creation date)

**Storage**: Projects stored in `localStorage` (client-side)

### 3. Widget Editor (`/project/[id]`)

Visual customization interface with:
- **Left Sidebar**: Configuration panels
  - Widget Editor: Style, Content, Website
  - Knowledge Base: Document upload
  - Deployment: Embed code
- **Right Panel**: Live preview
  - Desktop/Mobile views
  - Real-time updates
- **Header**: Save button, device switcher

### 4. Embeddable Widget

Standalone JavaScript widget that can be embedded in any website.

**Features**:
- Customizable appearance
- Session persistence
- Conversation memory
- Multilingual support

## 🧩 Components

### Configuration Panel

**Location**: `src/components/editor/ConfigurationPanel.tsx`

Main navigation for the editor with three modes:
1. **Widget Editor**: Customize appearance and behavior
2. **Knowledge Base**: Upload and manage documents
3. **Deployment**: Get embed code

**Sub-panels**:
- **StylePanel**: Colors, theme, positioning
- **BrandingPanel**: Icons and avatars
- **ContentPanel**: Welcome message, placeholder
- **WebsitePanel**: Website URL configuration
- **WorkflowPanel**: Custom chat workflow builder (NEW)
- **EmbedPanel**: Embed code generation

### Workflow Panel (NEW)

**Location**: `src/components/editor/panels/WorkflowPanel.tsx`

Manage custom chat workflows:
- Create/disable workflows
- View workflow status and validation
- Manage API whitelist for external integrations
- Open visual workflow editor

### Workflow Editor (NEW)

**Location**: `src/components/editor/WorkflowEditor.tsx`

Visual node-based workflow builder using React Flow:
- **Node Palette**: 9 node types for building workflows
- **Canvas**: Drag-and-drop interface with minimap and controls
- **Validation**: Real-time workflow validation
- **Save/Load**: Persist workflows to project configuration

**Node Components** (`src/components/editor/workflow-nodes/`):
- `StartNode.tsx` - Workflow entry point
- `MessageNode.tsx` - Display messages
- `UserInputNode.tsx` - Capture user input
- `ConditionNode.tsx` - Branching logic
- `AIAgentNode.tsx` - LLM integration
- `APICallNode.tsx` - External API calls
- `VariableSetNode.tsx` - Variable storage
- `HandoffNode.tsx` - Transfer to human
- `EndNode.tsx` - Workflow termination

### Workflow Executor (NEW)

**Location**: `src/lib/WorkflowExecutor.ts`

Frontend execution engine for hybrid workflow execution:
- Executes simple nodes locally (Message, Input, Condition, Variable Set)
- Delegates complex nodes to backend (AI Agent, API Call, Handoff)
- Manages workflow state and variables
- Handles user input and node traversal

### Preview Area

**Location**: `src/components/preview/PreviewArea.tsx`

Live preview of the chat widget with:
- Device switching (desktop/mobile)
- Real-time configuration updates
- Functional chat interface
- Session management

### Widget Context

**Location**: `src/context/WidgetContext.tsx`

Global state management for widget configuration:

```typescript
interface WidgetConfig {
  colors: {
    primary: string;
    headerBackground: string;
    chatBackground: string;
  };
  text: {
    welcomeMessage: string;
    inputPlaceholder: string;
  };
  branding: {
    chatIcon: string;
    agentAvatar: string;
    userAvatar: string;
  };
  settings: {
    position: 'left' | 'right';
    websiteUrl: string;
  };
  workflow?: WorkflowDefinition; // NEW: Optional custom workflow
  apiWhitelist?: string[]; // NEW: Allowed domains for API calls
}
```

**Methods**:
- `updateColors(colors)`: Update color scheme
- `updateText(text)`: Update text content
- `updateBranding(branding)`: Update icons/avatars
- `updateSettings(settings)`: Update widget settings
- `updateWorkflow(workflow)`: Update custom workflow (NEW)
- `updateApiWhitelist(whitelist)`: Update API whitelist (NEW)
- `saveProject()`: Save to localStorage
- `loadProject(id)`: Load from localStorage

## 🔌 API Routes

### 1. Chat Proxy (`/api/chat/route.ts`)

Proxies chat requests to the AI Agent service.

**POST** `/api/chat`

```typescript
// Request
{
  query: string;
  project_id: string;
  session_id?: string;
  history?: Array<{role: string, content: string}>;
}

// Response
{
  response: string;
  context_used: string[];
  session_id: string;
}
```

**Why Proxy?**
- Hides backend service URLs from client
- Enables server-side request modification
- Centralizes error handling

### 2. Config API (`/api/config/[id]/route.ts`)

Returns widget configuration for a project.

**GET** `/api/config/[id]`

```typescript
// Response
{
  id: string;
  name: string;
  config: WidgetConfig;
}
```

**Usage**: Called by embeddable widget to load configuration.

## 💾 MongoDB Storage (NEW)

All project data is stored in MongoDB for persistent, production-ready storage.

### Database Connection

**File**: `src/lib/mongodb.ts`

Provides MongoDB connection with:
- Connection pooling
- Hot reload support (development)
- Error handling
- Database instance getter

### Project Model

**File**: `src/lib/models/project.ts`

Defines:
- `Project` interface
- `WidgetConfig` interface
- `createDefaultProject()` - Create project with defaults
- `validateProject()` - Validate project data

### Storage API

**File**: `src/lib/storage.ts`

Provides async functions for project management:

```typescript
// Get all projects
const projects = await getUserProjects();

// Get single project
const project = await getProject(projectId);

// Create project
const newProject = await createProject(name, config);

// Update project
const updated = await updateProject(projectId, { name, config });

// Delete project
await deleteProject(projectId);
```

### API Endpoints

#### List Projects
```
GET /api/projects
Response: { projects: Project[] }
```

#### Create Project
```
POST /api/projects
Body: { name: string, config?: WidgetConfig }
Response: { project: Project }
```

#### Get Project
```
GET /api/projects/[id]
Response: { project: Project }
```

#### Update Project
```
PUT /api/projects/[id]
Body: { name?: string, config?: WidgetConfig }
Response: { project: Project }
```

#### Delete Project
```
DELETE /api/projects/[id]
Response: { success: boolean }
```

#### Migrate Data
```
POST /api/projects/migrate
Body: { projects: Project[] }
Response: { results: { success, failed, errors } }
```

### Data Migration

**From localStorage to MongoDB**:

1. Load migration script in browser console:
   ```javascript
   const script = document.createElement('script');
   script.src = '/migrate-to-mongodb.js';
   document.head.appendChild(script);
   ```

2. Run migration:
   ```javascript
   await migrateToMongoDB()
   ```

3. Verify and optionally clear localStorage:
   ```javascript
   clearLocalStorage()
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017` |
| `MONGODB_DB` | Database name | `chat-widget` |

### Database Management

**View projects**:
```bash
docker compose exec mongo mongosh
use chat-widget
db.projects.find().pretty()
```

**Create indexes**:
```javascript
db.projects.createIndex({ id: 1 }, { unique: true })
db.projects.createIndex({ createdAt: -1 })
```

## 📱 Embeddable Widget

**Location**: `public/widget/widget.js`

Standalone Web Component that can be embedded in any website.

### Integration

```html
<!-- Add to any HTML page -->
<your-chat-widget 
  project-id="proj_abc123" 
  api-url="http://localhost:3000"
  position="right"
  primary-color="#6320CE">
</your-chat-widget>

<script src="http://localhost:3000/widget/widget.js" defer></script>
```

### Attributes

| Attribute | Description | Required | Default |
|-----------|-------------|----------|---------|
| `project-id` | Project identifier | ✅ Yes | - |
| `api-url` | API base URL | No | Current origin |
| `position` | Widget position | No | `right` |
| `primary-color` | Primary color | No | `#6320CE` |

### Features

1. **Shadow DOM**: Isolated styles, no conflicts with host page
2. **Session Management**: Stores session ID in localStorage
3. **Conversation Memory**: Maintains chat history
4. **Responsive**: Adapts to mobile/desktop
5. **Customizable**: Loads configuration from API

### Architecture

```javascript
class ChatWidget extends HTMLElement {
  constructor() {
    // Initialize shadow DOM
    // Generate/retrieve session ID
  }

  connectedCallback() {
    // Fetch configuration
    // Render widget
    // Attach event listeners
  }

  async sendMessage(message) {
    // Get/create session ID
    // Send to /api/chat
    // Display response
    // Update history
  }
}

customElements.define('your-chat-widget', ChatWidget);
```

### Testing

Open `public/widget/test.html` in a browser to test the widget.

## 💻 Development

### Running Locally

```bash
cd chat-platform

# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
open http://localhost:3000
```

### Making Changes

#### 1. Update Widget Styles

```typescript
// src/components/editor/panels/StylePanel.tsx
// Modify color pickers, theme options, etc.
```

#### 2. Add New Configuration Option

```typescript
// 1. Update WidgetContext
interface WidgetConfig {
  // ... existing fields
  newOption: string;
}

// 2. Add UI in ConfigurationPanel
// 3. Use in PreviewArea
```

#### 3. Modify Embeddable Widget

```javascript
// public/widget/widget.js
// Update widget HTML, styles, or behavior
```

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm start

# Build Docker image
docker-compose build frontend
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker-compose build frontend

# Start container
docker-compose up -d frontend

# Check logs
docker-compose logs -f frontend
```

### Environment Configuration

For production, update environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-domain.com
KNOWLEDGE_BASE_API_URL=http://knowledge-base:8000
AI_AGENT_API_URL=http://ai-agent:8001
```

### Static Export (Optional)

For static hosting (Netlify, Vercel, etc.):

```bash
# Update next.config.ts
export default {
  output: 'export',
  // ... other config
}

# Build
npm run build

# Deploy 'out' directory
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Widget Not Loading

**Cause**: CORS or incorrect API URL.

**Solution**:
```javascript
// Check browser console for errors
// Verify api-url attribute
<your-chat-widget api-url="http://localhost:3000" ...>
```

#### 2. Configuration Not Saving

**Cause**: localStorage not available or quota exceeded.

**Solution**:
```javascript
// Check browser console
// Clear localStorage if needed
localStorage.clear();
```

#### 3. Preview Not Updating

**Cause**: Context not propagating changes.

**Solution**:
```bash
# Restart dev server
npm run dev
```

### Debugging

```bash
# Check Next.js logs
docker-compose logs -f frontend

# Inspect localStorage
# Open browser console
localStorage.getItem('makkn_projects')

# Test API routes
curl http://localhost:3000/api/config/proj_abc123
```

## 📊 Performance

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Use Next.js `<Image>` component
- **Bundle Size**: Monitor with `npm run build`
- **Caching**: Static assets cached by browser

## 🔐 Security

- **XSS Protection**: React escapes content by default
- **CORS**: Configure allowed origins in production
- **API Keys**: Never expose backend API keys to client
- **Input Validation**: Validate all user inputs

---

**For questions or issues, refer to the main [README.md](../README.md)**
