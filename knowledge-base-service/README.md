# Knowledge Base Service

The Knowledge Base Service is a Python FastAPI microservice responsible for document processing, embedding generation, and semantic search using MongoDB and Qdrant vector database.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Services](#services)
- [Database Schema](#database-schema)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Knowledge Base Service handles:
- **Document Upload**: Accepts PDF, DOCX, TXT, and MD files
- **Website Crawling**: Scrapes and indexes website content using Tavily API
- **Text Extraction**: Extracts text from various document formats
- **Text Chunking**: Splits documents into semantic chunks
- **Embedding Generation**: Creates vector embeddings using Google Gemini
- **Vector Storage**: Stores embeddings in Qdrant for fast similarity search
- **Metadata Management**: Stores document metadata in MongoDB
- **Semantic Search**: Performs vector similarity search for relevant context

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Knowledge Base Service                      │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐│
│  │ File Processing│  │   Embeddings   │  │  Database  ││
│  │                │  │                │  │            ││
│  │ - Extract Text │  │ - Gemini API   │  │ - MongoDB  ││
│  │ - Chunk Text   │  │ - Vector Gen   │  │ - Qdrant   ││
│  └────────────────┘  └────────────────┘  └────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           FastAPI Application                    │  │
│  │  - /upload (POST)                                │  │
│  │  - /query (POST)                                 │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   File Storage         Google Gemini         MongoDB
   (./uploads/)        (Embeddings API)    (Port 27017)
                                                  │
                                                  ▼
                                              Qdrant
                                           (Port 6333)
```

## 🛠️ Technology Stack

- **Framework**: FastAPI 0.104+
- **Python**: 3.11
- **Document Processing**: PyPDF2, python-docx
- **Embeddings**: Google Generative AI
- **Vector Database**: Qdrant Client 1.7.0
- **Document Database**: PyMongo
- **ASGI Server**: Uvicorn

## 📦 Setup

### Prerequisites

- Docker and Docker Compose (recommended)
- Python 3.11+ (for local development)
- Google API Key (for embeddings)
- MongoDB instance
- Qdrant instance

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key | ✅ Yes | - |
| `TAVILY_API_KEY` | Tavily API key for website scraping | ✅ Yes | - |
| `MONGO_URL` | MongoDB connection string | No | `mongodb://mongo:27017` |
| `QDRANT_URL` | Qdrant connection URL | No | `http://qdrant:6333` |

### Installation

#### Using Docker (Recommended)

```bash
# Build the service
docker-compose build knowledge-base

# Start the service
docker-compose up -d knowledge-base

# View logs
docker-compose logs -f knowledge-base
```

#### Local Development

```bash
cd knowledge-base-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_API_KEY=your_key_here
export MONGO_URL=mongodb://localhost:27017
export QDRANT_URL=http://localhost:6333

# Run the service
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🔌 API Endpoints

### 1. Health Check

**GET** `/`

Returns service status.

**Response:**
```json
{
  "message": "Knowledge Base Service is running (Mongo + Qdrant)"
}
```

### 2. Upload Document

**POST** `/upload`

Upload and process a document.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file`: Document file (PDF, DOCX, TXT, MD)
  - `project_id`: Project identifier

**Example (cURL):**
```bash
curl -X POST http://localhost:8000/upload \\
  -F "file=@document.pdf" \\
  -F "project_id=proj_abc123"
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('project_id', 'proj_abc123');

const response = await fetch('http://localhost:8000/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "chunks": 15
}
```

**Processing Flow:**
1. Save uploaded file to `./uploads/{project_id}/`
2. Create document record in MongoDB (status: "processing")
3. Extract text from document
4. Split text into chunks (1000 chars, 200 char overlap)
5. Generate embeddings for each chunk using Gemini
6. Store vectors in Qdrant with metadata
7. Update MongoDB document (status: "completed")

**Supported File Types:**
- **PDF**: `application/pdf`
- **Word**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Text**: `text/plain`
- **Markdown**: `text/markdown`

### 3. Query Knowledge Base

**POST** `/query`

Search for relevant document chunks.

**Request:**
- Content-Type: `application/x-www-form-urlencoded`
- Fields:
  - `query`: Search query
  - `project_id`: Project identifier
  - `limit`: (optional) Number of results (default: 5)

**Example (cURL):**
```bash
curl -X POST http://localhost:8000/query \\
  -d "query=return policy" \\
  -d "project_id=proj_abc123" \\
  -d "limit=5"
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:8000/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    query: 'return policy',
    project_id: 'proj_abc123',
    limit: '5'
  })
});

const results = await response.json();
console.log(results);
```

**Response:**
```json
[
  {
    "content": "Our return policy allows returns within 30 days...",
    "document_id": "550e8400-e29b-41d4-a716-446655440000",
    "similarity": 0.89
  },
  {
    "content": "To initiate a return, please contact...",
    "document_id": "550e8400-e29b-41d4-a716-446655440000",
    "similarity": 0.85
  }
]
```

**Search Flow:**
1. Generate embedding for query using Gemini
2. Perform vector similarity search in Qdrant
3. Filter by `project_id`
4. Return top N results with similarity scores

### 4. Crawl Website

**POST** `/crawl`

Crawl and index a website.

**Request:**
- Content-Type: `application/x-www-form-urlencoded`
- Fields:
  - `url`: Website URL to crawl
  - `project_id`: Project identifier

**Example (cURL):**
```bash
curl -X POST http://localhost:8000/crawl \\
  -d "url=https://example.com" \\
  -d "project_id=proj_abc123"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "chunks": 12
}
```

**Crawling Flow:**
1. Use Tavily API to discover URLs on the website
2. Extract content from discovered pages
3. Clean and preprocess HTML content
4. Create document record in MongoDB
5. Split text into chunks
6. Generate embeddings for each chunk
7. Store vectors in Qdrant
8. Update MongoDB document status

**Features:**
- Automatic URL discovery using Tavily's map API
- HTML cleaning (removes scripts, styles, navigation)
- Text preprocessing (whitespace normalization)
- Fallback to main URL if discovery fails

## 🔧 Services

### 1. File Processing (`services/file_processing.py`)

Handles file upload, text extraction, and chunking.

#### `save_upload_file(upload_file, project_id)`

Saves uploaded file to disk.

```python
file_path = await save_upload_file(upload_file, "proj_abc123")
# Returns: "uploads/proj_abc123/document.pdf"
```

**Storage Structure:**
```
uploads/
└── proj_abc123/
    ├── document1.pdf
    ├── document2.docx
    └── document3.txt
```

#### `extract_text(file_path, file_type)`

Extracts text from various document formats.

```python
text = extract_text("uploads/proj_abc123/doc.pdf", "application/pdf")
# Returns: "Full text content..."
```

**Supported Formats:**
- **PDF**: Uses PyPDF2 to extract text from all pages
- **DOCX**: Uses python-docx to extract paragraphs
- **TXT/MD**: Direct file reading with UTF-8 encoding

**Error Handling:**
- Returns empty string if extraction fails
- Logs errors for debugging

#### `chunk_text(text, chunk_size=1000, overlap=200)`

Splits text into overlapping chunks.

```python
chunks = chunk_text(long_text, chunk_size=1000, overlap=200)
# Returns: ["chunk1...", "chunk2...", ...]
```

**Parameters:**
- `chunk_size`: Maximum characters per chunk (default: 1000)
- `overlap`: Overlapping characters between chunks (default: 200)

**Why Chunking?**
- **Token Limits**: LLMs have maximum context windows
- **Relevance**: Smaller chunks improve search precision
- **Overlap**: Maintains context across chunk boundaries

**Example:**
```
Text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
Chunk Size: 10, Overlap: 3

Chunk 1: "ABCDEFGHIJ"
Chunk 2: "HIJKLMNOPQ"  (HIJ overlaps)
Chunk 3: "OPQRSTUVWX"  (OPQ overlaps)
Chunk 4: "VWXYZ"       (VWX overlaps)
```

### 2. Embeddings (`services/embeddings.py`)

Generates vector embeddings using Google Gemini.

#### `generate_embedding(text)`

Generates embedding for a text chunk.

```python
embedding = generate_embedding("This is a sample text")
# Returns: [0.123, -0.456, 0.789, ...] (768-dimensional vector)
```

**Model**: `models/embedding-001`
**Dimensions**: 768
**Task Type**: `retrieval_document`

#### `generate_query_embedding(query)`

Generates embedding for a search query.

```python
embedding = generate_query_embedding("What is your return policy?")
# Returns: [0.234, -0.567, 0.890, ...] (768-dimensional vector)
```

**Task Type**: `retrieval_query`

**Why Different Task Types?**
- `retrieval_document`: Optimized for document indexing
- `retrieval_query`: Optimized for search queries
- Improves search relevance

**Error Handling:**
- Returns `None` if embedding generation fails
- Logs API errors (rate limits, authentication, etc.)

## 💾 Database Schema

### MongoDB Schema

**Collection**: `documents`

```javascript
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",  // UUID
  "project_id": "proj_abc123",                    // Project identifier
  "filename": "product_guide.pdf",                // Original filename
  "file_type": "application/pdf",                 // MIME type
  "file_path": "uploads/proj_abc123/product_guide.pdf",  // Storage path
  "upload_date": ISODate("2024-01-15T10:30:00Z"), // Upload timestamp
  "status": "completed",                          // pending|processing|completed|failed
  "chunks_count": 15,                             // Number of chunks created
  "error": null                                   // Error message if failed
}
```

**Indexes:**
- `_id`: Primary key
- `project_id`: For filtering by project

### Qdrant Schema

**Collection**: `makkn_knowledge_base`

**Vector Configuration:**
- **Size**: 768 dimensions
- **Distance**: Cosine similarity

**Point Structure:**
```python
{
  "id": "uuid-string",                    // Unique point ID
  "vector": [0.123, -0.456, ...],        // 768-dimensional embedding
  "payload": {
    "document_id": "doc-uuid",           // Reference to MongoDB document
    "content": "Text chunk content...",  // Original text
    "project_id": "proj_abc123",         // Project identifier
    "chunk_index": 0                     // Chunk position in document
  }
}
```

**Indexes:**
- Vector index: HNSW (Hierarchical Navigable Small World)
- Payload index: `project_id` (for filtering)

## 💻 Development

### Project Structure

```
knowledge-base-service/
├── main.py                    # FastAPI application
├── database.py                # MongoDB & Qdrant connections
├── models.py                  # Pydantic data models
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container definition
├── README.md                  # This file
├── services/
│   ├── embeddings.py         # Embedding generation
│   ├── file_processing.py    # Document processing
│   └── scraping.py           # Website scraping (Tavily)
└── uploads/                   # File storage (created at runtime)
    └── {project_id}/
        └── {files}
```

### Adding New Features

#### 1. Support New File Format

```python
# In services/file_processing.py

def extract_text(file_path: str, file_type: str) -> str:
    # ... existing code ...
    
    elif file_type == "application/vnd.ms-excel":
        # Add Excel support
        import pandas as pd
        df = pd.read_excel(file_path)
        text = df.to_string()
```

#### 2. Change Chunking Strategy

```python
# In services/file_processing.py

def chunk_text(text: str, chunk_size: int = 1500, overlap: int = 300):
    # Adjust chunk_size and overlap as needed
    # Or implement semantic chunking using NLP
```

#### 3. Use Different Embedding Model

```python
# In services/embeddings.py

def generate_embedding(text: str):
    result = genai.embed_content(
        model="models/text-embedding-004",  # New model
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']
```

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/

# Test upload
curl -X POST http://localhost:8000/upload \\
  -F "file=@test.pdf" \\
  -F "project_id=test_project"

# Test query
curl -X POST http://localhost:8000/query \\
  -d "query=test query" \\
  -d "project_id=test_project"
```

### Monitoring

```bash
# Check MongoDB documents
docker-compose exec mongo mongosh
> use makkn_db
> db.documents.find()

# Check Qdrant collection
curl http://localhost:6333/collections/makkn_knowledge_base

# View Qdrant dashboard
open http://localhost:6333/dashboard
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "ModuleNotFoundError: No module named 'PyPDF2'"

**Cause**: Missing dependencies.

**Solution**:
```bash
# Rebuild container
docker-compose build knowledge-base
docker-compose restart knowledge-base
```

#### 2. "Error generating embedding: 403"

**Cause**: Invalid or leaked Google API key.

**Solution**:
1. Generate new API key
2. Update `.env` file
3. Restart service

#### 3. "Qdrant collection already exists"

**Cause**: Collection created in previous run.

**Solution**: The service now handles this automatically. If issues persist:
```bash
# Delete collection (WARNING: deletes all vectors)
curl -X DELETE http://localhost:6333/collections/makkn_knowledge_base

# Restart service
docker-compose restart knowledge-base
```

#### 4. "Failed to extract text"

**Cause**: Corrupted or unsupported file format.

**Solution**:
1. Verify file is not corrupted
2. Check file type is supported
3. Review logs: `docker-compose logs knowledge-base`

### Debugging

```bash
# View detailed logs
docker-compose logs -f knowledge-base

# Check file uploads
ls -la knowledge-base-service/uploads/

# Test embedding generation
python -c "from services.embeddings import generate_embedding; print(generate_embedding('test'))"

# Check MongoDB connection
docker-compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Check Qdrant connection
curl http://localhost:6333/collections
```

## 📊 Performance Considerations

- **Chunking**: Smaller chunks = better precision, more storage
- **Embedding Batch**: Generate embeddings in batches for large documents
- **Vector Index**: HNSW provides O(log n) search complexity
- **Caching**: Consider caching embeddings for frequently queried text

## 🔐 Security

- **File Upload**: Validate file types and sizes
- **Path Traversal**: File paths are sanitized
- **API Key**: Never commit `GOOGLE_API_KEY`
- **Access Control**: Implement project-level access control in production

## 🚀 Optimization Tips

1. **Batch Processing**: Process multiple chunks in parallel
2. **Async I/O**: Use async file operations for large files
3. **Compression**: Compress stored vectors
4. **Quantization**: Use quantized vectors for faster search

---

**For questions or issues, refer to the main [README.md](../README.md)**
