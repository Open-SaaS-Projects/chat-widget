from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Document, Chunk
from services.file_processing import save_upload_file, extract_text, chunk_text
from services.embeddings import generate_embedding, generate_query_embedding
from sqlalchemy import text

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Knowledge Base Service",
    description="Microservice for managing files and generating embeddings",
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

@app.get("/")
async def root():
    return {"message": "Knowledge Base Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Save file
    file_path = await save_upload_file(file, project_id)
    
    # 2. Create Document record
    db_doc = Document(
        project_id=project_id,
        filename=file.filename,
        file_type=file.content_type,
        file_path=file_path,
        status="processing"
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    try:
        # 3. Extract text
        text_content = extract_text(file_path, file.content_type)
        if not text_content:
            raise Exception("Failed to extract text")
            
        # 4. Chunk text
        chunks = chunk_text(text_content)
        
        # 5. Generate embeddings and save chunks
        for i, chunk_text_content in enumerate(chunks):
            embedding = generate_embedding(chunk_text_content)
            if embedding:
                db_chunk = Chunk(
                    document_id=db_doc.id,
                    content=chunk_text_content,
                    embedding=embedding,
                    chunk_index=i
                )
                db.add(db_chunk)
        
        db_doc.status = "completed"
        db.commit()
        
        return {"id": db_doc.id, "status": "completed", "chunks": len(chunks)}
        
    except Exception as e:
        db_doc.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_knowledge_base(
    query: str = Form(...),
    project_id: str = Form(...),
    limit: int = 5,
    db: Session = Depends(get_db)
):
    # 1. Generate query embedding
    query_embedding = generate_query_embedding(query)
    if not query_embedding:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")
        
    # 2. Perform vector search using pgvector
    # Note: We need to cast the embedding to a string representation for the SQL query
    embedding_str = str(query_embedding)
    
    # SQL query to find nearest neighbors within the project
    sql = text("""
        SELECT c.content, c.document_id, 1 - (c.embedding <=> :embedding) as similarity
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE d.project_id = :project_id
        ORDER BY c.embedding <=> :embedding
        LIMIT :limit
    """)
    
    results = db.execute(sql, {
        "embedding": embedding_str, 
        "project_id": project_id, 
        "limit": limit
    }).fetchall()
    
    return [
        {"content": row[0], "document_id": row[1], "similarity": row[2]} 
        for row in results
    ]
